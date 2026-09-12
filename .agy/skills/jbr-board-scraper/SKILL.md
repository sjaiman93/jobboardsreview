---
name: jbr-board-scraper
description: Scrapes US staffing news sites for updates on job boards, ATS, and recruiting tech using Node.js & Puppeteer.
---

# JBR Board Scraper Skill

This skill is used to monitor the US staffing industry for news related to job boards, ATS platforms, AI recruiting tools, and pricing changes.

## Prerequisites

This skill runs natively in your existing Node.js environment using `puppeteer` and `cheerio`.

## Workflow

When the user asks to "run the board scraper" or "check for job board news":

1.  **Execute the Scraper Script**:
    Run the Node script located at `scripts/scrape_news.js`.
    ```bash
    node .agy/skills/jbr-board-scraper/scripts/scrape_news.js
    ```

2.  **Analyze the Output**:
    The script will output a JSON list of recent articles from key staffing news sources to `scraper_output.json`.

3.  **Filter and Format**:
    Read the output and filter for articles specifically mentioning "job board", "pricing", "acquisition", "ATS", or "AI recruiting".

4.  **Present to User**:
    Present the findings to the user in a structured format:
    *   **Title**: 
    *   **Source URL**:
    *   **Relevance**: (e.g., "New Board", "Pricing Change", "Industry News")
    *   **Summary**: A brief summary of why it matters for JBR.
    *   **Recommendation**: "Write Blog Post" or "Add to Directory".
