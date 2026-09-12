const puppeteer = require('puppeteer');
const fs = require('fs');

async function auditPricing() {
    const args = process.argv.slice(2);
    const urlArgIndex = args.indexOf('--urls');
    if (urlArgIndex === -1 || !args[urlArgIndex + 1]) {
        console.error("Please provide urls using --urls <comma-separated-urls>");
        process.exit(1);
    }
    const urlList = args[urlArgIndex + 1].split(',').map(u => u.trim()).filter(u => u);
    
    console.log("Initializing Puppeteer Auditor...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const results = [];

    for (const url of urlList) {
        console.log(`Auditing pricing for ${url}...`);
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            // Extract the main body text to simulate raw extraction
            const textContent = await page.evaluate(() => document.body.innerText.substring(0, 4000));
            results.push({
                url: url,
                pricing_context: textContent,
                success: true
            });
        } catch (e) {
            console.error(`Error auditing ${url}: ${e.message}`);
            results.push({ url: url, success: false, error: e.message });
        }
    }
    
    await browser.close();
    fs.writeFileSync("auditor_output.json", JSON.stringify(results, null, 2));
    console.log("Auditing complete. Results saved to auditor_output.json");
}

auditPricing();
