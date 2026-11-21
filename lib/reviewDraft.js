// Builds the 2-4 sentence review shown on the draft screen, from the
// reviewer's own answers only. No AI provider: sentence templates.
//
// Rules (do not break them when editing):
// - Use only what the reviewer gave. Skip anything N/A, "Not sure" or skipped.
// - First person, plain language. Include negatives whenever any were chosen.
// - `seed` picks between phrasings so reviews don't all open the same way.
//
// Pure function, safe on client and server. The server rebuilds the draft
// from the stored answers to decide whether the reviewer edited it.

import { flowFor, labelOf, ROLES, SPECIALTIES, NOT_SURE } from "./reviewFlow";

function pick(list, seed, offset = 0) {
  return list[Math.abs(seed + offset) % list.length];
}

function joinList(items) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function lower(label) {
  // Keep acronyms and proper nouns as written; lower-case the first word only.
  return label.replace(/^[A-Z][a-z]/, (m) => m.toLowerCase());
}

function sentence(s) {
  const t = s.trim();
  if (!t) return "";
  const cap = t[0].toUpperCase() + t.slice(1);
  return /[.!?]$/.test(cap) ? cap : `${cap}.`;
}

function hasFact(facts, id) {
  return facts?.[id] && facts[id] !== NOT_SURE;
}

function factLabel(fact, value) {
  return fact.options.find((o) => o.id === value)?.label || "";
}

export function seedFrom(text) {
  let h = 0;
  for (const ch of String(text || "")) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function buildDraft(answers, listingName, seed = 0) {
  const a = answers || {};
  const flow = flowFor(a.listingType);
  const name = listingName;
  const out = [];

  // 1. Opening: rating + would-use-again, with who they are when known.
  const specialties = (a.specialties || []).map((id) => lower(labelOf(SPECIALTIES, id))).filter(Boolean);
  const role = ROLES.find((r) => r.id === a.role);
  const roleWord = role?.short.toLowerCase() || "";
  const who = role
    ? `As ${/^[aeiou]/.test(roleWord) ? "an" : "a"} ${roleWord}${specialties.length ? ` hiring for ${joinList(specialties)} roles` : ""}, `
    : "";
  if (a.overall) {
    const rating = pick(
      [
        `I'd rate ${name} ${a.overall} out of 5`,
        `${name} gets ${a.overall} out of 5 from me`,
        `my rating for ${name} is ${a.overall} out of 5`,
      ],
      seed
    );
    const again = {
      yes: pick([", and I'd use it again", " and I would use it again"], seed, 1),
      maybe: pick([", but I'm not sure I'd use it again", ", though I'm undecided about using it again"], seed, 1),
      no: pick([", and I wouldn't use it again", " and I would not use it again"], seed, 1),
    }[a.again] || "";
    out.push(sentence(`${who}${rating}${again}`));
  }

  // 2. What works and what doesn't.
  const pros = (a.pros || []).filter((id) => id !== "none").map((id) => lower(labelOf(flow.pros, id))).filter(Boolean);
  const cons = (a.cons || []).filter((id) => id !== "none").map((id) => lower(labelOf(flow.cons, id))).filter(Boolean);
  const noComplaints = (a.cons || []).includes("none");
  // Chip labels read as short phrases ("fresh profiles", "saves real time"),
  // so they go after a colon rather than into a sentence.
  const goodLead = pick(["What works for me:", "The good parts:", "On the plus side:"], seed, 2);
  const badLead = pick(["what doesn't:", "the downsides:", "where it falls short:"], seed, 2);
  if (pros.length && cons.length) {
    out.push(sentence(`${goodLead} ${joinList(pros)}; ${badLead} ${joinList(cons)}`));
  } else if (pros.length) {
    out.push(sentence(`${goodLead} ${joinList(pros)}${noComplaints ? ", and I have no real complaints" : ""}`));
  } else if (cons.length) {
    out.push(sentence(`${pick(["What doesn't work:", "The downsides:", "Where it falls short:"], seed, 2)} ${joinList(cons)}`));
  } else if (noComplaints) {
    out.push(sentence("I don't have any real complaints"));
  }

  // 3. Facts the reviewer gave.
  const f = a.facts || {};
  const facts = flow.factsFor(a.role);
  const byId = Object.fromEntries(facts.map((q) => [q.id, q]));
  const parts = [];
  if (a.listingType === "ai_tool") {
    if (hasFact(f, "hours_saved")) {
      parts.push(
        f.hours_saved === "none"
          ? "it hasn't saved our recruiters time each week"
          : `it saves each recruiter about ${factLabel(byId.hours_saved, f.hours_saved)} hours a week`
      );
    }
    if (hasFact(f, "replaced")) {
      parts.push(
        {
          manual: "it replaced manual work",
          other_tool: "it replaced another tool",
          new: "it's something new for us rather than a replacement",
        }[f.replaced]
      );
    }
  } else if (byId.monthly_spend) {
    if (hasFact(f, "monthly_spend")) parts.push(`we spend ${factLabel(byId.monthly_spend, f.monthly_spend)} a month on it`);
    if (hasFact(f, "relative_value")) {
      parts.push(
        {
          best: "it's the best value of our boards",
          average: "its value is about average among our boards",
          worst: "it's the worst value of our boards",
        }[f.relative_value]
      );
    }
    if (hasFact(f, "value_for_money")) parts.push(`I'd give it ${f.value_for_money} out of 5 for value for money`);
  } else {
    if (hasFact(f, "applicants_worth_call")) {
      parts.push(`about ${factLabel(byId.applicants_worth_call, f.applicants_worth_call)} in 10 applicants from it are worth a call`);
    }
    if (hasFact(f, "placements_3mo")) {
      const n = factLabel(byId.placements_3mo, f.placements_3mo);
      parts.push(
        n === "0"
          ? "I haven't made a placement from it in the last 3 months"
          : `I've made ${n} placement${n === "1" ? "" : "s"} from it in the last 3 months`
      );
    }
  }
  if (parts.length) out.push(sentence(joinList(parts)));

  // 4. Their own line, as written.
  const note = String(a.note || "").trim();
  if (note) out.push(`${pick(["My advice:", "One thing to know:", "Worth knowing:"], seed, 3)} ${sentence(note)}`);

  return out.slice(0, 4).join(" ");
}
