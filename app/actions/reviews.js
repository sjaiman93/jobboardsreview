"use server";

import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { randomUUID } from "node:crypto";
import { resolveMx, resolve4 } from "node:dns/promises";
import { getAllBoards } from "@/data/jobBoards";
import { REVIEWS_TAG } from "@/lib/reviews";
import { sendEmail, notifyAdmin, firstNameFrom, boardUrl } from "@/lib/email";
import { verifyTurnstileToken } from "@/app/actions/turnstile";
import { isWorkEmail, isOwnerDomain } from "@/lib/emailDomain";
import { listingTypeOf } from "@/lib/reviewFlow";
import { cleanAnswers, answersToColumns, answersFromRow } from "@/lib/reviewAnswers";
import { buildDraft, seedFrom } from "@/lib/reviewDraft";
import { linkBase } from "@/lib/linkBase";

// Publishing rules (Sagar, Nov 2026; overrides framework rule 3.3 for reviews)
// - Every review publishes the moment the reviewer presses Publish. No
//   sign-up needed, but a real email address is required from everyone.
// - Every published review sends an admin alert; admin can unpublish later.
// - "Verified" means the email was confirmed: signed in, or the reviewer
//   clicked the link in the "your review is live" email. Admin can also
//   verify a LinkedIn profile by hand.
// - One review per person per board (unique indexes in
//   supabase/migrations/20261116_reviews_instant.sql).
//
// A review is saved as a draft from the first star tap. Drafts are only
// changed with their secret draft_token, which the browser holds.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN_RE = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?(\?.*)?$/i;
const SOURCES = new Set(["personal", "voucher", "vendor"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const rateLimitCache = new Map();

function checkRateLimit(key, max = 5) {
  const now = Date.now();
  const recent = (rateLimitCache.get(key) || []).filter((t) => t > now - 60 * 60 * 1000);
  if (recent.length >= max) return false;
  recent.push(now);
  rateLimitCache.set(key, recent);
  return true;
}

async function clientIp() {
  try {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

// Refresh every page that shows this board's reviews or rating, now.
function revalidateBoard(board) {
  updateTag(REVIEWS_TAG);
  revalidatePath(`/board/${board.slug}`);
  revalidatePath(`/review/${board.slug}`);
  revalidatePath(`/category/${board.categorySlug}`);
  revalidatePath("/directory");
  revalidatePath("/categories");
  revalidatePath("/");
}

async function db() {
  const { supabaseAdmin } = await import("@/lib/supabase");
  return supabaseAdmin;
}

// The domain must exist and accept mail. A DNS outage must not block a
// review, so only a definite "no such domain / no mail" fails.
async function emailDomainReceivesMail(email) {
  const domain = email.split("@")[1];
  try {
    const mx = await resolveMx(domain);
    if (mx.length) return true;
  } catch (e) {
    if (!["ENOTFOUND", "ENODATA", "ENOENT"].includes(e.code)) return true;
  }
  try {
    return (await resolve4(domain)).length > 0;
  } catch (e) {
    return !["ENOTFOUND", "ENODATA", "ENOENT"].includes(e.code);
  }
}

async function loadDraft(supabase, id, token) {
  if (!UUID_RE.test(String(id || "")) || !UUID_RE.test(String(token || ""))) return null;
  const { data } = await supabase.from("reviews").select("*").eq("id", id).eq("draft_token", token).single();
  return data && data.status === "draft" ? data : null;
}

async function publishedCount(supabase, boardName) {
  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("board_name", boardName)
    .eq("status", "published");
  return count || 0;
}

// Step 1: the first star tap creates the draft.
export async function startReviewAction({ slug, overall, src, ref, devListingType }) {
  const board = getAllBoards().find((b) => b.slug === slug);
  if (!board) return { success: false, error: "Unknown listing." };
  const answers = cleanAnswers({ overall });
  if (!answers.overall) return { success: false, error: "Please pick a star rating." };

  const ip = await clientIp();
  if (!checkRateLimit(`draft:${ip}`, 30)) {
    return { success: false, error: "Too many reviews started. Please try again later." };
  }
  const supabase = await db();
  if (!supabase) return { success: false, error: "Reviews are temporarily unavailable." };

  // ?type=ai_tool lets the AI-tool questions be tested locally on any board.
  const listingType =
    process.env.NODE_ENV === "development" && devListingType === "ai_tool" ? "ai_tool" : listingTypeOf(board);
  const token = randomUUID();
  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        board_name: board.name,
        board_slug: board.slug,
        listing_type: listingType,
        status: "draft",
        rating: answers.overall,
        invite_source: SOURCES.has(src) ? src : "personal",
        invite_ref: ref ? String(ref).slice(0, 100) : null,
        draft_token: token,
        step_reached: "overall",
        source: "guest",
        is_work_email: false,
      },
    ])
    .select("id")
    .single();
  if (error) {
    console.error("Supabase insert error (review draft):", error);
    return { success: false, error: "Couldn't save your answer. Please try again." };
  }
  return { success: true, id: data.id, token, listingType };
}

// Every later step saves its answers to the draft.
export async function saveReviewStepAction({ id, token, step, answers }) {
  const supabase = await db();
  if (!supabase) return { success: false, error: "Reviews are temporarily unavailable." };
  const row = await loadDraft(supabase, id, token);
  if (!row) return { success: false, error: "This review can no longer be changed." };

  const current = answersFromRow(row);
  const clean = cleanAnswers(answers, current);
  const { error } = await supabase
    .from("reviews")
    .update({
      ...answersToColumns(clean),
      step_reached: String(step || "").slice(0, 40) || row.step_reached,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("draft_token", token);
  if (error) {
    console.error("Supabase update error (review step):", error);
    return { success: false, error: "Couldn't save your answer. Please try again." };
  }
  return { success: true };
}

// Last step: the reviewer pressed Publish.
export async function publishReviewAction(payload) {
  const supabase = await db();
  if (!supabase) return { success: false, error: "Reviews are temporarily unavailable." };
  const row = await loadDraft(supabase, payload.id, payload.token);
  if (!row) return { success: false, error: "This review was already published or can't be found." };
  const board = getAllBoards().find((b) => b.slug === row.board_slug);
  if (!board) return { success: false, error: "Unknown listing." };

  if (!payload.consent) {
    return { success: false, error: "Please tick the box to confirm you can publish this review." };
  }

  // Who is reviewing? Signed-in members use their (confirmed) account email.
  let user = null;
  if (payload.accessToken) {
    const { data } = await supabase.auth.getUser(payload.accessToken);
    user = data?.user || null;
  }
  const email = String(user?.email || payload.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!user && !(await verifyTurnstileToken(payload.turnstileToken))) {
    return { success: false, error: "Security check failed. Please try again." };
  }
  const ip = await clientIp();
  if (!checkRateLimit(`ip:${ip}`) || !checkRateLimit(`email:${email}`)) {
    return { success: false, error: "Too many reviews submitted. Please try again later." };
  }
  if (!(await emailDomainReceivesMail(email))) {
    return { success: false, error: "That email address can't receive mail. Please check it." };
  }

  const linkedinUrl = String(payload.linkedinUrl || "").trim();
  if (linkedinUrl && !LINKEDIN_RE.test(linkedinUrl)) {
    return { success: false, error: "That doesn't look like a LinkedIn profile link (linkedin.com/in/…)." };
  }
  const displayPreference = payload.displayPreference === "full_name" ? "full_name" : "role_firm";
  const displayName = String(payload.displayName || "").replace(/\s+/g, " ").trim().slice(0, 60);
  if (displayPreference === "full_name" && displayName.length < 2) {
    return { success: false, error: "Please add your name, or choose to show your role only." };
  }

  const finalText = String(payload.finalText || "").trim();
  if (finalText.length < 20) return { success: false, error: "Your review is too short." };
  if (finalText.length > 2000) return { success: false, error: "Your review is too long (2,000 characters max)." };
  const draftText = buildDraft(answersFromRow(row), board.name, seedFrom(row.id));

  // One review per person per board.
  {
    let q = supabase.from("reviews").select("id").eq("board_name", board.name).neq("status", "draft").limit(1);
    q = user ? q.eq("user_id", user.id) : q.is("user_id", null).ilike("reviewer_email", email);
    const { data: existing } = await q;
    if (existing?.length) return { success: false, error: `You've already reviewed ${board.name}. Thanks!` };
  }

  const now = new Date().toISOString();
  const confirmToken = user ? null : randomUUID();
  const { error } = await supabase
    .from("reviews")
    .update({
      status: "published",
      published_at: now,
      created_at: now,
      updated_at: now,
      user_id: user?.id || null,
      reviewer_email: email,
      source: user ? "member" : "guest",
      is_work_email: !!user && isWorkEmail(email),
      verification_method: user ? "signed_in" : null,
      verified_at: user ? now : null,
      confirm_token: confirmToken,
      linkedin_url: linkedinUrl || null,
      display_preference: displayPreference,
      display_name: displayPreference === "full_name" ? displayName : null,
      consent_at: now,
      draft_text: draftText,
      review_text: finalText,
      draft_edited: finalText !== draftText,
      draft_token: null,
      step_reached: "published",
    })
    .eq("id", row.id)
    .eq("draft_token", payload.token);
  if (error) {
    if (error.code === "23505") return { success: false, error: `You've already reviewed ${board.name}. Thanks!` };
    console.error("Supabase update error (publish review):", error);
    return { success: false, error: "Couldn't publish your review. Please try again." };
  }

  revalidateBoard(board);

  // Emails never fail the publish (sendEmail does not throw). Guests get a
  // link that confirms their email and marks the review Verified.
  const meta = user?.user_metadata || {};
  const ownerMatch = isOwnerDomain(email, board.website);
  await Promise.all([
    sendEmail("review-published", email, {
      first_name: firstNameFrom(displayName || meta.full_name || meta.name),
      board_name: board.name,
      review_url: confirmToken
        ? `${linkBase()}/review/confirm?t=${confirmToken}`
        : `${boardUrl(board.slug)}#reviews`,
    }),
    notifyAdmin({
      itemType: ownerMatch ? "published review from the board's own domain" : "published review",
      boardName: board.name,
      submitterEmail: email,
    }),
  ]);

  return {
    success: true,
    reviewerNumber: await publishedCount(supabase, board.name),
    verified: !!user,
    // Relative: the browser opens it on whatever site the reviewer is on.
    reviewPath: `/board/${board.slug}#reviews`,
  };
}

// "Report" link on a published review: emails the admin, nothing else.
export async function reportReviewAction(reviewId) {
  const ip = await clientIp();
  if (!checkRateLimit(`report:${ip}`, 10)) {
    return { success: false, error: "Too many reports. Please try again later." };
  }
  const supabase = await db();
  if (!supabase || !reviewId) return { success: false, error: "Could not send the report." };

  const { data: review } = await supabase
    .from("reviews")
    .select("id, board_name, status")
    .eq("id", reviewId)
    .single();
  if (!review || !["published", "approved"].includes(review.status)) {
    return { success: false, error: "Review not found." };
  }

  await notifyAdmin({
    itemType: "reported review",
    boardName: `${review.board_name} (review ${review.id})`,
    submitterEmail: "a site visitor",
  });
  return { success: true };
}
