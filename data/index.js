import { validateBoardData } from "./validation";
import { categories } from "./categories";
import { boardProsCons } from "./boardProsCons";
import { boardDecisionTags } from "./boardDecisionTags";
import { boardHighlightGroups } from "./boardHighlightGroups";
import { boardMetrics } from "./boardMetrics";

import accounting_jobs_today from "./jobboards/accounting-jobs-today";
import alliedhealthjobcafe from "./jobboards/alliedhealthjobcafe";
import alliedtravelcareers from "./jobboards/alliedtravelcareers";
import authentic_jobs from "./jobboards/authentic-jobs";
import behance_jobs from "./jobboards/behance-jobs";
import biospace from "./jobboards/biospace";
import bluepipes from "./jobboards/bluepipes";
import careerbuilder from "./jobboards/careerbuilder";
import careervitals from "./jobboards/careervitals";
import cfa_institute_jobs from "./jobboards/cfa-institute-jobs";
import chronicle_vitae from "./jobboards/chronicle-vitae";
import clearancejobs from "./jobboards/clearancejobs";
import coroflot from "./jobboards/coroflot";
import crunchboard from "./jobboards/crunchboard";
import culinary_agents from "./jobboards/culinary-agents";
import cybersecjobs from "./jobboards/cybersecjobs";
import dentistjobcafe from "./jobboards/dentistjobcafe";
import devex from "./jobboards/devex";
import devjobsscanner from "./jobboards/devjobsscanner";
import dice from "./jobboards/dice";
import dribbble_jobs from "./jobboards/dribbble-jobs";
import edsurge_jobs from "./jobboards/edsurge-jobs";
import efinancialcareers from "./jobboards/efinancialcareers";
import financial_job_bank from "./jobboards/financial-job-bank";
import flexjobs from "./jobboards/flexjobs";
import foundation_list from "./jobboards/foundation-list";
import geekwork from "./jobboards/geekwork";
import getwork from "./jobboards/getwork";
import glassdoor from "./jobboards/glassdoor";
import google_for_jobs from "./jobboards/google-for-jobs";
import hcareers from "./jobboards/hcareers";
import health_ecareers from "./jobboards/health-ecareers";
import healthjobsnationwide from "./jobboards/healthjobsnationwide";
import higheredjobs from "./jobboards/higheredjobs";
import himalayas from "./jobboards/himalayas";
import hired from "./jobboards/hired";
import hospitalrecruiting from "./jobboards/hospitalrecruiting";
import idealist from "./jobboards/idealist";
import ihire from "./jobboards/ihire";
import incredible_health from "./jobboards/incredible-health";
import indeed from "./jobboards/indeed";
import intelligence_careers from "./jobboards/intelligence-careers";
import journalismjobs from "./jobboards/journalismjobs";
import juicebox from "./jobboards/juicebox";
import ladders from "./jobboards/ladders";
import lawcrossing from "./jobboards/lawcrossing";
import lawyer_com_jobs from "./jobboards/lawyer-com-jobs";
import linkedin_jobs from "./jobboards/linkedin-jobs";
import logistics_management_jobs from "./jobboards/logistics-management-jobs";
import mediabistro from "./jobboards/mediabistro";
import monster from "./jobboards/monster";
import nalp_job_board from "./jobboards/nalp-job-board";
import nature_jobs from "./jobboards/nature-jobs";
import new_scientist_jobs from "./jobboards/new-scientist-jobs";
import nursingjobs from "./jobboards/nursingjobs";
import practicelink from "./jobboards/practicelink";
import practicematch from "./jobboards/practicematch";
import product_hunt_jobs from "./jobboards/product-hunt-jobs";
import remote_co from "./jobboards/remote-co";
import remote_ok from "./jobboards/remote-ok";
import remotive from "./jobboards/remotive";
import schoolspring from "./jobboards/schoolspring";
import science_careers from "./jobboards/science-careers";
import simplyhired from "./jobboards/simplyhired";
import smashing_magazine_jobs from "./jobboards/smashing-magazine-jobs";
import snagajob from "./jobboards/snagajob";
import stack_overflow_jobs from "./jobboards/stack-overflow-jobs";
import startup_jobs from "./jobboards/startup-jobs";
import supply_chain_jobs from "./jobboards/supply-chain-jobs";
import talent_com from "./jobboards/talent-com";
import teachers_teachers from "./jobboards/teachers-teachers";
import teamwork_online from "./jobboards/teamwork-online";
import techladies from "./jobboards/techladies";
import the_muse from "./jobboards/the-muse";
import therapist_com from "./jobboards/therapist-com";
import travelnursesource from "./jobboards/travelnursesource";
import usajobs from "./jobboards/usajobs";
import vivian from "./jobboards/vivian";
import wall_street_oasis_jobs from "./jobboards/wall-street-oasis-jobs";
import we_work_remotely from "./jobboards/we-work-remotely";
import wellfound from "./jobboards/wellfound";
import work_for_good from "./jobboards/work-for-good";
import workinlogistics from "./jobboards/workinlogistics";
import workinsports from "./jobboards/workinsports";
import y_combinator_jobs from "./jobboards/y-combinator-jobs";
import ziprecruiter from "./jobboards/ziprecruiter";

const rawBoards = [
  accounting_jobs_today,
  alliedhealthjobcafe,
  alliedtravelcareers,
  authentic_jobs,
  behance_jobs,
  biospace,
  bluepipes,
  careerbuilder,
  careervitals,
  cfa_institute_jobs,
  chronicle_vitae,
  clearancejobs,
  coroflot,
  crunchboard,
  culinary_agents,
  cybersecjobs,
  dentistjobcafe,
  devex,
  devjobsscanner,
  dice,
  dribbble_jobs,
  edsurge_jobs,
  efinancialcareers,
  financial_job_bank,
  flexjobs,
  foundation_list,
  geekwork,
  getwork,
  glassdoor,
  google_for_jobs,
  hcareers,
  health_ecareers,
  healthjobsnationwide,
  higheredjobs,
  himalayas,
  hired,
  hospitalrecruiting,
  idealist,
  ihire,
  incredible_health,
  indeed,
  intelligence_careers,
  journalismjobs,
  juicebox,
  ladders,
  lawcrossing,
  lawyer_com_jobs,
  linkedin_jobs,
  logistics_management_jobs,
  mediabistro,
  monster,
  nalp_job_board,
  nature_jobs,
  new_scientist_jobs,
  nursingjobs,
  practicelink,
  practicematch,
  product_hunt_jobs,
  remote_co,
  remote_ok,
  remotive,
  schoolspring,
  science_careers,
  simplyhired,
  smashing_magazine_jobs,
  snagajob,
  stack_overflow_jobs,
  startup_jobs,
  supply_chain_jobs,
  talent_com,
  teachers_teachers,
  teamwork_online,
  techladies,
  the_muse,
  therapist_com,
  travelnursesource,
  usajobs,
  vivian,
  wall_street_oasis_jobs,
  we_work_remotely,
  wellfound,
  work_for_good,
  workinlogistics,
  workinsports,
  y_combinator_jobs,
  ziprecruiter
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
  return boardProsCons[slug] || null;
}

export function getBoardDecisionTags(slug) {
  return boardDecisionTags[slug] || [];
}

export function getBoardHighlightGroups(slug) {
  return boardHighlightGroups[slug] || null;
}
