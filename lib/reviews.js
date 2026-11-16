// Approved recruiter reviews from Supabase, for public board pages.
// Server-only (uses the service-role client). Never throws: if Supabase is
// down or paused, pages render with no reviews instead of failing the build.
//
// Reviews are keyed by board *name* (reviews.board_name). Renaming a board
// detaches its reviews unless the rows are updated too.

export async function getApprovedReviews(boardName) {
  try {
    const { supabaseAdmin } = await import("@/lib/supabase");
    if (!supabaseAdmin || !boardName) return [];
    const { data, error } = await supabaseAdmin
      .from("reviews")
      // No user_id or email: nothing that identifies the reviewer leaves the server.
      .select("id, rating, title, review_text, created_at")
      .eq("board_name", boardName)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase fetch error (approved reviews):", error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error("Error loading approved reviews:", e);
    return [];
  }
}

export function reviewStats(reviews) {
  const rated = reviews.filter((r) => typeof r.rating === "number");
  if (!rated.length) return { rating: null, reviewCount: 0 };
  const avg = rated.reduce((sum, r) => sum + r.rating, 0) / rated.length;
  return { rating: Math.round(avg * 10) / 10, reviewCount: rated.length };
}
