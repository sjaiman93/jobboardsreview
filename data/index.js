import { validateBoardData } from "./validation";
import { categories } from "./categories";
import { boardProsCons } from "./boardProsCons";
import { boardDecisionTags } from "./boardDecisionTags";
import { boardHighlightGroups } from "./boardHighlightGroups";
import { boardMetrics } from "./boardMetrics";

import alliedhealthjobcafe from "./jobboards/alliedhealthjobcafe";
import accounting_jobs_today from "./jobboards/accounting-jobs-today";
import hired from "./jobboards/hired";
import getwork from "./jobboards/getwork";
import google_for_jobs from "./jobboards/google-for-jobs";
import himalayas from "./jobboards/himalayas";
import geekwork from "./jobboards/geekwork";
import hospital_recruiter from "./jobboards/hospital-recruiter";
import remote_co from "./jobboards/remote-co";
import wellfound from "./jobboards/wellfound";
import dice from "./jobboards/dice";
import flexjobs from "./jobboards/flexjobs";
import idealist from "./jobboards/idealist";
import indeed from "./jobboards/indeed";

const rawBoards = [
  alliedhealthjobcafe,
  accounting_jobs_today,
  hired,
  getwork,
  google_for_jobs,
  himalayas,
  geekwork,
  hospital_recruiter,
  remote_co,
  wellfound,
  dice,
  flexjobs,
  idealist,
  indeed
];

// Perform compile-time validation
const seenSlugs = new Set();
const seenNames = new Set();
rawBoards.forEach(board => {
  validateBoardData(board, seenSlugs, seenNames);
});

export const jobBoards = rawBoards;
export { categories, boardProsCons, boardDecisionTags, boardHighlightGroups, boardMetrics };

/* Helper Functions */
export function getAllBoards() {
  return jobBoards;
}

export function getBoardBySlug(slug) {
  return jobBoards.find((b) => b.slug === slug) || null;
}

export function getBoardsByCategory(categorySlug) {
  return jobBoards.filter((b) => b.categorySlug === categorySlug);
}

export function getAllCategories() {
  return categories;
}

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug) || null;
}

export function searchBoards(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  return jobBoards.filter((b) => {
    const nameMatch = b.name.toLowerCase().includes(q);
    const slugMatch = b.slug.toLowerCase().includes(q);
    const catMatch = b.category.toLowerCase().includes(q);
    const shortDescMatch = b.shortDescription?.toLowerCase().includes(q);
    const fullDescMatch = b.fullDescription?.toLowerCase().includes(q);
    const featuresMatch = b.features?.some(f => f.toLowerCase().includes(q));
    const tags = getBoardDecisionTags(b.slug) || [];
    const tagsMatch = tags.some(t => t.toLowerCase().includes(q));

    return nameMatch || slugMatch || catMatch || shortDescMatch || fullDescMatch || featuresMatch || tagsMatch;
  });
}

export function getBoardMetrics(slug) {
  return boardMetrics[slug] || { candidateReach: "Growing", reachLabel: "Candidates" };
}

export function getBoardProsCons(slug) {
  return boardProsCons[slug] || {
    pros: ["Established platform in its niche", "Active user community", "Regular platform updates"],
    cons: ["Limited public pricing information", "May not suit all industries"],
  };
}

export function getBoardDecisionTags(slug) {
  return boardDecisionTags[slug] || ["Established", "Active Community"];
}

export function getBoardHighlightGroups(slug) {
  return boardHighlightGroups[slug] || {
    "Hiring Type": ["Full-time", "Various Levels"],
    "Industry Focus": [slug ? "Specialized" : "Generalist"],
    "Pricing Model": ["Contact for Pricing"],
    "Candidate Quality": ["Standard Pool"],
  };
}
