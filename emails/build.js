// Generates the email templates in this folder. Run from the repo root: node emails/build.js .
const fs = require("fs");
const path = require("path");
const out = path.join(process.argv[2], "emails");
fs.mkdirSync(path.join(out, "supabase"), { recursive: true });
fs.mkdirSync(path.join(out, "transactional"), { recursive: true });

const C = { orange: "#FF5630", cream: "#FCFBF8", ink: "#0F172A", body: "#334155", muted: "#64748B", line: "#E2E8F0", white: "#FFFFFF" };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const p = (t) => `<p style="margin:0 0 16px;font:400 16px/1.6 ${FONT};color:${C.body};">${t}</p>`;
const small = (t) => `<p style="margin:0 0 12px;font:400 13px/1.6 ${FONT};color:${C.muted};">${t}</p>`;
const h1 = (t) => `<h1 style="margin:0 0 16px;font:800 26px/1.25 ${FONT};color:${C.ink};">${t}</h1>`;
const button = (label, href) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
  <tr><td style="border-radius:12px;background:${C.orange};">
    <a href="${href}" style="display:inline-block;padding:14px 28px;font:700 16px/1 ${FONT};color:${C.white};text-decoration:none;border-radius:12px;">${label}</a>
  </td></tr>
</table>`;
const link = (label, href) => `<a href="${href}" style="color:${C.orange};font-weight:600;text-decoration:underline;word-break:break-all;">${label}</a>`;
const list = (items) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;width:100%;">
  ${items.map((t, i) => `<tr>
    <td valign="top" style="width:28px;padding:0 0 12px;font:800 15px/1.6 ${FONT};color:${C.orange};">${i + 1}.</td>
    <td valign="top" style="padding:0 0 12px;font:400 15px/1.6 ${FONT};color:${C.body};">${t}</td>
  </tr>`).join("")}
</table>`;
const panel = (inner) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 24px;">
  <tr><td style="background:${C.cream};border:1px solid ${C.line};border-radius:12px;padding:16px 20px;font:400 15px/1.6 ${FONT};color:${C.body};">${inner}</td></tr>
</table>`;
const fallback = (href) => small(`Button not working? Copy this link into your browser:<br><a href="${href}" style="color:${C.muted};word-break:break-all;">${href}</a>`);

function layout({ title, preheader, body, footerNote }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${C.cream};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.cream};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;">
      <tr><td style="padding:0 4px 20px;">
        <a href="https://jobboardsreview.com" style="text-decoration:none;font:800 20px/1 ${FONT};color:${C.ink};">Job<span style="color:${C.orange};">Boards</span>Review</a>
      </td></tr>
      <tr><td style="background:${C.white};border:1px solid ${C.line};border-radius:16px;padding:32px 28px;">
        ${body}
      </td></tr>
      <tr><td style="padding:20px 4px 0;">
        ${footerNote ? small(footerNote) : ""}
        ${small(`JobBoardsReview · Compare &amp; review US job boards · ${link("jobboardsreview.com", "https://jobboardsreview.com")}`)}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
`;
}

