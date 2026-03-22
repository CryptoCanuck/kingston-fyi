"""News article scraper using Scrapling."""
import asyncio
from typing import List
from scrapling import StealthCrawler
from models import NewsArticleScraped


async def scrape_news(
    url: str,
    source_name: str,
    config: dict,
) -> tuple[List[NewsArticleScraped], List[str]]:
    """
    Scrape news articles from a website using CSS selectors from config.

    Config format:
    {
        "article_selector": "article",
        "title_selector": "h2 a",
        "link_selector": "h2 a",
        "content_selector": ".article-body",
        "date_selector": "time",
        "thumbnail_selector": "img",
    }
    """
    articles: List[NewsArticleScraped] = []
    errors: List[str] = []

    article_sel = config.get("article_selector", "article")
    title_sel = config.get("title_selector", "h2 a, h3 a")
    link_sel = config.get("link_selector", "h2 a, h3 a")
    date_sel = config.get("date_selector", "time")
    thumb_sel = config.get("thumbnail_selector", "img")

    try:
        crawler = StealthCrawler()
        page = await asyncio.to_thread(crawler.fetch, url)

        if not page or page.status != 200:
            errors.append(f"Failed to fetch {url}: status {getattr(page, 'status', 'unknown')}")
            return articles, errors

        results = page.css(article_sel)

        for result in results[:50]:
            try:
                title_el = result.css_first(title_sel)
                if not title_el:
                    continue

                title = title_el.text.strip() if title_el.text else ""
                if not title:
                    continue

                link_el = result.css_first(link_sel)
                article_url = link_el.attrib.get("href", "") if link_el else ""
                if article_url and not article_url.startswith("http"):
                    # Make relative URL absolute
                    from urllib.parse import urljoin
                    article_url = urljoin(url, article_url)

                if not article_url:
                    continue

                date_el = result.css_first(date_sel)
                published = date_el.attrib.get("datetime", date_el.text) if date_el else None

                thumb_el = result.css_first(thumb_sel)
                thumbnail = thumb_el.attrib.get("src", "") if thumb_el else None

                articles.append(NewsArticleScraped(
                    title=title,
                    url=article_url,
                    published_at=published,
                    thumbnail_url=thumbnail,
                    source_name=source_name,
                ))

            except Exception as e:
                errors.append(f"Parse error: {str(e)}")
                continue

    except Exception as e:
        errors.append(f"Scrape error for {url}: {str(e)}")

    return articles, errors
