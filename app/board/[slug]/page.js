import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBoardBySlug,
  getAllBoards,
  getBoardProsCons,
  getBoardDecisionTags,
  getBoardHighlightGroups,
  getBoardMetrics,
} from "@/data/jobBoards";
import JobBoardCard from "@/components/JobBoardCard";
import BoardStickyNav from "@/components/BoardStickyNav";
import BoardInteractionPrompt from "@/components/BoardInteractionPrompt";
import Collapsible from "@/components/Collapsible";
import StarRating from "@/components/StarRating";

export async function generateStaticParams() {
  return getAllBoards().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const board = getBoardBySlug(slug);
  if (!board) return {};
  return {
    title: `${board.name} | JobBoardsReview Profile`,
    description: board.shortDescription,
  };
}

function segmentOverviewText(text) {
  if (!text || text.trim().length === 0) return [];
  
  // 1. Split by existing paragraph breaks (double newlines)
  const blocks = text.split(/\r?\n\r?\n/);
  const resultParagraphs = [];
  
  blocks.forEach(block => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return;
    
    // 2. If block is under ~400 characters, keep it unchanged
    if (trimmedBlock.length < 400) {
      resultParagraphs.push(trimmedBlock);
      return;
    }
    
    // 3. Segment large block using sentence boundaries
    // Split on space preceded by . ! or ? and followed by uppercase letter or digit
    const sentences = trimmedBlock.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/).map(s => s.trim()).filter(Boolean);
    
    if (sentences.length <= 2) {
      resultParagraphs.push(trimmedBlock);
      return;
    }
    
    // Extract Lead paragraph (1-2 sentences)
    let lead = [];
    lead.push(sentences[0]);
    if (sentences.length > 1 && sentences[0].length < 120) {
      lead.push(sentences[1]);
    }
    resultParagraphs.push(lead.join(" ").trim());
    
    // Extract remaining paragraphs (target size: 250-400 characters)
    let currentPara = [];
    let currentLength = 0;
    const startIndex = lead.length;
    
    for (let i = startIndex; i < sentences.length; i++) {
      const sentence = sentences[i];
      currentPara.push(sentence);
      currentLength += sentence.length;
      
      // If we have accumulated at least 300 characters, or if this is the last sentence
      if (currentLength >= 300 || i === sentences.length - 1) {
        resultParagraphs.push(currentPara.join(" ").trim());
        currentPara = [];
        currentLength = 0;
      }
    }
    
    if (currentPara.length > 0) {
      resultParagraphs.push(currentPara.join(" ").trim());
    }
  });
  
  return resultParagraphs;
}

