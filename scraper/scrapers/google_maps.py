"""Google Maps scraper using Scrapling."""
import asyncio
import json
import re
from typing import List
from scrapling import StealthCrawler
from models import ScrapedBusiness
from scrapers.base import BaseScraper


class GoogleMapsScraper(BaseScraper):
    """Scrapes business listings from Google Maps using Scrapling."""

    async def scrape(
        self,
        category: str,
        bounds: dict,
        max_results: int = 100,
    ) -> tuple[List[ScrapedBusiness], List[str]]:
        """
        Scrape Google Maps for businesses in a bounding box.

        Uses a grid-based approach: divides the bounding box into cells
        and searches each cell for the given category.
        """
        businesses: List[ScrapedBusiness] = []
        errors: List[str] = []
        seen_ids: set[str] = set()

        # Calculate grid cells based on bounding box size
        lat_range = bounds["north"] - bounds["south"]
        lng_range = bounds["east"] - bounds["west"]
        grid_size = max(1, int(max(lat_range, abs(lng_range)) / 0.02))

        lat_step = lat_range / grid_size
        lng_step = lng_range / grid_size

        for i in range(grid_size):
            for j in range(grid_size):
                if len(businesses) >= max_results:
                    break

                center_lat = bounds["south"] + (i + 0.5) * lat_step
                center_lng = bounds["west"] + (j + 0.5) * lng_step

                try:
                    results = await self._search_area(
                        category, center_lat, center_lng
                    )
                    for biz in results:
                        key = biz.google_place_id or f"{biz.name}|{biz.address}"
                        if key not in seen_ids:
                            seen_ids.add(key)
                            businesses.append(biz)
                except Exception as e:
                    errors.append(f"Grid ({i},{j}): {str(e)}")

                # Rate limiting
                await asyncio.sleep(1.5)

        return businesses[:max_results], errors

    async def _search_area(
        self, category: str, lat: float, lng: float
    ) -> List[ScrapedBusiness]:
        """Search a specific area for businesses."""
        businesses: List[ScrapedBusiness] = []

        try:
            url = f"https://www.google.com/maps/search/{category}/@{lat},{lng},14z"
            crawler = StealthCrawler()
            page = await asyncio.to_thread(crawler.fetch, url)

            if not page or not page.status == 200:
                return businesses

            # Extract business data from the page
            # Google Maps renders results in a specific DOM structure
            results = page.css('div[role="feed"] > div')

            for result in results[:20]:
                try:
                    biz = self._parse_result(result)
                    if biz:
                        businesses.append(biz)
                except Exception:
                    continue

        except Exception as e:
            raise RuntimeError(f"Failed to search area ({lat}, {lng}): {e}")

        return businesses

    def _parse_result(self, element) -> ScrapedBusiness | None:
        """Parse a single search result element into a ScrapedBusiness."""
        try:
            name_el = element.css_first('a[aria-label]')
            if not name_el:
                return None

            name = name_el.attrib.get("aria-label", "").strip()
            if not name:
                return None

            # Extract href for place ID
            href = name_el.attrib.get("href", "")
            place_id = None
            if "place/" in href:
                # Extract from URL pattern
                match = re.search(r"place/[^/]+/data=.*!1s(0x[a-f0-9]+:0x[a-f0-9]+)", href)
                if match:
                    place_id = match.group(1)

            # Extract rating
            rating = None
            rating_el = element.css_first('span[role="img"]')
            if rating_el:
                aria = rating_el.attrib.get("aria-label", "")
                match = re.search(r"([\d.]+)\s*star", aria)
                if match:
                    rating = float(match.group(1))

            # Extract address and other text info
            text_els = element.css("div.fontBodyMedium span")
            address = None
            phone = None
            category_text = None

            for tel in text_els:
                text = tel.text.strip() if tel.text else ""
                if re.match(r"^\(\d{3}\)", text) or re.match(r"^\+\d", text):
                    phone = text
                elif re.match(r"^\d+\s", text) or ", " in text:
                    address = text
                elif not category_text and text and len(text) < 50:
                    category_text = text

            return ScrapedBusiness(
                name=name,
                address=address,
                phone=phone,
                rating=rating,
                category=category_text,
                google_place_id=place_id,
            )

        except Exception:
            return None
