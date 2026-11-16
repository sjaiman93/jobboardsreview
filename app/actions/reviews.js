"use server";

import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { getAllBoards } from "@/data/jobBoards";
import { REVIEWS_TAG } from "@/lib/reviews";
import { sendEmail, notifyAdmin, firstNameFrom, boardUrl } from "@/lib/email";
import { verifyTurnstileToken } from "@/app/actions/turnstile";

// Publishing rules
// - Signed-in members: published immediately, including people whose email
//   domain matches the board's own website (Sagar's call, Nov 2026: a new site
//   should welcome the boards' own teams). Those still trigger a labelled
//   admin alert so they can be checked and unpublished if needed.
// - Guests (not signed in): email + spam check required, always wait for
//   approval.
// - One review per person per board (also enforced by unique indexes in
//   supabase/migrations/20261116_reviews_instant.sql).

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "yahoo.co.uk", "ymail.com",
  "hotmail.com", "outlook.com", "live.com", "msn.com", "aol.com", "icloud.com", "me.com",
  "mac.com", "proton.me", "protonmail.com", "gmx.com", "gmx.net", "mail.com", "zoho.com",
  "yandex.com", "rediffmail.com", "fastmail.com", "hey.com", "tutanota.com", "pm.me",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailDomain(email) {
  return String(email || "").split("@")[1]?.toLowerCase().trim() || "";
}

function isWorkEmail(email) {
  const d = emailDomain(email);
  return !!d && !FREE_EMAIL_DOMAINS.has(d);
}

// True when the reviewer's email domain is the board's own domain, e.g.
// someone@dice.com reviewing Dice (dice.com / www.dice.com / jobs.dice.com).
function isOwnerDomain(email, website) {
  const d = emailDomain(email);
  if (!d || FREE_EMAIL_DOMAINS.has(d)) return false;
  let host = "";
  try {
    host = new URL(website).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return false;
  }
  return d === host || host.endsWith("." + d) || d.endsWith("." + host);
}

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
  revalidatePath(`/category/${board.categorySlug}`);
  revalidatePath("/directory");
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function submitReviewAction(payload) {
  if (payload.website_hp) {
    console.warn("Honeypot triggered, rejecting review.");
    return { success: false, error: "Spam verification failed." };
  }
  if (!payload.formLoadTime || Date.now() - payload.formLoadTime < 2000) {
    return { success: false, error: "Spam verification failed (too fast)." };
  }

  const rating = Number(payload.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Please select a star rating." };
  }
  const reviewText = String(payload.reviewText || "").trim();
  if (reviewText.length < 10) {
    return { success: false, error: "Your review is too short. Please add more details." };
  }
  if (reviewText.length > 5000) {
    return { success: false, error: "Your review is too long (5,000 characters max)." };
  }
  const title = String(payload.title || "").trim().slice(0, 150);

  const board = getAllBoards().find((b) => b.name === payload.boardName);
  if (!board) return { success: false, error: "Unknown job board." };

  const { supabaseAdmin } = await import("@/lib/supabase");
  if (!supabaseAdmin) return { success: false, error: "Reviews are temporarily unavailable." };

  // Who is reviewing?
  let user = null;
  if (payload.token) {
    const { data } = await supabaseAdmin.auth.getUser(payload.token);
    user = data?.user || null;
  }

  let email;
  if (user) {
    email = user.email;
  } else {
    email = String(payload.guestEmail || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return { success: false, error: "Please enter a valid email address." };
    if (!(await verifyTurnstileToken(payload.turnstileToken))) {
      return { success: false, error: "Security check failed. Please try again." };
    }
  }

  const ip = await clientIp();
  if (!checkRateLimit(`ip:${ip}`) || !checkRateLimit(`email:${email}`)) {
    return { success: false, error: "Too many reviews submitted. Please try again later." };
  }

  // One review per person per board.
  {
    let q = supabaseAdmin.from("reviews").select("id").eq("board_name", board.name).limit(1);
    q = user ? q.eq("user_id", user.id) : q.is("user_id", null).ilike("reviewer_email", email);
    const { data: existing, error: dupErr } = await q;
    if (!dupErr && existing?.length) {
      return { success: false, error: `You've already reviewed ${board.name}. Thanks!` };
    }
  }

  const ownerMatch = isOwnerDomain(email, board.website);
  const instant = !!user;

  const row = {
    user_id: user?.id || null,
    board_name: board.name,
    rating,
    title,
    review_text: reviewText,
    status: instant ? "approved" : "pending",
    created_at: new Date().toISOString(),
    reviewer_email: email,
    // Only signed-in members have a confirmed email, so only they can carry the badge.
    is_work_email: !!user && isWorkEmail(email),
    source: user ? "member" : "guest",
  };

  let { error } = await supabaseAdmin.from("reviews").insert([row]);
  if (error && (error.code === "PGRST204" || /column/i.test(error.message || ""))) {
    // The reviews migration hasn't been run yet: save without the new columns.
    const { reviewer_email, is_work_email, source, ...legacy } = row;
    ({ error } = await supabaseAdmin.from("reviews").insert([legacy]));
  }
  if (error) {
    if (error.code === "23505") return { success: false, error: `You've already reviewed ${board.name}. Thanks!` };
    console.error("Supabase insert error (reviews):", error);
    return { success: false, error: "Database error. Please try again." };
  }

  if (instant) revalidateBoard(board);

  // Emails never fail the submission (sendEmail does not throw).
  const meta = user?.user_metadata || {};
  const firstName = firstNameFrom(meta.full_name || meta.name);
  const reviewTitle = title || (reviewText.length > 80 ? reviewText.slice(0, 77) + "..." : reviewText);
  await Promise.all([
    instant
      ? sendEmail("review-published", email, {
          first_name: firstName,
          board_name: board.name,
          review_url: `${boardUrl(board.slug)}#reviews`,
        })
      : sendEmail("review-received", email, {
          first_name: firstName,
          board_name: board.name,
          rating,
          review_title: reviewTitle,
        }),
    notifyAdmin({
      itemType: !instant ? "guest review" : ownerMatch ? "published review from the board's own domain" : "published review",
      boardName: board.name,
      submitterEmail: email,
    }),
  ]);

  return { success: true, status: instant ? "approved" : "pending", ownerMatch };
}

// "Report" link on a published review: emails the admin, nothing else.
export async function reportReviewAction(reviewId) {
  const ip = await clientIp();
  if (!checkRateLimit(`report:${ip}`, 10)) {
    return { success: false, error: "Too many reports. Please try again later." };
  }
  const { supabaseAdmin } = await import("@/lib/supabase");
  if (!supabaseAdmin || !reviewId) return { success: false, error: "Could not send the report." };

  const { data: review } = await supabaseAdmin
    .from("reviews")
    .select("id, board_name, status")
    .eq("id", reviewId)
    .single();
  if (!review || review.status !== "approved") return { success: false, error: "Review not found." };

  await notifyAdmin({
    itemType: "reported review",
    boardName: `${review.board_name} (review ${review.id})`,
    submitterEmail: "a site visitor",
  });
  return { success: true };
}
