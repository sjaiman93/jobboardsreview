// Email-domain checks shared by reviews and listing claims. Pure functions,
// safe on client and server.

export const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "yahoo.co.uk", "ymail.com",
  "hotmail.com", "outlook.com", "live.com", "msn.com", "aol.com", "icloud.com", "me.com",
  "mac.com", "proton.me", "protonmail.com", "gmx.com", "gmx.net", "mail.com", "zoho.com",
  "yandex.com", "rediffmail.com", "fastmail.com", "hey.com", "tutanota.com", "pm.me",
]);

export function emailDomain(email) {
  return String(email || "").split("@")[1]?.toLowerCase().trim() || "";
}

export function isWorkEmail(email) {
  const d = emailDomain(email);
  return !!d && !FREE_EMAIL_DOMAINS.has(d);
}

export function websiteHost(website) {
  try {
    const url = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

// True when the email's domain is the website's own domain, e.g.
// someone@dice.com for dice.com / www.dice.com / jobs.dice.com.
export function isOwnerDomain(email, website) {
  const d = emailDomain(email);
  if (!d || FREE_EMAIL_DOMAINS.has(d)) return false;
  const host = websiteHost(website);
  if (!host) return false;
  return d === host || host.endsWith("." + d) || d.endsWith("." + host);
}
