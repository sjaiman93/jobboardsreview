"use server";

import { headers } from "next/headers";

const rateLimitCache = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  
  if (!rateLimitCache.has(ip)) {
    rateLimitCache.set(ip, [now]);
    return true;
  }
  
  const timestamps = rateLimitCache.get(ip).filter(t => t > oneHourAgo);
  if (timestamps.length >= 5) {
    return false;
  }
  
  timestamps.push(now);
  rateLimitCache.set(ip, timestamps);
  return true;
}

export async function submitReviewAction(payload) {
  // Honeypot check
  if (payload.website_hp) {
    console.warn("Honeypot triggered, rejecting review.");
    return { success: false, error: "Spam verification failed." };
  }

  // Timestamp validation
  const submitTime = Date.now();
  if (!payload.formLoadTime || submitTime - payload.formLoadTime < 2000) {
    console.warn("Submission too fast, rejecting review.");
    return { success: false, error: "Spam verification failed (too fast)." };
  }

  // Input validation
  if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
    return { success: false, error: "Please select a star rating." };
  }
  if (!payload.reviewText || payload.reviewText.trim().length < 10) {
    return { success: false, error: "Your review is too short. Please add more details." };
  }

  const { supabaseAdmin } = await import("@/lib/supabase");
  
  // Verify User Auth Token
  let userId = null;
  if (payload.token && supabaseAdmin) {
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(payload.token);
    if (user) {
      userId = user.id;
    }
  }

  if (!userId) {
    return { success: false, error: "You must be logged in to submit a review." };
  }

  let ip = "127.0.0.1";
  try {
    const headersList = headers();
    ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "127.0.0.1";
  } catch (err) {
    // Ignore header read errors
  }

  if (!checkRateLimit(ip)) {
    return { success: false, error: "Too many reviews submitted. Please try again later." };
  }

  const dbPayload = {
    user_id: userId,
    board_name: payload.boardName,
    rating: payload.rating,
    title: payload.title?.trim() || "",
    review_text: payload.reviewText.trim(),
    status: 'pending',
    created_at: new Date().toISOString()
  };

  try {
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from('reviews').insert([dbPayload]);
      if (error) {
        console.error("Supabase insert error (reviews):", error);
        return { success: false, error: "Database error. Please try again." };
      }
    } else {
      console.warn("No Supabase Admin Key. Review not saved:", dbPayload);
    }
  } catch (e) {
    console.error("Error saving review:", e);
    return { success: false, error: "Server error saving review." };
  }

  return { success: true };
}
