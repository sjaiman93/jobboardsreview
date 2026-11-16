"use client";

import { useState } from "react";
import { reportReviewAction } from "@/app/actions/reviews";

export default function ReportReviewButton({ reviewId }) {
  const [state, setState] = useState("idle"); // idle | sending | sent | error

  async function report() {
    if (!confirm("Report this review to the JobBoardsReview team?")) return;
    setState("sending");
    const res = await reportReviewAction(reviewId);
    setState(res.success ? "sent" : "error");
  }

  if (state === "sent") return <span className="text-xs font-bold text-slate-400">Reported. Thanks, we'll take a look.</span>;

  return (
    <button
      type="button"
      onClick={report}
      disabled={state === "sending"}
      className="text-xs font-bold text-slate-400 hover:text-slate-700 underline disabled:opacity-50"
    >
      {state === "error" ? "Couldn't send. Try again" : state === "sending" ? "Sending…" : "Report"}
    </button>
  );
}
