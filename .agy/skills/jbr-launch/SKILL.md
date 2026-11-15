---
name: jbr-launch
description: Pre-launch fixes for the JobBoardsReview Next.js site before cutover from the Lovable build. One task at a time, reviewed before commit.
---

# JBR Launch Fixes

Sixteen planned tasks (T1–T16), plus nine added while working (T3b–T3d,
T17–T20). Status as of 15 Nov 2026 is in the task index below.
Run **one task per session**. Stop after each. Do not chain them.

## Rules that apply to every task

1. Change only the files the task names. Do not refactor anything else.
2. Do not invent facts, prices, dates, reviews or board descriptions. If a task needs a fact that is not in the repo, stop and ask Sagar.
3. Run `npm run build` before reporting done. If it fails, fix it or report the failure.
4. **Never run `git commit`, `git push`, or `git add`.** Sagar reviews the diff first.
5. When finished, report in this shape:
   - files changed
   - what each change does
   - the acceptance check result
   - anything you could not do, and why

## Review loop

After each task:

```
npm run build
git diff
```

Sagar pastes the diff to Claude for review. Only after approval:

```
git add -A && git commit -m "JBR-T<n>: <short description>"
```

## Task index

| # | Task | Blocks launch | Status |
| --- | --- | --- | --- |
| T1 | Port the blog post | Yes | **Done** — 3 posts, not 1; text verified identical |
| T2 | Add JSON-LD structured data | Yes | Open |
| T3 | Remove dead job boards | Yes | **Done** (`ebe41d3`) |
| T3b | Board liveness sweep | Yes | **Done** — not committed (`scratch/` is gitignored) |
| T3c | Re-probe boards that returned 403 | Yes | **Done** — not committed; 20 boards still unconfirmed, see T3c |
| T3d | 11-board cleanup | Yes | **Done** — uncommitted in working tree |
| T4 | Verify the redirect map | Yes | Open |
| T5 | Add Open Graph and Twitter cards | Yes | **Done** — 1200×630 banner from Canva |
| T6 | Decide the admin write strategy | Yes | **Done** — option A, local-only admin |
| T7 | Add blog posts to sitemap | No | Open |
| T8 | Real lastModified dates | No | Open |
| T9 | Add canonical URLs and title template | No | Open |
| T10 | Add lastVerified to boards | No | Open |
| T11 | Complete .env.example | No | Open |
| T12 | Fix zero-review rating display | No | Open |
| T13 | Repo hygiene | Post-launch | Open |
| T14 | Install analytics | Post-launch | Open |
| T15 | Add agent output validation | Post-launch | Open |
| T16 | Author page for Palak | Post-launch | Open |
| T17 | Fix hallucinated `react-quill` version | Yes | **Done** (`ebe41d3`) |
| T17b | Get `npm run build` green | Yes | **Done** (`ebe41d3`) |
| T18 / T18a | Wire admin approval to Supabase | Yes | **Done** (`ebe41d3`) |
| T19 | Gate `/admin` in production | Yes | **Done** (`ebe41d3`) |
| T20 | Await async `cookies()` / `headers()` | Yes | **Done** (`ebe41d3`) |

---

## T1 — Port the blog post

```
data/blogs.js currently holds one blank draft with an empty title and slug.
The live Lovable site has one published post (AI architecture comparison,
24 April 2026) that is missing from this repo.

Replace the blank draft entry with the real post. I will paste the title,
slug, body HTML, description and image URL — do not write the content
yourself and do not generate placeholder text.

Set status to "published" and createdAt to the original publish date,
not today.

Confirm /blog lists it and /blog/<slug> renders it.
Run npm run build. Do not commit.
```

**Acceptance:** `/blog` shows the post; `/blog/<slug>` renders the full body; no blank draft remains in `data/blogs.js`.

---

## T2 — Add JSON-LD structured data

```
There is no structured data anywhere in this repo. Add JSON-LD, rendered
as <script type="application/ld+json"> inside the existing server components.

- app/layout.js: Organization schema (name, url, logo). Include sameAs only
  if real social URLs already exist in components/Footer.js.
- app/blog/[slug]/page.js: Article schema (headline, datePublished, author, image).
- app/board/[slug]/page.js: FAQPage schema built from the existing
  boardProsCons / boardHighlightGroups data.

Do NOT add AggregateRating or Review schema. There are no real reviews yet
and fabricated ratings in schema are a policy violation.

Run npm run build. Do not commit.
```

