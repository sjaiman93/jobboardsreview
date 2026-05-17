"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import CsvTools from "./CsvTools";
import { saveBoard, saveSiteContentAction, saveBlogAction } from "./actions";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function AdminDashboard({ boards, editingBoard, editProsCons, editTags, editSlug, siteContent, blogs = [] }) {
  const [activeTab, setActiveTab] = useState("jobBoards");
  const [isSaving, setIsSaving] = useState(false);

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
        {activeTab === "jobBoards" && <CsvTools boards={boards} />}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-10 border-b border-slate-200">
        {[
          { id: "jobBoards", label: "Job Boards" },
          { id: "legalPages", label: "Legal Pages" },
          { id: "homepage", label: "Homepage" },
          { id: "blog", label: "Blog" },
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
    </div>
  );
}
