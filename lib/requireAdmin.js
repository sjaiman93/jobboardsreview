// Server actions are public HTTP endpoints: anyone who learns an action's ID
// can call it, whatever page it lives on. Every admin-only action must call
// this first. Admin is local-only by design, so production always refuses.
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "./adminAuth";

export async function isAdmin() {
  if (process.env.NODE_ENV !== "development") return false;
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export const NOT_AUTHORIZED = { success: false, error: "Not authorized. Log in to admin again." };
