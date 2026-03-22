"""Base scraper class for all scraping implementations."""
from abc import ABC, abstractmethod
from typing import List
from models import ScrapedBusiness


class BaseScraper(ABC):
    """Abstract base class for business scrapers."""

    @abstractmethod
    async def scrape(
        self,
        category: str,
        bounds: dict,
        max_results: int = 100,
    ) -> tuple[List[ScrapedBusiness], List[str]]:
        """
        Scrape businesses in a bounding box for a given category.

        Returns:
            Tuple of (businesses, errors)
        """
        pass
