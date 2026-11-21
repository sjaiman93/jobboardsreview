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

// "published" is the new flow's status; "approved" is the same thing in
// rows written before supabase/migrations/20261119_review_flow.sql ran.
export const LIVE_STATUSES = ["published", "approved"];

// Only these fields ever reach a public page: nothing that identifies the
// reviewer (no email, LinkedIn URL or tokens). The name only when the
// reviewer chose to show it.
function toPublic(r) {
  return {
    id: r.id,
    rating: r.rating,
    title: r.title,
    review_text: r.review_text,
    created_at: r.published_at || r.created_at,
    is_work_email: r.is_work_email === true,
    verified: !!r.verified_at,
    listing_type: r.listing_type || "job_board",
    would_use_again: r.would_use_again || null,
    aspect_ratings: r.aspect_ratings || {},
    pros: r.pros || [],
    cons: r.cons || [],
    reviewer_role: r.reviewer_role || null,
    firm_type: r.firm_type || null,
    facts: r.facts || {},
    specialties: r.specialties || [],
    display_name: r.display_preference === "full_name" ? r.display_name || null : null,
    invite_source: r.invite_source || "personal",
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
      .in("status", LIVE_STATUSES)
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
    const { data, error } = await db.from("reviews").select("board_name, rating").in("status", LIVE_STATUSES);
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