**Acceptance:** Google Rich Results Test passes on the homepage, one board page and one blog post, with no warnings about missing required fields.

---

## T3 — Remove dead job boards

```
data/jobboards/stack-overflow-jobs.js describes a board that shut down in
2022, written in the present tense. Delete this board entirely: its data
file, and any references in data/index.js, data/boardProsCons.js,
data/boardDecisionTags.js, data/boardHighlightGroups.js and data/boardMetrics.js.

Then check data/jobboards/chronicle-vitae.js. It claims 26,000+ live roles.
Load its website URL and tell me what you find before changing anything —
do not delete it on your own judgement.

Add a 301 redirect in next.config.mjs from /board/stack-overflow-jobs to
/category/technology-engineering so the URL does not 404 after launch.

Run npm run build. Do not commit.
```

**Acceptance:** build passes with no broken references; `/board/stack-overflow-jobs` redirects; Chronicle Vitae reported on, not silently changed.

**Status: Done** (`ebe41d3`). The prompt's `/category/technology-engineering`
does not exist; the redirect points at `/category/technology`, the real slug.
Chronicle Vitae was reported on, then removed in T3d.

---

## T3b — Board liveness sweep

**Status: Done, not committed.** Run outside this file; the original prompt was
not recorded.

`scratch/sweep.mjs` checked DNS and HTTP for all 85 boards and wrote
`scratch/sweep_results.json`; `scratch/table_output.md` holds the verdict
table. Every board it marked DEAD, MOVED or URL_WRONG was handled in T3d.

`scratch/` is gitignored, so none of this is in git.

---

## T3c — Re-probe the 403 boards

**Status: Done, not committed.** Run outside this file; the original prompt was
not recorded.

`scratch/check_403.cjs`, `reverify_403.cjs` and `detailed_probe_403.cjs`
re-probed the 21 boards that returned 403 → `reverify_403_results.json`,
`detailed_probe_results.json`.

**Open follow-up:** 20 of those boards (all but Crunchboard, now removed) only
ever returned a Cloudflare / GoDaddy challenge page. That proves a server
answers, not that the job board is live. Crunchboard returned the same 403 and
turned out to be dead. Check the 20 by hand in a real browser before launch:

accounting-jobs-today, alliedtravelcareers, cfa-institute-jobs, clearancejobs,
coroflot, culinary-agents, foundation-list, geekwork, ihire, incredible-health,
ladders, lawyer-com-jobs, nalp-job-board, practicematch, remote-co,
startup-jobs, teamwork-online, wall-street-oasis-jobs, we-work-remotely,
workinsports.

---

## T3d — 11-board cleanup

**Status: Done, uncommitted in the working tree.**

Removed, each with a 301 in `next.config.mjs` to its category page (board file
plus `data/index.js` and the four metadata files):

| Slug | Reason | Redirects to |
| --- | --- | --- |
| new-scientist-jobs | shutdown notice on /jobs-closed/ | `/category/science-research` |
| edsurge-jobs | "Job Board Is Unavailable" | `/category/education` |
| careervitals | original domain now a pizzeria | `/category/healthcare` |
| crunchboard | Cloudflare 1014, apex is dead Yahoo host | `/category/startups` |
| logistics-management-jobs | /jobs 404, no replacement | `/category/logistics-supply` |
| hired | absorbed into LHH | `/category/technology` |
| nursingjobs | redirects to AMN Healthcare listings | `/category/healthcare` |
| chronicle-vitae | retired product; text described it throughout | `/category/education` |

Renamed / repointed (name, website and logo only; descriptions untouched):

- teachers-teachers → "K12JobSpot", https://www.k12jobspot.com
- science-careers → name kept, https://www.science.org/careers
- workinlogistics → "JobsInLogistics.com", https://www.jobsinlogistics.com

Also:

- New category `science-research` ("Science & Research") in `data/categories.js`;
  nature-jobs and science-careers moved into it from healthcare.
- `app/compare/page.js` default slot `hired` → `dice`.

Known leftovers, not fixed:

