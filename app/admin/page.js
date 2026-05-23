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

  // Read Submissions
  const submissionsPath = path.join(process.cwd(), "storage", "submissions.json");
  let submissions = [];
  if (fs.existsSync(submissionsPath)) {
    try {
      submissions = JSON.parse(fs.readFileSync(submissionsPath, "utf-8"));
    } catch (e) {
      console.error("Error reading submissions in admin page.js:", e);
    }
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

