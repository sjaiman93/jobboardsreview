export const ADMIN_COOKIE_NAME = "jbr_admin_session";

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode((password || "") + "_jbr_secure_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export async function verifyAdminSession(token) {
  if (!token) return false;
  const expectedToken = await hashPassword(getAdminPassword());
  return token === expectedToken;
}