- `logo.clearbit.com` does not resolve (checked 15 Nov 2026). 38 boards use it.
- `boardCount` in `data/categories.js` is hand-written and wrong for most categories.
- Unused logos in `public/logos/`: careervitals.jpg, crunchboard.jpg, edsurge-jobs.jpg.
- About 13 boards have a `categorySlug` that does not match what they are
  (e.g. cybersecjobs under generalist, usajobs under nonprofit-impact).

---

## T4 — Verify the redirect map

```
next.config.mjs defines fourteen redirects: five that assume the Lovable
site's URL structure, plus nine /board/<slug> redirects for removed boards
(T3, T3d). I need these verified, not assumed.

List every path pattern the redirects currently cover. Then tell me exactly
which live Lovable URLs I need to check to confirm each one is correct.

Do not change next.config.mjs yet. Report first.
```

**Acceptance:** a list of the exact Lovable URLs to spot-check, so nothing indexed gets 301'd into a 404.

---

## T5 — Add Open Graph and Twitter cards

```
There is no openGraph or twitter metadata anywhere in this repo. Every link
shared on LinkedIn, WhatsApp or X renders as a bare URL with no image.
The Lovable site had an OG image; this build lost it.

Add to app/layout.js metadata: openGraph (title, description, url, siteName,
images, locale, type) and twitter (card: "summary_large_image", title,
description, images).

Add page-specific openGraph in the existing generateMetadata functions in
app/board/[slug]/page.js, app/category/[slug]/page.js and
app/blog/[slug]/page.js — reuse each page's own title and description.

For the default image, use the existing /logo-highres.svg or /icon.svg only
if no PNG exists; OG images must be PNG or JPG at 1200x630. If there is no
suitable image, tell me and stop — do not generate one.

Run npm run build. Do not commit.
```

**Acceptance:** a board URL pasted into LinkedIn's Post Inspector shows a title, description and image.

---

## T6 — Decide the admin write strategy

```
This is a report-only task. Change nothing yet.

app/admin/actions.js uses fs.writeFileSync to write data/jobboards/<slug>.js,
data/index.js and storage/submissions.json at runtime. Serverless hosts
(Vercel included) have a read-only filesystem, so every admin action —
approving a board submission, adding a board, publishing a blog post —
will throw in production. It works locally, which is why it looks fine.

Note that the public site is unaffected: app/optimizer/actions.js and
app/actions/newsletter.js correctly write to Supabase.

Confirm this analysis by listing every fs write in app/admin/actions.js and
what each one writes. Then present the two options with their trade-offs:

A) Admin stays local-only. I run npm run dev, make changes, commit, push,
   Vercel rebuilds. No code change needed.
B) Migrate board and blog data to Supabase so admin works in production.

Do not implement either. Report and wait.
```

**Acceptance:** a list of every filesystem write in the admin layer, and a clear recommendation. This is a decision Sagar makes, not AG.

**Status: Done — option A.** Admin stays local-only. T19 enforces it (404 in
production). T18 moved submissions out of `storage/submissions.json` into
Supabase; board and blog data still live in files.

---

## T7 — Add blog posts to sitemap

```
app/sitemap.js imports getAllBoards and getAllCategories but never getBlogs,
so blog posts are never submitted to search engines.

Import getBlogs from @/data/blogs and add an entry per published post at
/blog/<slug>. Filter out drafts.

Run npm run build. Do not commit.
```

**Acceptance:** `/sitemap.xml` contains an entry for every published post and none for drafts.

---

## T8 — Real lastModified dates

```
app/sitemap.js sets lastModified: now on every URL, so every page claims to
have changed on every build. That makes the freshness signal meaningless.

Use a real per-record date where one exists: createdAt for blog posts,
and a static launch date constant for pages that genuinely do not change
(about, privacy, terms, cookies, disclaimer).

Leave the homepage and directory as now — those do change often.

Run npm run build. Do not commit.
```

**Acceptance:** `/sitemap.xml` shows differing `lastmod` values rather than one identical timestamp.

---

## T9 — Add canonical URLs and title template

```
Two gaps:

1. No page sets alternates.canonical. Next.js does not add canonicals
   automatically, and /directory, /categories and /category/<slug> list
   overlapping board sets, so duplicate-content risk is real. Add a
   self-referencing canonical to every page's metadata, including inside
   the generateMetadata functions on board, category and blog pages.

2. app/layout.js has no title.template, so any page without its own
   generateMetadata inherits the root title verbatim. Add
   template: "%s | JobBoardsReview" and check which pages currently
   fall through — /categories, /profile, /cookies, /disclaimer,
   /privacy, /terms. Give each a real title.

Run npm run build. Do not commit.
```

