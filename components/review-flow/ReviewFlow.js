"use client";

// Tap-first review flow: one question per screen, auto-advance on tap, no
// typing until the optional line near the end. Saves after every step, so
// an abandoned review is kept as a draft. Question lists: lib/reviewFlow/.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { supabase } from "@/lib/supabase";
import { startReviewAction, saveReviewStepAction, publishReviewAction } from "@/app/actions/reviews";
import {
  flowFor,
  WOULD_USE_AGAIN,
  ROLES,
  FIRM_TYPES,
  SPECIALTIES,
  NOT_SURE,
  MAX_CHIPS,
  NOTE_MAX,
} from "@/lib/reviewFlow";
import { buildDraft, seedFrom } from "@/lib/reviewDraft";
import { factsComplete } from "@/lib/reviewAnswers";

const PROFILE_KEY = "jbr-reviewer-profile";

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}
function writeProfile(p) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {}
}

function newSessionId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

// ── Small building blocks ────────────────────────────────────────────────

const optionBase =
  "min-h-[52px] w-full rounded-2xl border-2 px-5 py-3 text-left text-base font-bold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF5630]/30";
const optionIdle = "border-slate-200 bg-white text-slate-800 hover:border-slate-400";
const optionOn = "border-[#FF5630] bg-[#FF5630]/5 text-slate-900";

function Option({ selected, onClick, children, className = "" }) {
  return (
    <button type="button" aria-pressed={!!selected} onClick={onClick} className={`${optionBase} ${selected ? optionOn : optionIdle} ${className}`}>
      {children}
    </button>
  );
}

function Chip({ selected, onClick, children, disabled }) {
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[44px] rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF5630]/30 disabled:opacity-40 ${
        selected ? "border-[#FF5630] bg-[#FF5630] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, disabled, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="min-h-[52px] w-full rounded-2xl bg-[#FF5630] px-6 py-3 text-base font-black text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF5630]/30 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {children}
    </button>
  );
}

function TextLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[44px] px-2 text-sm font-bold text-slate-500 underline underline-offset-4 hover:text-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF5630]/30 rounded"
    >
      {children}
    </button>
  );
}

const STAR =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

// ── The flow ─────────────────────────────────────────────────────────────

