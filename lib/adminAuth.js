// Admin sessions.
//
// Sign-in uses the normal site login (Supabase: email link, Google, LinkedIn).
// Only emails listed in ADMIN_EMAILS (comma-separated) get an admin session.
// The session is an httpOnly cookie: base64url(payload).hmacSHA256, signed
// with ADMIN_SESSION_SECRET (falls back to SUPABASE_SERVICE_ROLE_KEY).
//
// Web Crypto only, so this also runs in middleware (Edge runtime).

export const ADMIN_COOKIE_NAME = "jbr_admin_session";
export const ADMIN_SESSION_DAYS = 7;

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email) {
  return !!email && getAdminEmails().includes(String(email).toLowerCase());
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function b64url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(str) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  return atob(s + "=".repeat((4 - (s.length % 4)) % 4));
}

async function sign(payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(new Uint8Array(sig));
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createAdminSession(email) {
  if (!sessionSecret()) throw new Error("No session secret configured.");
  const payload = b64url(
    new TextEncoder().encode(
      JSON.stringify({ email: String(email).toLowerCase(), exp: Date.now() + ADMIN_SESSION_DAYS * 864e5 })
    )
  );
  return `${payload}.${await sign(payload)}`;
}

// Returns the admin email for a valid session, otherwise null. Re-checks the
// allow-list, so removing someone from ADMIN_EMAILS ends their session.
export async function verifyAdminSession(token) {
  try {
    if (!token || !sessionSecret()) return null;
    const [payload, sig] = String(token).split(".");
    if (!payload || !sig) return null;
    if (!safeEqual(sig, await sign(payload))) return null;
    const { email, exp } = JSON.parse(fromB64url(payload));
    if (!exp || Date.now() > exp) return null;
    return isAllowedAdminEmail(email) ? email : null;
  } catch {
    return null;
  }
}