**Acceptance:** every route returns a self-referencing canonical; no two routes share a title tag.

---

## T10 — Add lastVerified to boards

```
Nothing in data/ records when a board's information was last checked, so
"updated weekly" is unprovable and jbr-pricing-auditor has nowhere to
write its results.

Add a lastVerified field (ISO date string) to the board object in every
file under data/jobboards/. Set it to null for now — do NOT invent dates.

Add a helper getBoardLastVerified(slug) in data/index.js, and display it
on app/board/[slug]/page.js only when it is not null.

Run npm run build. Do not commit.
```

**Acceptance:** every board object has the field; board pages show nothing when it is null; no fabricated dates anywhere.

---

## T11 — Complete .env.example

```
.env.example lists only ADMIN_PASSWORD, but lib/supabase.js reads three
more variables. A fresh deploy fails quietly.

Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and
SUPABASE_SERVICE_ROLE_KEY with placeholder values and a one-line comment
each. Check app/actions/turnstile.js and app/actions/newsletter.js for any
Turnstile or email API keys and add those too.

Use placeholders only. Never put a real key in this file.
```

**Acceptance:** every `process.env.*` referenced in the codebase appears in `.env.example`.

**Note (15 Nov 2026):** the code reads 8 variables besides `NODE_ENV`; only
`ADMIN_PASSWORD` is documented. Missing: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `MAILCHIMP_API_KEY`,
`MAILCHIMP_AUDIENCE_ID`.

---

## T12 — Fix zero-review rating display

```
components/StarRating.js and components/JobBoardCard.js render rating and
reviewCount. Show me what they display when a board has zero reviews.

If they render stars, a number, or any implied rating with no reviews
behind it, change them to show "No reviews yet" instead. Showing a rating
nobody gave is the same credibility problem as a fake testimonial.

Also check app/directory/layout.js — its title says "85+ Verified Hiring
Sites". Nothing in the repo verifies anything yet. Flag it; do not silently
reword it.

Run npm run build. Do not commit.
```

**Acceptance:** a board with zero reviews shows no stars and no numeric rating anywhere on the card or the detail page.

**Note (15 Nov 2026):** after T3/T3d there are 77 boards, so "85+" in the
`/directory` title is now false as well as unverified.

---

## T13 — Repo hygiene

```
This is a public repository. Clean it up.

1. Add storage/ to .gitignore and git rm --cached the two files in it.
   They are runtime write targets, not source. The current contents are
   test data (Jane Doe), so nothing real is exposed — but real submissions
   must never land in git.
2. Delete scratch/test_logic.js, scratch/test_submit.js and
   public/get-logo-png.html — dev scratch files served publicly.
3. legacy-jobboards.csv duplicates data/jobboards/ as a second source of
   truth. Tell me whether anything still reads it. If nothing does,
   recommend deleting it; do not delete it yourself.

Run npm run build. Do not commit.
```

**Acceptance:** `git ls-files storage scratch` returns nothing; build still passes.

**Note (15 Nov 2026):** `ebe41d3` added `scratch/` to `.gitignore`, but that
does not untrack files already committed. `git ls-files` still lists
`storage/submissions.json`, `storage/channel_analysis_submissions.json`,
`scratch/test_logic.js`, `scratch/test_submit.js`, `public/get-logo-png.html`
and `legacy-jobboards.csv`. Nothing in the code reads `legacy-jobboards.csv`.

---

## T14 — Install analytics

```
There is no analytics in this repo at all — no GA4, no Vercel Analytics,
nothing. Add GA4 via next/script in app/layout.js, reading the measurement
ID from NEXT_PUBLIC_GA_ID.

Add the env var to .env.example as a placeholder.

Do not add any other tracking, pixels or third-party scripts.

Run npm run build. Do not commit.
```

**Acceptance:** GA4 fires on a page view in production; `NEXT_PUBLIC_GA_ID` documented in `.env.example`.

Then, outside AG: create a GA4 custom channel group for AI referrers (`chatgpt.com`, `perplexity.ai`, `claude.ai`, `copilot.microsoft.com`) and connect Search Console.

---

## T15 — Add agent output validation

