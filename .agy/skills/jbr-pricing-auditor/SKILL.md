---
name: jbr-pricing-auditor
description: Audits all job boards in the JobBoardsReview database against their live websites using Node.js & Puppeteer.
---

# JBR Pricing Auditor Skill

Job boards frequently change their pricing tiers (e.g., Pay-Per-Post vs. Subscription) without announcing it. This skill helps ensure `data/jobboards/*.js` remains accurate.

## Prerequisites

This skill runs natively in your existing Node.js environment using `puppeteer`.

## Workflow

When the user asks to "audit job board pricing" or "check if pricing is up to date":

1.  **Extract Target URLs**:
    Read the `data/jobboards/` directory to get a list of all current job board objects and their `website` or pricing page URLs.

2.  **Execute the Auditor Script**:
    The agent should run the script at `scripts/audit_pricing.js`, passing a batch of URLs to check.
    ```bash
    node .agy/skills/jbr-pricing-auditor/scripts/audit_pricing.js --urls <comma-separated-urls>
    ```

3.  **Analyze the Output**:
    The script will use Puppeteer to extract text from the target pages. The agent must:
    *   Compare the scraped text against the `pricing` and `pricingSummary` fields currently in the database.
    *   Look for keywords like "$", "per post", "subscription", "free trial", "contact sales".

4.  **Report Discrepancies**:
    Present any found discrepancies to the user:
    *   **Board**: [Name]
    *   **Current DB Pricing**: [Value]
    *   **Live Website Pricing**: [Detected Value]
    *   **Action**: Prompt the user to confirm if the database should be updated.
