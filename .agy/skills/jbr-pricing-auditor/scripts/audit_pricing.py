import asyncio
import json
import argparse
from crawl4ai import AsyncWebCrawler

async def audit_pricing(urls):
    results = []
    print("Initializing Crawl4AI Auditor...")
    async with AsyncWebCrawler(verbose=True) as crawler:
        for url in urls:
            print(f"Auditing pricing for {url}...")
            try:
                result = await crawler.arun(url=url)
                # Keep first 3000 chars of markdown to capture pricing info
                results.append({
                    "url": url,
                    "pricing_context": result.markdown[:3000] if result.markdown else "No content",
                    "success": result.success
                })
            except Exception as e:
                print(f"Error auditing {url}: {e}")
    
    with open("auditor_output.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print("Auditing complete. Results saved to auditor_output.json")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Crawl4AI Pricing Auditor")
    parser.add_argument("--urls", type=str, required=True, help="Comma-separated list of URLs to audit")
    args = parser.parse_args()
    
    url_list = [u.strip() for u in args.urls.split(",") if u.strip()]
    asyncio.run(audit_pricing(url_list))
