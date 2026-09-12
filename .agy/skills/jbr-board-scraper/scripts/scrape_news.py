import asyncio
import json
from crawl4ai import AsyncWebCrawler

# Target URLs for staffing news
TARGET_URLS = [
    "https://www.staffingindustry.com/",
    "https://recruitingdaily.com/"
]

async def scrape_news():
    results = []
    print("Initializing Crawl4AI...")
    async with AsyncWebCrawler(verbose=True) as crawler:
        for url in TARGET_URLS:
            print(f"Crawling {url}...")
            try:
                result = await crawler.arun(url=url)
                # Extract markdown content and basic metadata
                results.append({
                    "url": url,
                    "content": result.markdown[:2000] if result.markdown else "No content extracted",
                    "success": result.success
                })
            except Exception as e:
                print(f"Error crawling {url}: {e}")
    
    # Output as JSON for the agent to parse
    with open("scraper_output.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print("Scraping complete. Results saved to scraper_output.json")

if __name__ == "__main__":
    asyncio.run(scrape_news())
