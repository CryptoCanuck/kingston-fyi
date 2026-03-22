FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for Scrapling/Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget curl gnupg ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers for Scrapling
RUN pip install playwright && playwright install --with-deps chromium

COPY . .

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
