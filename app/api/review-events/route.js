import { NextResponse } from "next/server";
import { getAllBoards } from "@/data/jobBoards";

// One row per review-flow step event (viewed / answered / abandoned), for
// the drop-off report in /admin. Called with fetch or navigator.sendBeacon
// (a text/plain JSON body). Never fails loudly: measurement must not break
// the review flow.
const EVENTS = new Set(["viewed", "answered", "abandoned"]);
const SOURCES = new Set(["personal", "voucher", "vendor"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request) {
  try {
    const body = JSON.parse(await request.text());
    const slug = String(body.slug || "");
    const step = String(body.step || "").slice(0, 40);
    const sessionId = String(body.sessionId || "").slice(0, 64);
    if (!EVENTS.has(body.event) || !step || !sessionId || !getAllBoards().some((b) => b.slug === slug)) {
      return new NextResponse(null, { status: 204 });
    }
    const { supabaseAdmin } = await import("@/lib/supabase");
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("review_events").insert([
        {
          review_id: UUID_RE.test(String(body.reviewId || "")) ? body.reviewId : null,
          session_id: sessionId,
          board_slug: slug,
          step,
          event: body.event,
          src: SOURCES.has(body.src) ? body.src : "personal",
        },
      ]);
      if (error) console.error("Supabase insert error (review event):", error.message);
    }
  } catch {
    // Bad JSON or a closed connection: ignore.
  }
  return new NextResponse(null, { status: 204 });
}
