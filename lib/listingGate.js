// Publish gate for listing pages (JBR_GROWTH_FRAMEWORK.md section 5):
// a listing is "complete" when it has a human-edited write-up of 300+ words
// (`fullDescription`) and a "last verified" date (`lastVerified`, YYYY-MM-DD,
// set by hand in the board's file in data/jobboards/ when you check it).
// Only complete listings go in the sitemap.

export const MIN_WRITEUP_WORDS = 300;

export function writeupWords(board) {
  return String(board?.fullDescription || "").split(/\s+/).filter(Boolean).length;
}

export function lastVerifiedDate(board) {
  const raw = board?.lastVerified;
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isCompleteListing(board) {
  return writeupWords(board) >= MIN_WRITEUP_WORDS && !!lastVerifiedDate(board);
}