const emails = [
  // ---------- Supabase Auth (paste into Supabase → Authentication → Emails) ----------
  {
    file: "supabase/magic-link.html",
    subject: "Your JobBoardsReview sign-in link",
    preheader: "One click and you're back to comparing job boards.",
    body: h1("Sign in to JobBoardsReview") +
      p("Click the button below to sign in. The link works once and expires soon, so use it now.") +
      button("Sign me in", "{{ .ConfirmationURL }}") +
      fallback("{{ .ConfirmationURL }}"),
    footerNote: "Didn't ask to sign in? You can ignore this email. Nobody can get into your account without this link.",
  },
  {
    file: "supabase/confirm-signup.html",
    subject: "Confirm your email to finish joining JobBoardsReview",
    preheader: "One click to confirm, then start comparing boards by price and results.",
    body: h1("Welcome to JobBoardsReview") +
      p("You're one click away from your account. Confirm your email and you're in.") +
      button("Confirm my email", "{{ .ConfirmationURL }}") +
      p("<strong style=\"color:" + C.ink + ";\">Once you're in, three things worth doing:</strong>") +
      list([
        "<strong>Compare boards side by side.</strong> Pricing, focus and fit for the roles you hire for, in one view.",
        "<strong>Check what a board charges</strong> before you get on a call with its sales team.",
        "<strong>Review a board you've used.</strong> Recruiters learn the most from other recruiters, and every honest review makes the next budget call easier.",
      ]) +
      fallback("{{ .ConfirmationURL }}"),
    footerNote: "Didn't sign up? Ignore this email and no account will be created.",
  },
  {
    file: "supabase/change-email.html",
    subject: "Confirm your new email address",
    preheader: "Confirm the change to your JobBoardsReview sign-in email.",
    body: h1("Confirm your new email") +
      p("You asked to change the email on your JobBoardsReview account from <strong>{{ .Email }}</strong> to <strong>{{ .NewEmail }}</strong>.") +
      button("Confirm new email", "{{ .ConfirmationURL }}") +
      fallback("{{ .ConfirmationURL }}"),
    footerNote: "Didn't request this? Ignore this email and your address stays the same.",
  },

  // ---------- Transactional (sent by the site; placeholders filled in code) ----------
  {
    file: "transactional/review-received.html",
    subject: "Thanks, your review of {{board_name}} is in",
    preheader: "Our team reads every review before it goes live.",
    body: h1("Thanks for reviewing {{board_name}}") +
      p("Hi {{first_name}},") +
      p("Your review is with our team. We read every review before it goes live, so recruiters can trust what they find on JobBoardsReview.") +
      panel(`<strong style="color:${C.ink};">What you sent</strong><br>{{rating}} / 5 · &ldquo;{{review_title}}&rdquo;`) +
      p("We'll email you as soon as it's published. If you spot something you want to change, reply to this email."),
  },
  {
    file: "transactional/review-published.html",
    subject: "Your review of {{board_name}} is live",
    preheader: "Other recruiters can now see what you learned.",
    body: h1("Your review is live") +
      p("Hi {{first_name}},") +
      p("Your review of <strong>{{board_name}}</strong> is now on its page, helping other recruiters decide where their budget goes.") +
      button("See your review", "{{review_url}}") +
      p("Used other boards this year? Each review you add makes the comparison fairer for everyone hiring.") +
      p(link("Review another board", "https://jobboardsreview.com/directory")),
  },
  {
    file: "transactional/listing-received.html",
    subject: "We've received your listing for {{board_name}}",
    preheader: "Here's what happens next.",
    body: h1("Thanks for listing {{board_name}}") +
      p("Hi {{first_name}},") +
      p("We've received your submission. Someone on our team checks every listing by hand before it goes live. Here's what happens next:") +
      list([
        "We check that the board is live and hiring in the US.",
        "We confirm the pricing and details you sent us.",
        "We email you when your page is published, or if we need anything from you.",
      ]) +
      p("Want to add or correct something in the meantime? Just reply to this email."),
  },
  {
    file: "transactional/listing-approved.html",
    // Sent when the listing is approved in local admin. The page only goes live
    // after the next commit + deploy, so this must not say "live now".
    subject: "{{board_name}} is approved for JobBoardsReview",
    preheader: "Your page goes up with our next site update. Two things will help it most.",
    body: h1("{{board_name}} is approved") +
      p("Hi {{first_name}},") +
      p("Good news: we've approved your listing. Your page goes up with our next site update, at this address:") +
      p(link("{{board_url}}", "{{board_url}}")) +
      p("<strong style=\"color:" + C.ink + ";\">Recruiters compare boards on price and on results, so two things help your page most:</strong>") +
      list([
        "<strong>Keep your pricing current.</strong> When your rates change, reply to this email and we'll update the page.",
        `<strong>Ask recruiters who've hired through you for a review.</strong> Send them this link: ${link("{{board_url}}#reviews", "{{board_url}}#reviews")}`,
      ]),
  },
  {
    file: "transactional/admin-alert.html",
    subject: "[JBR] New {{item_type}} waiting: {{board_name}}",
    preheader: "Something needs your approval.",
    body: h1("New {{item_type}} waiting") +
      panel(`<strong style="color:${C.ink};">Board:</strong> {{board_name}}<br><strong style="color:${C.ink};">From:</strong> {{submitter_email}}<br><strong style="color:${C.ink};">Submitted:</strong> {{submitted_at}}`) +
      button("Open in Supabase", "{{supabase_url}}") +
      small("To approve a listing: run <code>npm run dev</code>, open /admin, approve, then commit and push."),
  },
];

