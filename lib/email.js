// Transactional email via Resend's HTTP API (no SDK dependency).
//
// Server-only: import from server actions, never from client components.
// Sending never throws: a failed or unconfigured email must not fail the
// review or listing submission that triggered it.
//
// Env: RESEND_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO (optional),
// ADMIN_ALERT_EMAIL (optional). See .env.example and emails/README.md.

import { EMAIL_TEMPLATES } from "./emailTemplates";
import { linkBase } from "./linkBase";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function render(name, vars) {
  const tpl = EMAIL_TEMPLATES[name];
  if (!tpl) throw new Error(`Unknown email template: ${name}`);
  const fill = (text, encode) =>
    text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const v = vars[key] ?? "";
      return encode ? escapeHtml(v) : String(v).replace(/[\r\n]+/g, " ");
    });
  return { subject: fill(tpl.subject, false), html: fill(tpl.html, true) };
}

export async function sendEmail(name, to, vars = {}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || !to) {
    console.info(`[email] skipped "${name}": ${!to ? "no recipient" : "RESEND_API_KEY / EMAIL_FROM not set"}`);
    return { sent: false, skipped: true };
  }

  try {
    const { subject, html } = render(name, vars);
    const replyTo = process.env.EMAIL_REPLY_TO;
    // EMAIL_API_URL exists only so tests can point at a local stub.
    const apiUrl = process.env.EMAIL_API_URL || "https://api.resend.com/emails";
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`[email] "${name}" failed: ${res.status} ${await res.text()}`);
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    console.error(`[email] "${name}" error:`, err?.message || err);
    return { sent: false };
  }
}

// ---- helpers for building template variables ----

export function firstNameFrom(fullName) {
  const first = String(fullName || "").trim().split(/\s+/)[0];
  return first || "there";
}

export function boardUrl(slug) {
  return `${linkBase()}/board/${slug}`;
}

function supabaseTableUrl() {
  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
  return ref ? `https://supabase.com/dashboard/project/${ref}/editor` : "https://supabase.com/dashboard";
}

export function notifyAdmin({ itemType, boardName, submitterEmail }) {
  return sendEmail("admin-alert", process.env.ADMIN_ALERT_EMAIL, {
    item_type: itemType,
    board_name: boardName,
    submitter_email: submitterEmail || "unknown",
    submitted_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST",
    supabase_url: supabaseTableUrl(),
  });
}
