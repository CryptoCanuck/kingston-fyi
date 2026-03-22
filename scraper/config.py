"""City bounding boxes and category mappings for scraping."""

CITY_BOUNDS = {
    "kingston": {"north": 44.2800, "south": 44.2000, "east": -76.4200, "west": -76.5600},
    "ottawa": {"north": 45.5000, "south": 45.3500, "east": -75.6000, "west": -75.8000},
    "montreal": {"north": 45.5800, "south": 45.4400, "east": -73.4800, "west": -73.6600},
    "toronto": {"north": 43.8555, "south": 43.5810, "east": -79.1168, "west": -79.6393},
    "vancouver": {"north": 49.3170, "south": 49.1990, "east": -123.0234, "west": -123.2247},
}

# Google Maps search categories mapped to our taxonomy
SCRAPE_CATEGORIES = {
    "restaurant": ["restaurant", "restaurants", "dining"],
    "bar": ["bar", "pub", "lounge"],
    "nightclub": ["nightclub", "club", "dance club"],
    "cafe": ["cafe", "coffee shop", "coffee"],
    "bakery": ["bakery", "pastry shop"],
    "shopping": ["shopping", "store", "boutique", "retail"],
    "attraction": ["tourist attraction", "museum", "gallery", "landmark"],
    "activity": ["gym", "fitness", "recreation", "spa", "yoga"],
    "service": ["service", "repair", "professional services"],
}

# Category normalization map
CATEGORY_ALIASES = {
    "restaurants": "restaurant",
    "dining": "restaurant",
    "pubs": "bar",
    "pub": "bar",
    "lounge": "bar",
    "clubs": "nightclub",
    "dance club": "nightclub",
    "coffee shop": "cafe",
    "coffee": "cafe",
    "pastry shop": "bakery",
    "store": "shopping",
    "boutique": "shopping",
    "retail": "shopping",
    "museum": "attraction",
    "gallery": "attraction",
    "landmark": "attraction",
    "gym": "activity",
    "fitness": "activity",
    "recreation": "activity",
    "spa": "activity",
    "yoga": "activity",
    "repair": "service",
    "professional services": "service",
}


def normalize_category(raw_category: str) -> str:
    """Normalize a raw category string to our taxonomy."""
    lower = raw_category.lower().strip()
    return CATEGORY_ALIASES.get(lower, lower)