for (const e of emails) {
  fs.writeFileSync(path.join(out, e.file), layout({ title: e.subject, ...e }));
}
fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(emails.map(({ file, subject, preheader }) => ({ file, subject, preheader })), null, 2));
console.log("wrote", emails.length, "templates to", out);

// ---------- lib/emailTemplates.js: transactional templates the site imports ----------
// A JS module (not files read at runtime) so they ship with the serverless build.
const transactional = {};
for (const e of emails.filter((x) => x.file.startsWith("transactional/"))) {
  const name = path.basename(e.file, ".html");
  transactional[name] = { subject: e.subject, html: fs.readFileSync(path.join(out, e.file), "utf8") };
}
fs.writeFileSync(
  path.join(out, "..", "lib", "emailTemplates.js"),
  `// GENERATED by emails/build.js. Do not edit by hand: change build.js and run\n// \`node emails/build.js .\` from the repo root.\nexport const EMAIL_TEMPLATES = ${JSON.stringify(transactional, null, 2)};\n`
);
console.log("wrote lib/emailTemplates.js");

// ---------- preview.html: every email with sample data, side by side ----------
const SAMPLE = {
  "{{ .ConfirmationURL }}": "https://jobboardsreview.com/directory",
  "{{ .Email }}": "old@staffingco.com",
  "{{ .NewEmail }}": "maria@staffingco.com",
  "{{first_name}}": "Maria",
  "{{board_name}}": "Vivian Health",
  "{{board_url}}": "https://jobboardsreview.com/board/vivian",
  "{{review_url}}": "https://jobboardsreview.com/board/vivian#reviews",
  "{{rating}}": "4",
  "{{review_title}}": "Strong for travel RN roles, slower for allied",
  "{{item_type}}": "review",
  "{{submitter_email}}": "maria@staffingco.com",
  "{{submitted_at}}": "16 Nov 2026, 10:42",
  "{{supabase_url}}": "https://supabase.com/dashboard",
};
const fill = (s) => Object.entries(SAMPLE).reduce((acc, [k, v]) => acc.split(k).join(v), s);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const cards = emails.map((e) => {
  const html = fill(fs.readFileSync(path.join(out, e.file), "utf8"));
  return `<section>
  <div class="meta"><span class="tag">${e.file.startsWith("supabase") ? "Supabase sign-in" : "Sent by site"}</span>
  <div class="subj">${esc(fill(e.subject))}</div><div class="pre">${esc(fill(e.preheader))}</div><code>${e.file}</code></div>
  <iframe srcdoc="${esc(html)}" title="${esc(e.subject)}" loading="lazy"></iframe>
</section>`;
}).join("\n");
fs.writeFileSync(path.join(out, "preview.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>JBR email preview</title>
<style>
  body{margin:0;background:#F1F5F9;font:15px/1.5 ${FONT};color:${C.ink}}
  header{padding:24px 16px;max-width:1240px;margin:0 auto}
  h1{margin:0 0 4px;font-size:22px} header p{margin:0;color:${C.muted}}
  main{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:20px;padding:0 16px 40px;max-width:1240px;margin:0 auto}
  section{background:#fff;border:1px solid ${C.line};border-radius:14px;overflow:hidden}
  .meta{padding:14px 16px;border-bottom:1px solid ${C.line}}
  .tag{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:${C.orange}}
  .subj{font-weight:700;margin:4px 0 2px} .pre{color:${C.muted};font-size:13px} code{font-size:12px;color:${C.muted}}
  iframe{width:100%;height:640px;border:0;display:block;background:${C.cream}}
</style></head><body>
<header><h1>JobBoardsReview emails</h1><p>${emails.length} templates with sample data. Source: <code>emails/build.js</code></p></header>
<main>
${cards}
</main></body></html>
`);
console.log("wrote preview.html");