export default async function BoardDetailPage({ params }) {
  const { slug } = await params;
  const board = getBoardBySlug(slug);
  if (!board) notFound();

  const prosCons = getBoardProsCons(slug);
  const decisionTags = getBoardDecisionTags(slug);
  const highlightGroups = getBoardHighlightGroups(slug);
  const metrics = getBoardMetrics(slug);
  const allBoards = getAllBoards();
  const related = allBoards
    .filter((b) => b.categorySlug === board.categorySlug && b.slug !== board.slug)
    .slice(0, 3);

  const hasReviews = board.reviews && board.reviews.length > 0;
  const hasPricingData = board.pricingDetails && board.pricingDetails.employerCost;
  const hasPros = prosCons && prosCons.pros && prosCons.pros.length > 0;
  const hasCons = prosCons && prosCons.cons && prosCons.cons.length > 0;
  const hasHighlights = highlightGroups && Object.keys(highlightGroups).length > 0;

  // Feature grouping
  const featureGroups = [];
  if (board.features && board.features.length > 0) {
    const featureLabels = ["Core", "Recruiting", "Experience", "Other"];
    const chunkSize = Math.ceil(
      board.features.length /
        Math.min(featureLabels.length, Math.ceil(board.features.length / 2))
    );
    for (let i = 0; i < board.features.length; i += chunkSize) {
      featureGroups.push({
        label: featureLabels[Math.floor(i / chunkSize)] || "Other",
        items: board.features.slice(i, i + chunkSize),
      });
    }
  }



  return (
    <>
      {/* ─── Hero ─── */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-[#FF5630] transition-colors">Home</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/directory" className="hover:text-[#FF5630] transition-colors">Directory</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900">{board.name}</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-white p-10 sm:p-12 rounded-[48px] border border-slate-100 card-shadow">
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <div className="w-24 h-24 rounded-[30px] bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
              {board.logo && board.logo !== "/logos/default.svg" ? (
                <img src={board.logo} alt={board.name} className="w-full h-full object-contain p-4" />
              ) : (
                <span className="text-4xl font-black text-slate-600">{board.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <h1 className="text-4xl font-black text-slate-900">{board.name}</h1>
                {board.bestFor && board.bestFor.trim() !== "" && (
                  <span className="tag-coral">Best for {board.bestFor}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <StarRating rating={board.rating} reviewCount={board.reviewCount} />
              </div>
              <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-xl">
                {board.shortDescription}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#reviews"
                  className="bg-[#FF5630] text-white font-black px-7 py-3.5 rounded-2xl shadow-xl shadow-[#FF5630]/20 hover:scale-105 transition-all text-sm"
                >
                  ✍ Write a Review
                </a>
                <a
                  href={board.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 text-white font-black px-7 py-3.5 rounded-2xl hover:bg-[#FF5630] transition-all text-sm"
                >
                  Visit Website →
                </a>
                <Link
                  href={`/compare?boards=${board.slug}`}
                  className="bg-white border-2 border-slate-900 text-slate-900 font-black px-7 py-3.5 rounded-2xl hover:bg-slate-50 transition-all text-sm"
                >
                  Compare
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Facts Bar */}
        <div className="flex flex-wrap items-center gap-x-12 gap-y-4 bg-slate-50 border border-slate-100 p-6 rounded-[28px] mt-10">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] block mb-1">Category</span>
            <span className="text-sm font-black text-slate-900">{board.category}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] block mb-1">Pricing Model</span>
            <span className="text-sm font-black text-slate-900">
              {board.pricingModel ? board.pricingModel.charAt(0).toUpperCase() + board.pricingModel.slice(1) : "Paid"}
            </span>
          </div>
          {metrics && metrics.candidateReach && (
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] block mb-1">Candidate Reach</span>
              <span className="text-sm font-black text-slate-900">{metrics.candidateReach}</span>
            </div>
          )}
          {highlightGroups && highlightGroups["Hiring Type"] && highlightGroups["Hiring Type"].length > 0 && (
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] block mb-1">Hiring Type</span>
              <span className="text-sm font-black text-slate-900">
                {highlightGroups["Hiring Type"].join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Section Nav */}
      <BoardStickyNav />

      {/* ─── Content Grid ─── */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-20">

              {/* ── Overview ── */}
              <div id="overview" className="space-y-14">
                {/* Who it's best for */}
                {board.idealFor && board.idealFor.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-8">
                      Who is {board.name} best for?
                    </h2>
                    <ul className="space-y-5">
                      {board.idealFor.map((item, i) => (
                        <li key={i} className="flex items-start gap-4 text-slate-700 font-medium">
                          <svg className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pros & Cons */}
                {(hasPros || hasCons) && (
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-8">Pros & Cons</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {hasPros && (
                        <div className="bg-white p-7 rounded-[24px] border border-slate-100 card-shadow">
                          <div className="text-[10px] font-black text-teal-600 uppercase tracking-[0.12em] mb-5">Pros</div>
                          <Collapsible label="View all pros" collapseLabel="Show less" maxHeight={120} fade={true}>
                            <ul className="space-y-4">
                              {prosCons.pros.map((pro, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                  <svg className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </Collapsible>
                        </div>
                      )}
                      {hasCons && (
                        <div className="bg-white p-7 rounded-[24px] border border-slate-100 card-shadow">
                          <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.12em] mb-5">Cons</div>
                          <Collapsible label="View all cons" collapseLabel="Show less" maxHeight={120} fade={true}>
                            <ul className="space-y-4">
                              {prosCons.cons.map((con, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </Collapsible>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Full Overview — collapsible */}
                {board.fullDescription && board.fullDescription.trim() !== "" && (
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-5">Full Overview</h3>
                    <Collapsible label="Read full analysis" collapseLabel="Show less" maxHeight={120} fade={true}>
                      <div className="space-y-4">
                        {(() => {
                          const paragraphs = segmentOverviewText(board.fullDescription);
                          const isSingleParagraph = paragraphs.length <= 1;
                          
                          return paragraphs.map((paragraph, pIdx) => {
                            const isLead = pIdx === 0 && !isSingleParagraph;
                            return (
                              <p 
                                key={pIdx} 
                                className={
                                  isLead 
                                    ? "text-sm text-slate-800 font-bold leading-relaxed max-w-2xl" 
                                    : "text-sm text-slate-600 font-medium leading-relaxed max-w-2xl"
                                }
                              >
                                {paragraph}
                              </p>
                            );
                          });
                        })()}
                      </div>
                    </Collapsible>
                  </div>
                )}
              </div>

              {/* ── Pricing & Commercial Model ── */}
              <div id="pricing">
                <h2 className="text-3xl font-black text-slate-900 mb-8">
                  {hasPricingData ? "Pricing & Commercial Model" : "Commercial Insights"}
                </h2>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 card-shadow">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
                    {hasPricingData ? (
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-2">Employer Pricing</div>
                        <p className="text-slate-600 leading-relaxed font-normal">{board.pricingDetails.employerCost}</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-2">Pricing Model</div>
                        <p className="text-slate-600 leading-relaxed font-normal">{board.pricing}</p>
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-2">Transparency</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="text-sm font-bold text-slate-700">Medium — varies by contract</span>
                      </div>
                    </div>
                    {!hasPricingData && (
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-2">Typical Structure</div>
                        <div className="text-sm font-bold text-slate-700">Varies by role and volume</div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                    {hasPricingData
                      ? "Exact pricing varies based on hiring volume, role seniority, and contract terms."
                      : "Public pricing is not disclosed. Costs typically depend on hiring volume, role type, and geographic reach."}
                  </p>
                  {hasPricingData ? (
                    <Collapsible label="View detailed pricing insights" collapseLabel="Hide details" maxHeight={0} fade={false}>
                      <div className="pt-6 mt-2 border-t border-slate-100 space-y-5">
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-3">Included Features</div>
                          <ul className="space-y-3">
                            {board.pricingDetails.includes.map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Collapsible>
                  ) : (
                    <button className="text-sm font-black text-[#FF5630] hover:underline transition-colors">
                      See recruiter-reported pricing →
                    </button>
                  )}
                </div>
              </div>

              {/* ── Key Highlights ── */}
              {hasHighlights && (
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-8">
                    Key Highlights
                  </h2>
                  <div className="bg-white p-8 rounded-[32px] border border-slate-100 card-shadow">
                    <Collapsible label="+ View more highlights" collapseLabel="Show less" maxHeight={200} fade={true}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {Object.entries(highlightGroups).map(([groupLabel, tags]) => (
                          <div key={groupLabel} className="highlight-group">
                            <div className="highlight-group__label">{groupLabel}</div>
                            <div className="highlight-group__tags">
                              {tags.map((t, i) => (
                                <span key={i} className="tag">{t}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Collapsible>
                  </div>
                </div>
              )}

              {/* ── Features ── */}
              {board.features && board.features.length > 0 && (
                <div id="features">
                  <h2 className="text-3xl font-black text-slate-900 mb-8">
                    Key Platform Features
                  </h2>
                  <Collapsible
                    label={`View all ${board.features.length} features`}
                    collapseLabel="Show less"
                    maxHeight={220}
                    fade={true}
                  >
                    <div className="space-y-8">
                      {featureGroups.map((group, gi) => (
                        <div key={gi}>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-4">{group.label}</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {group.items.map((feature, fi) => (
                              <div key={fi} className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-100 card-shadow">
                                <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-black text-slate-900">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Collapsible>
                </div>
              )}

              {/* ── Reviews ── */}
              <div id="reviews">
                <h2 className="text-3xl font-black text-slate-900 mb-8">
                  Recruiter Reviews
                </h2>
                {hasReviews ? (
                  <div className="space-y-6">
                    {board.reviews.map((review, i) => (
                      <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 card-shadow">
                        <div className="flex items-center gap-1 mb-4">
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <svg key={j} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <h4 className="text-slate-900 font-black text-lg mb-3">&ldquo;{review.title}&rdquo;</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-5">{review.text}</p>
                        <p className="text-xs text-slate-400 font-bold">{review.author} · {review.role}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-10 rounded-[32px] border border-slate-100 card-shadow text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">No reviews yet</h4>
                    <p className="text-sm text-slate-500 font-medium mb-6">
                      Be the first recruiter to share feedback on {board.name}.
                    </p>
                    <a
                      href="#reviews"
                      className="inline-block bg-[#FF5630] text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-[#FF5630]/20 hover:scale-105 transition-all text-sm"
                    >
                      ✍ Write a Review
                    </a>
                  </div>
                )}
              </div>

              {/* ── Recruiter Questions (FAQ) ── */}
              <div id="faq">
                <h2 className="text-3xl font-black text-slate-900 mb-8">
                  Recruiter Questions
                </h2>
                <div className="space-y-5">
                  {[
                    {
                      q: `Is ${board.name} worth the cost for mid-volume hiring?`,
                      a: board.pricingDetails?.employerCost
                        ? `It depends on your role types and volume. ${board.name} charges ${board.pricingDetails.employerCost} on the employer side. For niche or senior roles, the quality-to-cost ratio is generally favorable. For high-volume entry-level hiring, consider alternatives.`
                        : `It depends on your role types and volume. ${board.name} operates under a ${board.pricing || "contact for pricing"} model. For specialized vertical positions, the targeted exposure is generally favorable. For high-volume entry-level hiring, consider generalist alternatives.`,
                    },
                    {
                      q: `How does ${board.name} compare to other ${board.category.toLowerCase()} boards?`,
                      a: board.bestFor
                        ? `${board.name} is best known for "${board.bestFor}". Use our comparison tool to see how it stacks up on pricing, features, and recruiter reviews against similar boards.`
                        : `${board.name} is a dedicated recruiting platform in the ${board.category} sector. Use our comparison tool to see how it stacks up on pricing and features against similar options.`,
                    },
                    {
                      q: `What kinds of roles get the best results on ${board.name}?`,
                      a: board.idealFor && board.idealFor.length > 0
                        ? `Based on recruiter feedback, ${board.name} works best for: ${board.idealFor.slice(0, 2).join(", ")}. It may underperform for roles outside its core ${board.category.toLowerCase()} focus.`
                        : `Based on recruiter feedback, ${board.name} works best for specialized roles within the ${board.category.toLowerCase()} vertical. It may underperform for general business positions outside its core area.`,
                    },
                    {
                      q: `Can I try ${board.name} before committing?`,
                      a: board.pricingModel === "free"
                        ? `Yes — ${board.name} is free to use. You can explore the platform without any upfront commitment.`
                        : `${board.name} offers a ${board.pricing || "paid"} model. Check their website for any trial or demo options before committing.`,
                    },
                  ].map((faq, i) => (
                    <details
                      key={i}
                      className="group bg-white rounded-[24px] border border-slate-100 card-shadow"
                    >
                      <summary className="flex items-center justify-between cursor-pointer p-7 text-sm font-black text-slate-900 select-none leading-snug">
                        {faq.q}
                        <svg
                          className="w-5 h-5 text-slate-400 shrink-0 ml-4 transition-transform duration-200 group-open:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <p className="px-7 pb-7 text-sm text-slate-500 font-medium leading-relaxed">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="lg:col-span-1 space-y-6">
              {/* Board Details Card */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 card-shadow">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.12em] mb-6">
                  Board Details
                </h3>
                <dl className="space-y-5">
                  {[
                    ["Year Founded", board.yearFounded],
                    ["Headquarters", board.headquarters],
                    ["Category", board.category],
                  ]
                    .filter(([_, value]) => value !== undefined && value !== null && String(value).trim() !== "")
                    .map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center text-sm">
                        <dt className="text-slate-400 font-bold">{label}</dt>
                        <dd className="text-slate-900 font-black">{value}</dd>
                      </div>
                    ))}
                </dl>
                <Link
                  href="/compare"
                  className="block w-full py-3.5 bg-slate-900 text-white font-black text-center rounded-2xl hover:bg-[#FF5630] transition-all text-sm mt-8"
                >
                  View Comparison Tool
                </Link>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500 font-medium mb-3 leading-relaxed">
                    <strong className="text-slate-900 block mb-1">Own a job board?</strong>
                    List your board to build visibility and collect reviews.
                  </p>
                  <Link
                    href="/claim-listing"
                    className="inline-block w-full py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                  >
                    List Your Board
                  </Link>
                </div>
              </div>

              {/* Analyze Your Spend Card */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 card-shadow">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.12em] mb-4">
                  Analyze Your Spend
                </h3>
                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                  Evaluate the performance of this recruiting channel and generate a professional hiring budget report.
                </p>
                <Link
                  href={`/optimizer?board=${board.slug}&source=board_page`}
                  className="block w-full py-3.5 bg-slate-900 text-white font-black text-center rounded-2xl hover:bg-[#FF5630] hover:shadow-xl hover:shadow-[#FF5630]/20 transition-all duration-300 active:scale-95 text-sm"
                >
                  Launch Optimizer
                </Link>
              </div>

              {/* Decision Tags — separate from Board Details */}
              {decisionTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {decisionTags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide bg-slate-50 text-slate-600 border border-slate-200 transition-all duration-200 cursor-default hover:bg-[#FF5630]/[0.06] hover:text-[#FF5630] hover:border-[#FF5630]/30 hover:shadow-[0_0_0_3px_rgba(255,86,48,0.06)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Alternatives to [Board] ── */}
      {related.length > 0 && (
        <section id="alternatives" className="pb-20 pt-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-black text-slate-900 mb-4 text-center">
              Alternatives to {board.name}
            </h2>
            <p className="text-sm text-slate-500 font-medium text-center mb-12 max-w-lg mx-auto">
              Similar {board.category.toLowerCase()} boards you might want to compare.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((b) => (
                <JobBoardCard key={b.id} board={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fixed Interaction Prompt */}
      <BoardInteractionPrompt boardName={board.name} />
    </>
  );
}
