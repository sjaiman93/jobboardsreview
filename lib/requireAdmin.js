// Server actions are public HTTP endpoints: anyone who learns an action's ID
// can call it, whatever page it lives on. Every admin-only action must call
// isAdmin() first. Admin works on the live site and locally; a valid signed
// session cookie for an ADMIN_EMAILS address is required either way.
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "./adminAuth";

export async function isAdmin() {
  const cookieStore = await cookies();
  return !!(await verifyAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value));
}

export const NOT_AUTHORIZED = { success: false, error: "Not authorized. Sign in to admin again." };

// Edits that write source files directly (board edit, CSV import, blog,
// homepage, legal pages) only work when running locally. Board approvals
// work everywhere via lib/repoFiles.js.
export function isLocalDev() {
  return process.env.NODE_ENV === "development";
}

export const LOCAL_ONLY = {
  success: false,
  error: "This edit only works on your computer for now: run npm run dev and open localhost:3000/admin.",
};
