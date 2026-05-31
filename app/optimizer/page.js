"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAllBoards } from "@/data/jobBoards";
import CustomSelect from "@/components/CustomSelect";
import { saveOptimizerSubmissionAction } from "./actions";

// Wrapper component to handle search parameters safely inside Suspense
function OptimizerContent() {
  const searchParams = useSearchParams();
  const allBoards = getAllBoards();

  // URL Parameter parsing
  const initialBoardParam = searchParams.get("board") || "";
  const initialSourceParam = searchParams.get("source") || "direct";

  // State Variables
  const [userType, setUserType] = useState("corporate"); // 'corporate' or 'agency'
  const [selectedBoardSlug, setSelectedBoardSlug] = useState("");
  const [boardNotListed, setBoardNotListed] = useState(false);
  const [freeformBoardName, setFreeformBoardName] = useState("");
  
  // Input fields
  const [spend, setSpend] = useState("");
  const [applications, setApplications] = useState("");
  const [interviews, setInterviews] = useState("");
  const [placements, setPlacements] = useState("");
  
  // Agency specific
  const [placementFee, setPlacementFee] = useState("");
  const [margin, setMargin] = useState("");

  // Corporate specific
  const [costPerHour, setCostPerHour] = useState("");

  // Errors and Status
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState(null);

  // Refs
  const resultsRef = useRef(null);
  const formRef = useRef(null);

  // Build Board Options for CustomSelect
  const boardOptions = [
    ...allBoards.map((b) => ({ value: b.slug, label: b.name })),
    { value: "not-listed", label: "Board not listed?" },
  ];

  // Sync URL parameters on mount
  useEffect(() => {
    if (initialBoardParam) {
      const foundBoard = allBoards.find(
        (b) => b.slug.toLowerCase() === initialBoardParam.toLowerCase()
      );
      if (foundBoard) {
        setSelectedBoardSlug(foundBoard.slug);
        setBoardNotListed(false);
      } else {
        setSelectedBoardSlug("not-listed");
        setBoardNotListed(true);
        setFreeformBoardName(initialBoardParam);
      }
    }
  }, [initialBoardParam, allBoards]);

  // Handle board select dropdown change
  const handleBoardChange = (value) => {
    setSelectedBoardSlug(value);
    if (value === "not-listed") {
      setBoardNotListed(true);
    } else {
      setBoardNotListed(false);
      setFreeformBoardName("");
    }
  };

  // Run Calculations
  const calculateAnalysis = async (e, isSample = false) => {
    if (e) e.preventDefault();
    setErrors({});
    setIsCalculating(true);

    let activeSpend = spend;
    let activeApps = applications;
    let activeInterviews = interviews;
    let activePlacements = placements;
    let activeFee = placementFee;
    let activeMargin = margin;
    let activeTargetCost = costPerHour;
    let activeUserType = userType;
    let activeBoardSlug = selectedBoardSlug;
    let activeBoardName = freeformBoardName;

    // Load sample data if triggered
    if (isSample) {
      activeUserType = "agency";
      setUserType("agency");
      activeBoardSlug = allBoards[0]?.slug || "linkedin";
      setSelectedBoardSlug(activeBoardSlug);
      setBoardNotListed(false);
      
      activeSpend = "5000";
      setSpend("5000");
      activeApps = "250";
      setApplications("250");
      activeInterviews = "30";
      setInterviews("30");
      activePlacements = "6";
      setPlacements("6");
      activeFee = "12000";
      setPlacementFee("12000");
      activeMargin = "25";
      setMargin("25");
      activeTargetCost = "";
      setCostPerHour("");
    }

    // Resolve Board Name
    if (activeBoardSlug && activeBoardSlug !== "not-listed") {
      const bObj = allBoards.find((b) => b.slug === activeBoardSlug);
      activeBoardName = bObj ? bObj.name : activeBoardSlug;
    }

    // Validation checks
    const newErrors = {};
    if (!activeBoardName || activeBoardName.trim() === "") {
      newErrors.boardName = "Please select a job board or enter one manually.";
    }
    
    const numSpend = Number(activeSpend);
    const numApps = Number(activeApps);
    const numInterviews = Number(activeInterviews);
    const numPlacements = Number(activePlacements);

    if (!activeSpend || isNaN(numSpend) || numSpend <= 0) {
      newErrors.spend = "Monthly spend must be a positive number.";
    }
    if (!activeApps || isNaN(numApps) || numApps < 0) {
      newErrors.applications = "Applications must be a positive number or zero.";
    }
    if (!activeInterviews || isNaN(numInterviews) || numInterviews < 0) {
      newErrors.interviews = "Interviews must be a positive number or zero.";
    }
    if (!activePlacements || isNaN(numPlacements) || numPlacements < 0) {
      newErrors.placements = "Placements must be a positive number or zero.";
    }

    if (activeUserType === "agency") {
      const numFee = Number(activeFee);
      const numMargin = Number(activeMargin);
      if (!activeFee || isNaN(numFee) || numFee < 0) {
        newErrors.placementFee = "Placement fee must be a positive number or zero.";
      }
      if (!activeMargin || isNaN(numMargin) || numMargin < 0 || numMargin > 100) {
        newErrors.margin = "Margin percentage must be between 0 and 100.";
      }
    } else {
      if (activeTargetCost) {
        const numTarget = Number(activeTargetCost);
        if (isNaN(numTarget) || numTarget < 0) {
          newErrors.costPerHour = "Target cost per hire must be a positive number or zero.";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsCalculating(false);
      return;
    }

    // ─── Mathematical Calculations ───
    const costPerApp = numApps > 0 ? numSpend / numApps : numSpend;
    const costPerInt = numInterviews > 0 ? numSpend / numInterviews : numSpend;
    const costPerPlacement = numPlacements > 0 ? numSpend / numPlacements : numSpend;

    // Conversion rates
    const appToInterviewPct = numApps > 0 ? ((numInterviews / numApps) * 100).toFixed(1) : "0.0";
    const interviewToPlacementPct = numInterviews > 0 ? ((numPlacements / numInterviews) * 100).toFixed(1) : "0.0";
    const appDropOffPct = (100 - parseFloat(appToInterviewPct)).toFixed(1);
    const intDropOffPct = (100 - parseFloat(interviewToPlacementPct)).toFixed(1);

    let revenue = 0;
    let profit = 0;
    let roi = 0;
    let savings = null;

    if (activeUserType === "agency") {
      const numFee = Number(activeFee);
      const numMargin = Number(activeMargin);
      revenue = numPlacements * numFee;
      profit = (revenue * (numMargin / 100)) - numSpend;
      roi = numSpend > 0 ? (profit / numSpend) * 100 : 0;
    } else {
      if (activeTargetCost) {
        const numTarget = Number(activeTargetCost);
        const targetTotalSpend = numPlacements * numTarget;
        savings = targetTotalSpend - numSpend;
        roi = numSpend > 0 ? (savings / numSpend) * 100 : 0;
      }
    }

    // Executive Narrative Builder
    const formatCurrency = (val) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(val);

    let summaryText = `Based on the submitted data, ${activeBoardName} generated ${numPlacements} placement${
      numPlacements === 1 ? "" : "s"
    } from a monthly investment of ${formatCurrency(numSpend)}, resulting in a cost per placement (cost per hire) of ${formatCurrency(
      costPerPlacement
    )}. `;

    if (activeUserType === "agency") {
      if (roi > 0) {
        summaryText += `This campaign generated ${formatCurrency(numSpend)} in recruitment cost against ${formatCurrency(
          revenue
        )} in gross placement value. Accounting for a ${activeMargin}% contract margin, this yields a net profit of ${formatCurrency(
          profit
        )} and a positive return on investment of ${roi.toFixed(1)}%. This channel demonstrates strong commercial viability for your staffing operations.`;
      } else {
        summaryText += `The channel generated a net yield deficit of ${formatCurrency(
          profit
        )} (ROI: ${roi.toFixed(1)}%). Continued investment should be audited to improve conversion ratios or negotiate lower spend packages.`;
      }
    } else {
      if (savings !== null) {
        if (savings > 0) {
          summaryText += `Compared to your target cost per hire of ${formatCurrency(
            Number(activeTargetCost)
          )}, this campaign produced an estimated budget savings of ${formatCurrency(
            savings
          )} (Cost Efficiency ROI: ${roi.toFixed(1)}%). This channel is performing above your efficiency threshold, justifying continued budget allocation.`;
        } else if (savings < 0) {
          summaryText += `Compared to your target cost per hire of ${formatCurrency(
            Number(activeTargetCost)
          )}, this channel exceeded target spend parameters by ${formatCurrency(
            Math.abs(savings)
          )} (efficiency variance: ${roi.toFixed(1)}%). We recommend analyzing drop-off ratios to improve applicant-to-interview rates.`;
        } else {
          summaryText += `The channel cost per hire aligns exactly with your cost target threshold of ${formatCurrency(
            Number(activeTargetCost)
          )}.`;
        }
      } else {
        summaryText += `The channel is producing recruitment flow at a Cost Per Placement of ${formatCurrency(
          costPerPlacement
        )}. To evaluate financial savings, enter your historical target cost per hire metric above.`;
      }
    }

    const calculatedData = {
      boardSlug: activeBoardSlug === "not-listed" ? "" : activeBoardSlug,
      boardName: activeBoardName,
      sourceLocation: initialSourceParam,
      userType: activeUserType,
      spend: numSpend,
      applications: numApps,
      interviews: numInterviews,
      placements: numPlacements,
      placementFee: activeUserType === "agency" ? Number(activeFee) : null,
      margin: activeUserType === "agency" ? Number(activeMargin) : null,
      costPerHour: activeUserType === "corporate" && activeTargetCost ? Number(activeTargetCost) : null,
      costPerApplication: costPerApp,
      costPerInterview: costPerInt,
      costPerPlacement: costPerPlacement,
      revenue,
      profit,
      roi,
      savings,
      funnel: {
        appToInterviewPct,
        interviewToPlacementPct,
        appDropOffPct,
        intDropOffPct,
      },
      executiveSummary: summaryText,
    };

    setResults(calculatedData);
    setIsCalculating(false);

    // Save submission data anonymously to server
    try {
      await saveOptimizerSubmissionAction({
        boardSlug: calculatedData.boardSlug,
        boardName: calculatedData.boardName,
        sourceLocation: calculatedData.sourceLocation,
        userType: calculatedData.userType,
        spend: calculatedData.spend,
        applications: calculatedData.applications,
        interviews: calculatedData.interviews,
        placements: calculatedData.placements,
        placementFee: calculatedData.placementFee,
        margin: calculatedData.margin,
        costPerHour: calculatedData.costPerHour,
        generatedMetrics: {
          costPerApplication: costPerApp,
          costPerInterview: costPerInt,
          costPerPlacement,
          revenue,
          profit,
          roi,
          savings,
        },
      });
    } catch (err) {
      console.error("Error storing submission anonymously:", err);
    }

    // Scroll to results section smoothly
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Scroll to form section
  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // PDF Export Trigger
  const handlePdfExport = async () => {
    if (!results) return;
    try {
      const { generateBudgetPDF } = await import("./pdfGenerator");
      generateBudgetPDF(results);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  const handleReset = () => {
    setResults(null);
    setSpend("");
    setApplications("");
    setInterviews("");
    setPlacements("");
    setPlacementFee("");
    setMargin("");
    setCostPerHour("");
    setErrors({});
  };

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-[#FCFBF8]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 py-2 px-4 bg-[#FF5630]/5 text-[#FF5630] text-xs font-bold tracking-wider uppercase rounded-xl mb-6 border border-[#FF5630]/10">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Recruitment Channel Intelligence
            </div>
            <h1 className="text-5xl lg:text-[72px] font-black text-slate-900 leading-[0.95] tracking-tight mb-8">
              Hiring Budget <br />
              <span className="text-[#FF5630] scribble-underline">Optimizer</span>
            </h1>
            <p className="text-xl text-slate-500 mb-5 leading-relaxed max-w-2xl font-medium">
              Analyze recruiting channel performance, evaluate hiring spend, and generate professional budget reports.
            </p>
            <p className="text-sm text-slate-400 mb-10 leading-relaxed max-w-xl font-medium">
              Help staffing agencies and hiring teams understand what their recruiting investments are producing through structured analysis and reporting.
            </p>
            <div className="flex flex-wrap gap-5">
              <button
                onClick={handleScrollToForm}
                className="btn-primary text-base px-10 py-4.5 flex items-center gap-2.5"
              >
                Generate Analysis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => calculateAnalysis(e, true)}
                className="btn-outline text-base px-10 py-4.5 flex items-center gap-2.5"
              >
                View Sample Report
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 relative hidden lg:block">
            {/* Background elements */}
            <div className="absolute -inset-10 bg-teal-50/40 rounded-[3rem] rotate-3 -z-10"></div>
            <div className="absolute -inset-10 bg-amber-50/40 rounded-[3rem] -rotate-3 -z-20"></div>
            
            <div className="bg-white border border-slate-100 rounded-[32px] p-8 card-shadow text-center relative overflow-hidden">
              <div className="w-16 h-16 bg-[#FF5630]/5 text-[#FF5630] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 2v-6m-9-4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">V1 Recruiting Intelligence</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Structured channel analysis designed to replace fragile budget spreadsheets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Two-Column Workstation ─── */}
      <section ref={formRef} className="py-20 bg-slate-50 border-t border-slate-100 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left Column: Education and Timeline */}
            <div className="lg:col-span-5 space-y-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-6">Why analyze recruiting spend?</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Recruiters and staffing agencies spend millions on job boards and platforms without understanding their actual yield. Evaluated spend analysis aligns vendor billing with actual hires.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900">Key Outcomes</h3>
                <ul className="space-y-4">
                  {[
                    "Identify low-yield vendor sources wasting budget.",
                    "Audit Cost Per Placement to justify talent resources.",
                    "Provide hiring teams with structured, meeting-ready channel reports.",
                    "Strengthen vendor renewal negotiations with exact yield numbers."
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-start gap-3.5 text-sm text-slate-600 font-medium leading-relaxed">
                      <svg className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Process Timeline */}
              <div className="bg-[#F9F6F0] p-8 rounded-3xl border border-slate-200/50 space-y-6">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Analysis Process</h4>
                <div className="relative border-l-2 border-slate-200 pl-6 ml-2.5 space-y-8">
                  {[
                    { title: "Select Profile", desc: "Select between Staffing Agency and Corporate settings." },
                    { title: "Choose Channel", desc: "Choose a directory job board or input a custom source." },
                    { title: "Enter Metrics", desc: "Input spend, applicant count, interviews, and placements." },
                    { title: "Review & Export", desc: "Inspect metrics cards, and download a professional PDF." }
                  ].map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[33px] top-0.5 w-4 h-4 rounded-full bg-slate-900 border-4 border-white flex items-center justify-center"></div>
                      <h5 className="font-black text-sm text-slate-900 mb-1">{step.title}</h5>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Optimizer Panel */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[36px] border border-slate-100 card-shadow space-y-10">
              <h2 className="text-2xl font-black text-slate-900">Optimizer Panel</h2>

              <form onSubmit={calculateAnalysis} className="space-y-8">
                {/* Step 1: User Type Selection */}
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                    Step 1: Who are you?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Corporate option */}
                    <button
                      type="button"
                      onClick={() => setUserType("corporate")}
                      className={`text-left p-6 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer focus:outline-none ${
                        userType === "corporate"
                          ? "border-[#FF5630] bg-[#FF5630]/[0.02] shadow-[0_0_0_3px_rgba(255,86,48,0.1)]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                        userType === "corporate" ? "border-[#FF5630]" : "border-slate-300"
                      }`}>
                        {userType === "corporate" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5630]"></div>
                        )}
                      </div>
                      <div>
                        <span className="block font-black text-sm text-slate-900 mb-1">Corporate Hiring Team</span>
                        <span className="block text-xs text-slate-500 font-medium leading-relaxed">
                          Internal recruiting, focus on Cost Per Hire and budget efficiencies.
                        </span>
                      </div>
                    </button>

                    {/* Agency option */}
                    <button
                      type="button"
                      onClick={() => setUserType("agency")}
                      className={`text-left p-6 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer focus:outline-none ${
                        userType === "agency"
                          ? "border-[#FF5630] bg-[#FF5630]/[0.02] shadow-[0_0_0_3px_rgba(255,86,48,0.1)]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                        userType === "agency" ? "border-[#FF5630]" : "border-slate-300"
                      }`}>
                        {userType === "agency" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5630]"></div>
                        )}
                      </div>
                      <div>
                        <span className="block font-black text-sm text-slate-900 mb-1">Staffing Agency</span>
                        <span className="block text-xs text-slate-500 font-medium leading-relaxed">
                          Placement fee margins, billable revenue, and direct ROI parameters.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Step 2: Job Board Selection */}
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                    Step 2: Select Job Board
                  </label>
                  <CustomSelect
                    options={boardOptions}
                    value={selectedBoardSlug}
                    onChange={handleBoardChange}
                    placeholder="Choose recruiting channel..."
                  />
                  {errors.boardName && (
                    <p className="text-xs text-[#FF5630] font-bold mt-1.5">{errors.boardName}</p>
                  )}

                  {/* Freeform input if "Board not listed?" selected */}
                  {boardNotListed && (
                    <div className="space-y-2 mt-3 animate-fade-in">
                      <label htmlFor="freeform-board" className="text-xs font-bold text-slate-500 block">
                        Enter Channel Name *
                      </label>
                      <input
                        type="text"
                        id="freeform-board"
                        placeholder="e.g. LinkedIn, Indeed, Dribbble"
                        value={freeformBoardName}
                        onChange={(e) => setFreeformBoardName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>
                  )}
                </div>

                {/* Step 3: Metric Inputs */}
                <div className="space-y-5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                    Step 3: Enter Performance Metrics
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Monthly Spend */}
                    <div className="space-y-2">
                      <label htmlFor="spend-input" className="text-xs font-bold text-slate-500 block">
                        Monthly Spend ($) *
                      </label>
                      <input
                        type="number"
                        id="spend-input"
                        placeholder="e.g. 3000"
                        min="1"
                        value={spend}
                        onChange={(e) => setSpend(e.target.value)}
                        className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 ${
                          errors.spend ? "border-[#FF5630]" : "border-slate-200"
                        }`}
                      />
                      {errors.spend && (
                        <p className="text-[11px] text-[#FF5630] font-bold mt-1">{errors.spend}</p>
                      )}
                    </div>

                    {/* Applications */}
                    <div className="space-y-2">
                      <label htmlFor="apps-input" className="text-xs font-bold text-slate-500 block">
                        Applications *
                      </label>
                      <input
                        type="number"
                        id="apps-input"
                        placeholder="e.g. 150"
                        min="0"
                        value={applications}
                        onChange={(e) => setApplications(e.target.value)}
                        className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 ${
                          errors.applications ? "border-[#FF5630]" : "border-slate-200"
                        }`}
                      />
                      {errors.applications && (
                        <p className="text-[11px] text-[#FF5630] font-bold mt-1">{errors.applications}</p>
                      )}
                    </div>

                    {/* Interviews */}
                    <div className="space-y-2">
                      <label htmlFor="interviews-input" className="text-xs font-bold text-slate-500 block">
                        Interviews *
                      </label>
                      <input
                        type="number"
                        id="interviews-input"
                        placeholder="e.g. 20"
                        min="0"
                        value={interviews}
                        onChange={(e) => setInterviews(e.target.value)}
                        className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 ${
                          errors.interviews ? "border-[#FF5630]" : "border-slate-200"
                        }`}
                      />
                      {errors.interviews && (
                        <p className="text-[11px] text-[#FF5630] font-bold mt-1">{errors.interviews}</p>
                      )}
                    </div>

                    {/* Placements */}
                    <div className="space-y-2">
                      <label htmlFor="placements-input" className="text-xs font-bold text-slate-500 block">
                        Placements *
                      </label>
                      <input
                        type="number"
                        id="placements-input"
                        placeholder="e.g. 5"
                        min="0"
                        value={placements}
                        onChange={(e) => setPlacements(e.target.value)}
                        className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 ${
                          errors.placements ? "border-[#FF5630]" : "border-slate-200"
                        }`}
                      />
                      {errors.placements && (
                        <p className="text-[11px] text-[#FF5630] font-bold mt-1">{errors.placements}</p>
                      )}
                    </div>

                    {/* Agency Mode conditional inputs */}
                    {userType === "agency" && (
                      <>
                        <div className="space-y-2 animate-fade-in">
                          <label htmlFor="fee-input" className="text-xs font-bold text-slate-500 block">
                            Average Placement Fee ($) *
                          </label>
                          <input
                            type="number"
                            id="fee-input"
                            placeholder="e.g. 10000"
                            min="0"
                            value={placementFee}
                            onChange={(e) => setPlacementFee(e.target.value)}
                            className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 ${
                              errors.placementFee ? "border-[#FF5630]" : "border-slate-200"
                            }`}
                          />
                          {errors.placementFee && (
                            <p className="text-[11px] text-[#FF5630] font-bold mt-1">{errors.placementFee}</p>
                          )}
                        </div>

                        <div className="space-y-2 animate-fade-in">
                          <label htmlFor="margin-input" className="text-xs font-bold text-slate-500 block">
                            Contract Margin (%) *
                          </label>
                          <input
                            type="number"
                            id="margin-input"
                            placeholder="e.g. 20"
                            min="0"
                            max="100"
                            value={margin}
                            onChange={(e) => setMargin(e.target.value)}
                            className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 ${
                              errors.margin ? "border-[#FF5630]" : "border-slate-200"
                            }`}
                          />
                          {errors.margin && (
                            <p className="text-[11px] text-[#FF5630] font-bold mt-1">{errors.margin}</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Corporate Mode conditional inputs */}
                    {userType === "corporate" && (
                      <div className="space-y-2 animate-fade-in">
                        <label htmlFor="target-cost-input" className="text-xs font-bold text-slate-500 block font-medium">
                          Target Cost Per Hire ($) <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="number"
                          id="target-cost-input"
                          placeholder="e.g. 4000"
                          min="0"
                          value={costPerHour}
                          onChange={(e) => setCostPerHour(e.target.value)}
                          className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 ${
                            errors.costPerHour ? "border-[#FF5630]" : "border-slate-200"
                          }`}
                        />
                        {errors.costPerHour && (
                          <p className="text-[11px] text-[#FF5630] font-bold mt-1">{errors.costPerHour}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Action buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="flex-1 btn-primary py-4 text-sm font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCalculating ? "Generating..." : "Generate Analysis"}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-outline px-6 text-sm font-black flex items-center justify-center cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div className="pt-2 text-center text-xs text-slate-400 font-bold leading-relaxed">
                  Your data is stored anonymously to help improve JobBoardsReview's recruitment intelligence platform. No personally identifiable information is retained.
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Dashboard Results Section ─── */}
      {results && (
        <section ref={resultsRef} className="py-24 bg-white border-t border-slate-100 animate-slide-up scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 space-y-16">
            
            {/* Header with PDF CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
              <div>
                <span className="text-xs font-black text-[#FF5630] uppercase tracking-widest block mb-2">Analysis Complete</span>
                <h2 className="text-4xl font-black text-slate-900">Analysis Results Dashboard</h2>
              </div>
              <button
                onClick={handlePdfExport}
                className="bg-[#FF5630] text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-[#FF5630]/20 hover:scale-105 transition-all text-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Branded Report (PDF)
              </button>
            </div>

            {/* Dynamic Summary Card */}
            <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-[32px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 space-y-4">
                <div className="text-xs font-black text-teal-400 uppercase tracking-widest">Executive Summary</div>
                <p className="text-xl sm:text-2xl font-medium leading-relaxed italic text-slate-100">
                  &ldquo;{results.executiveSummary}&rdquo;
                </p>
              </div>
            </div>

            {/* 3 Main KPIs & User Type specific metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Cost Per Application */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-between h-48 transition-all hover:scale-102 hover:shadow-lg">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.12em]">Cost Per Application</div>
                <div className="text-4xl font-black text-slate-900 my-4">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(results.costPerApplication)}
                </div>
                <div className="text-xs text-slate-500 font-bold">Total Spend / Applications count</div>
              </div>

              {/* Cost Per Interview */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-between h-48 transition-all hover:scale-102 hover:shadow-lg">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.12em]">Cost Per Interview</div>
                <div className="text-4xl font-black text-slate-900 my-4">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(results.costPerInterview)}
                </div>
                <div className="text-xs text-slate-500 font-bold">Total Spend / Interviews count</div>
              </div>

              {/* Cost Per Placement */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-between h-48 transition-all hover:scale-102 hover:shadow-lg">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.12em]">
                  {results.userType === "agency" ? "Cost Per Placement" : "Cost Per Hire"}
                </div>
                <div className="text-4xl font-black text-slate-900 my-4">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(results.costPerPlacement)}
                </div>
                <div className="text-xs text-slate-500 font-bold">Total Spend / Placements count</div>
              </div>
            </div>

            {/* Custom Profiles metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Profile specific KPIs card */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 card-shadow space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">
                  {results.userType === "agency" ? "Agency ROI & Placements Yield" : "Hiring Spend Analysis"}
                </h3>

                <dl className="space-y-4">
                  {results.userType === "agency" ? (
                    <>
                      <div className="flex justify-between items-center text-sm py-2">
                        <dt className="text-slate-500 font-bold">Gross Placements Revenue</dt>
                        <dd className="text-slate-900 font-black text-lg">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(results.revenue)}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-sm py-2 border-t border-slate-50">
                        <dt className="text-slate-500 font-bold">Contract Yield Net Profit</dt>
                        <dd className="text-slate-900 font-black text-lg text-teal-600">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(results.profit)}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-sm py-2 border-t border-slate-50">
                        <dt className="text-slate-500 font-bold">Return on Investment (ROI)</dt>
                        <dd className={`text-xl font-black ${results.roi > 0 ? "text-teal-600" : "text-red-500"}`}>
                          {results.roi.toFixed(1)}%
                        </dd>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-sm py-2">
                        <dt className="text-slate-500 font-bold">Actual Monthly Spend</dt>
                        <dd className="text-slate-900 font-black text-lg">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(results.spend)}
                        </dd>
                      </div>
                      {results.costPerHour ? (
                        <>
                          <div className="flex justify-between items-center text-sm py-2 border-t border-slate-50">
                            <dt className="text-slate-500 font-bold">Target Cost Per Hire</dt>
                            <dd className="text-slate-900 font-black text-lg">
                              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(results.costPerHour)}
                            </dd>
                          </div>
                          <div className="flex justify-between items-center text-sm py-2 border-t border-slate-50">
                            <dt className="text-slate-500 font-bold">Total Budget Savings</dt>
                            <dd className={`text-lg font-black ${results.savings > 0 ? "text-teal-600" : "text-red-500"}`}>
                              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(results.savings)}
                            </dd>
                          </div>
                          <div className="flex justify-between items-center text-sm py-2 border-t border-slate-50">
                            <dt className="text-slate-500 font-bold">Cost Efficiency Yield</dt>
                            <dd className={`text-xl font-black ${results.roi > 0 ? "text-teal-600" : "text-red-500"}`}>
                              {results.roi.toFixed(1)}%
                            </dd>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-100 font-bold leading-relaxed">
                          To compute cost savings / cost-efficiency ROI metrics against target budget baselines, enter your Target Cost Per Hire parameter in the inputs.
                        </div>
                      )}
                    </>
                  )}
                </dl>
              </div>

              {/* Conversion Funnel Card */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 card-shadow space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">
                  Recruitment Funnel Visualization
                </h3>

                <div className="space-y-4">
                  {/* Applications Level */}
                  <div className="relative">
                    <div className="bg-slate-900 text-white px-5 py-4 rounded-xl font-black text-sm flex justify-between items-center">
                      <span>Applications</span>
                      <span>{results.applications}</span>
                    </div>
                  </div>

                  {/* App to Interview Conversion */}
                  <div className="flex justify-between items-center px-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                      </svg>
                      {results.funnel.appToInterviewPct}% conversion
                    </span>
                    <span>Drop-off: {results.funnel.appDropOffPct}%</span>
                  </div>

                  {/* Interviews Level */}
                  <div className="relative mx-auto w-[85%]">
                    <div className="bg-teal-600 text-white px-5 py-3.5 rounded-xl font-black text-sm flex justify-between items-center">
                      <span>Interviews</span>
                      <span>{results.interviews}</span>
                    </div>
                  </div>

                  {/* Interview to Placement Conversion */}
                  <div className="flex justify-between items-center px-12 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                      </svg>
                      {results.funnel.interviewToPlacementPct}% conversion
                    </span>
                    <span>Drop-off: {results.funnel.intDropOffPct}%</span>
                  </div>

                  {/* Placements Level */}
                  <div className="relative mx-auto w-[70%]">
                    <div className="bg-[#FF5630] text-white px-5 py-3 rounded-xl font-black text-sm flex justify-between items-center shadow-lg shadow-[#FF5630]/20">
                      <span>Placements</span>
                      <span>{results.placements}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Post-Analysis Engagement Section */}
            <div className="bg-[#FCFBF8] border border-slate-200/60 p-8 rounded-[32px] space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-slate-900">Continue Your Research</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-lg mx-auto">
                  Compare performance parameters with JBR review pools to find higher-converting channels.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {selectedBoardSlug && selectedBoardSlug !== "not-listed" && (
                  <Link
                    href={`/board/${selectedBoardSlug}`}
                    className="btn-dark py-3.5 px-8 text-sm text-center"
                  >
                    View {results.boardName} Profile
                  </Link>
                )}
                <Link
                  href={selectedBoardSlug && selectedBoardSlug !== "not-listed" ? `/compare?boards=${selectedBoardSlug}` : "/compare"}
                  className="btn-outline py-3.5 px-8 text-sm text-center"
                >
                  Compare With Another Board
                </Link>
                <Link
                  href="/directory"
                  className="btn-outline py-3.5 px-8 text-sm text-center"
                >
                  Browse Recruitment Platforms
                </Link>
              </div>
            </div>

          </div>
        </section>
      )}
    </>
  );
}

export default function OptimizerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#FF5630] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 font-bold">Loading Optimizer...</p>
        </div>
      </div>
    }>
      <OptimizerContent />
    </Suspense>
  );
}
