"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import CsvTools from "./CsvTools";
import { saveBoard, saveSiteContentAction, saveBlogAction, approveSubmissionAction, updateSubmissionStatusAction, hardDeleteSubmissionAction, adminLogoutAction } from "./actions";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function AdminDashboard({ boards, editingBoard, editProsCons, editTags, editSlug, siteContent, blogs = [], submissions = [] }) {
  const [activeTab, setActiveTab] = useState("jobBoards");
  const [isSaving, setIsSaving] = useState(false);

  const [submissionsList, setSubmissionsList] = useState(submissions || []);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    if (submissions) {
      setSubmissionsList(submissions);
    }
  }, [submissions]);


  const [legalContent, setLegalContent] = useState({
    terms: "",
    privacy: "",
    disclaimer: "",
    cookies: "",
  });

  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [highlightText, setHighlightText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [copyrightText, setCopyrightText] = useState("");

  useEffect(() => {
    console.log("Admin Loaded siteContent:", siteContent);

    if (siteContent?.legal) {
      setLegalContent({
        terms: siteContent.legal.terms || "",
        privacy: siteContent.legal.privacy || "",
        disclaimer: siteContent.legal.disclaimer || "",
        cookies: siteContent.legal.cookies || "",
      });
    }
    
    if (!siteContent || !siteContent.homepage) return;

    setHeroTitle(siteContent.homepage.heroTitle || "");
    setHeroSubtitle(siteContent.homepage.heroSubtitle || "");
    setHighlightText(siteContent.homepage.highlightText || "");
    setFooterText(siteContent.homepage.footerText || "");
    setCopyrightText(siteContent.homepage.copyrightText || "");
  }, [siteContent]);

  // --- BLOG STATE ---
  const [editingBlogSlug, setEditingBlogSlug] = useState(null);
  const [blogContent, setBlogContent] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    image: "",
    metaTitle: "",
    metaDescription: "",
    status: "draft",
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState("");

  // Load blog into state when edit icon clicked or new
  const loadBlog = (blog) => {
    if (blog) {
      setEditingBlogSlug(blog.slug);
      setBlogContent(blog);
    } else {
      setEditingBlogSlug(null);
      setBlogContent({
        title: "", slug: "", description: "", content: "", image: "", metaTitle: "", metaDescription: "", status: "draft"
      });
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (activeTab !== "blog") return;
    if (!blogContent.title && !blogContent.content) return; // don't autosave empty new blog

    const timer = setTimeout(async () => {
      setAutoSaveStatus("Saving draft...");
      const formData = new FormData();
      Object.entries(blogContent).forEach(([k, v]) => formData.append(k, v));
      formData.set("status", "draft"); // ensure auto-save keeps it as draft or maintains current status
      // Wait, if it's already published, auto-save should preserve published status?
      // Better to preserve the current status of blogContent.status
      formData.set("status", blogContent.status);
      
      await saveBlogAction(formData);
      setAutoSaveStatus("Draft saved at " + new Date().toLocaleTimeString());
    }, 2000);

    return () => clearTimeout(timer);
  }, [blogContent, activeTab]);

  const quillModules = {
    toolbar: [
      ["bold", "italic"],
      [{ list: "bullet" }, { list: "ordered" }],
      [{ header: [1, 2, 3, false] }],
      ["link"],
    ],
  };

  async function handleAdd(formData) {
    setIsSaving(true);
    await saveBoard(formData);
    setIsSaving(false);
    if (editSlug) {
      window.location.href = "/admin"; // redirect to clear searchParams
    }
  }

  async function handleSaveLegal(formData) {
    setIsSaving(true);
    await saveSiteContentAction(formData, "legal");
    setIsSaving(false);
    alert("Legal pages saved!");
  }

  async function handleSaveHomepage(formData) {
    setIsSaving(true);
    await saveSiteContentAction(formData, "homepage");
    setIsSaving(false);
    alert("Homepage content saved!");
  }

  async function handlePublishBlog(e) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    Object.entries(blogContent).forEach(([k, v]) => formData.append(k, v));
    formData.set("status", "published");
    await saveBlogAction(formData);
    setBlogContent(prev => ({ ...prev, status: "published" }));
    setIsSaving(false);
    alert("Blog published!");
  }

  async function handleUnpublishBlog(e) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    Object.entries(blogContent).forEach(([k, v]) => formData.append(k, v));
    formData.set("status", "draft");
    await saveBlogAction(formData);
    setBlogContent(prev => ({ ...prev, status: "draft" }));
    setIsSaving(false);
    alert("Blog unpublished (Draft mode)!");
  }

  async function handleStatusAction(id, actionType) {
    if (actionType === "approved") {
      const confirmApprove = confirm("Are you sure you want to approve and publish this job board listing?");
      if (!confirmApprove) return;
    }
    
    setIsSaving(true);
    try {
      let res;
      if (actionType === "approved") {
        res = await approveSubmissionAction(id);
      } else {
        res = await updateSubmissionStatusAction(id, actionType);
      }
      
      if (res.success) {
        setSubmissionsList(prev => prev.map(s => s.id === id ? { ...s, status: actionType } : s));
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(prev => ({ ...prev, status: actionType }));
        }
        alert(`Submission status updated to '${actionType}' successfully.`);
      } else {
        alert(`Error: ${res.error || "Failed to update submission status."}`);
      }
    } catch (e) {
      alert("A network error occurred.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleHardDelete(id) {
    const confirmDelete = confirm("Are you sure you want to permanently delete this submission? This action cannot be undone.");
    if (!confirmDelete) return;

    setIsSaving(true);
    try {
      const res = await hardDeleteSubmissionAction(id);
      if (res.success) {
        setSubmissionsList(prev => prev.filter(s => s.id !== id));
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(null);
        }
        alert("Submission deleted permanently.");
      } else {
        alert(`Error: ${res.error || "Failed to delete submission."}`);
      }
    } catch (e) {
      alert("A network error occurred.");
    } finally {
      setIsSaving(false);
    }
  }

  const filteredSubmissions = submissionsList.filter(s => {
    const status = s.status || "pending";
    return status === statusFilter;
  });

  async function handleLogout() {
    if (confirm("Are you sure you want to log out of the admin panel?")) {
      await adminLogoutAction();
      window.location.href = "/admin/login";
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-24">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black text-slate-900">Admin Panel</h1>
          {editSlug && (
            <Link href="/admin" className="text-sm font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg">
              Cancel Edit
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "jobBoards" && <CsvTools boards={boards} />}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            title="Log out of Admin"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-10 border-b border-slate-200">
        {[
          { id: "jobBoards", label: "Job Boards" },
          { id: "submissions", label: "Submissions" },
          { id: "blog", label: "Blog" },
          { id: "homepage", label: "Homepage" },
          { id: "legalPages", label: "Legal Pages" },
        ].map((tab) => (

          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#FF5630] text-[#FF5630]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "jobBoards" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl">
            <h2 className="text-xl font-bold mb-6">{editSlug ? "Edit Job Board" : "Add Job Board"}</h2>
            <form action={handleAdd} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Name</label>
                <input name="name" defaultValue={editingBoard?.name} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="e.g. Hired" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Slug</label>
                <input name="slug" defaultValue={editingBoard?.slug} readOnly={!!editSlug} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630] read-only:bg-slate-50" placeholder="e.g. hired" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Logo URL</label>
                <input name="logo" defaultValue={editingBoard?.logo} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="e.g. /logos/hired.svg or https://..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Website URL</label>
                <input name="website" defaultValue={editingBoard?.website} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Pricing Summary</label>
                <input name="pricingSummary" defaultValue={editingBoard?.pricing} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="e.g. Pay per hire" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Category</label>
                <input name="category" defaultValue={editingBoard?.category} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="e.g. Healthcare" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Subcategory (Optional)</label>
                <input name="subcategory" defaultValue={editingBoard?.subcategory} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="e.g. Travel Nurses" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Brief Overview</label>
                <textarea name="shortDescription" defaultValue={editingBoard?.shortDescription} required rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="Short description..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Full Overview</label>
                <textarea name="fullDescription" defaultValue={editingBoard?.fullDescription} required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="Detailed description..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Pros (one per line)</label>
                <textarea name="pros" defaultValue={editProsCons?.pros?.join("\n")} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="Fast hiring&#10;Pre-vetted candidates" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Cons (one per line)</label>
                <textarea name="cons" defaultValue={editProsCons?.cons?.join("\n")} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="Expensive&#10;Niche only" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Features (comma-separated)</label>
                <input name="features" defaultValue={editingBoard?.features?.join(", ")} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="Feature 1, Feature 2" />
              </div>

              <button type="submit" disabled={isSaving} className="w-full bg-[#FF5630] text-white font-black py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50">
                {isSaving ? "Saving..." : editSlug ? "Save Changes" : "Add Job Board"}
              </button>
            </form>
          </div>

          {/* List Section */}
          <div>
            <h2 className="text-xl font-bold mb-6">Existing Boards ({boards.length})</h2>
            <div className="space-y-3">
              {boards.map((board) => (
                <div key={board.slug} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <div className="font-black text-slate-900">{board.name}</div>
                    <div className="text-sm text-slate-500 font-medium">/{board.slug}</div>
                  </div>
                  <Link href={`/admin?edit=${board.slug}`} scroll={false} className="text-sm font-bold text-slate-400 hover:text-[#FF5630]">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="bg-white p-8 sm:p-12 rounded-[48px] card-shadow border border-slate-100 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Submission Queue</h2>
              <p className="text-slate-500 font-medium text-sm">
                Review and moderate user or vendor submitted job boards.
              </p>
            </div>
            
            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "pending", label: "Pending" },
                { id: "approved", label: "Approved" },
                { id: "rejected", label: "Rejected" },
                { id: "archived", label: "Archived" },
              ].map(statusItem => {
                const count = submissionsList.filter(s => (s.status || "pending") === statusItem.id).length;
                const isActive = statusFilter === statusItem.id;
                return (
                  <button
                    key={statusItem.id}
                    onClick={() => setStatusFilter(statusItem.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                      isActive
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {statusItem.label}
                    <span className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      isActive ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-slate-100">
              <span className="text-4xl mb-4 block">📥</span>
              <h3 className="text-lg font-black text-slate-900">No {statusFilter} submissions</h3>
              <p className="text-slate-400 font-medium text-sm mt-1">
                Submissions matching this status will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-8 sm:-mx-12">
              <div className="inline-block min-w-full align-middle px-8 sm:px-12">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="py-4 px-4 pl-0">Board Name</th>
                      <th className="py-4 px-4">Website</th>
                      <th className="py-4 px-4">Submitted By</th>
                      <th className="py-4 px-4">Type</th>
                      <th className="py-4 px-4">Claimed</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 pr-0 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredSubmissions.map((sub) => {
                      const dateStr = new Date(sub.submittedAt || sub.id).toLocaleDateString();
                      return (
                        <tr key={sub.id} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-4 pl-0 font-bold text-slate-900">
                            {sub.boardName}
                          </td>
                          <td className="py-5 px-4">
                            <a href={sub.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#FF5630] font-bold text-xs truncate max-w-[120px] inline-block">
                              {sub.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          </td>
                          <td className="py-5 px-4">
                            <div className="text-xs font-bold text-slate-800">{sub.contactName}</div>
                            <div className="text-[10px] text-slate-400">{sub.contactEmail}</div>
                          </td>
                          <td className="py-5 px-4 text-xs font-semibold text-slate-500">
                            {sub.submitterType || "Community"}
                          </td>
                          <td className="py-5 px-4">
                            {sub.claimListing ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100">Yes</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-100">No</span>
                            )}
                          </td>
                          <td className="py-5 px-4 text-xs text-slate-500">
                            {sub.category}
                          </td>
                          <td className="py-5 px-4 text-xs text-slate-400">
                            {dateStr}
                          </td>
                          <td className="py-5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              (sub.status || "pending") === "pending"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : (sub.status === "approved" || sub.status === "verified")
                                ? "bg-teal-50 text-teal-700 border-teal-100"
                                : sub.status === "rejected"
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}>
                              {sub.status || "pending"}
                            </span>
                          </td>
                          <td className="py-5 px-4 pr-0 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <button onClick={() => setSelectedSubmission(sub)} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">
                                View
                              </button>
                              
                              {(sub.status || "pending") === "pending" && (
                                <>
                                  <button onClick={() => handleStatusAction(sub.id, "approved")} className="text-xs font-bold text-teal-600 hover:text-teal-900 transition-colors">
                                    Approve
                                  </button>
                                  <button onClick={() => handleStatusAction(sub.id, "rejected")} className="text-xs font-bold text-rose-600 hover:text-rose-900 transition-colors">
                                    Reject
                                  </button>
                                  <button onClick={() => handleStatusAction(sub.id, "archived")} className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
                                    Archive
                                  </button>
                                </>
                              )}
                              
                              {sub.status === "approved" && (
                                <button onClick={() => handleStatusAction(sub.id, "archived")} className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
                                  Archive
                                </button>
                              )}
                              
                              {sub.status === "rejected" && (
                                <>
                                  <button onClick={() => handleStatusAction(sub.id, "pending")} className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                                    Restore
                                  </button>
                                  <button onClick={() => handleStatusAction(sub.id, "archived")} className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
                                    Archive
                                  </button>
                                </>
                              )}

                              {sub.status === "archived" && (
                                <>
                                  <button onClick={() => handleStatusAction(sub.id, "pending")} className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                                    Restore
                                  </button>
                                  <button onClick={() => handleHardDelete(sub.id)} className="text-xs font-bold text-red-600 hover:text-red-900 transition-colors">
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "legalPages" && (

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl max-w-3xl">
          <h2 className="text-xl font-bold mb-6">Legal Pages Content</h2>
          <form action={handleSaveLegal} className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Terms of Use</label>
              <input type="hidden" name="terms" value={legalContent.terms} />
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <ReactQuill theme="snow" modules={quillModules} value={legalContent.terms} onChange={(v) => setLegalContent(p => ({...p, terms: v}))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Privacy Policy</label>
              <input type="hidden" name="privacy" value={legalContent.privacy} />
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <ReactQuill theme="snow" modules={quillModules} value={legalContent.privacy} onChange={(v) => setLegalContent(p => ({...p, privacy: v}))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Disclaimer</label>
              <input type="hidden" name="disclaimer" value={legalContent.disclaimer} />
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <ReactQuill theme="snow" modules={quillModules} value={legalContent.disclaimer} onChange={(v) => setLegalContent(p => ({...p, disclaimer: v}))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Cookie Preferences</label>
              <input type="hidden" name="cookies" value={legalContent.cookies} />
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <ReactQuill theme="snow" modules={quillModules} value={legalContent.cookies} onChange={(v) => setLegalContent(p => ({...p, cookies: v}))} />
              </div>
            </div>
            <button type="submit" disabled={isSaving} className="w-full bg-[#FF5630] text-white font-black py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50">
              {isSaving ? "Saving..." : "Save Legal Pages"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "homepage" && (
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl max-w-3xl">
          <h2 className="text-xl font-bold mb-6">Homepage Content</h2>
          <form action={handleSaveHomepage} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Hero Title</label>
              <input name="heroTitle" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Hero Subtitle</label>
              <input name="heroSubtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Highlight Text</label>
              <input name="highlightText" value={highlightText} onChange={(e) => setHighlightText(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" />
            </div>
            <hr className="my-6 border-slate-100" />
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Footer Text</label>
              <textarea name="footerText" value={footerText} onChange={(e) => setFooterText(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Copyright Text</label>
              <input name="copyrightText" value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" />
            </div>
            <button type="submit" disabled={isSaving} className="w-full bg-[#FF5630] text-white font-black py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50">
              {isSaving ? "Saving..." : "Save Homepage Content"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "blog" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Blog Editor Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{editingBlogSlug ? "Edit Blog" : "Create New Blog"}</h2>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${blogContent.status === 'published' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                  {blogContent.status}
                </span>
              </div>
              <span className="text-sm text-slate-400 italic">{autoSaveStatus}</span>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">Blog Title</label>
                  <input value={blogContent.title} onChange={e => setBlogContent(p => ({...p, title: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="Top 10 Tips..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">Slug (URL)</label>
                  <input value={blogContent.slug} onChange={e => setBlogContent(p => ({...p, slug: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="top-10-tips" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Featured Image URL</label>
                <input value={blogContent.image} onChange={e => setBlogContent(p => ({...p, image: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Short Description</label>
                <textarea value={blogContent.description} onChange={e => setBlogContent(p => ({...p, description: e.target.value}))} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" placeholder="Brief summary of the post..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Main Content</label>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <ReactQuill theme="snow" modules={quillModules} value={blogContent.content} onChange={v => setBlogContent(p => ({...p, content: v}))} />
                </div>
              </div>

              <hr className="my-6 border-slate-100" />
              <h3 className="font-bold text-lg">SEO Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">Meta Title</label>
                  <input value={blogContent.metaTitle} onChange={e => setBlogContent(p => ({...p, metaTitle: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">Meta Description</label>
                  <textarea value={blogContent.metaDescription} onChange={e => setBlogContent(p => ({...p, metaDescription: e.target.value}))} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5630]" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {blogContent.status === "published" ? (
                  <button onClick={handleUnpublishBlog} disabled={isSaving} className="w-full bg-slate-200 text-slate-900 font-black py-4 rounded-xl hover:bg-slate-300 transition-colors disabled:opacity-50">
                    Unpublish to Draft
                  </button>
                ) : (
                  <button onClick={handlePublishBlog} disabled={isSaving} className="w-full bg-[#FF5630] text-white font-black py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50">
                    Publish Blog
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Existing Blogs List */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Posts ({blogs.length})</h2>
              <button onClick={() => loadBlog(null)} className="text-sm font-bold text-[#FF5630] hover:underline">
                + New Post
              </button>
            </div>
            <div className="space-y-3">
              {blogs.map((blog) => (
                <div key={blog.slug} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
                  <div>
                    <div className="font-black text-slate-900">{blog.title}</div>
                    <div className="flex gap-2 items-center mt-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${blog.status === 'published' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                        {blog.status}
                      </span>
                      <span className="text-xs text-slate-400">/{blog.slug}</span>
                    </div>
                  </div>
                  <button onClick={() => loadBlog(blog)} className="text-sm font-bold text-slate-400 hover:text-[#FF5630]">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900">Submission Details</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Submitted on {new Date(selectedSubmission.submittedAt || selectedSubmission.id).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-505 hover:text-slate-900 flex items-center justify-center font-bold text-lg transition-colors"
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
              
              {/* Submission Target Board Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Board Name</span>
                  <span className="text-base font-black text-slate-900">{selectedSubmission.boardName}</span>
                </div>
                
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Website</span>
                  <a 
                    href={selectedSubmission.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm font-bold text-[#FF5630] hover:underline break-all"
                  >
                    {selectedSubmission.websiteUrl}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Category</span>
                  <span className="text-sm font-bold text-slate-700">{selectedSubmission.category}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tool/Product Type</span>
                  <span className="text-sm font-bold text-slate-700">{selectedSubmission.toolType || "Job Board"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Best For</span>
                  <span className="text-sm font-semibold text-slate-600">{selectedSubmission.bestFor}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Short Description</span>
                <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                  {selectedSubmission.shortDescription}
                </p>
              </div>

              {/* Submitter & Verification Info */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Submitter Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contact Name</span>
                    <span className="text-sm font-bold text-slate-900">{selectedSubmission.contactName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contact Email</span>
                    <span className="text-sm font-bold text-slate-700">{selectedSubmission.contactEmail}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Submitter Type</span>
                    <span className="text-sm font-semibold text-slate-600">{selectedSubmission.submitterType || "User / Community Member"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">LinkedIn Company Page</span>
                    {selectedSubmission.linkedinPage ? (
                      <a 
                        href={selectedSubmission.linkedinPage} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-bold text-slate-600 hover:text-[#FF5630] hover:underline break-all"
                      >
                        {selectedSubmission.linkedinPage}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-slate-400">Not provided</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Wants to Claim Profile</span>
                    {selectedSubmission.claimListing ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100">
                        Yes, represents company
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-400 border border-slate-100">
                        No, community submission
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current Moderation Status</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                      (selectedSubmission.status || "pending") === "pending"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : selectedSubmission.status === "approved"
                        ? "bg-teal-50 text-teal-700 border-teal-100"
                        : selectedSubmission.status === "rejected"
                        ? "bg-rose-50 text-rose-700 border-rose-100"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {selectedSubmission.status || "pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing details */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Pricing & Target Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pricing Model</span>
                    <span className="text-sm font-bold text-slate-700">{selectedSubmission.pricingModel || "Custom Pricing"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Free Trial Available?</span>
                    <span className="text-sm font-semibold text-slate-600">{selectedSubmission.freeTrial || "Not Sure"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pricing Information</span>
                    <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                      {selectedSubmission.pricingInfo || "No pricing description provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Target Audience</span>
                {selectedSubmission.targetAudience && selectedSubmission.targetAudience.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSubmission.targetAudience.map(aud => (
                      <span key={aud} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/50">
                        {aud}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-400">None specified</span>
                )}
              </div>

            </div>

            {/* Modal Footer (Actions) */}
            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between">
              <div>
                <button 
                  onClick={() => {
                    handleHardDelete(selectedSubmission.id);
                  }}
                  className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all"
                >
                  Hard Delete
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {(selectedSubmission.status || "pending") === "pending" && (
                  <>
                    <button 
                      onClick={() => handleStatusAction(selectedSubmission.id, "approved")}
                      className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Approve & Publish
                    </button>
                    <button 
                      onClick={() => handleStatusAction(selectedSubmission.id, "rejected")}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleStatusAction(selectedSubmission.id, "archived")}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Archive
                    </button>
                  </>
                )}

                {selectedSubmission.status === "approved" && (
                  <button 
                    onClick={() => handleStatusAction(selectedSubmission.id, "archived")}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Archive Profile
                  </button>
                )}

                {(selectedSubmission.status === "rejected" || selectedSubmission.status === "archived") && (
                  <button 
                    onClick={() => handleStatusAction(selectedSubmission.id, "pending")}
                    className="px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Restore to Pending
                  </button>
                )}

                {selectedSubmission.status === "rejected" && (
                  <button 
                    onClick={() => handleStatusAction(selectedSubmission.id, "archived")}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Archive
                  </button>
                )}

                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
