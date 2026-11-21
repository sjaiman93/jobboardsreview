// Base address for links that send a person somewhere (email buttons,
// "see your review"), so they open the deployment that sent them:
//
// 1. LINK_BASE_URL if set (e.g. https://jobboardsreview.com after cutover)
// 2. a Vercel preview: that branch's preview address
// 3. Vercel production: the project's production domain
// 4. local dev: http://localhost:3000
// 5. otherwise https://jobboardsreview.com
//
// Canonical tags, the sitemap, robots.txt and JSON-LD always use
// https://jobboardsreview.com and must NOT use this.
// Server-only (reads server env vars).

export function linkBase() {
  const explicit = process.env.LINK_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const env = process.env.VERCEL_ENV;
  if (env === "preview" && process.env.VERCEL_BRANCH_URL) return `https://${process.env.VERCEL_BRANCH_URL}`;
  if (env === "preview" && process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (env === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return "https://jobboardsreview.com";
}