export default function ReviewFlow({ board, listingType, devListingType, reviewCount, src, inviteRef, voucher, again, otherBoards }) {
  const router = useRouter();
  const flow = flowFor(listingType);

  const [answers, setAnswers] = useState({ listingType, aspects: {}, pros: [], cons: [], facts: {}, specialties: [] });
  const [prefilled, setPrefilled] = useState(null); // profile carried over from a previous review
  const [stepIndex, setStepIndex] = useState(0);
  const [saveError, setSaveError] = useState("");
  const draft = useRef(null); // { id, token }
  const draftReady = useRef(null); // promise of the draft
  const sessionId = useRef(null);
  const headingRef = useRef(null);
  const finished = useRef(false);

  // Final screens
  const [editing, setEditing] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [displayPreference, setDisplayPreference] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [result, setResult] = useState(null);
  const [pickOther, setPickOther] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    sessionId.current = newSessionId();
    supabase.auth
      .getSession()
      .then(({ data }) => {
        const s = data?.session || null;
        setSession(s);
        if (s?.user?.email) setEmail(s.user.email);
        const meta = s?.user?.user_metadata || {};
        if (meta.full_name || meta.name) setDisplayName(meta.full_name || meta.name);
      })
      .catch(() => {});
    if (again) {
      const p = readProfile();
      if (p?.role) {
        setPrefilled(p);
        setAnswers((a) => ({ ...a, role: p.role, firm: p.firm, specialties: p.specialties || [] }));
        if (p.email) setEmail((e) => e || p.email);
        if (p.linkedinUrl) setLinkedinUrl(p.linkedinUrl);
        if (p.displayPreference) setDisplayPreference(p.displayPreference);
        if (p.displayName) setDisplayName((n) => n || p.displayName);
      }
    }
  }, [again]);

  // Steps depend on the role (fact questions) and on what was carried over.
  const facts = useMemo(() => (answers.role ? flow.factsFor(answers.role) : []), [flow, answers.role]);
  const steps = useMemo(() => {
    const s = ["overall", "again", "aspects", "pros", "cons"];
    if (!prefilled) s.push("role", "firm");
    for (const f of facts) s.push(`fact:${f.id}`);
    if (!prefilled) s.push("specialties");
    s.push("note", "draft", "verify", "done");
    return s;
  }, [facts, prefilled]);
  // Before the role is known, the fact questions aren't in the list yet;
  // count them anyway so the progress bar doesn't jump.
  const totalSteps = steps.length + (answers.role ? 0 : flow.factsFor("recruiter").length);
  const step = steps[stepIndex];

  // ── Measurement ──
  function logEvent(event, stepName = step, beacon = false) {
    const body = JSON.stringify({
      sessionId: sessionId.current,
      reviewId: draft.current?.id || null,
      slug: board.slug,
      step: stepName,
      event,
      src,
    });
    try {
      if (beacon && navigator.sendBeacon) navigator.sendBeacon("/api/review-events", body);
      else fetch("/api/review-events", { method: "POST", body, keepalive: true }).catch(() => {});
    } catch {}
  }

  useEffect(() => {
    if (!step || !sessionId.current) return;
    logEvent("viewed", step);
    headingRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    const onHide = () => {
      if (!finished.current && stepRef.current !== "done") logEvent("abandoned", stepRef.current, true);
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Saving ──
  async function save(stepName, patch) {
    setSaveError("");
    try {
      const d = await draftReady.current;
      if (!d) return;
      const res = await saveReviewStepAction({ id: d.id, token: d.token, step: stepName, answers: patch });
      if (!res.success) setSaveError(res.error);
    } catch {
      setSaveError("Couldn't save your last answer. Check your connection.");
    }
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }
  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function answer(stepName, patch, { advance = true } = {}) {
    // Changing the role changes the fact questions: drop old fact answers.
    const extra = stepName === "role" && patch.role !== answers.role ? { facts: {} } : {};
    setAnswers({ ...answers, ...patch, ...extra });
    logEvent("answered", stepName);
    if (stepName === "overall" && !draftReady.current) {
      draftReady.current = startReviewAction({
        slug: board.slug,
        overall: patch.overall,
        src,
        ref: inviteRef,
        devListingType,
      }).then((res) => {
        if (!res.success) {
          setSaveError(res.error);
          draftReady.current = null;
          return null;
        }
        draft.current = { id: res.id, token: res.token };
        // A carried-over profile is saved with the first answer.
        if (prefilled) {
          saveReviewStepAction({
            id: res.id,
            token: res.token,
            step: "overall",
            answers: { role: prefilled.role, firm: prefilled.firm, specialties: prefilled.specialties || [] },
          });
        }
        return draft.current;
      });
    } else {
      save(stepName, { ...patch, ...extra });
    }
    if (advance) goNext();
  }

  const draftText = useMemo(
    () => (step === "draft" || step === "verify" ? buildDraft(answers, board.name, seedFrom(draft.current?.id)) : ""),
    [answers, board.name, step]
  );
  useEffect(() => {
    if (step === "draft" && !editing) setFinalText(draftText);
  }, [step, draftText, editing]);

  async function publish(e) {
    e.preventDefault();
    setPublishError("");
    const d = await draftReady.current;
    if (!d) {
      setPublishError("Your review wasn't saved. Please go back to the first question and try again.");
      return;
    }
    setPublishing(true);
    try {
      const res = await publishReviewAction({
        id: d.id,
        token: d.token,
        email,
        linkedinUrl,
        displayPreference,
        displayName,
        consent,
        finalText,
        turnstileToken,
        accessToken: session?.access_token || null,
      });
      if (!res.success) {
        setPublishError(res.error);
        return;
      }
      finished.current = true;
      writeProfile({
        role: answers.role,
        firm: answers.firm,
        specialties: answers.specialties,
        email: session ? "" : email,
        linkedinUrl,
        displayPreference,
        displayName: displayPreference === "full_name" ? displayName : "",
      });
      logEvent("answered", "verify");
      setResult(res);
      goNext();
    } catch {
      setPublishError("Couldn't publish. Check your connection and try again.");
    } finally {
      setPublishing(false);
    }
  }

  // ── Header ──
  const progress = Math.round((stepIndex / (totalSteps - 1)) * 100);
  const header = (
    <header className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-4 min-h-[44px]">
        {stepIndex > 0 && step !== "done" ? (
          <button
            type="button"
            onClick={goBack}
            className="min-h-[44px] min-w-[44px] -ml-2 px-2 rounded-xl text-sm font-black text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF5630]/30"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        <span className="text-xs font-bold text-slate-400">
          {step === "done" ? "Done" : `Step ${stepIndex + 1} of ${totalSteps - 1}`}
        </span>
      </div>
      <div
        className="h-1 w-full rounded-full bg-slate-100 overflow-hidden mb-6"
        role="progressbar"
        aria-label="Review progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div className="h-full bg-[#FF5630] transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-2xl font-black text-slate-900 leading-tight">Review {board.name}</p>
      <p className="text-sm font-medium text-slate-500 mt-1">About 2 minutes. No typing needed.</p>
      {voucher && <p className="text-sm font-bold text-teal-700 mt-1">Verified reviews get a $5 voucher.</p>}
      <p className="text-sm font-medium text-slate-500 mt-1">
        {reviewCount >= 10
          ? `Join ${reviewCount} recruiters who reviewed this.`
          : "Be one of the first 10 reviewers."}
      </p>
    </header>
  );

  const question = (text, sub) => (
    <div className="mb-5">
      <h1 ref={headingRef} tabIndex={-1} className="text-xl font-black text-slate-900 focus:outline-none">
        {text}
      </h1>
      {sub && <p className="text-sm font-medium text-slate-500 mt-1">{sub}</p>}
    </div>
  );

  // ── Screens ──
  let body = null;

  if (step === "overall") {
    body = (
      <>
        {question("Overall, how would you rate it?")}
        <div role="radiogroup" aria-label="Overall rating" className="flex justify-between gap-1 max-w-xs">
          {[1, 2, 3, 4, 5].map((n) => {
            const on = (answers.overall || 0) >= n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={answers.overall === n}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onClick={() => answer("overall", { overall: n })}
                className="min-h-[56px] min-w-[56px] flex items-center justify-center rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF5630]/30"
              >
                <svg viewBox="0 0 24 24" className={`w-11 h-11 ${on ? "text-[#FF5630]" : "text-slate-200"}`} fill="currentColor" aria-hidden="true">
                  <path d={STAR} />
                </svg>
              </button>
            );
          })}
        </div>
      </>
    );
  } else if (step === "again") {
    body = (
      <>
        {question("Would you use it again?")}
        <div className="grid gap-3">
          {WOULD_USE_AGAIN.map((o) => (
            <Option key={o.id} selected={answers.again === o.id} onClick={() => answer("again", { again: o.id })}>
              {o.label}
            </Option>
          ))}
        </div>
      </>
    );
  } else if (step === "aspects") {
    const done = flow.aspects.every((a) => a.id in (answers.aspects || {}));
    const setAspect = (id, v) => setAnswers((s) => ({ ...s, aspects: { ...s.aspects, [id]: v } }));
    body = (
      <>
        {question("Quick ratings", "1 is poor, 5 is great. Tap N/A if you can't say.")}
        <div className="space-y-5 mb-6">
          {flow.aspects.map((a) => (
            <fieldset key={a.id}>
              <legend className="text-sm font-black text-slate-800 mb-2">{a.label}</legend>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={answers.aspects?.[a.id] === n}
                    aria-label={`${a.label}: ${n} of 5`}
                    onClick={() => setAspect(a.id, n)}
                    className={`min-h-[44px] flex-1 rounded-xl border-2 text-base font-black focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF5630]/30 ${
                      answers.aspects?.[a.id] === n ? "border-[#FF5630] bg-[#FF5630] text-white" : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  aria-pressed={answers.aspects?.[a.id] === null}
                  aria-label={`${a.label}: not applicable`}
                  onClick={() => setAspect(a.id, null)}
                  className={`min-h-[44px] px-3 rounded-xl border-2 text-xs font-black focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF5630]/30 ${
                    answers.aspects?.[a.id] === null ? "border-slate-700 bg-slate-700 text-white" : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  N/A
                </button>
              </div>
            </fieldset>
          ))}
        </div>
        <PrimaryButton disabled={!done} onClick={() => answer("aspects", { aspects: answers.aspects })}>
          Continue
        </PrimaryButton>
      </>
    );
  } else if (step === "pros" || step === "cons") {
    const isPros = step === "pros";
    const options = isPros ? flow.pros : flow.cons;
    const none = isPros ? flow.prosNone : flow.consNone;
    const chosen = answers[step] || [];
    const toggle = (id) => {
      let nextList;
      if (id === none.id) nextList = chosen.includes(none.id) ? [] : [none.id];
      else {
        const base = chosen.filter((c) => c !== none.id);
        nextList = base.includes(id) ? base.filter((c) => c !== id) : base.length < MAX_CHIPS ? [...base, id] : base;
      }
      setAnswers((s) => ({ ...s, [step]: nextList }));
    };
    const full = chosen.filter((c) => c !== none.id).length >= MAX_CHIPS;
    body = (
      <>
        {question(
          isPros ? "What works?" : "What doesn't?",
          isPros ? "Pick up to 3." : "Pick up to 3. You can publish without your name."
        )}
        <div className="flex flex-wrap gap-2 mb-6">
          {options.map((o) => (
            <Chip key={o.id} selected={chosen.includes(o.id)} disabled={full && !chosen.includes(o.id)} onClick={() => toggle(o.id)}>
              {o.label}
            </Chip>
          ))}
          <Chip selected={chosen.includes(none.id)} onClick={() => toggle(none.id)}>
            {none.label}
          </Chip>
        </div>
        <PrimaryButton disabled={!chosen.length} onClick={() => answer(step, { [step]: chosen })}>
          Continue
        </PrimaryButton>
      </>
    );
  } else if (step === "role") {
    body = (
      <>
        {question("Which describes you?")}
        <div className="grid gap-3">
          {ROLES.map((o) => (
            <Option key={o.id} selected={answers.role === o.id} onClick={() => answer("role", { role: o.id })}>
              {o.label}
            </Option>
          ))}
        </div>
      </>
    );
  } else if (step === "firm") {
    body = (
      <>
        {question("Where do you work?", "Shown instead of your name if you publish without it.")}
        <div className="grid gap-3">
          {FIRM_TYPES.map((o) => (
            <Option key={o.id} selected={answers.firm === o.id} onClick={() => answer("firm", { firm: o.id })}>
              {o.label}
            </Option>
          ))}
        </div>
      </>
    );
  } else if (step?.startsWith("fact:")) {
    const q = facts.find((f) => `fact:${f.id}` === step);
    // The role goes along so the server checks the facts against the right questions.
    const setFact = (v) => answer(step, { role: answers.role, facts: { ...answers.facts, [q.id]: v } });
    body = q && (
      <>
        {question(q.question, q.scale ? "1 is poor, 5 is great." : null)}
        <div className={q.scale ? "flex gap-2 mb-3" : "grid gap-3 mb-3"}>
          {q.options.map((o) => (
            <Option key={o.id} selected={answers.facts?.[q.id] === o.id} onClick={() => setFact(o.id)} className={q.scale ? "text-center px-0" : ""}>
              {o.label}
            </Option>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Chip selected={answers.facts?.[q.id] === NOT_SURE} onClick={() => setFact(NOT_SURE)}>
            Not sure
          </Chip>
          <TextLink onClick={goNext}>Skip</TextLink>
        </div>
      </>
    );
  } else if (step === "specialties") {
    const chosen = answers.specialties || [];
    const toggle = (id) => {
      const base = chosen.filter((c) => c !== NOT_SURE);
      setAnswers((s) => ({ ...s, specialties: base.includes(id) ? base.filter((c) => c !== id) : [...base, id] }));
    };
    body = (
      <>
        {question("Which specialties do you hire for?", "Pick all that apply.")}
        <div className="flex flex-wrap gap-2 mb-6">
          {SPECIALTIES.map((o) => (
            <Chip key={o.id} selected={chosen.includes(o.id)} onClick={() => toggle(o.id)}>
              {o.label}
            </Chip>
          ))}
          <Chip
            selected={chosen.includes(NOT_SURE)}
            onClick={() => setAnswers((s) => ({ ...s, specialties: chosen.includes(NOT_SURE) ? [] : [NOT_SURE] }))}
          >
            Not sure
          </Chip>
        </div>
        <PrimaryButton disabled={!chosen.length} onClick={() => answer("specialties", { specialties: chosen })}>
          Continue
        </PrimaryButton>
        <div className="mt-2 text-center">
          <TextLink onClick={goNext}>Skip</TextLink>
        </div>
      </>
    );
  } else if (step === "note") {
    body = (
      <>
        {question("One thing a colleague should know before buying.", "Optional.")}
        <label htmlFor="review-note" className="sr-only">
          One thing a colleague should know before buying
        </label>
        <input
          id="review-note"
          type="text"
          maxLength={NOTE_MAX}
          value={answers.note || ""}
          onChange={(e) => setAnswers((s) => ({ ...s, note: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (answers.note || "").trim()) answer("note", { note: answers.note });
          }}
          className="min-h-[52px] w-full rounded-2xl border-2 border-slate-200 px-4 text-base font-medium focus:border-[#FF5630] focus:outline-none mb-4"
          placeholder="e.g. Negotiate the contract length"
        />
        <PrimaryButton disabled={!(answers.note || "").trim()} onClick={() => answer("note", { note: answers.note })}>
          Continue
        </PrimaryButton>
        <div className="mt-2 text-center">
          <TextLink
            onClick={() => {
              setAnswers((s) => ({ ...s, note: "" }));
              save("note", { note: "" });
              logEvent("answered", "note");
              goNext();
            }}
          >
            Skip
          </TextLink>
        </div>
      </>
    );
  } else if (step === "draft") {
    body = (
      <>
        {question("Here's your review", "Written from your answers. Change anything you like.")}
        {editing ? (
          <>
            <label htmlFor="review-text" className="sr-only">
              Your review
            </label>
            <textarea
              id="review-text"
              value={finalText}
              onChange={(e) => setFinalText(e.target.value)}
              rows={7}
              maxLength={2000}
              className="w-full rounded-2xl border-2 border-slate-200 p-4 text-base font-medium leading-relaxed focus:border-[#FF5630] focus:outline-none mb-4"
            />
          </>
        ) : (
          <blockquote className="rounded-2xl bg-slate-50 border border-slate-100 p-5 text-base font-medium text-slate-700 leading-relaxed mb-3">
            {finalText}
          </blockquote>
        )}
        {!editing && (
          <div className="mb-4">
            <TextLink onClick={() => setEditing(true)}>Edit</TextLink>
          </div>
        )}
        <PrimaryButton
          disabled={finalText.trim().length < 20}
          onClick={() => {
            logEvent("answered", "draft");
            goNext();
          }}
        >
          Publish my review
        </PrimaryButton>
      </>
    );
  } else if (step === "verify") {
    const role = ROLES.find((r) => r.id === answers.role);
    const firm = FIRM_TYPES.find((f) => f.id === answers.firm);
    const anonLabel = role ? `${role.short}${firm?.phrase ? ` at ${firm.phrase}` : ""}` : "Recruiter";
    const canPublish =
      email.trim() && consent && displayPreference && (displayPreference !== "full_name" || displayName.trim().length >= 2) && (session || turnstileToken);
    body = (
      <form onSubmit={publish} noValidate>
        {question("Your review is saved. Add your email to publish it.", "We never show your email. We'll send a link to confirm it, which adds a Verified badge to your review.")}

        <label htmlFor="review-email" className="block text-sm font-black text-slate-800 mb-2">
          Email
        </label>
        <input
          id="review-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          readOnly={!!session}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-[52px] w-full rounded-2xl border-2 border-slate-200 px-4 text-base font-medium focus:border-[#FF5630] focus:outline-none read-only:bg-slate-50 mb-1"
        />
        {session && <p className="text-xs font-medium text-slate-500 mb-4">You're signed in, so this review is verified.</p>}
        {!session && <div className="mb-4" />}

        <label htmlFor="review-linkedin" className="block text-sm font-black text-slate-800 mb-2">
          LinkedIn profile <span className="font-medium text-slate-400">(optional)</span>
        </label>
        <input
          id="review-linkedin"
          type="url"
          inputMode="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="linkedin.com/in/your-name"
          className="min-h-[52px] w-full rounded-2xl border-2 border-slate-200 px-4 text-base font-medium focus:border-[#FF5630] focus:outline-none mb-6"
        />

        <fieldset className="mb-6">
          <legend className="text-sm font-black text-slate-800 mb-2">Show my review with</legend>
          <div className="grid gap-3">
            <Option selected={displayPreference === "full_name"} onClick={() => setDisplayPreference("full_name")}>
              My full name
            </Option>
            {displayPreference === "full_name" && (
              <>
                <label htmlFor="review-name" className="sr-only">
                  Your full name
                </label>
                <input
                  id="review-name"
                  type="text"
                  autoComplete="name"
                  maxLength={60}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                  className="min-h-[52px] w-full rounded-2xl border-2 border-slate-200 px-4 text-base font-medium focus:border-[#FF5630] focus:outline-none"
                />
              </>
            )}
            <Option selected={displayPreference === "role_firm"} onClick={() => setDisplayPreference("role_firm")}>
              My role and firm type only
              <span className="block text-sm font-medium text-slate-500">Shown as “{anonLabel}”</span>
            </Option>
          </div>
        </fieldset>

        <label className="flex items-start gap-3 mb-6 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-6 w-6 shrink-0 accent-[#FF5630]"
          />
          <span className="text-sm font-medium text-slate-700">
            I have used this product, I don&apos;t work for the vendor, and I agree to publish this review.
          </span>
        </label>

        {!session && (
          <div className="mb-4">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              onSuccess={(t) => setTurnstileToken(t)}
              onExpire={() => setTurnstileToken("")}
            />
          </div>
        )}

        {publishError && (
          <p role="alert" className="mb-4 text-sm font-bold text-red-600">
            {publishError}
          </p>
        )}
        <PrimaryButton type="submit" disabled={!canPublish || publishing}>
          {publishing ? "Publishing…" : "Publish"}
        </PrimaryButton>
      </form>
    );
  } else if (step === "done") {
    // Built from the address the reviewer is on, so it works on previews too.
    const shareUrl = result?.reviewPath ? `${window.location.origin}${result.reviewPath}` : "";
    const eligible = factsComplete({
      listing_type: listingType,
      reviewer_role: answers.role,
      facts: answers.facts,
      specialties: answers.specialties,
    });
    body = (
      <>
        {question(`You're reviewer #${result?.reviewerNumber || 1} for ${board.name}.`, "Your review is live. Thank you.")}
        {!result?.verified && (
          <p className="text-sm font-medium text-slate-600 mb-4">
            Check your inbox for a link from us. Opening it confirms your email and adds the Verified badge.
          </p>
        )}
        {voucher && (
          <p className="rounded-2xl bg-teal-50 border border-teal-100 p-4 text-sm font-medium text-teal-900 mb-6">
            {eligible
              ? result?.verified
                ? "Thank-you voucher: you qualify. We'll check your review and email your $5 voucher."
                : "Thank-you voucher: confirm your email with the link we sent, then we'll check your review and email your $5 voucher."
              : "Thank-you voucher: some questions were skipped, so this review doesn't qualify for the voucher."}
          </p>
        )}

        {!pickOther ? (
          <PrimaryButton onClick={() => setPickOther(true)}>Review another board you&apos;ve used (60 seconds)</PrimaryButton>
        ) : (
          <div className="space-y-3">
            <label htmlFor="other-board" className="block text-sm font-black text-slate-800">
              Which one?
            </label>
            <select
              id="other-board"
              defaultValue=""
              onChange={(e) => {
                if (!e.target.value) return;
                const qs = new URLSearchParams({ again: "1" });
                if (voucher) qs.set("campaign", "voucher");
                else if (src !== "personal") qs.set("src", src);
                router.push(`/review/${e.target.value}?${qs}`);
              }}
              className="min-h-[52px] w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-base font-bold focus:border-[#FF5630] focus:outline-none"
            >
              <option value="">Choose a board</option>
              <optgroup label="Healthcare">
                {otherBoards.filter((b) => b.healthcare).map((b) => (
                  <option key={b.slug} value={b.slug}>{b.name}</option>
                ))}
              </optgroup>
              <optgroup label="Other boards">
                {otherBoards.filter((b) => !b.healthcare).map((b) => (
                  <option key={b.slug} value={b.slug}>{b.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
        )}

        {shareUrl && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                const text = `I reviewed ${board.name} on JobBoardsReview`;
                try {
                  if (navigator.share) await navigator.share({ title: text, text, url: shareUrl });
                  else {
                    await navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                  }
                } catch {}
              }}
              className="min-h-[44px] rounded-2xl border-2 border-slate-200 px-5 text-sm font-black text-slate-800 hover:border-slate-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF5630]/30"
            >
              {copied ? "Link copied" : "Share your review"}
            </button>
            <a href={shareUrl} className="min-h-[44px] inline-flex items-center px-2 text-sm font-bold text-slate-500 underline underline-offset-4">
              See it on {board.name}
            </a>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
      {header}
      {saveError && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm font-bold text-red-700">
          {saveError}
        </p>
      )}
      <section>{body}</section>
    </div>
  );
}
