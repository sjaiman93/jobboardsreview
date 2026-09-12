---
name: jbr-code-auditor
description: A comprehensive code auditing pipeline that runs ESLint, NPM Audit, and Knip to find bugs, security flaws, and dead code.
---

# JBR Code Auditor Skill

This skill is used to ensure the JobBoardsReview codebase is perfectly optimized, secure, and clean before pushing to production.

## Prerequisites

This skill runs locally using Node.js and NPX. It requires no external API keys.

## Workflow

When the user asks to "audit the code" or "run a code review":

1.  **Run Security Audit**:
    Execute `npm audit` to check for CVEs and vulnerability reports in third-party dependencies.
    
2.  **Run React/Next.js Linter**:
    Execute `npm run lint` to catch React anti-patterns, missing dependencies in `useEffect`, and accessibility issues.

3.  **Run Dead Code Scanner (Knip)**:
    Execute `npx knip@latest` to find unused files, unreferenced exports, and unused NPM dependencies.

4.  **AI Analysis**:
    The agent must read the outputs of all three tools, synthesize the warnings, and present a prioritized "Code Review Report" to the user, suggesting exact fixes for the most critical issues.
