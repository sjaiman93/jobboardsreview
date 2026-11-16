import { redirect } from "next/navigation";
import { getAllBoards, getBoardBySlug, getBoardProsCons, getBoardDecisionTags } from "@/data/jobBoards";
import { getSiteContent } from "@/data/siteContent";
import { getBlogs } from "@/data/blogs";
import { isAdmin, isLocalDev } from "@/lib/requireAdmin";
import AdminDashboard from "./AdminDashboard";

export const metadata = {
  title: "Admin Panel | JobBoardsReview",
  robots: { index: false, follow: false },
};

// Always render fresh: queues change constantly and need the visitor's session.
export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }) {
  // Middleware already checks; this is the second lock.
  if (!(await isAdmin())) redirect("/admin/login");

  const rawBoards = getAllBoards();
  const siteContent = getSiteContent();
  const blogs = getBlogs();
  
  // Attach pros/cons/tags for CSV export
  const boards = rawBoards.map(b => {
    const pc = getBoardProsCons(b.slug) || {};
    const tgs = getBoardDecisionTags(b.slug) || [];
    return { ...b, _pros: pc.pros || [], _cons: pc.cons || [], _tags: tgs };
  });

  // searchParams is a Promise in Next 15+; reading it directly gave undefined,
  // so ?edit=<slug> never loaded the board.
  const editSlug = (await searchParams)?.edit;
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
        // "domain_match" | "needs_verification" | null (set for claims since Nov 2026)
        ownerVerification: sub.owner_verification || null,
        linkedinPage: sub.linkedin_page,
        status: sub.status
      }));
    }
  } catch (e) {
    console.error("Error reading submissions from Supabase:", e);
  }

  // Reviews for the Reviews tab, newest first, with the reviewer's email
  // (admin-only view; never sent to public pages).
  let reviews = [];
  try {
    const { supabaseAdmin } = await import("@/lib/supabase");
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("reviews")
        .select("*") // "*" so it works before and after the reviews migration
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) {
        console.error("Supabase fetch error (reviews):", error);
      } else {
        const emails = {};
        for (const id of [...new Set(data.filter((r) => !r.reviewer_email).map((r) => r.user_id).filter(Boolean))]) {
          const { data: u } = await supabaseAdmin.auth.admin.getUserById(id);
          emails[id] = u?.user?.email || null;
        }
        reviews = data.map((r) => ({ ...r, reviewer_email: r.reviewer_email || emails[r.user_id] || null }));
      }
    }
  } catch (e) {
    console.error("Error reading reviews from Supabase:", e);
  }

  return (
    <AdminDashboard
      reviews={reviews}
      canEditFiles={isLocalDev()}
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

