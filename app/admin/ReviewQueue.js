"use client";

import { useMemo, useState } from "react";
import { setReviewStatusAction, verifyReviewAction, setVoucherIssuedAction } from "./actions";
import { flowFor, labelOf, ROLES, FIRM_TYPES, SPECIALTIES, WOULD_USE_AGAIN, NOT_SURE } from "@/lib/reviewFlow";
import { voucherEligibleOnItsOwn } from "@/lib/reviewAnswers";

// Reviews publish instantly; this is where they are checked afterwards.
// "approved"/"pending" are the pre-migration names for published/submitted.
const normal = (s) => (s === "approved" ? "published" : s === "pending" ? "submitted" : s || "submitted");

const FILTERS = [
  { id: "published", label: "Published" },
  { id: "submitted", label: "Waiting" },
  { id: "rejected", label: "Removed" },
];

const MAX_VOUCHER_LISTINGS = 3;

function Stars({ rating }) {
  const n = Number(rating) || 0;
  return (
    <span className="text-[#FF5630] tracking-tight" aria-label={`${n} out of 5`}>
      {"★".repeat(n)}
      <span className="text-slate-200">{"★".repeat(5 - n)}</span>
    </span>
  );
}

function Pill({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-200 text-slate-700",
    amber: "bg-amber-100 text-amber-800",
    teal: "bg-teal-100 text-teal-800",
    red: "bg-red-100 text-red-800",
  };
  return <span className={`px-2 py-0.5 rounded-full ${tones[tone]}`}>{children}</span>;
}

// Voucher limits across rows: one per listing (one review per board already
// guarantees it) and at most three listings per person, earliest first.
function voucherEligibility(list) {
  const byPerson = {};
  const out = {};
  const eligible = list
    .filter((r) => normal(r.status) === "published" && voucherEligibleOnItsOwn(r))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  for (const r of eligible) {
    const person = (r.reviewer_email || r.user_id || r.id).toLowerCase();
    byPerson[person] = (byPerson[person] || 0) + 1;
    out[r.id] = byPerson[person] <= MAX_VOUCHER_LISTINGS ? "eligible" : "over_limit";
  }
  return out;
}

function Details({ r }) {
  const flow = flowFor(r.listing_type);
  const role = ROLES.find((x) => x.id === r.reviewer_role);
  const firm = FIRM_TYPES.find((x) => x.id === r.firm_type);
  const aspects = flow.aspects.filter((a) => r.aspect_ratings && a.id in r.aspect_ratings);
  const facts = r.reviewer_role ? flow.factsFor(r.reviewer_role) : [];
  const chip = (list, id) => (id === "none" ? "(none)" : labelOf(list, id) || id);
  if (!r.reviewer_role && !aspects.length && !(r.pros || []).length) return null;
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs mb-4 text-slate-600">
      {r.would_use_again && (
        <div><dt className="inline font-bold">Use again: </dt><dd className="inline">{labelOf(WOULD_USE_AGAIN, r.would_use_again)}</dd></div>
      )}
      {role && (
        <div><dt className="inline font-bold">Reviewer: </dt><dd className="inline">{role.label}{firm ? `, ${firm.label}` : ""}</dd></div>
      )}
      {aspects.map((a) => (
        <div key={a.id}><dt className="inline font-bold">{a.label}: </dt><dd className="inline">{r.aspect_ratings[a.id] ?? "N/A"}</dd></div>
      ))}
      {(r.pros || []).length > 0 && (
        <div><dt className="inline font-bold">Works: </dt><dd className="inline">{r.pros.map((id) => chip(flow.pros, id)).join(", ")}</dd></div>
      )}
      {(r.cons || []).length > 0 && (
        <div><dt className="inline font-bold">Doesn&apos;t: </dt><dd className="inline">{r.cons.map((id) => chip(flow.cons, id)).join(", ")}</dd></div>
      )}
      {facts.map((q) => (
        <div key={q.id}>
          <dt className="inline font-bold">{q.public}: </dt>
          <dd className="inline">
            {r.facts?.[q.id] === NOT_SURE ? "Not sure" : q.options.find((o) => o.id === r.facts?.[q.id])?.label || <em>skipped</em>}
          </dd>
        </div>
      ))}
      <div>
        <dt className="inline font-bold">Specialties: </dt>
        <dd className="inline">
          {(r.specialties || []).length
            ? r.specialties.map((id) => (id === NOT_SURE ? "Not sure" : labelOf(SPECIALTIES, id))).join(", ")
            : <em>skipped</em>}
        </dd>
      </div>
      {r.colleague_note && (
        <div className="sm:col-span-2"><dt className="inline font-bold">Their line: </dt><dd className="inline">{r.colleague_note}</dd></div>
      )}
    </dl>
  );
}

