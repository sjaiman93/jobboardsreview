// Converts review answers between the flow's shape and Supabase columns,
// and checks every answer against the question config. Pure functions,
// safe on client and server.

import {
  flowFor,
  WOULD_USE_AGAIN,
  ROLES,
  FIRM_TYPES,
  SPECIALTIES,
  NOT_SURE,
  MAX_CHIPS,
  NOTE_MAX,
} from "./reviewFlow";

const ids = (list) => new Set(list.map((o) => o.id));

function cleanChips(value, options, noneId) {
  if (!Array.isArray(value)) return undefined;
  if (value.length === 1 && value[0] === noneId) return [noneId];
  const allowed = ids(options);
  const out = [...new Set(value.filter((v) => allowed.has(v)))];
  return out.length >= 1 && out.length <= MAX_CHIPS ? out : undefined;
}

// Keeps only valid answers from `patch`. Unknown keys and bad values are
// dropped, so a tampered request can't write anything the flow can't.
// `current` supplies the listing type and role the patch is checked against.
export function cleanAnswers(patch, current = {}) {
  const p = patch || {};
  const listingType = current.listingType;
  const flow = flowFor(listingType);
  const out = {};

  if ("overall" in p) {
    const n = Number(p.overall);
    if (Number.isInteger(n) && n >= 1 && n <= 5) out.overall = n;
  }
  if ("again" in p && ids(WOULD_USE_AGAIN).has(p.again)) out.again = p.again;

  if ("aspects" in p && p.aspects && typeof p.aspects === "object") {
    const aspects = {};
    for (const a of flow.aspects) {
      const v = p.aspects[a.id];
      if (v === null || v === NOT_SURE) aspects[a.id] = null; // N/A
      else if (Number.isInteger(v) && v >= 1 && v <= 5) aspects[a.id] = v;
    }
    if (Object.keys(aspects).length === flow.aspects.length) out.aspects = aspects;
  }

  const pros = "pros" in p ? cleanChips(p.pros, flow.pros, flow.prosNone.id) : undefined;
  if (pros) out.pros = pros;
  const cons = "cons" in p ? cleanChips(p.cons, flow.cons, flow.consNone.id) : undefined;
  if (cons) out.cons = cons;

  if ("role" in p && ids(ROLES).has(p.role)) out.role = p.role;
  if ("firm" in p && ids(FIRM_TYPES).has(p.firm)) out.firm = p.firm;

  if ("facts" in p && p.facts && typeof p.facts === "object") {
    const role = out.role || current.role;
    const facts = {};
    for (const q of flow.factsFor(role)) {
      const v = p.facts[q.id];
      if (v === NOT_SURE || q.options.some((o) => o.id === v)) facts[q.id] = v;
    }
    out.facts = facts;
  }

  if ("specialties" in p && Array.isArray(p.specialties)) {
    if (p.specialties.length === 1 && p.specialties[0] === NOT_SURE) out.specialties = [NOT_SURE];
    else {
      const allowed = ids(SPECIALTIES);
      out.specialties = [...new Set(p.specialties.filter((v) => allowed.has(v)))];
    }
  }

  if ("note" in p) out.note = String(p.note || "").replace(/\s+/g, " ").trim().slice(0, NOTE_MAX);

  return out;
}

export function answersToColumns(a) {
  const c = {};
  if ("overall" in a) c.rating = a.overall;
  if ("again" in a) c.would_use_again = a.again;
  if ("aspects" in a) c.aspect_ratings = a.aspects;
  if ("pros" in a) c.pros = a.pros;
  if ("cons" in a) c.cons = a.cons;
  if ("role" in a) c.reviewer_role = a.role;
  if ("firm" in a) c.firm_type = a.firm;
  if ("facts" in a) c.facts = a.facts;
  if ("specialties" in a) c.specialties = a.specialties;
  if ("note" in a) c.colleague_note = a.note || null;
  return c;
}

export function answersFromRow(r) {
  return {
    listingType: r.listing_type || "job_board",
    overall: r.rating,
    again: r.would_use_again,
    aspects: r.aspect_ratings || {},
    pros: r.pros || [],
    cons: r.cons || [],
    role: r.reviewer_role,
    firm: r.firm_type,
    facts: r.facts || {},
    specialties: r.specialties || [],
    note: r.colleague_note || "",
  };
}

// Voucher rule: verified, and every fact question on the reviewer's path
// (plus specialties) answered or marked "Not sure". The per-person limits
// (one per listing, three listings) are checked across rows in the admin view.
export function factsComplete(r) {
  const a = answersFromRow(r);
  const questions = flowFor(a.listingType).factsFor(a.role);
  return (
    !!a.role &&
    questions.every((q) => a.facts[q.id]) &&
    (a.specialties || []).length > 0
  );
}

export function voucherEligibleOnItsOwn(r) {
  return r.invite_source === "voucher" && !!r.verified_at && factsComplete(r);
}
