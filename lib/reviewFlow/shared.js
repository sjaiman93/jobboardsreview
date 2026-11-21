// Questions asked on every review, whatever the listing type.
// Ids are stored in Supabase: rename a label freely, never change an id.

export const NOT_SURE = "not_sure";

export const WOULD_USE_AGAIN = [
  { id: "yes", label: "Yes" },
  { id: "maybe", label: "Maybe" },
  { id: "no", label: "No" },
];

export const ROLES = [
  { id: "recruiter", label: "Recruiter or sourcer", short: "Recruiter" },
  { id: "team_lead", label: "Team lead", short: "Team lead" },
  { id: "manager", label: "Manager or director", short: "Manager" },
  { id: "owner", label: "Owner or executive", short: "Owner" },
];

// Asked so a reviewer who publishes without their name can be shown as
// "Recruiter at a staffing agency".
export const FIRM_TYPES = [
  { id: "staffing_agency", label: "Staffing agency", phrase: "a staffing agency" },
  { id: "in_house", label: "In-house hiring team", phrase: "an in-house hiring team" },
  { id: "rpo", label: "RPO", phrase: "an RPO" },
  { id: "other", label: "Something else", phrase: "" },
];

export const SPECIALTIES = [
  { id: "travel_nursing", label: "Travel nursing" },
  { id: "per_diem", label: "Per diem" },
  { id: "allied", label: "Allied" },
  { id: "locums", label: "Locums" },
  { id: "advanced_practice", label: "Advanced practice" },
  { id: "non_clinical", label: "Non-clinical" },
];

export const MAX_CHIPS = 3;
export const NOTE_MAX = 200;

export function labelOf(list, id) {
  return list.find((o) => o.id === id)?.label || "";
}
