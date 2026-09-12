const puppeteer = require('puppeteer');
const fs = require('fs');

const TARGET_URLS = [
    "https://www.staffingindustry.com/",
    "https://recruitingdaily.com/"
];

async function scrapeNews() {
    console.log("Initializing Puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const results = [];

    for (const url of TARGET_URLS) {
        console.log(`Crawling ${url}...`);
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            // Extract the main body text to simulate raw extraction
            const textContent = await page.evaluate(() => document.body.innerText.substring(0, 3000));
            results.push({
                url: url,
                content: textContent,
                success: true
            });
        } catch (e) {
            console.error(`Error crawling ${url}: ${e.message}`);
            results.push({ url: url, success: false, error: e.message });
        }
    }
    
    await browser.close();
    fs.writeFileSync("scraper_output.json", JSON.stringify(results, null, 2));
    console.log("Scraping complete. Results saved to scraper_output.json");
}

scrapeNews();
