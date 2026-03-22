"""FastAPI scraper service for CityFYI."""
import asyncio
import json
import re
from typing import Optional
from urllib.parse import urljoin

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from bs4 import BeautifulSoup
from models import (
    ScrapeRequest, ScrapeResponse,
    NewsScrapeRequest, NewsScrapeResponse,
)
from scrapers.google_maps import GoogleMapsScraper
from scrapers.news import scrape_news

app = FastAPI(title="CityFYI Scraper", version="1.0.0")

google_scraper = GoogleMapsScraper()


# ============================================================
# Enrichment models
# ============================================================

class EnrichRequest(BaseModel):
    url: str
    business_name: str


class EnrichResponse(BaseModel):
    images: list[str] = Field(default_factory=list)
    og_image: Optional[str] = None
    og_description: Optional[str] = None
    social_media: dict = Field(default_factory=dict)
    email: Optional[str] = None
    phone: Optional[str] = None
    hours: Optional[dict] = None
    features: list[str] = Field(default_factory=list)
    verified_name: Optional[str] = None
    errors: list[str] = Field(default_factory=list)


class GoogleSearchRequest(BaseModel):
    business_name: str
    city: str = "Kingston ON"


class GoogleSearchResponse(BaseModel):
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = None
    hours: Optional[dict] = None
    images: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)


# ============================================================
# Endpoints
# ============================================================

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/scrape/businesses", response_model=ScrapeResponse)
async def scrape_businesses(request: ScrapeRequest):
    """Scrape businesses from Google Maps for a city/category."""
    try:
        businesses, errors = await google_scraper.scrape(
            category=request.category,
            bounds=request.bounds,
            max_results=request.max_results,
        )
        return ScrapeResponse(
            city_id=request.city_id,
            category=request.category,
            businesses=businesses,
            total_found=len(businesses),
            errors=errors,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scrape/news", response_model=NewsScrapeResponse)
async def scrape_news_endpoint(request: NewsScrapeRequest):
    """Scrape news articles from a website."""
    try:
        articles, errors = await scrape_news(
            url=request.url,
            source_name=request.source_name,
            config=request.scrape_config,
        )
        return NewsScrapeResponse(
            articles=articles,
            errors=errors,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/enrich/website", response_model=EnrichResponse)
async def enrich_from_website(request: EnrichRequest):
    """
    Scrape a business website using headless Chromium (Playwright)
    to extract images, social links, contact info, hours, etc.
    """
    errors = []
    result = EnrichResponse()

    try:
        from playwright.async_api import async_playwright

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            )

            try:
                await page.goto(request.url, wait_until="networkidle", timeout=15000)
            except Exception as e:
                errors.append(f"Navigation failed: {str(e)[:100]}")
                try:
                    await page.goto(request.url, wait_until="domcontentloaded", timeout=10000)
                except Exception as e2:
                    errors.append(f"Fallback navigation also failed: {str(e2)[:100]}")
                    await browser.close()
                    result.errors = errors
                    return result

            html = await page.content()
            final_url = page.url
            await browser.close()

        soup = BeautifulSoup(html, "html.parser")

        # Verify this is the right business (check title/h1 for name)
        title = soup.title.string if soup.title else ""
        h1 = soup.find("h1")
        h1_text = h1.get_text() if h1 else ""
        name_lower = request.business_name.lower()

        if name_lower not in title.lower() and name_lower not in h1_text.lower():
            # Check if any part of the business name appears
            name_parts = [w for w in name_lower.split() if len(w) > 3]
            page_text = (title + " " + h1_text).lower()
            matches = sum(1 for part in name_parts if part in page_text)
            if matches < len(name_parts) / 2:
                errors.append(f"Name mismatch: page title '{title[:60]}' doesn't match '{request.business_name}'")

        result.verified_name = title.strip()[:100] if title else None

        # OpenGraph
        og_img = soup.find("meta", property="og:image")
        if og_img and og_img.get("content"):
            result.og_image = _resolve(og_img["content"], final_url)

        og_desc = soup.find("meta", property="og:description")
        if not og_desc:
            og_desc = soup.find("meta", attrs={"name": "description"})
        if og_desc and og_desc.get("content"):
            result.og_description = og_desc["content"][:500]

        # Images - collect good ones
        seen = set()
        if result.og_image:
            seen.add(result.og_image)
            result.images.append(result.og_image)

        for img in soup.find_all("img", src=True):
            src = _resolve(img["src"], final_url)
            if not src or src in seen:
                continue
            # Skip junk
            if any(x in src.lower() for x in [
                "pixel", "spacer", "tracking", ".svg", "favicon",
                "logo", "icon", "spinner", "loading", "placeholder",
                "1x1", "badge", "widget", "button"
            ]):
                continue
            # Skip data URIs and tiny images
            if src.startswith("data:"):
                continue
            width = img.get("width", "")
            if width and width.isdigit() and int(width) < 80:
                continue
            seen.add(src)
            result.images.append(src)
            if len(result.images) >= 8:
                break

        # Social media
        social_patterns = {
            "facebook": r"facebook\.com/(?!sharer)[^\"'\s)#]+",
            "instagram": r"instagram\.com/[^\"'\s)#]+",
            "twitter": r"(?:twitter|x)\.com/[^\"'\s)#]+",
            "tiktok": r"tiktok\.com/@[^\"'\s)#]+",
            "youtube": r"youtube\.com/(?:channel|c|@|user)[^\"'\s)#]+",
            "tripadvisor": r"tripadvisor\.(?:com|ca)/[^\"'\s)#]+",
            "yelp": r"yelp\.(?:com|ca)/biz/[^\"'\s)#]+",
        }

        for a in soup.find_all("a", href=True):
            href = a["href"]
            for platform, pattern in social_patterns.items():
                if platform not in result.social_media:
                    m = re.search(pattern, href, re.IGNORECASE)
                    if m:
                        result.social_media[platform] = "https://" + m.group(0).rstrip("/")

        # Email
        emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", html)
        for email in emails:
            if not any(x in email.lower() for x in [
                "example", "sentry", "webpack", "wix", "schema.org",
                "cloudflare", "google", "facebook"
            ]):
                result.email = email
                break

        # Phone
        tel_link = soup.find("a", href=re.compile(r"^tel:"))
        if tel_link:
            result.phone = tel_link["href"].replace("tel:", "").strip()
        else:
            phone_match = re.search(r"(?:\+1[- ]?)?\(?[0-9]{3}\)?[- .][0-9]{3}[- .][0-9]{4}", html)
            if phone_match:
                result.phone = phone_match.group(0)

        # Structured data (JSON-LD)
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string or "{}")
                items = data if isinstance(data, list) else [data]
                for item in items:
                    item_type = item.get("@type", "")
                    if item_type in ("Restaurant", "LocalBusiness", "FoodEstablishment",
                                     "CafeOrCoffeeShop", "BarOrPub", "Store", "TouristAttraction"):
                        if item.get("telephone") and not result.phone:
                            result.phone = item["telephone"]
                        if item.get("email") and not result.email:
                            result.email = item["email"]
                        if item.get("image"):
                            imgs = item["image"] if isinstance(item["image"], list) else [item["image"]]
                            for img_url in imgs[:5]:
                                if isinstance(img_url, str) and img_url not in seen:
                                    result.images.append(_resolve(img_url, final_url))
                                    seen.add(img_url)
                        if item.get("openingHoursSpecification"):
                            specs = item["openingHoursSpecification"]
                            if not isinstance(specs, list):
                                specs = [specs]
                            hours = {}
                            for spec in specs:
                                days = spec.get("dayOfWeek", [])
                                if not isinstance(days, list):
                                    days = [days]
                                for day in days:
                                    day_name = day.split("/")[-1].lower()
                                    hours[day_name] = f"{spec.get('opens', '?')} - {spec.get('closes', '?')}"
                            if hours:
                                result.hours = hours
                        if item.get("servesCuisine"):
                            cuisines = item["servesCuisine"]
                            if not isinstance(cuisines, list):
                                cuisines = [cuisines]
                            result.features.extend(cuisines)
            except (json.JSONDecodeError, TypeError):
                pass

    except Exception as e:
        errors.append(f"Enrichment failed: {str(e)[:200]}")

    result.errors = errors
    return result


