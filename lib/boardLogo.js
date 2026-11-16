// Board logo helpers.
//
// logo.clearbit.com no longer resolves, so Clearbit URLs count as "no logo"
// and the board shows its initials instead of a broken image. Once a real
// logo file is added under public/logos/ and the board's `logo` field points
// to it, the image is used again.

const SMALL_WORDS = new Set(["the", "of", "for", "and", "in", "on", "at", "a", "&"]);

export function boardHasLogo(board) {
  const logo = board?.logo;
  if (!logo || logo === "/logos/default.svg") return false;
  if (logo.includes("logo.clearbit.com")) return false;
  return true;
}

// "Monster" -> "M", "HealthJobsNationwide" -> "HJ", "Lawyer.com Jobs" -> "LJ",
// "Vivian (formerly NurseFly)" -> "V", "The Muse" -> "M".
export function boardInitials(name = "") {
  const words = name
    .replace(/\(.*?\)/g, " ")                 // drop "(formerly X)", "(AngelList)"
    .replace(/\.(com|co|org|net|io)\b/gi, " ") // drop domain suffixes
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")   // split CamelCase
    .split(/[\s\-_/]+/)
    .filter((w) => w && !SMALL_WORDS.has(w.toLowerCase()));

  const initials = words.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  return initials || name.charAt(0).toUpperCase();
}
