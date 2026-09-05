"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { validateBoardData } from "@/data/validation";
import { getAllBoards } from "@/data/jobBoards";
import { ADMIN_COOKIE_NAME, hashPassword, getAdminPassword } from "@/lib/adminAuth";

export async function adminLoginAction(password) {
  const adminPass = getAdminPassword();
  if (!password || password !== adminPass) {
    return { success: false, error: "Incorrect password. Please try again." };
  }

  const sessionToken = await hashPassword(adminPass);
  const cookieStore = cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, sessionToken, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true };
}

export async function adminLogoutAction() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return { success: true };
}

// Helper to read metadata file
function readMetadataFile(filePath, exportName) {
  const content = fs.readFileSync(filePath, "utf-8");
  const prefix = `export const ${exportName} = `;
  const startIndex = content.indexOf(prefix);
  if (startIndex === -1) return {};
  let objStr = content.substring(startIndex + prefix.length).trim();
  if (objStr.endsWith(";")) {
    objStr = objStr.slice(0, -1);
  }
  try {
    return new Function(`return ${objStr}`)();
  } catch (e) {
    console.error(`Error parsing ${filePath}:`, e);
    return {};
  }
}

// Helper to write metadata file
function writeMetadataFile(filePath, exportName, data) {
  const content = `export const ${exportName} = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(filePath, content, "utf-8");
}

export async function saveBoard(formData) {
  const name = formData.get("name");
  const slug = formData.get("slug");
  const shortDescription = formData.get("shortDescription");
  const fullDescription = formData.get("fullDescription");
  const pricingSummary = formData.get("pricingSummary");
  const logo = formData.get("logo") || "/logos/default.svg";
  const website = formData.get("website") || "#";
  const category = formData.get("category") || "Generalist";
  const subcategory = formData.get("subcategory") || "";
  const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  // Use \n for pros and cons
  const pros = formData.get("pros") ? formData.get("pros").split("\n").map(s => s.trim()).filter(Boolean) : [];
  const cons = formData.get("cons") ? formData.get("cons").split("\n").map(s => s.trim()).filter(Boolean) : [];
  
  // Tags and features still comma-separated
  const tags = formData.get("tags") ? formData.get("tags").split(",").map(s => s.trim()).filter(Boolean) : [];
  const features = formData.get("features") ? formData.get("features").split(",").map(s => s.trim()).filter(Boolean) : [];

  const allBoards = getAllBoards();
  const existingBoard = allBoards.find(b => b.slug === slug);

  let newBoard;
  if (existingBoard) {
    newBoard = {
      ...existingBoard,
      name,
      logo,
      bestFor: tags[0] || existingBoard.bestFor || "General",
      shortDescription,
      fullDescription,
      category,
      categorySlug,
      subcategory,
      pricing: pricingSummary,
      website,
      features,
      highlights: tags.slice(0, 3).length > 0 ? tags.slice(0, 3) : (existingBoard.highlights || []),
      pricingDetails: {
        ...existingBoard.pricingDetails,
        employerCost: pricingSummary
      }
    };
  } else {
    newBoard = {
      id: Date.now(),
      slug,
      name,
      logo,
      bestFor: tags[0] || "General",
      shortDescription,
      fullDescription,
      category,
      categorySlug,
      subcategory,
      pricing: pricingSummary,
      pricingModel: "paid",
      rating: null,
      reviewCount: null,
      yearFounded: new Date().getFullYear(),
      headquarters: "Remote",
      ownership: "Private",
      website,
      features,
      idealFor: [],
      pricingDetails: { employerCost: pricingSummary, includes: [] },
      reviews: [],
      highlights: tags.slice(0, 3)
    };
  }

  // Validate the board data
  const existingSlugs = new Set(allBoards.map(b => b.slug).filter(s => s !== slug));
  const existingNames = new Set(allBoards.map(b => b.name.toLowerCase()).filter(n => n !== name.trim().toLowerCase()));
  validateBoardData(newBoard, existingSlugs, existingNames);

  // 1. Save individual board file under /data/jobboards/
  const boardVarName = slug.replace(/[^a-zA-Z0-9_]/g, "_");
  const boardFileContent = `const ${boardVarName} = ${JSON.stringify(newBoard, null, 2)};\n\nexport default ${boardVarName};\n`;
  fs.writeFileSync(path.join(process.cwd(), "data", "jobboards", `${slug}.js`), boardFileContent, "utf-8");

  // 2. Update boardProsCons.js
  const prosConsPath = path.join(process.cwd(), "data", "boardProsCons.js");
  const prosConsData = readMetadataFile(prosConsPath, "boardProsCons");
  prosConsData[slug] = { pros, cons };
  writeMetadataFile(prosConsPath, "boardProsCons", prosConsData);

  // 3. Update boardDecisionTags.js
  const tagsPath = path.join(process.cwd(), "data", "boardDecisionTags.js");
  const tagsData = readMetadataFile(tagsPath, "boardDecisionTags");
  tagsData[slug] = tags;
  writeMetadataFile(tagsPath, "boardDecisionTags", tagsData);

  // 4. Update boardHighlightGroups.js
  const highlightPath = path.join(process.cwd(), "data", "boardHighlightGroups.js");
  const highlightData = readMetadataFile(highlightPath, "boardHighlightGroups");
  if (!highlightData[slug]) {
    highlightData[slug] = {
      "Hiring Type": ["Full-time"],
      "Industry Focus": [category],
      "Pricing Model": [pricingSummary],
      "Candidate Quality": ["Verified Pool"]
    };
  }
  writeMetadataFile(highlightPath, "boardHighlightGroups", highlightData);

  // 5. Update boardMetrics.js
  const metricsPath = path.join(process.cwd(), "data", "boardMetrics.js");
  const metricsData = readMetadataFile(metricsPath, "boardMetrics");
  if (!metricsData[slug]) {
    metricsData[slug] = {
      candidateReach: "Growing",
      reachLabel: "Candidates"
    };
  }
  writeMetadataFile(metricsPath, "boardMetrics", metricsData);

  // 6. Regenerate data/index.js imports
  const jobboardsDir = path.join(process.cwd(), "data", "jobboards");
  const files = fs.readdirSync(jobboardsDir).filter(f => f.endsWith(".js"));

  const imports = files.map(f => {
    const boardSlug = f.slice(0, -3);
    const varName = boardSlug.replace(/[^a-zA-Z0-9_]/g, "_");
    return `import ${varName} from "./jobboards/${boardSlug}";`;
  }).join("\n");

  const rawBoardsList = files.map(f => {
    const boardSlug = f.slice(0, -3);
    return `  ${boardSlug.replace(/[^a-zA-Z0-9_]/g, "_")}`;
  }).join(",\n");

  const indexContent = `import { validateBoardData } from "./validation";
import { categories } from "./categories";
import { boardProsCons } from "./boardProsCons";
import { boardDecisionTags } from "./boardDecisionTags";
import { boardHighlightGroups } from "./boardHighlightGroups";
import { boardMetrics } from "./boardMetrics";

${imports}

const rawBoards = [
${rawBoardsList}
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
`;
  fs.writeFileSync(path.join(process.cwd(), "data", "index.js"), indexContent, "utf-8");

  revalidatePath("/admin");
  revalidatePath("/directory");
  revalidatePath(`/board/${slug}`);
  revalidatePath("/compare");
}

export async function importCsvAction(csvText) {
  const rows = [];
  let row = [];
  let inQuotes = false;
  let currentVal = "";

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (inQuotes) {
      if (char === '"' && csvText[i + 1] === '"') {
        currentVal += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(currentVal);
        currentVal = "";
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && csvText[i + 1] === '\n') i++;
        row.push(currentVal);
        if (row.length > 1 || currentVal) rows.push(row);
        row = [];
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
  }
  if (row.length || currentVal) {
    row.push(currentVal);
    rows.push(row);
  }

  if (rows.length < 2) return { success: false, error: "No data found" };

  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1);
  let importedCount = 0;

  for (const rowData of dataRows) {
    if (rowData.length < 2) continue; // Skip invalid lines

    const getVal = (col) => {
      const idx = headers.indexOf(col);
      return idx >= 0 ? rowData[idx] || "" : "";
    };

    const name = getVal("name");
    const slug = getVal("slug");
    if (!name || !slug) continue; // Required fields

    // Build mock FormData to pass to saveBoard
    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("logo", getVal("logo"));
    formData.append("website", getVal("websiteUrl"));
    formData.append("pricingSummary", getVal("pricing"));
    formData.append("shortDescription", getVal("briefOverview"));
    formData.append("fullDescription", getVal("fullOverview"));
    formData.append("category", getVal("category"));
    formData.append("subcategory", getVal("subcategory"));

    // Replace | with \n for pros/cons so saveBoard parses them properly
    formData.append("pros", getVal("pros").split("|").join("\n"));
    formData.append("cons", getVal("cons").split("|").join("\n"));
    // Tags was removed from the new template, so pass empty or extract from features
    formData.append("tags", "");
    formData.append("features", getVal("features").split("|").join(","));

    try {
      await saveBoard(formData);
      importedCount++;
    } catch (e) {
      console.error(`Failed to import ${slug}:`, e);
    }
  }

  return { success: true, count: importedCount };
}

export async function saveSiteContentAction(formData, section) {
  // Read current content dynamically to avoid caching issues with imports
  const filePath = path.join(process.cwd(), "data", "siteContent.js");
  let content = fs.readFileSync(filePath, "utf-8");
  
  // simple extraction of the object string to parse it (since it's a simple export)
  const objStart = content.indexOf("export const siteContent = ") + "export const siteContent = ".length;
  const objEnd = content.indexOf(";\n\nexport function");
  
  let current;
  try {
    current = JSON.parse(content.substring(objStart, objEnd));
  } catch(e) {
    // fallback if parsing fails
    current = { legal: {}, homepage: {} };
  }

  if (section === "legal") {
    current.legal = {
      terms: formData.get("terms") || "",
      privacy: formData.get("privacy") || "",
      disclaimer: formData.get("disclaimer") || "",
      cookies: formData.get("cookies") || "",
    };
  } else if (section === "homepage") {
    current.homepage = {
      heroTitle: formData.get("heroTitle") || "",
      heroSubtitle: formData.get("heroSubtitle") || "",
      highlightText: formData.get("highlightText") || "",
      footerText: formData.get("footerText") || "",
      copyrightText: formData.get("copyrightText") || "",
    };
  }

  const newContent = `export const siteContent = ${JSON.stringify(current, null, 2)};\n\nexport function getSiteContent() {\n  return siteContent;\n}\n`;
  fs.writeFileSync(filePath, newContent, "utf-8");
  
  revalidatePath("/", "layout"); // Revalidate entire app since layout/footer/pages use this
}

export async function saveBlogAction(formData) {
  const filePath = path.join(process.cwd(), "data", "blogs.js");
  let content = fs.readFileSync(filePath, "utf-8");
  
  const objStart = content.indexOf("export const blogs = ") + "export const blogs = ".length;
  const objEnd = content.indexOf(";\n\nexport function");
  
  let currentBlogs = [];
  try {
    currentBlogs = JSON.parse(content.substring(objStart, objEnd));
  } catch(e) {
    currentBlogs = [];
  }

  const slug = formData.get("slug");
  const existingIndex = currentBlogs.findIndex(b => b.slug === slug);
  
  const blogObj = {
    title: formData.get("title") || "",
    slug: slug || "",
    description: formData.get("description") || "",
    content: formData.get("content") || "",
    image: formData.get("image") || "",
    metaTitle: formData.get("metaTitle") || "",
    metaDescription: formData.get("metaDescription") || "",
    status: formData.get("status") || "draft",
    createdAt: formData.get("createdAt") || new Date().toISOString()
  };

  if (existingIndex >= 0) {
    currentBlogs[existingIndex] = blogObj;
  } else {
    currentBlogs.push(blogObj);
  }

  const newContent = `export const blogs = ${JSON.stringify(currentBlogs, null, 2)};\n\nexport function getBlogs() {\n  return blogs;\n}\n\nexport function getBlogBySlug(slug) {\n  return blogs.find((b) => b.slug === slug);\n}\n`;
  fs.writeFileSync(filePath, newContent, "utf-8");
  
  revalidatePath("/blog", "layout");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin");
}

// In-memory rate limiting: max 3 per IP per hour
const rateLimitCache = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  
  if (!rateLimitCache.has(ip)) {
    rateLimitCache.set(ip, [now]);
    return true;
  }
  
  const timestamps = rateLimitCache.get(ip).filter(t => t > oneHourAgo);
  if (timestamps.length >= 3) {
    return false;
  }
  
  timestamps.push(now);
  rateLimitCache.set(ip, timestamps);
  return true;
}

export async function submitBoardProposal(submission) {
  // Honeypot check
  if (submission.website_hp) {
    console.warn("Honeypot triggered, rejecting submission.");
    return { success: false, error: "Spam verification failed." };
  }

  // Timestamp validation (minimum 3 seconds)
  const submitTime = Date.now();
  if (!submission.formLoadTime || submitTime - submission.formLoadTime < 3000) {
    console.warn("Submission too fast, rejecting as bot.");
    return { success: false, error: "Spam verification failed." };
  }

  // IP rate limiting
  let ip = "127.0.0.1";
  try {
    const headersList = headers();
    ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "127.0.0.1";
  } catch (err) {
    console.error("Error reading headers for IP rate limit:", err);
  }

  if (!checkRateLimit(ip)) {
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    return { success: false, error: "Too many requests. Please try again in an hour." };
  }

  const { website_hp, formLoadTime, ...cleanSubmission } = submission;

  const dbPayload = {
    submitter_type: cleanSubmission.submitterType,
    contact_name: cleanSubmission.contactName,
    contact_email: cleanSubmission.contactEmail,
    board_name: cleanSubmission.boardName,
    tool_type: cleanSubmission.toolType,
    website_url: cleanSubmission.websiteUrl,
    category_slug: cleanSubmission.categorySlug,
    best_for: cleanSubmission.bestFor,
    short_description: cleanSubmission.shortDescription,
    target_audience: cleanSubmission.targetAudience || [],
    pricing_model: cleanSubmission.pricingModel,
    pricing_info: cleanSubmission.pricingInfo,
    free_trial: cleanSubmission.freeTrial,
    claim_listing: cleanSubmission.claimListing,
    linkedin_page: cleanSubmission.linkedinPage,
    status: 'pending'
  };

  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const { error } = await supabaseAdmin.from('board_submissions').insert([dbPayload]);
    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: "Database error." };
    }
  } catch (e) {
    console.error("Error connecting to Supabase:", e);
    return { success: false, error: "Database connection failed." };
  }

  return { success: true };
}

export async function approveSubmissionAction(submissionId) {
  const submissionsPath = path.join(process.cwd(), "storage", "submissions.json");
  if (!fs.existsSync(submissionsPath)) {
    return { success: false, error: "Submissions file not found." };
  }
  
  let submissions = [];
  try {
    submissions = JSON.parse(fs.readFileSync(submissionsPath, "utf-8"));
  } catch (e) {
    console.error("Error reading submissions:", e);
    return { success: false, error: "Failed to read submissions." };
  }
  
  const subIndex = submissions.findIndex(s => s.id === submissionId);
  if (subIndex === -1) {
    return { success: false, error: "Submission not found." };
  }
  
  const sub = submissions[subIndex];
  
  // 1. Sanitize incoming text & normalize formatting
  const boardName = sub.boardName.trim();
  const websiteUrl = sub.websiteUrl.trim();
  const shortDescription = sub.shortDescription.trim();
  const category = sub.category || "Generalist";
  
  // 2. Safely generate slug
  const slugify = (text) => {
    return text.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };
  
  let baseSlug = slugify(boardName);
  if (!baseSlug) baseSlug = "board";
  
  let slug = baseSlug;
  let counter = 1;
  const allBoards = getAllBoards();
  while (allBoards.some(b => b.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  const categorySlug = sub.categorySlug || slugify(category);
  
  // 3. Build new board structure, keeping factual/verifiable metrics only
  const newBoard = {
    id: Date.now(),
    slug,
    name: boardName,
    logo: "/logos/default.svg",
    bestFor: sub.bestFor?.trim() || "General",
    shortDescription,
    fullDescription: shortDescription,
    category,
    categorySlug,
    toolType: sub.toolType || "Job Board",
    subcategory: "",
    pricing: sub.pricingInfo?.trim() || sub.pricingModel || "Custom Pricing",
    pricingModel: sub.pricingModel ? sub.pricingModel.toLowerCase() : "paid",
    rating: null,
    reviewCount: null,
    yearFounded: new Date().getFullYear(),
    headquarters: "Remote",
    ownership: "Private",
    website: websiteUrl,
    features: [],
    idealFor: sub.targetAudience || [],
    pricingDetails: { 
      employerCost: sub.pricingInfo?.trim() || sub.pricingModel || "Custom Pricing",
      includes: []
    },
    reviews: [],
    highlights: sub.targetAudience?.slice(0, 3) || []
  };
  
  // 4. Validate using project helper
  try {
    const existingSlugs = new Set(allBoards.map(b => b.slug));
    const existingNames = new Set(allBoards.map(b => b.name.toLowerCase()));
    validateBoardData(newBoard, existingSlugs, existingNames);
  } catch (err) {
    console.error("Board validation failed on approve:", err);
    return { success: false, error: err.message || "Failed to validate board data." };
  }
  
  try {
    // 5. Create /data/jobboards/[slug].js
    const boardVarName = slug.replace(/[^a-zA-Z0-9_]/g, "_");
    const boardFileContent = `const ${boardVarName} = ${JSON.stringify(newBoard, null, 2)};\n\nexport default ${boardVarName};\n`;
    fs.writeFileSync(path.join(process.cwd(), "data", "jobboards", `${slug}.js`), boardFileContent, "utf-8");
    
    // 6. Update helpers / mappings
    const prosConsPath = path.join(process.cwd(), "data", "boardProsCons.js");
    const prosConsData = readMetadataFile(prosConsPath, "boardProsCons");
    prosConsData[slug] = {
      pros: [],
      cons: []
    };
    writeMetadataFile(prosConsPath, "boardProsCons", prosConsData);
    
    const tagsPath = path.join(process.cwd(), "data", "boardDecisionTags.js");
    const tagsData = readMetadataFile(tagsPath, "boardDecisionTags");
    tagsData[slug] = sub.targetAudience || [];
    writeMetadataFile(tagsPath, "boardDecisionTags", tagsData);
    
    const highlightPath = path.join(process.cwd(), "data", "boardHighlightGroups.js");
    const highlightData = readMetadataFile(highlightPath, "boardHighlightGroups");
    highlightData[slug] = {
      "Hiring Type": ["Full-time"],
      "Industry Focus": [category],
      "Pricing Model": [sub.pricingModel || "Custom Pricing"],
      "Candidate Quality": ["Verified Pool"]
    };
    writeMetadataFile(highlightPath, "boardHighlightGroups", highlightData);
    
    const metricsPath = path.join(process.cwd(), "data", "boardMetrics.js");
    const metricsData = readMetadataFile(metricsPath, "boardMetrics");
    metricsData[slug] = {
      candidateReach: "Growing",
      reachLabel: "Candidates"
    };
    writeMetadataFile(metricsPath, "boardMetrics", metricsData);
    
    // 7. Update exports / indexes (data/index.js)
    const jobboardsDir = path.join(process.cwd(), "data", "jobboards");
    const files = fs.readdirSync(jobboardsDir).filter(f => f.endsWith(".js"));
    
    const imports = files.map(f => {
      const boardSlug = f.slice(0, -3);
      const varName = boardSlug.replace(/[^a-zA-Z0-9_]/g, "_");
      return `import ${varName} from "./jobboards/${boardSlug}";`;
    }).join("\n");
    
    const rawBoardsList = files.map(f => {
      const boardSlug = f.slice(0, -3);
      return `  ${boardSlug.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    }).join(",\n");
    
    const indexContent = `import { validateBoardData } from "./validation";
import { categories } from "./categories";
import { boardProsCons } from "./boardProsCons";
import { boardDecisionTags } from "./boardDecisionTags";
import { boardHighlightGroups } from "./boardHighlightGroups";
import { boardMetrics } from "./boardMetrics";

${imports}

const rawBoards = [
${rawBoardsList}
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
`;
    fs.writeFileSync(path.join(process.cwd(), "data", "index.js"), indexContent, "utf-8");
    
    // 8. Move submission status: pending -> approved
    submissions[subIndex].status = "approved";
    submissions[subIndex].updatedAt = new Date().toISOString();
    submissions[subIndex].publishedSlug = slug;
    fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2), "utf-8");
    
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("Error writing board:", e);
    return { success: false, error: "Failed to publish listing and update imports." };
  }
}

