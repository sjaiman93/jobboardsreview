// Approved recruiter reviews from Supabase, for public pages.
// Server-only (service-role key). Never throws: if Supabase is down or
// paused, pages render with no reviews instead of failing the build.
//
// Reviews are keyed by board *name* (reviews.board_name). Renaming a board
// detaches its reviews unless the rows are updated too.
//
// Caching: reads are tagged REVIEWS_TAG and kept up to 5 minutes. Actions
// that change reviews call updateTag(REVIEWS_TAG) + revalidatePath(...) so
// the change shows immediately.

import { createClient } from "@supabase/supabase-js";

export const REVIEWS_TAG = "reviews";

let client;
function reviewsClient() {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client =
    url && key
      ? createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 300, tags: [REVIEWS_TAG] } }),
          },
        })
      : null;
  return client;
}

// Only these fields ever reach a public page: nothing that identifies the reviewer.
function toPublic(r) {
  return {
    id: r.id,
    rating: r.rating,
    title: r.title,
    review_text: r.review_text,
    created_at: r.created_at,
    is_work_email: r.is_work_email === true,
  };
}

export async function getApprovedReviews(boardName) {
  try {
    const db = reviewsClient();
    if (!db || !boardName) return [];
    const { data, error } = await db
      .from("reviews")
      .select("*") // "*" so it works before and after the reviews migration
      .eq("board_name", boardName)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase fetch error (approved reviews):", error);
      return [];
    }
    return (data || []).map(toPublic);
  } catch (e) {
    console.error("Error loading approved reviews:", e);
    return [];
  }
}

// { [boardName]: { rating, reviewCount } } for every board with approved reviews.
export async function getReviewStatsMap() {
  try {
    const db = reviewsClient();
    if (!db) return {};
    const { data, error } = await db.from("reviews").select("board_name, rating").eq("status", "approved");
    if (error) {
      console.error("Supabase fetch error (review stats):", error);
      return {};
    }
    const sums = {};
    for (const r of data || []) {
      if (typeof r.rating !== "number") continue;
      const s = (sums[r.board_name] ||= { total: 0, count: 0 });
      s.total += r.rating;
      s.count += 1;
    }
    return Object.fromEntries(
      Object.entries(sums).map(([name, s]) => [name, { rating: Math.round((s.total / s.count) * 10) / 10, reviewCount: s.count }])
    );
  } catch (e) {
    console.error("Error loading review stats:", e);
    return {};
  }
}

// Boards with their real rating attached, for cards and sorting.
export function withReviewStats(boards, statsMap) {
  return boards.map((b) => {
    const s = statsMap[b.name];
    return s ? { ...b, rating: s.rating, reviewCount: s.reviewCount } : b;
  });
}

export function reviewStats(reviews) {
  const rated = reviews.filter((r) => typeof r.rating === "number");
  if (!rated.length) return { rating: null, reviewCount: 0 };
  const avg = rated.reduce((sum, r) => sum + r.rating, 0) / rated.length;
  return { rating: Math.round(avg * 10) / 10, reviewCount: rated.length };
}
