"use client";

import { useState } from "react";
import { setReviewStatusAction } from "./actions";

const FILTERS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

function Stars({ rating }) {
  return (
    <span className="text-[#FF5630] tracking-tight" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-slate-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function ReviewQueue({ reviews = [] }) {
  const [list, setList] = useState(reviews);
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const shown = list.filter((r) => (r.status || "pending") === filter);

  async function setStatus(id, status) {
    if (status === "rejected" && !confirm("Reject this review? It will not be shown on the site.")) return;
    setBusyId(id);
    setError("");
    const res = await setReviewStatusAction(id, status);
    if (res.success) {
      setList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } else {
      setError(res.error || "Something went wrong.");
    }
    setBusyId(null);
  }

  return (
    <div className="bg-white p-8 sm:p-12 rounded-[48px] card-shadow border border-slate-100 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Review Queue</h2>
          <p className="text-slate-500 font-medium text-sm">
            Approved reviews appear on the board page within about 5 minutes. No deploy needed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = list.filter((r) => (r.status || "pending") === f.id).length;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                  active ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                {f.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${active ? "bg-slate-800" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm font-bold text-red-600">{error}</p>}

      {shown.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-slate-100">
          <h3 className="text-lg font-black text-slate-900">No {filter} reviews</h3>
        </div>
      ) : (
        <ul className="space-y-5">
          {shown.map((r) => (
            <li key={r.id} className="p-6 rounded-[24px] border border-slate-100 bg-slate-50/50">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="font-black text-slate-900">
                  {r.board_name} <span className="ml-2 text-sm"><Stars rating={r.rating} /></span>
                </div>
                <div className="text-xs font-bold text-slate-400 flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full ${r.source === "guest" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"}`}>
                    {r.source === "guest" ? "Guest" : "Member"}
                  </span>
                  {r.is_work_email && <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">Work email</span>}
                  <span>{r.reviewer_email || "unknown reviewer"} · {new Date(r.created_at).toLocaleString()}</span>
                </div>
              </div>
              {r.title && <p className="font-bold text-slate-900 mb-1">&ldquo;{r.title}&rdquo;</p>}
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-5">{r.review_text}</p>
              <div className="flex gap-3">
                {r.status !== "approved" && (
                  <button
                    disabled={busyId === r.id}
                    onClick={() => setStatus(r.id, "approved")}
                    className="px-5 py-2.5 rounded-xl bg-[#FF5630] text-white text-sm font-black disabled:opacity-50"
                  >
                    {busyId === r.id ? "Saving…" : "Approve"}
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    disabled={busyId === r.id}
                    onClick={() => setStatus(r.id, "rejected")}
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-black disabled:opacity-50"
                  >
                    {r.status === "approved" ? "Unpublish" : "Reject"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
