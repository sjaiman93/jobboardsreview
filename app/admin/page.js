import fs from "fs";
import path from "path";
import { getAllBoards, getBoardBySlug, getBoardProsCons, getBoardDecisionTags } from "@/data/jobBoards";
import { getSiteContent } from "@/data/siteContent";
import { getBlogs } from "@/data/blogs";
import AdminDashboard from "./AdminDashboard";

export const metadata = {
  title: "Admin Panel | JobBoardsReview",
};

export default function AdminPage({ searchParams }) {
  const rawBoards = getAllBoards();
  const siteContent = getSiteContent();
  const blogs = getBlogs();
  
  // Attach pros/cons/tags for CSV export
  const boards = rawBoards.map(b => {
    const pc = getBoardProsCons(b.slug) || {};
    const tgs = getBoardDecisionTags(b.slug) || [];
    return { ...b, _pros: pc.pros || [], _cons: pc.cons || [], _tags: tgs };
  });

  const editSlug = searchParams?.edit;
  let editingBoard = null;
  let editProsCons = null;
  let editTags = null;

  if (editSlug) {
    editingBoard = getBoardBySlug(editSlug);
    editProsCons = getBoardProsCons(editSlug);
    editTags = getBoardDecisionTags(editSlug);
  }

  let submissions = [];
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const { data, error } = await supabaseAdmin
      .from('board_submissions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Supabase fetch error in admin:", error);
    } else {
      // Map back to the expected camelCase format for the dashboard
      submissions = data.map(sub => ({
        id: sub.id,
        submittedAt: sub.created_at,
        submitterType: sub.submitter_type,
        contactName: sub.contact_name,
        contactEmail: sub.contact_email,
        boardName: sub.board_name,
        toolType: sub.tool_type,
        websiteUrl: sub.website_url,
        categorySlug: sub.category_slug,
        bestFor: sub.best_for,
        shortDescription: sub.short_description,
        targetAudience: sub.target_audience,
        pricingModel: sub.pricing_model,
        pricingInfo: sub.pricing_info,
        freeTrial: sub.free_trial,
        claimListing: sub.claim_listing,
        linkedinPage: sub.linkedin_page,
        status: sub.status
      }));
    }
  } catch (e) {
    console.error("Error reading submissions from Supabase:", e);
  }

  return (
    <AdminDashboard 
      boards={boards}
      siteContent={siteContent}
      blogs={blogs}
      editingBoard={editingBoard}
      editProsCons={editProsCons}
      editTags={editTags}
      editSlug={editSlug}
      submissions={submissions}
    />
  );
}

