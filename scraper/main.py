"""FastAPI scraper service for CityFYI."""
from fastapi import FastAPI, HTTPException
from models import (
    ScrapeRequest, ScrapeResponse,
    NewsScrapeRequest, NewsScrapeResponse,
)
from scrapers.google_maps import GoogleMapsScraper
from scrapers.news import scrape_news

app = FastAPI(title="CityFYI Scraper", version="1.0.0")

google_scraper = GoogleMapsScraper()


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