export default function ReviewQueue({ reviews = [] }) {
  const [list, setList] = useState(reviews);
  const [filter, setFilter] = useState("published");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const vouchers = useMemo(() => voucherEligibility(list), [list]);
  const shown = list.filter((r) => normal(r.status) === filter);

  async function run(id, fn, patch, confirmText) {
    if (confirmText && !confirm(confirmText)) return;
    setBusyId(id);
    setError("");
    const res = await fn();
    if (res.success) setList((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch(res) } : r)));
    else setError(res.error || "Something went wrong.");
    setBusyId(null);
  }

  const btn = "px-5 py-2.5 rounded-xl text-sm font-black disabled:opacity-50";

  return (
    <div className="bg-white p-8 sm:p-12 rounded-[48px] card-shadow border border-slate-100 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Reviews</h2>
          <p className="text-slate-500 font-medium text-sm">
            Reviews go live as soon as they are published. Check them here and remove any that break the rules.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = list.filter((r) => normal(r.status) === f.id).length;
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
          <h3 className="text-lg font-black text-slate-900">No {FILTERS.find((f) => f.id === filter).label.toLowerCase()} reviews</h3>
        </div>
      ) : (
        <ul className="space-y-5">
          {shown.map((r) => {
            const status = normal(r.status);
            const voucher = vouchers[r.id];
            return (
              <li key={r.id} className="p-6 rounded-[24px] border border-slate-100 bg-slate-50/50">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="font-black text-slate-900">
                    {r.board_name} <span className="ml-2 text-sm"><Stars rating={r.rating} /></span>
                  </div>
                  <div className="text-xs font-bold text-slate-400 flex flex-wrap items-center gap-2">
                    <Pill tone={r.source === "guest" ? "amber" : "slate"}>{r.source === "guest" ? "Guest" : "Member"}</Pill>
                    {r.verified_at ? (
                      <Pill tone="teal">Verified ({(r.verification_method || "").replace("_", " ")})</Pill>
                    ) : (
                      <Pill tone="red">Not verified</Pill>
                    )}
                    {r.invite_source && r.invite_source !== "personal" && (
                      <Pill>{r.invite_source === "vendor" ? "Invited by vendor" : "Voucher campaign"}{r.invite_ref ? ` · ref ${r.invite_ref}` : ""}</Pill>
                    )}
                    {r.draft_edited && <Pill>Edited draft</Pill>}
                    <span>{r.reviewer_email || "unknown reviewer"} · {new Date(r.published_at || r.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-500 mb-3">
                  Shown as: {r.display_preference === "full_name" && r.display_name ? r.display_name : "role and firm type"}
                  {r.linkedin_url && (
                    <>
                      {" · "}
                      <a href={r.linkedin_url} target="_blank" rel="noopener noreferrer" className="underline">LinkedIn profile</a>
                    </>
                  )}
                </p>

                {r.title && <p className="font-bold text-slate-900 mb-1">&ldquo;{r.title}&rdquo;</p>}
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">{r.review_text}</p>
                <Details r={r} />

                {r.invite_source === "voucher" && (
                  <p className="text-xs font-bold mb-4">
                    Voucher:{" "}
                    {r.voucher_status === "issued"
                      ? "sent"
                      : voucher === "eligible"
                        ? <span className="text-teal-700">eligible, not sent yet</span>
                        : voucher === "over_limit"
                          ? <span className="text-red-700">not eligible (already 3 listings)</span>
                          : <span className="text-red-700">not eligible ({r.verified_at ? "fact questions skipped" : "not verified"})</span>}
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  {status !== "published" && (
                    <button
                      disabled={busyId === r.id}
                      onClick={() => run(r.id, () => setReviewStatusAction(r.id, "published"), () => ({ status: "published" }))}
                      className={`${btn} bg-[#FF5630] text-white`}
                    >
                      Publish
                    </button>
                  )}
                  {status !== "rejected" && (
                    <button
                      disabled={busyId === r.id}
                      onClick={() =>
                        run(r.id, () => setReviewStatusAction(r.id, "rejected"), () => ({ status: "rejected" }), "Remove this review from the site?")
                      }
                      className={`${btn} bg-white border border-slate-200 text-slate-700`}
                    >
                      {status === "published" ? "Unpublish" : "Reject"}
                    </button>
                  )}
                  {!r.verified_at && (
                    <button
                      disabled={busyId === r.id}
                      onClick={() =>
                        run(
                          r.id,
                          () => verifyReviewAction(r.id),
                          (res) => ({ verified_at: res.verifiedAt || new Date().toISOString(), verification_method: r.linkedin_url ? "linkedin" : "admin" }),
                          r.linkedin_url ? "Mark verified? Check the LinkedIn profile first." : "Mark verified without a LinkedIn profile?"
                        )
                      }
                      className={`${btn} bg-white border border-teal-200 text-teal-800`}
                    >
                      Mark verified
                    </button>
                  )}
                  {voucher === "eligible" && r.voucher_status !== "issued" && (
                    <button
                      disabled={busyId === r.id}
                      onClick={() => run(r.id, () => setVoucherIssuedAction(r.id, true), () => ({ voucher_status: "issued" }), "Mark the voucher as sent?")}
                      className={`${btn} bg-white border border-slate-200 text-slate-700`}
                    >
                      Mark voucher sent
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
