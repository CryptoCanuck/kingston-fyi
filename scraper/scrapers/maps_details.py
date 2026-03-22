"""Scrape detailed business info from Google Maps using Playwright."""
import asyncio
import re
import json
from typing import Optional
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field


class PlaceDetails(BaseModel):
    name: str
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    hours: Optional[dict] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    images: list[str] = Field(default_factory=list)
    category: Optional[str] = None
    price_level: Optional[str] = None
    errors: list[str] = Field(default_factory=list)


async def get_place_details(business_name: str, city: str = "Kingston ON") -> PlaceDetails:
    """Navigate to a specific Google Maps listing and extract all details."""
    result = PlaceDetails(name=business_name)

    try:
        from playwright.async_api import async_playwright

        query = f"{business_name} {city}"
        url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={"width": 1280, "height": 900},
            )

            await page.goto(url, wait_until="domcontentloaded", timeout=15000)

            # Wait for results
            try:
                await page.wait_for_selector('div[role="feed"]', timeout=8000)
            except Exception:
                result.errors.append("No results feed")
                await browser.close()
                return result

            # Click the first result to open the details panel
            try:
                first_result = page.locator('div[role="feed"] a[aria-label]').first
                await first_result.click()
                await asyncio.sleep(3)  # Wait for detail panel to load
            except Exception as e:
                result.errors.append(f"Click failed: {str(e)[:100]}")
                await browser.close()
                return result

            # Now extract from the detail panel
            html = await page.content()

            # Try to get website by looking for the website button
            try:
                website_el = page.locator('a[data-item-id="authority"]')
                if await website_el.count() > 0:
                    result.website = await website_el.get_attribute("href")
            except Exception:
                pass

            # Phone
            try:
                phone_el = page.locator('button[data-item-id^="phone"]')
                if await phone_el.count() > 0:
                    phone_text = await phone_el.get_attribute("aria-label")
                    if phone_text:
                        # Extract phone from "Phone: (613) 555-1234"
                        match = re.search(r"[\d\(\)][0-9\(\)\s\-\.]+\d", phone_text)
                        if match:
                            result.phone = match.group(0).strip()
            except Exception:
                pass

            # Address
            try:
                addr_el = page.locator('button[data-item-id="address"]')
                if await addr_el.count() > 0:
                    addr_text = await addr_el.get_attribute("aria-label")
                    if addr_text:
                        result.address = addr_text.replace("Address: ", "").strip()
            except Exception:
                pass

            # Hours - look for the hours table
            try:
                hours_el = page.locator('div[aria-label*="hours"]').first
                if await hours_el.count() > 0:
                    hours_table = page.locator('table.eK4R0e')
                    if await hours_table.count() > 0:
                        rows = await hours_table.locator('tr').all()
                        hours = {}
                        for row in rows:
                            cells = await row.locator('td').all()
                            if len(cells) >= 2:
                                day = (await cells[0].inner_text()).strip().lower()
                                time = (await cells[1].inner_text()).strip()
                                if day:
                                    hours[day] = time
                        if hours:
                            result.hours = hours
            except Exception:
                pass

            # Rating
            try:
                rating_el = page.locator('div.F7nice span[aria-hidden]').first
                if await rating_el.count() > 0:
                    rating_text = await rating_el.inner_text()
                    result.rating = float(rating_text)
            except Exception:
                pass

            # Review count
            try:
                review_el = page.locator('div.F7nice span[aria-label*="review"]').first
                if await review_el.count() > 0:
                    label = await review_el.get_attribute("aria-label")
                    if label:
                        match = re.search(r"([\d,]+)\s*review", label)
                        if match:
                            result.review_count = int(match.group(1).replace(",", ""))
            except Exception:
                pass

            # Images from the photos section
            try:
                img_els = page.locator('button.aoRNLd img')
                count = await img_els.count()
                for i in range(min(count, 6)):
                    src = await img_els.nth(i).get_attribute("src")
                    if src and "googleusercontent" in src:
                        # Get higher resolution by modifying URL params
                        high_res = re.sub(r"=w\d+-h\d+", "=w600-h400", src)
                        result.images.append(high_res)
            except Exception:
                pass

            # Category
            try:
                cat_el = page.locator('button.DkEaL')
                if await cat_el.count() > 0:
                    result.category = await cat_el.inner_text()
            except Exception:
                pass

            # Price level
            try:
                price_el = page.locator('span[aria-label*="Price"]')
                if await price_el.count() > 0:
                    label = await price_el.get_attribute("aria-label")
                    if label:
                        result.price_level = label.replace("Price: ", "")
            except Exception:
                pass

            await browser.close()

    except Exception as e:
        result.errors.append(f"Failed: {str(e)[:200]}")

    return result
