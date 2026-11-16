# JobBoardsReview emails

Branded HTML emails: orange/cream, short, written recruiter-to-recruiter.
Edit the copy in `build.js`, then regenerate everything from the repo root:

```bash
node emails/build.js .
```

`preview.html` shows all eight with sample data. Open it in a browser.

## A. Supabase sign-in emails: paste into the dashboard (no code)

Supabase → **Authentication → Emails → Templates**. For each one, set the
subject and paste the whole HTML file into the message body.

| Template in Supabase | Subject | File |
| --- | --- | --- |
| Magic Link | Your JobBoardsReview sign-in link | `supabase/magic-link.html` |
| Confirm signup | Confirm your email to finish joining JobBoardsReview | `supabase/confirm-signup.html` |
| Change Email Address | Confirm your new email address | `supabase/change-email.html` |

The site signs people in with an email link (`signInWithOtp`) or with Google or
LinkedIn. There are no passwords, so the Reset Password template is never
sent.

**Before launch: set up your own sender (custom SMTP).** Supabase's built-in
sender is for testing only: it has a very low hourly limit and may only
deliver to your own team. Without your own SMTP, real recruiters may never get
their sign-in link. To set it up:

1. Create a free Resend account. Verify `jobboardsreview.com` by adding the
   DNS records Resend shows you.
2. Supabase → **Authentication → Emails → SMTP Settings** → enable custom SMTP:
   host `smtp.resend.com`, port `465`, user `resend`, password = your Resend
   API key. Sender: `noreply@jobboardsreview.com`, name
   `JobBoardsReview`.
3. Paste the three templates above.
4. Send yourself a sign-in link from `/join` to test.

## B. Transactional emails: sent by the site

Sent through Resend by `lib/email.js`, which uses the generated
`lib/emailTemplates.js`. They need `RESEND_API_KEY` and `EMAIL_FROM`, plus
`EMAIL_REPLY_TO` and `ADMIN_ALERT_EMAIL` (see `.env.example`). Set these in
Vercel and in your `.env.local`, because listing approval runs locally.

If the keys are missing, each email is skipped with a log line and the
submission still succeeds. A failed send never fails a submission.

| File | Subject | Sent from | To | Wired |
| --- | --- | --- | --- | --- |
| `transactional/review-received.html` | Thanks, your review of {{board_name}} is in | `submitReviewAction` (`app/actions/reviews.js`) | reviewer | yes |
| `transactional/listing-received.html` | We've received your listing for {{board_name}} | `submitBoardProposal` (`app/admin/actions.js`) | submitter | yes |
| `transactional/listing-approved.html` | {{board_name}} is approved for JobBoardsReview | `approveSubmissionAction`, after all writes | submitter | yes |
| `transactional/admin-alert.html` | [JBR] New {{item_type}} waiting: {{board_name}} | both submit actions | `ADMIN_ALERT_EMAIL` | yes |
| `transactional/review-published.html` | Your review of {{board_name}} is live | `setReviewStatusAction` (admin → Reviews tab), first approval only | reviewer | yes |

**review-published** is sent the first time a review is approved. The board page
shows it within about 10 minutes (5-min page refresh + 5-min data cache).

**listing-approved says "approved", not "live".** Approval happens in local
admin, and the page only goes live after commit + push + Vercel deploy.

Placeholders: `first_name`, `board_name`, `board_url`, `review_url`, `rating`,
`review_title`, `item_type` (`review` / `listing`), `submitter_email`,
`submitted_at`, `supabase_url`.

**Copy that makes a promise, so check it stays true:**

- "Reply to this email" appears in review-received, listing-received and
  listing-approved. The reply-to inbox must be one someone reads.
- listing-received lists three checks: live, hiring in the US, pricing
  confirmed. Edit these if your approval steps change.
- No approval times are promised anywhere. Add one only if you can keep it.