export async function updateSubmissionStatusAction(submissionId, status) {
  const submissionsPath = path.join(process.cwd(), "storage", "submissions.json");
  if (!fs.existsSync(submissionsPath)) {
    return { success: false, error: "Submissions file not found." };
  }
  
  try {
    const fileData = fs.readFileSync(submissionsPath, "utf-8");
    const submissions = JSON.parse(fileData);
    const subIndex = submissions.findIndex(s => s.id === submissionId);
    if (subIndex === -1) {
      return { success: false, error: "Submission not found." };
    }
    
    submissions[subIndex].status = status;
    submissions[subIndex].updatedAt = new Date().toISOString();
    
    fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2), "utf-8");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("Error updating submission status:", e);
    return { success: false, error: "Failed to update submission status." };
  }
}

export async function hardDeleteSubmissionAction(submissionId) {
  const submissionsPath = path.join(process.cwd(), "storage", "submissions.json");
  if (!fs.existsSync(submissionsPath)) {
    return { success: false, error: "Submissions file not found." };
  }
  
  try {
    const fileData = fs.readFileSync(submissionsPath, "utf-8");
    let submissions = JSON.parse(fileData);
    submissions = submissions.filter(s => s.id !== submissionId);
    fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2), "utf-8");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("Error hard deleting submission:", e);
    return { success: false, error: "Failed to hard delete submission." };
  }
}



