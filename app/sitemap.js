import { getAllBoards, getAllCategories } from "@/data/jobBoards";
import { getBlogs } from "@/data/blogs";

// Date the board/category data and the static pages were last changed.
// Bump this when you edit data/ or the about/legal copy, so search engines
// see a real change date rather than "today" on every build.
const CONTENT_UPDATED = new Date("2026-11-16");

export default function sitemap() {
  const baseUrl = "https://jobboardsreview.com";
  const now = new Date();

  const posts = getBlogs()
    .filter((b) => b.status === "published" && b.slug)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const latestPost = posts.length ? new Date(posts[0].createdAt) : CONTENT_UPDATED;

  // Home and directory change often; the rest use real dates.
  const staticRoutes = [
    { url: `${baseUrl}`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/directory`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: CONTENT_UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: CONTENT_UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/optimizer`, lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: latestPost, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/claim-listing`, lastModified: CONTENT_UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: CONTENT_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: CONTENT_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastModified: CONTENT_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified: CONTENT_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoryRoutes = getAllCategories().map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const boardRoutes = getAllBoards().map((board) => ({
    url: `${baseUrl}/board/${board.slug}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...boardRoutes, ...blogRoutes];
}
