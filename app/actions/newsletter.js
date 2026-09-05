"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { verifyTurnstileToken } from "@/app/actions/turnstile";

export async function subscribeToNewsletter(email, turnstileToken) {
  if (!email) {
    return { success: false, error: "Email is required." };
  }

  const isValidToken = await verifyTurnstileToken(turnstileToken);
  if (!isValidToken) {
    return { success: false, error: "Bot detected. Please try again." };
  }

  try {
    // 1. Save to Supabase (Database Backup)
    const { error: dbError } = await supabaseAdmin
      .from('email_subscribers')
      .insert([{ email: email }]);
      
    // We ignore unique constraint errors (23505) in Supabase if they are already subscribed
    if (dbError && dbError.code !== '23505') {
      console.error("Supabase insert error:", dbError);
      return { success: false, error: "Failed to save email." };
    }

    // 2. Add to Mailchimp
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    
    if (!API_KEY || !AUDIENCE_ID) {
      console.error("Missing Mailchimp credentials in environment.");
      return { success: true }; // Still return true if DB succeeded but Mailchimp isn't configured yet
    }

    const DATACENTER = API_KEY.split("-")[1];
    const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

    const data = {
      email_address: email,
      status: "subscribed",
    };

    const response = await fetch(url, {
      body: JSON.stringify(data),
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (response.status >= 400) {
      const respData = await response.json();
      // Mailchimp returns 400 with title "Member Exists" if already subscribed
      if (respData.title === "Member Exists") {
        return { success: true, message: "Already subscribed!" };
      }
      console.error("Mailchimp error:", respData);
      // We don't want to show raw Mailchimp errors to the user
      return { success: false, error: "Failed to join the newsletter. Please try again." };
    }

    return { success: true };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
