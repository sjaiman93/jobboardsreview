"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllCategories } from "@/data/jobBoards";
import { submitBoardProposal } from "@/app/admin/actions";
import CustomSelect from "@/components/CustomSelect";

export default function ClaimListingPage() {
  const categories = getAllCategories();
  const submitterTypeOptions = [
    { value: "Job Board Team", label: "Job Board Team" },
    { value: "Recruiter / Staffing Agency", label: "Recruiter / Staffing Agency" },
    { value: "User / Community Member", label: "User / Community Member" },
    { value: "Vendor Partner", label: "Vendor Partner" }
  ];

  const toolTypeOptions = [
    { value: "Job Board", label: "Job Board" },
    { value: "AI Recruiting Tool", label: "AI Recruiting Tool" },
    { value: "ATS", label: "ATS" },
    { value: "Other", label: "Other" }
  ];

  const categoryOptions = categories.map((cat) => ({
    value: cat.slug,
    label: cat.name
  }));

  const pricingModelOptions = [
    { value: "Free", label: "Free" },
    { value: "Freemium", label: "Freemium" },
    { value: "Pay Per Post", label: "Pay Per Post" },
    { value: "Subscription", label: "Subscription" },
    { value: "Pay Per Hire", label: "Pay Per Hire" },
    { value: "Custom Pricing", label: "Custom Pricing" }
  ];

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [submitterType, setSubmitterType] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [boardName, setBoardName] = useState("");
  const [toolType, setToolType] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [bestFor, setBestFor] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState([]);
  const [pricingModel, setPricingModel] = useState("");
  const [pricingInfo, setPricingInfo] = useState("");
  const [freeTrial, setFreeTrial] = useState("Not Sure");
  const [claimListing, setClaimListing] = useState(false);
  const [linkedinPage, setLinkedinPage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formLoadTime] = useState(() => Date.now());

  // Validation State
  const [errors, setErrors] = useState({});

  const audiences = [
    "Staffing Agencies",
    "Internal TA Teams",
    "Healthcare Recruiters",
    "Startups",
    "Enterprise",
    "SMB",
    "Job Seekers"
  ];

  const handleAudienceChange = (aud) => {
    if (targetAudience.includes(aud)) {
      setTargetAudience(targetAudience.filter((a) => a !== aud));
    } else {
      setTargetAudience([...targetAudience, aud]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required Field Validation
    if (!submitterType) newErrors.submitterType = "Please select who you are submitting as.";
    if (!contactName.trim()) newErrors.contactName = "Contact Name is required.";
    
    // Email Validation
    if (!contactEmail.trim()) {
      newErrors.contactEmail = "Work Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      newErrors.contactEmail = "Please enter a valid work email address.";
    }

    if (!boardName.trim()) newErrors.boardName = "Job Board / ATS / AI Tool Name is required.";
    if (!toolType) newErrors.toolType = "Please select a type.";

    // URL Validation
    const urlPattern = /^https?:\/\//i;
    const validateUrlString = (str) => {
      let formatted = str.trim();
      if (!urlPattern.test(formatted)) {
        formatted = "https://" + formatted;
      }
      try {
        new URL(formatted);
        return formatted;
      } catch (_) {
        return null;
      }
    };

    if (!websiteUrl.trim()) {
      newErrors.websiteUrl = "Website URL is required.";
    } else {
      const validUrl = validateUrlString(websiteUrl);
      if (!validUrl) {
        newErrors.websiteUrl = "Please enter a valid website URL (e.g. indeed.com).";
      }
    }

    if (!categorySlug) newErrors.categorySlug = "Please select a primary category.";
    if (!bestFor.trim()) newErrors.bestFor = "Please specify what this board is best for.";

    // Description validation
    if (!shortDescription.trim()) {
      newErrors.shortDescription = "Short Description is required.";
    } else if (shortDescription.trim().length < 30) {
      newErrors.shortDescription = `Description is too short. Please write at least 30 characters (currently ${shortDescription.trim().length}).`;
    }

    // Optional LinkedIn validation if filled
    if (linkedinPage.trim()) {
      const validLinkedin = validateUrlString(linkedinPage);
      if (!validLinkedin) {
        newErrors.linkedinPage = "Please enter a valid LinkedIn page URL.";
      }
    }

    // Spam protection check (honeypot & timestamp)
    if (honeypot || Date.now() - formLoadTime < 3000) {
      newErrors.submit = "Spam verification failed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorEl = document.querySelector(".text-red-500");
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    // Normalize URLs before sending
    const normalizeUrl = (url) => {
      if (!url) return "";
      let trimmed = url.trim();
      if (trimmed && !/^https?:\/\//i.test(trimmed)) {
        return "https://" + trimmed;
      }
      return trimmed;
    };

    const categoryObj = categories.find((c) => c.slug === categorySlug);

    const submissionPayload = {
      submitterType,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      boardName: boardName.trim(),
      toolType,
      websiteUrl: normalizeUrl(websiteUrl),
      category: categoryObj ? categoryObj.name : "Generalist",
      categorySlug,
      bestFor: bestFor.trim(),
      shortDescription: shortDescription.trim(),
      targetAudience,
      pricingModel: pricingModel || "Custom Pricing",
      pricingInfo: pricingInfo.trim(),
      freeTrial,
      claimListing,
      linkedinPage: normalizeUrl(linkedinPage),
      website_hp: honeypot,
      formLoadTime,
    };

    try {
      const result = await submitBoardProposal(submissionPayload);
      if (result.success) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrors({ submit: result.error || "An error occurred while saving." });
      }
    } catch (err) {
      setErrors({ submit: "A network error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center py-16 px-6 relative overflow-x-clip min-h-[calc(100vh-96px)] bg-[#FCFBF8]">
      {/* Background Shapes */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF5630]/5 rounded-full blur-[100px] -mr-40 -mt-20 animate-[float_20s_infinite_alternate_ease-in-out]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[80px] -ml-20 -mb-20 animate-[float_20s_infinite_alternate_ease-in-out]" style={{ animationDelay: "-5s" }}></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start relative z-10">
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-[120px] lg:self-start">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.15]">
              Get Your Recruiting Product Discovered by <span className="text-[#FF5630]">Staffing Teams</span> and Hiring Organizations
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Products submitted to JBR become discoverable across comparison pages, niche categories, and recruiter searches.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ),
                color: "text-[#FF5630] bg-[#FF5630]/5",
                title: "Boost Sourcing Visibility",
                desc: "Get listed where recruitment agencies search for niche and high-converting channels.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: "text-teal-600 bg-teal-50",
                title: "Build Peer-Verified Credibility",
                desc: "Enable recruiters to review, rate, and recommend your platform using actual metrics.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: "text-amber-600 bg-amber-50",
                title: "Attract Qualified Hiring Budgets",
                desc: "Position your board directly in comparison matrices where active spend is decided.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: The Form Card */}
        <div className="lg:col-span-7">
          {!submitted ? (
            <div className="bg-white p-8 sm:p-12 rounded-[48px] card-shadow border border-slate-100">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">List Your Board</h2>
                <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
                  Built a recruiting product worth discovering?
                  <br /><br />
                  Submit it to JobBoardsReview for visibility, reviews, and discovery.
                </p>
              </div>

              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field for bot protection */}
                <div style={{ display: "none" }} aria-hidden="true">
                  <input
                    type="text"
                    name="website_hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Who are you submitting as? */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                      Who are you submitting as? *
                    </label>
                    <CustomSelect
                      options={submitterTypeOptions}
                      value={submitterType}
                      onChange={setSubmitterType}
                      placeholder="Select option..."
                      triggerClassName="!bg-slate-50 !border-2 !border-transparent !rounded-[20px] !px-6 !py-4 focus:!border-slate-900 focus:!bg-white !text-base !font-medium !text-slate-700 hover:!border-slate-200"
                    />
                    {errors.submitterType && <p className="text-red-500 text-xs font-bold ml-1">{errors.submitterType}</p>}
                  </div>

                  {/* Contact Name */}
                  <div className="space-y-2">
                    <label htmlFor="contactName" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none transition-all focus:border-[#FF5630] focus:bg-white text-base font-medium focus:placeholder-transparent placeholder:text-slate-400"
                    />
                    {errors.contactName && <p className="text-red-500 text-xs font-bold ml-1">{errors.contactName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Contact Email */}
                  <div className="space-y-2">
                    <label htmlFor="contactEmail" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none transition-all focus:border-[#FF5630] focus:bg-white text-base font-medium focus:placeholder-transparent placeholder:text-slate-400"
                    />
                    {errors.contactEmail && <p className="text-red-500 text-xs font-bold ml-1">{errors.contactEmail}</p>}
                  </div>

                  {/* LinkedIn Page */}
                  <div className="space-y-2">
                    <label htmlFor="linkedinPage" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                      LinkedIn Company Page
                    </label>
                    <input
                      type="text"
                      id="linkedinPage"
                      value={linkedinPage}
                      onChange={(e) => setLinkedinPage(e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none transition-all focus:border-[#FF5630] focus:bg-white text-base font-medium focus:placeholder-transparent placeholder:text-slate-400"
                    />
                    {errors.linkedinPage && <p className="text-red-500 text-xs font-bold ml-1">{errors.linkedinPage}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Job Board / ATS / AI Tool Name */}
                  <div className="space-y-2">
                    <label htmlFor="boardName" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                      Job Board / ATS / AI Tool Name *
                    </label>
                    <input
                      type="text"
                      id="boardName"
                      value={boardName}
                      onChange={(e) => setBoardName(e.target.value)}
                      placeholder="Indeed, Ashby, Fetcher, Gem, etc."
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none transition-all focus:border-[#FF5630] focus:bg-white text-base font-medium focus:placeholder-transparent placeholder:text-slate-400"
                    />
                    {errors.boardName && <p className="text-red-500 text-xs font-bold ml-1">{errors.boardName}</p>}
                  </div>

                  {/* Tool Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                      Type *
                    </label>
                    <CustomSelect
                      options={toolTypeOptions}
                      value={toolType}
                      onChange={setToolType}
                      placeholder="Select option..."
                      triggerClassName="!bg-slate-50 !border-2 !border-transparent !rounded-[20px] !px-6 !py-4 focus:!border-slate-900 focus:!bg-white !text-base !font-medium !text-slate-700 hover:!border-slate-200"
                    />
                    {errors.toolType && <p className="text-red-500 text-xs font-bold ml-1">{errors.toolType}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Website URL */}
                  <div className="space-y-2">
                    <label htmlFor="websiteUrl" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                      Website URL *
                    </label>
                    <input
                      type="text"
                      id="websiteUrl"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="indeed.com"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none transition-all focus:border-[#FF5630] focus:bg-white text-base font-medium focus:placeholder-transparent placeholder:text-slate-400"
                    />
                    {errors.websiteUrl && <p className="text-red-500 text-xs font-bold ml-1">{errors.websiteUrl}</p>}
                  </div>

                  {/* Primary Category */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                      Primary Category *
                    </label>
                    <CustomSelect
                      options={categoryOptions}
                      value={categorySlug}
                      onChange={setCategorySlug}
                      placeholder="Select category..."
                      triggerClassName="!bg-slate-50 !border-2 !border-transparent !rounded-[20px] !px-6 !py-4 focus:!border-slate-900 focus:!bg-white !text-base !font-medium !text-slate-700 hover:!border-slate-200"
                    />
                    {errors.categorySlug && <p className="text-red-500 text-xs font-bold ml-1">{errors.categorySlug}</p>}
                  </div>
                </div>

                {/* Best For */}
                <div className="space-y-2">
                  <label htmlFor="bestFor" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Best For *
                  </label>
                  <input
                    type="text"
                    id="bestFor"
                    value={bestFor}
                    onChange={(e) => setBestFor(e.target.value)}
                    placeholder="e.g. tech developers in Europe, healthcare staffing, etc."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none transition-all focus:border-[#FF5630] focus:bg-white text-base font-medium focus:placeholder-transparent placeholder:text-slate-400"
                  />
                  {errors.bestFor && <p className="text-red-500 text-xs font-bold ml-1">{errors.bestFor}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="shortDescription" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Short Description *
                  </label>
                  <textarea
                    id="shortDescription"
                    rows={4}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Tell us what this tool does, who it helps, and why recruiting teams use it (min. 30 characters)..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none transition-all focus:border-[#FF5630] focus:bg-white text-base font-medium focus:placeholder-transparent placeholder:text-slate-400 resize-y min-h-[100px]"
                  />
                  {errors.shortDescription && <p className="text-red-500 text-xs font-bold ml-1">{errors.shortDescription}</p>}
                </div>

                {/* Target Audience */}
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 block">
                    Target Audience
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {audiences.map((aud) => {
                      const isChecked = targetAudience.includes(aud);
                      return (
                        <label
                          key={aud}
                          className={`inline-flex items-center justify-center px-5 py-2.5 border rounded-full cursor-pointer select-none transition-all text-xs font-bold ${
                            isChecked
                              ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                              : "bg-white border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleAudienceChange(aud)}
                            className="sr-only"
                          />
                          {aud}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Pricing Model */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                      Pricing Model
                    </label>
                    <CustomSelect
                      options={pricingModelOptions}
                      value={pricingModel}
                      onChange={setPricingModel}
                      placeholder="Select model..."
                      triggerClassName="!bg-slate-50 !border-2 !border-transparent !rounded-[20px] !px-6 !py-4 focus:!border-slate-900 focus:!bg-white !text-base !font-medium !text-slate-700 hover:!border-slate-200"
                    />
                  </div>

                  {/* Free Trial Available? */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 block">
                      Free Trial Available?
                    </span>
                    <div className="flex items-center gap-6 py-4">
                      {["Yes", "No", "Not Sure"].map((val) => (
                        <label key={val} className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-700 select-none text-sm">
                          <input
                            type="radio"
                            name="freeTrial"
                            value={val}
                            checked={freeTrial === val}
                            onChange={(e) => setFreeTrial(e.target.value)}
                            className="w-5 h-5 border-2 border-slate-200 text-[#FF5630] focus:ring-[#FF5630] cursor-pointer"
                          />
                          {val}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing Info */}
                <div className="space-y-2">
                  <label htmlFor="pricingInfo" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Pricing Information
                  </label>
                  <textarea
                    id="pricingInfo"
                    rows={3}
                    value={pricingInfo}
                    onChange={(e) => setPricingInfo(e.target.value)}
                    placeholder="e.g. $395 for a 30-day listing, monthly packages available..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none transition-all focus:border-[#FF5630] focus:bg-white text-base font-medium focus:placeholder-transparent placeholder:text-slate-400 resize-y"
                  />
                </div>

                {/* Claim listing */}
                <div className="pt-2">
                  <label className="flex items-start gap-3.5 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      checked={claimListing}
                      onChange={(e) => setClaimListing(e.target.checked)}
                      className="w-5.5 h-5.5 rounded-[6px] border-2 border-slate-200 text-[#FF5630] focus:ring-[#FF5630] transition-all cursor-pointer mt-0.5"
                    />
                    <span className="font-bold text-slate-700 text-sm leading-relaxed group-hover:text-slate-900 transition-colors">
                      I represent this company and would like to manage this profile.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-slate-900 text-white font-black text-lg rounded-[24px] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#FF5630] hover:shadow-2xl hover:shadow-[#FF5630]/30 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Listing
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Success State */
            <div className="bg-white p-10 lg:p-14 rounded-[56px] card-shadow border border-slate-100 text-center animate-fade-in">
              <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-[32px] flex items-center justify-center text-5xl mx-auto mb-10">
                🎉
              </div>
              {!claimListing ? (
                <>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Submission Received!</h2>
                  <p className="text-slate-500 font-medium mb-10 leading-relaxed max-w-md mx-auto text-base sm:text-lg">
                    Thank you for submitting your listing to JobBoardsReview. Our team will review the submission before it is added to the directory.
                  </p>

                  <div className="bg-slate-50 p-8 rounded-[32px] text-left space-y-4 mb-10 border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">What happens next?</h4>
                    {[
                      {
                        title: "Directory Review",
                        desc: "We review the submission for accuracy, category fit, and quality."
                      },
                      {
                        title: "Listing Formatting",
                        desc: "We organize the listing for search, comparison pages, and category discovery."
                      },
                      {
                        title: "Publication",
                        desc: "Approved listings are added to the JobBoardsReview directory."
                      }
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{i + 1}</div>
                        <div>
                          <p className="text-slate-900 text-sm font-bold leading-none">{step.title}</p>
                          <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Submission Received!</h2>
                  <p className="text-slate-500 font-medium mb-10 leading-relaxed max-w-md mx-auto text-base sm:text-lg">
                    Thank you for listing your board. Our moderation team is reviewing the submission for quality and uniqueness before publishing it live.
                  </p>

                  <div className="bg-slate-50 p-8 rounded-[32px] text-left space-y-4 mb-10 border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">What happens next?</h4>
                    {[
                      {
                        title: "Ownership Confirmation",
                        desc: "We verify your connection to the company using your work email and LinkedIn company page."
                      },
                      {
                        title: "Profile Verification",
                        desc: "We check the listing details for accuracy, category fit, and standard pricing models."
                      },
                      {
                        title: "Management Access",
                        desc: "Once approved, we will send email instructions to verify your identity and activate your dashboard."
                      }
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{i + 1}</div>
                        <div>
                          <p className="text-slate-900 text-sm font-bold leading-none">{step.title}</p>
                          <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex flex-col gap-4">
                <Link href="/directory" className="w-full py-5 bg-[#FF5630] text-white font-black text-lg rounded-[24px] flex items-center justify-center gap-2 hover:opacity-90 hover:shadow-xl hover:shadow-[#FF5630]/20 transition-all">
                  Go to Directory
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Link>
                <button onClick={() => setSubmitted(false)} className="text-slate-400 font-bold hover:text-slate-900 text-sm transition-colors">
                  Submit another job board
                </button>
              </div>
            </div>

          )}
        </div>
      </div>
    </main>
  );
}
