from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ScrapedBusiness(BaseModel):
    """Raw business data from scraping."""
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    category: Optional[str] = None
    subcategories: list[str] = Field(default_factory=list)
    hours: Optional[dict] = None
    photos: list[str] = Field(default_factory=list)
    google_place_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None


class ScrapeRequest(BaseModel):
    """Request to scrape businesses in an area."""
    city_id: str
    category: str
    bounds: dict = Field(description="Bounding box: north, south, east, west")
    max_results: int = 100


class ScrapeResponse(BaseModel):
    """Response from a scrape job."""
    city_id: str
    category: str
    businesses: list[ScrapedBusiness]
    total_found: int
    errors: list[str] = Field(default_factory=list)


class NewsArticleScraped(BaseModel):
    """Scraped news article data."""
    title: str
    url: str
    content: Optional[str] = None
    published_at: Optional[str] = None
    thumbnail_url: Optional[str] = None
    source_name: str


class NewsScrapeRequest(BaseModel):
    """Request to scrape news from a source."""
    url: str
    source_name: str
    scrape_config: dict = Field(default_factory=dict)


class NewsScrapeResponse(BaseModel):
    """Response from news scraping."""
    articles: list[NewsArticleScraped]
    errors: list[str] = Field(default_factory=list)
