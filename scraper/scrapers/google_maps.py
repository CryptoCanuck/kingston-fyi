"""Google Maps scraper using Playwright directly (async)."""
import asyncio
import re
from typing import List
from bs4 import BeautifulSoup
from models import ScrapedBusiness
from scrapers.base import BaseScraper


class GoogleMapsScraper(BaseScraper):
    """Scrapes business listings from Google Maps using Playwright."""

    async def scrape(
        self,
        category: str,
        bounds: dict,
        max_results: int = 100,
    ) -> tuple[List[ScrapedBusiness], List[str]]:
        businesses: List[ScrapedBusiness] = []
        errors: List[str] = []
        seen: set[str] = set()

        # Use center of bounding box for a single search
        center_lat = (bounds["north"] + bounds["south"]) / 2
        center_lng = (bounds["east"] + bounds["west"]) / 2

        try:
            results, errs = await self._search_area(category, center_lat, center_lng, max_results)
            errors.extend(errs)
            for biz in results:
                key = biz.google_place_id or f"{biz.name}|{biz.address}"
                if key not in seen:
                    seen.add(key)
                    businesses.append(biz)
        except Exception as e:
            errors.append(f"Search failed: {str(e)[:200]}")

        return businesses[:max_results], errors

    async def _search_area(
        self, category: str, lat: float, lng: float, max_results: int = 20
    ) -> tuple[List[ScrapedBusiness], List[str]]:
        businesses: List[ScrapedBusiness] = []
        errors: List[str] = []

        try:
            from playwright.async_api import async_playwright

            url = f"https://www.google.com/maps/search/{category}/@{lat},{lng},13z"

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                )

                await page.goto(url, wait_until="domcontentloaded", timeout=15000)

                # Wait for results to load
                try:
                    await page.wait_for_selector('div[role="feed"]', timeout=8000)
                except Exception:
                    errors.append("No results feed found - may be blocked or no results")

                # Scroll the results panel to load more
                feed = page.locator('div[role="feed"]')
                for _ in range(3):
                    try:
                        await feed.evaluate("el => el.scrollTop = el.scrollHeight")
                        await asyncio.sleep(1.5)
                    except Exception:
                        break

                html = await page.content()
                await browser.close()

            # Parse results
            soup = BeautifulSoup(html, "html.parser")

            # Find all result containers - Google Maps uses aria-label on links
            for link in soup.find_all("a", attrs={"aria-label": True}):
                if len(businesses) >= max_results:
                    break

                try:
                    biz = self._parse_result_from_soup(link, soup)
                    if biz:
                        businesses.append(biz)
                except Exception as e:
                    errors.append(f"Parse error: {str(e)[:100]}")

        except Exception as e:
            errors.append(f"Playwright error: {str(e)[:200]}")

        return businesses, errors

    def _parse_result_from_soup(self, link_el, soup) -> ScrapedBusiness | None:
        name = link_el.get("aria-label", "").strip()
        if not name or len(name) < 2:
            return None

        # Skip non-business links
        href = link_el.get("href", "")
        if "/maps/place/" not in href and "data=" not in href:
            return None

        # Extract place_id from URL
        place_id = None
        match = re.search(r"!1s(0x[a-f0-9]+:0x[a-f0-9]+)", href)
        if match:
            place_id = match.group(1)

        # Find the parent container to get more details
        parent = link_el.find_parent()
        for _ in range(5):
            if parent is None:
                break
            # Look for a container with enough text content
            text = parent.get_text(separator=" ", strip=True)
            if len(text) > len(name) + 20:
                break
            parent = parent.find_parent()

        rating = None
        address = None
        phone = None
        category_text = None
        review_count = None

        if parent:
            text_content = parent.get_text(separator="\n", strip=True)
            lines = [l.strip() for l in text_content.split("\n") if l.strip()]

            for line in lines:
                # Rating (e.g., "4.5" or "4.5(127)")
                rating_match = re.match(r"^(\d+\.\d+)\s*(?:\((\d[\d,]*)\))?$", line)
                if rating_match and not rating:
                    rating = float(rating_match.group(1))
                    if rating_match.group(2):
                        review_count = int(rating_match.group(2).replace(",", ""))
                    continue

                # Phone number
                if re.match(r"^\(?[0-9]{3}\)?[- .][0-9]{3}[- .][0-9]{4}$", line):
                    phone = line
                    continue

                # Address (starts with number, contains street-like words)
                if re.match(r"^\d+\s+\w+", line) and len(line) < 80:
                    if any(w in line.lower() for w in ["st", "ave", "rd", "dr", "blvd", "way", "cr", "princess", "king", "ontario"]):
                        address = line
                        continue

                # Category (short text, no numbers at start)
                if not category_text and len(line) < 40 and not line[0].isdigit() and line != name:
                    if any(c in line.lower() for c in ["restaurant", "cafe", "bar", "pub", "shop", "store", "museum", "hotel", "bakery", "pizza", "sushi", "indian", "thai", "chinese", "italian", "mexican"]):
                        category_text = line

        return ScrapedBusiness(
            name=name,
            address=address,
            phone=phone,
            rating=rating,
            review_count=review_count,
            category=category_text,
            google_place_id=place_id,
        )
