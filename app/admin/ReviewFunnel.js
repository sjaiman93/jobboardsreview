"use client";

import { useMemo, useState } from "react";

// Drop-off by step for the review flow (review_events, last 90 days).
// Counts distinct visits (session ids), so a back-and-forth doesn't inflate
// the numbers.
const BASE_ORDER = ["overall", "again", "aspects", "pros", "cons", "role", "firm"];
const END_ORDER = ["specialties", "note", "draft", "verify"];
const LABELS = {
  overall: "Overall rating",
  again: "Would use again",
  aspects: "Quick ratings",
  pros: "What works",
  cons: "What doesn't",
  role: "Role",
  firm: "Firm type",
  specialties: "Specialties",
  note: "Optional line",
  draft: "Draft review",
  verify: "Email + publish",
};
const SOURCES = ["all", "personal", "voucher", "vendor"];

function label(step) {
  if (step.startsWith("fact:")) return `Fact: ${step.slice(5).replace(/_/g, " ")}`;
  return LABELS[step] || step;
}

export default function ReviewFunnel({ events = [] }) {
  const [src, setSrc] = useState("all");

  const rows = useMemo(() => {
    const shown = src === "all" ? events : events.filter((e) => e.src === src);
    const sets = {};
    for (const e of shown) {
      const s = (sets[e.step] ||= { viewed: new Set(), answered: new Set(), abandoned: new Set() });
      s[e.event]?.add(e.session_id);
    }
    const factSteps = Object.keys(sets).filter((s) => s.startsWith("fact:")).sort();
    const order = [...BASE_ORDER, ...factSteps, ...END_ORDER];
    const starts = sets.overall?.viewed.size || 0;
    return order
      .filter((s) => sets[s])
      .map((s) => ({
        step: s,
        viewed: sets[s].viewed.size,
        answered: sets[s].answered.size,
        abandoned: sets[s].abandoned.size,
        reach: starts ? Math.round((sets[s].viewed.size / starts) * 100) : 0,
      }));
  }, [events, src]);

  return (
    <div className="bg-white p-8 sm:p-12 rounded-[48px] card-shadow border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Review form drop-off</h2>
          <p className="text-slate-500 font-medium text-sm">
            Visits that saw each step, last 90 days. &ldquo;Left here&rdquo; = closed the page on that step.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <button
              key={s}
              onClick={() => setSrc(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border capitalize ${
                src === s ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-center py-12 text-sm font-bold text-slate-500">No review-form visits yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="py-2 pr-4">Step</th>
                <th className="py-2 pr-4 text-right">Viewed</th>
                <th className="py-2 pr-4 text-right">Answered</th>
                <th className="py-2 pr-4 text-right">Left here</th>
                <th className="py-2 text-right">% of starts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.step} className="border-t border-slate-100">
                  <td className="py-2 pr-4 font-bold text-slate-800">{label(r.step)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.viewed}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.answered}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.abandoned}</td>
                  <td className="py-2 text-right tabular-nums font-black">{r.reach}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
