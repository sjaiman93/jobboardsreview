"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { adminSignInAction } from "@/app/admin/actions";

// Admin uses the normal site sign-in. If the signed-in email is on the
// ADMIN_EMAILS allow-list, the server issues an admin session cookie.
function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";

  const [state, setState] = useState("checking"); // checking | signed-out | working | error
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function enterAdmin(session) {
    setState("working");
    setError("");
    const res = await adminSignInAction(session.access_token);
    if (res.success) {
      router.push(redirectPath.startsWith("/admin") ? redirectPath : "/admin");
      router.refresh();
    } else {
      setError(res.error || "Could not open admin.");
      setState("error");
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setState("signed-out");
        return;
      }
      setEmail(session.user.email || "");
      enterAdmin(session);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOutAndSwitch() {
    await supabase.auth.signOut();
    setEmail("");
    setError("");
    setState("signed-out");
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5630]"></div>
        <div className="w-14 h-14 bg-[#FF5630] rounded-[18px] rotate-3 flex items-center justify-center text-white text-base font-black mx-auto mb-5 shadow-lg shadow-[#FF5630]/20">
          JBR
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Admin Panel</h1>

        {(state === "checking" || state === "working") && (
          <p className="text-sm text-slate-500 font-medium mt-4">
            {state === "checking" ? "Checking your sign-in…" : `Opening admin for ${email}…`}
          </p>
        )}

        {state === "signed-out" && (
          <>
            <p className="text-sm text-slate-500 font-medium mb-8">
              Sign in with your JobBoardsReview account. Only approved admin emails can open the panel.
            </p>
            <Link
              href="/join?next=/admin/login"
              className="block w-full py-4 bg-[#FF5630] text-white font-black rounded-2xl hover:opacity-90 transition-all"
            >
              Sign in
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mt-4 mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-bold">
              {error}
            </div>
            <button
              onClick={signOutAndSwitch}
              className="block w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-[#FF5630] transition-all"
            >
              Sign in with a different account
            </button>
          </>
        )}

        <Link href="/" className="inline-block mt-8 text-sm font-bold text-slate-400 hover:text-slate-700">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLogin />
    </Suspense>
  );
}
