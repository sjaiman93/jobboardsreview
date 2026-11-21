import { NextResponse } from "next/server";
import { revalidatePath, updateTag } from "next/cache";
import { getAllBoards } from "@/data/jobBoards";
import { REVIEWS_TAG } from "@/lib/reviews";
import { isWorkEmail } from "@/lib/emailDomain";

// The link in the "your review is live" email. Opening it proves the
// reviewer owns the address: the review gets the Verified badge, then they
// land on the board's reviews.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t") || "";
  const home = new URL("/", url);
  if (!UUID_RE.test(token)) return NextResponse.redirect(home);

  const { supabaseAdmin } = await import("@/lib/supabase");
  if (!supabaseAdmin) return NextResponse.redirect(home);

  const { data: row } = await supabaseAdmin
    .from("reviews")
    .select("id, board_slug, board_name, reviewer_email, verified_at")
    .eq("confirm_token", token)
    .single();
  if (!row) return NextResponse.redirect(home);

  const board = getAllBoards().find((b) => b.slug === row.board_slug || b.name === row.board_name);
  if (!row.verified_at) {
    await supabaseAdmin
      .from("reviews")
      .update({
        verified_at: new Date().toISOString(),
        verification_method: "email_link",
        is_work_email: isWorkEmail(row.reviewer_email),
        confirm_token: null,
      })
      .eq("id", row.id);
    updateTag(REVIEWS_TAG);
    if (board) revalidatePath(`/board/${board.slug}`);
  }

  const dest = board ? new URL(`/board/${board.slug}?verified=1#reviews`, url) : home;
  return NextResponse.redirect(dest);
}
