// One published review on a board page: ratings, chips, fact answers, the
// text, and its badges. Takes the public review shape from lib/reviews.js
// (toPublic), which never carries the reviewer's email.

import ReportReviewButton from "./ReportReviewButton";
import { flowFor, labelOf, ROLES, FIRM_TYPES, SPECIALTIES, WOULD_USE_AGAIN, NOT_SURE } from "@/lib/reviewFlow";

const STAR =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

function Badge({ children, tone = "slate", title }) {
  const tones = {
    teal: "bg-teal-50 text-teal-700 border-teal-100",
    amber: "bg-amber-50 text-amber-800 border-amber-100",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span title={title} className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function ReviewCard({ review }) {
  const flow = flowFor(review.listing_type);
  const date = review.created_at
    ? new Date(review.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";

  const role = ROLES.find((r) => r.id === review.reviewer_role);
  const firm = FIRM_TYPES.find((f) => f.id === review.firm_type);
  const author =
    review.display_name ||
    (role ? `${role.short}${firm?.phrase ? ` at ${firm.phrase}` : ""}` : review.author || "Recruiter review");

  const aspects = flow.aspects.filter((a) => Number.isInteger(review.aspect_ratings?.[a.id]));
  const pros = (review.pros || []).filter((id) => id !== "none").map((id) => labelOf(flow.pros, id)).filter(Boolean);
  const cons = (review.cons || []).filter((id) => id !== "none").map((id) => labelOf(flow.cons, id)).filter(Boolean);
  const facts = (review.reviewer_role ? flow.factsFor(review.reviewer_role) : [])
    .filter((q) => review.facts?.[q.id] && review.facts[q.id] !== NOT_SURE)
    .map((q) => ({ label: q.public, value: q.options.find((o) => o.id === review.facts[q.id])?.label }))
    .filter((f) => f.value);
  const specialties = (review.specialties || []).map((id) => labelOf(SPECIALTIES, id)).filter(Boolean);
  const again = labelOf(WOULD_USE_AGAIN, review.would_use_again);
  const text = review.review_text ?? review.text;

  return (
    <article className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 card-shadow">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <svg key={n} className={`w-5 h-5 ${n <= review.rating ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d={STAR} />
            </svg>
          ))}
        </span>
        {again && <span className="text-xs font-bold text-slate-500">Would use again: {again}</span>}
      </div>

      {review.title && <h3 className="text-slate-900 font-black text-lg mb-3">&ldquo;{review.title}&rdquo;</h3>}
      {text && <p className="text-sm text-slate-600 font-medium leading-relaxed mb-5 whitespace-pre-line">{text}</p>}

      {aspects.length > 0 && (
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {aspects.map((a) => (
            <div key={a.id}>
              <dt className="text-xs font-bold text-slate-500 mb-1">{a.label}</dt>
              <dd className="flex items-center gap-2">
                <span className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                  <span className="block h-full bg-[#FF5630]" style={{ width: `${review.aspect_ratings[a.id] * 20}%` }} />
                </span>
                <span className="text-xs font-black text-slate-700">{review.aspect_ratings[a.id]}/5</span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {(pros.length > 0 || cons.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {pros.map((p) => (
            <span key={p} className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold">+ {p}</span>
          ))}
          {cons.map((c) => (
            <span key={c} className="px-3 py-1 rounded-full bg-red-50 text-red-800 text-xs font-bold">− {c}</span>
          ))}
        </div>
      )}

      {(facts.length > 0 || specialties.length > 0) && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-5 text-xs">
          {facts.map((f) => (
            <div key={f.label} className="flex justify-between gap-3 border-b border-slate-100 pb-1">
              <dt className="font-medium text-slate-500">{f.label}</dt>
              <dd className="font-black text-slate-800">{f.value}</dd>
            </div>
          ))}
          {specialties.length > 0 && (
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-1">
              <dt className="font-medium text-slate-500">Hires for</dt>
              <dd className="font-black text-slate-800 text-right">{specialties.join(", ")}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-400 font-bold flex flex-wrap items-center gap-2">
          <span>
            {author}
            {date && ` · ${date}`}
          </span>
          {review.verified && (
            <Badge tone="teal" title="The reviewer confirmed their email address">
              Verified
            </Badge>
          )}
          {review.invite_source === "vendor" && <Badge>Invited by vendor</Badge>}
          {review.invite_source === "voucher" && <Badge tone="amber">Received a thank-you voucher</Badge>}
        </p>
        {review.id && <ReportReviewButton reviewId={review.id} />}
      </div>
    </article>
  );
}