@app.post("/search/google", response_model=GoogleSearchResponse)
async def search_google_for_business(request: GoogleSearchRequest):
    """
    Search Google for a business to find its verified website, phone, etc.
    Uses headless Chromium to render Google search results.
    """
    errors = []
    result = GoogleSearchResponse()

    try:
        from playwright.async_api import async_playwright

        query = f"{request.business_name} {request.city}"
        search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            )
            await page.goto(search_url, wait_until="domcontentloaded", timeout=10000)
            await asyncio.sleep(2)  # Let knowledge panel load
            html = await page.content()
            await browser.close()

        soup = BeautifulSoup(html, "html.parser")

        # Extract from Google Knowledge Panel
        # Website link
        for a in soup.find_all("a", href=True):
            href = a["href"]
            text = a.get_text().lower()
            if "website" in text or "visit" in text:
                if href.startswith("http") and "google" not in href:
                    result.website = href.split("&")[0] if "&" in href else href
                    break

        # Phone from knowledge panel
        phone_match = re.search(r"(?:\+1[- ]?)?\(?[0-9]{3}\)?[- .][0-9]{3}[- .][0-9]{4}", html)
        if phone_match:
            result.phone = phone_match.group(0)

        # Address
        for span in soup.find_all("span"):
            text = span.get_text()
            if re.match(r"^\d+\s+\w+.*(?:St|Ave|Rd|Dr|Blvd|Way|Cr|Ct)", text):
                if "Kingston" in text or "ON" in text or len(text) < 100:
                    result.address = text.strip()
                    break

    except Exception as e:
        errors.append(f"Google search failed: {str(e)[:200]}")

    result.errors = errors
    return result


@app.post("/details/maps")
async def get_maps_details(request: GoogleSearchRequest):
    """Get detailed business info from Google Maps (clicks into the listing)."""
    from scrapers.maps_details import get_place_details
    try:
        result = await get_place_details(request.business_name, request.city)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _resolve(src: str, base: str) -> str:
    """Resolve a relative URL against a base URL."""
    if not src:
        return ""
    if src.startswith("//"):
        return "https:" + src
    if src.startswith("http"):
        return src
    try:
        return urljoin(base, src)
    except Exception:
        return src