```
Both scraper skills are capturing junk. auditor_output.json contains a Dice
login wall stored as pricing_context. scraper_output.json contains a
recruitingdaily.com bot-detection page and a net::ERR_ABORTED from
staffingindustry.com.

Add a validation function to both scripts:
- .agy/skills/jbr-pricing-auditor/scripts/audit_pricing.js
- .agy/skills/jbr-board-scraper/scripts/scrape_news.js

Reject any capture whose text contains "log in", "sign in", "security
verification", "performing security verification", "enable javascript",
or is under 200 characters. Write {"status": "blocked", "reason": "..."}
for those instead of storing the page text.

Never let a blocked capture reach the data files.

Do not commit.
```

**Acceptance:** re-running both scripts produces `blocked` statuses for Dice, RecruitingDaily and StaffingIndustry rather than storing their page text.

---

## T16 — Author page for Palak

```
Create /author/palak as a server component with a real bio, credentials
and a photo. I will supply the bio text — do not write it yourself.

Link it from every blog post byline, and add Person schema to the page
and to the author field of the Article schema from T2.

Add it to app/sitemap.js.

Run npm run build. Do not commit.
```

**Acceptance:** the page exists, is linked from posts, carries Person schema, and contains no invented credentials.

---

## Tasks run but not planned here (T17–T20)

These were run outside this file and their prompts were not recorded. All
landed in a single commit, `ebe41d3` ("Fix build, wire admin to Supabase, gate
prod admin, async cookies/headers, drop Stack Overflow Jobs"). The commit does
not say where T17 ends and T17b begins, or T18 and T18a, so each pair is
recorded together.

### T17 / T17b — Build green

**Status: Done.**

- `react-quill` was pinned to `^0.0.2`, which does not exist → `^2.0.0`.
- `puppeteer` and `cheerio` moved from `dependencies` to `devDependencies`,
  so Vercel does not download Chromium on every build.
- `eslint` `^8.57.0` → `^9.0.0`.
- `app/globals.css`: the Google Fonts `@import` moved above the `@tailwind`
  directives (CSS requires `@import` first).

### T18 / T18a — Admin approval reads from Supabase

**Status: Done.**

- `approveSubmissionAction` in `app/admin/actions.js` reads the submission
  from the Supabase `board_submissions` table instead of
  `storage/submissions.json`, accepting both snake_case and camelCase fields.
- The category name is resolved from `data/categories.js`.
- The `status: 'approved'` update runs after every file write, so a failed
  write cannot leave a submission marked approved with no board page.

### T19 — Production admin gate

**Status: Done.**

- `middleware.js` rewrites every `/admin` path to the 404 page when
  `NODE_ENV !== "development"`.
- `app/admin/page.js` also calls `notFound()` outside development.

### T20 — Async `cookies()` / `headers()`

**Status: Done.**

- `await cookies()` in `adminLoginAction` and `adminLogoutAction`.
- `await headers()` in `submitBoardProposal` (`app/admin/actions.js`) and
  `submitReviewAction` (`app/actions/reviews.js`). Without it, rate limiting
  saw every visitor as `127.0.0.1`.

---

## Order

Original plan, kept for reference:
T6 → T3 → T2 → T5 → T1 → T7 → T8 → T9 → T12 → T11 → T4 → cutover;
after launch T13 → T14 → T10 → T15 → T16.

**Remaining, as of 15 Nov 2026:**

1. T3c follow-up — browser check of the 20 bot-walled boards. Any removals
   add redirects, so this goes before T4.
2. T11 — `.env.example`. Needed to set up Vercel env vars.
3. T2 → T9 — both edit `app/layout.js` and the same `generateMetadata`
   functions; do them back to back. (T5 done.)
4. T7 → T8 — sitemap blog entries and real dates. (T1 done.)
5. T12 — rating display and the "85+ Verified" title.
6. T4 — last, once the redirect list has stopped changing.
7. Cutover.

**After launch:** T13 → T14 → T10 → T15 → T16. T14 is small enough to do
before cutover if launch-day traffic should be measured.

## What this skill does not cover

- Content Sagar must supply: the blog post body (T1) and Palak's bio (T16).
- The cutover itself: DNS, Vercel domain, Search Console property, sitemap submission. Those happen outside the repo.
- Strategy: cutting the board list to healthcare, collecting real reviews, the monetisation test with inbound boards. Not code tasks.
