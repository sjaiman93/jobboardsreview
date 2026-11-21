"use server";

import fs from "fs";
import path from "path";
import { revalidatePath, updateTag } from "next/cache";
import { REVIEWS_TAG } from "@/lib/reviews";
import { cookies, headers } from "next/headers";
import { validateBoardData } from "@/data/validation";
import { getAllBoards, getAllCategories } from "@/data/jobBoards";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_DAYS, createAdminSession, isAllowedAdminEmail, getAdminEmails } from "@/lib/adminAuth";
import { sendEmail, notifyAdmin, firstNameFrom, boardUrl } from "@/lib/email";
import { isAdmin, NOT_AUTHORIZED, isLocalDev, LOCAL_ONLY } from "@/lib/requireAdmin";
import { readRepoFile, listRepoDir, commitRepoFiles, canWriteRepo } from "@/lib/repoFiles";
import { isOwnerDomain, isWorkEmail, websiteHost } from "@/lib/emailDomain";
import { linkBase } from "@/lib/linkBase";
import { verifyTurnstileToken } from "@/app/actions/turnstile";

// Exchange a signed-in site user's Supabase access token for an admin
// session, if their email is on the ADMIN_EMAILS allow-list.
export async function adminSignInAction(accessToken) {
  if (!getAdminEmails().length) {
    return { success: false, error: "Admin is not set up: ADMIN_EMAILS is empty." };
  }
  if (!accessToken) return { success: false, error: "Please sign in first." };

  const { supabaseAdmin } = await import("@/lib/supabase");
  if (!supabaseAdmin) return { success: false, error: "Database client not configured." };

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  const email = data?.user?.email;
  if (error || !email) return { success: false, error: "Your sign-in has expired. Sign in again." };
  if (!isAllowedAdminEmail(email)) {
    return { success: false, error: `${email} is not an admin account.` };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, await createAdminSession(email), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * ADMIN_SESSION_DAYS,
  });
  return { success: true, email };
}

export async function adminLogoutAction() {
const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return { success: true };
}

// Parse "export const name = {...};" source text into an object.
function parseMetadataSource(content, exportName) {
  const prefix = `export const ${exportName} = `;
  const startIndex = content.indexOf(prefix);
  if (startIndex === -1) throw new Error(`${exportName}: export not found`);
  let objStr = content.substring(startIndex + prefix.length).trim();
  if (objStr.endsWith(";")) objStr = objStr.slice(0, -1);
  return new Function(`return ${objStr}`)();
}

// Add one board to data/index.js in place: an import line and a rawBoards
// entry, both kept alphabetical. Edits the existing file instead of
// regenerating it from a template, so helper functions can't go missing.
function addBoardToIndexSource(source, slug) {
  const v = slug.replace(/[^a-zA-Z0-9_]/g, "_");
  // Keep the file's own line endings: Windows checkouts use CRLF, GitHub LF.
  const eol = source.includes("\r\n") ? "\r\n" : "\n";
  const lines = source.split(/\r?\n/);
  if (lines.some((l) => l.includes(`"./jobboards/${slug}"`))) return source;

  const importIdx = lines.map((l, i) => [l, i]).filter(([l]) => l.startsWith("import ") && l.includes('"./jobboards/'));
  if (!importIdx.length) throw new Error("index.js: no board imports found");
  const before = importIdx.filter(([l]) => l.match(/"\.\/jobboards\/(.*)"/)[1] < slug).pop();
  lines.splice(before ? before[1] + 1 : importIdx[0][1], 0, `import ${v} from "./jobboards/${slug}";`);

  const start = lines.findIndex((l) => l.startsWith("const rawBoards = ["));
  const end = lines.indexOf("];", start);
  if (start < 0 || end < 0) throw new Error("index.js: rawBoards array not found");
  let pos = start + 1;
  for (let n = start + 1; n < end; n++) if (lines[n].trim().replace(",", "") < v) pos = n + 1;
  if (pos === end) {
    // Appending after the last entry, which has no trailing comma.
    if (!lines[end - 1].trim().endsWith(",")) lines[end - 1] += ",";
    lines.splice(end, 0, `  ${v}`);
  } else {
    lines.splice(pos, 0, `  ${v},`);
  }
  return lines.join(eol);
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
  if (!(await isAdmin())) return NOT_AUTHORIZED;
  if (!isLocalDev()) return LOCAL_ONLY;

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
    // Only facts we hold. Hiring type and candidate quality need evidence.
    highlightData[slug] = {
      "Industry Focus": [category],
      "Pricing Model": [pricingSummary],
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
  if (!(await isAdmin())) return NOT_AUTHORIZED;
  if (!isLocalDev()) return LOCAL_ONLY;

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
  if (!(await isAdmin())) return NOT_AUTHORIZED;
  if (!isLocalDev()) return LOCAL_ONLY;

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
  if (!(await isAdmin())) return NOT_AUTHORIZED;
  if (!isLocalDev()) return LOCAL_ONLY;

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

// The listed board a claim refers to, matched by name (ignoring case and
// punctuation) or by website host. Null for a board we don't list yet.
function findExistingListing(boardName, websiteUrl) {
  const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = norm(boardName);
  const host = websiteHost(websiteUrl || "");
  return (
    getAllBoards().find(
      (b) => (name && norm(b.name) === name) || (host && websiteHost(b.website || "") === host)
    ) || null
  );
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
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "127.0.0.1";
  } catch (err) {
    console.error("Error reading headers for IP rate limit:", err);
  }

  if (!checkRateLimit(ip)) {
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    return { success: false, error: "Too many requests. Please try again in an hour." };
  }

  const { website_hp, formLoadTime, token, turnstileToken, ...cleanSubmission } = submission;

  // Spam check on the server (a browser-only check can be skipped).
  if (!(await verifyTurnstileToken(turnstileToken))) {
    return { success: false, error: "Security check failed. Please refresh and try again." };
  }

  const { supabaseAdmin } = await import("@/lib/supabase");
  if (!supabaseAdmin) return { success: false, error: "Database connection failed." };

  // Claiming a listing requires a signed-in account with a company email.
  // The contact email is the account's (verified) email, not whatever was
  // typed. Every claim still waits for manual approval; a domain match only
  // labels it as a likely owner.
  let claimant = null;
  if (cleanSubmission.claimListing) {
    if (token) {
      const { data } = await supabaseAdmin.auth.getUser(token);
      claimant = data?.user || null;
    }
    if (!claimant?.email) {
      return { success: false, error: "Please sign in to claim and manage a listing." };
    }
    if (!isWorkEmail(claimant.email)) {
      return { success: false, error: "Please sign in with your company email to claim a listing." };
    }
  }
  const contactEmail = claimant ? claimant.email.toLowerCase() : cleanSubmission.contactEmail;
  // For a board already listed, check against the website we have on file,
  // not the one typed into the form (anyone can type a domain they own).
  const existingListing = claimant ? findExistingListing(cleanSubmission.boardName, cleanSubmission.websiteUrl) : null;
  const verifyAgainst = existingListing ? existingListing.website : cleanSubmission.websiteUrl;
  const ownerVerification = claimant
    ? isOwnerDomain(contactEmail, verifyAgainst) ? "domain_match" : "needs_verification"
    : null;

  const dbPayload = {
    submitter_type: cleanSubmission.submitterType,
    contact_name: cleanSubmission.contactName,
    contact_email: contactEmail,
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
    status: 'pending',
    user_id: claimant?.id || null,
    owner_verification: ownerVerification,
  };

  try {
    let { error } = await supabaseAdmin.from('board_submissions').insert([dbPayload]);
    if (error && (error.code === "PGRST204" || /column/i.test(error.message || ""))) {
      // Ownership migration not run yet: save without the new columns.
      const { user_id, owner_verification, ...legacy } = dbPayload;
      ({ error } = await supabaseAdmin.from('board_submissions').insert([legacy]));
    }
    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: "Database error." };
    }
  } catch (e) {
    console.error("Error connecting to Supabase:", e);
    return { success: false, error: "Database connection failed." };
  }

  // Emails never fail the submission (sendEmail does not throw).
  const listedAs = existingListing ? `, existing listing ${existingListing.name}` : ", not yet listed";
  const itemType = !claimant
    ? "listing"
    : ownerVerification === "domain_match"
      ? `listing claim (email matches ${websiteHost(verifyAgainst)}${listedAs})`
      : `listing claim (needs verification${listedAs})`;
  await Promise.all([
    sendEmail("listing-received", dbPayload.contact_email, {
      first_name: firstNameFrom(dbPayload.contact_name),
      board_name: dbPayload.board_name,
    }),
    notifyAdmin({ itemType, boardName: dbPayload.board_name, submitterEmail: dbPayload.contact_email }),
  ]);

  return { success: true, ownerVerification };
}

export async function approveSubmissionAction(submissionId) {
  if (!(await isAdmin())) return NOT_AUTHORIZED;

  let sub;
  let supabaseAdmin;
  try {
    const supabaseModule = await import('@/lib/supabase');
    supabaseAdmin = supabaseModule.supabaseAdmin;
    if (!supabaseAdmin) {
      return { success: false, error: "Database client not configured." };
    }

    const { data, error } = await supabaseAdmin
      .from('board_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (error || !data) {
      console.error("Error reading submission from Supabase:", error);
      return { success: false, error: "Submission not found." };
    }
    sub = data;
  } catch (err) {
    console.error("Database error fetching submission:", err);
    return { success: false, error: "Failed to read submission from database." };
  }
  
  if (sub.status === "approved") {
    return { success: false, error: "This submission is already approved." };
  }
  if (!canWriteRepo()) {
    return { success: false, error: "Approving on the live site needs GITHUB_TOKEN and GITHUB_REPO set in Vercel." };
  }

  // 1. Sanitize incoming text & normalize formatting
  const boardName = (sub.board_name || sub.boardName || "").trim();
  const websiteUrl = (sub.website_url || sub.websiteUrl || "").trim();
  const shortDescription = (sub.short_description || sub.shortDescription || "").trim();
  
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
  let repoSlugs;
  try {
    repoSlugs = new Set((await listRepoDir("data/jobboards")).filter((n) => n.endsWith(".js")).map((n) => n.slice(0, -3)));
  } catch (e) {
    console.error("Could not list board files:", e);
    return { success: false, error: "Could not read the current board list. Try again in a minute." };
  }
  while (allBoards.some(b => b.slug === slug) || repoSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  const allCategories = getAllCategories();
  const categorySlug = sub.category_slug || sub.categorySlug || slugify(sub.category || "Generalist");
  const matchedCategory = allCategories.find(c => c.slug === categorySlug);
  const category = sub.category || matchedCategory?.name || "Generalist";
  const toolType = sub.tool_type || sub.toolType || "Job Board";
  const bestFor = (sub.best_for || sub.bestFor || "General").trim();
  const pricingInfo = (sub.pricing_info || sub.pricingInfo || "").trim();
  const pricingModel = sub.pricing_model || sub.pricingModel || "paid";
  const targetAudience = sub.target_audience || sub.targetAudience || [];

  // 3. Build new board structure, keeping factual/verifiable metrics only
  const newBoard = {
    id: Date.now(),
    slug,
    name: boardName,
    logo: "/logos/default.svg",
    bestFor: bestFor,
    shortDescription,
    fullDescription: shortDescription,
    category,
    categorySlug,
    toolType: toolType,
    subcategory: "",
    pricing: pricingInfo || pricingModel || "Custom Pricing",
    pricingModel: pricingModel ? pricingModel.toLowerCase() : "paid",
    rating: null,
    reviewCount: null,
    // Unknown until checked. Never default these: a guessed founding year,
    // HQ or ownership is an invented fact on a public page.
    yearFounded: null,
    headquarters: null,
    ownership: null,
    website: websiteUrl,
    features: [],
    idealFor: targetAudience,
    pricingDetails: { 
      employerCost: pricingInfo || pricingModel || "Custom Pricing",
      includes: []
    },
    reviews: [],
    highlights: targetAudience.slice(0, 3) || []
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
  
  // 5-7. Every file change is built in memory, then written in one go: one
  // GitHub commit on the live site (Vercel rebuilds, live in ~2 min), or the
  // files on disk locally. A failure leaves nothing half-written.
  let writeResult;
  try {
    const boardVarName = slug.replace(/[^a-zA-Z0-9_]/g, "_");
    const files = {
      [`data/jobboards/${slug}.js`]: `const ${boardVarName} = ${JSON.stringify(newBoard, null, 2)};\n\nexport default ${boardVarName};\n`,
    };

    const metadata = [
      ["boardProsCons", { pros: [], cons: [] }],
      ["boardDecisionTags", targetAudience],
      // Only facts we hold. Hiring type and candidate quality need evidence.
      ["boardHighlightGroups", { "Industry Focus": [category], "Pricing Model": [pricingModel || "Custom Pricing"] }],
      ["boardMetrics", { candidateReach: "Growing", reachLabel: "Candidates" }],
    ];
    for (const [exportName, value] of metadata) {
      const relPath = `data/${exportName}.js`;
      const data = parseMetadataSource(await readRepoFile(relPath), exportName);
      data[slug] = value;
      files[relPath] = `export const ${exportName} = ${JSON.stringify(data, null, 2)};\n`;
    }

    files["data/index.js"] = addBoardToIndexSource(await readRepoFile("data/index.js"), slug);

    writeResult = await commitRepoFiles(files, `Approve board: ${boardName} (${slug})`);
  } catch (e) {
    console.error("Error writing board files:", e);
    return { success: false, error: "Failed to publish the board files: " + (e.message || "unknown error") };
  }

  // 8. LAST operation: Move submission status in Supabase (pending -> approved)
  // Only executed after the board file and data/index.js writes have both succeeded.
  try {
    const { error: updateErr } = await supabaseAdmin
      .from('board_submissions')
      .update({ status: 'approved' })
      .eq('id', submissionId);

    if (updateErr) {
      console.error("Supabase update error on approve:", updateErr);
      return { success: false, error: "Board published, but failed to update submission status in database." };
    }
  } catch (err) {
    console.error("Supabase update error on approve:", err);
    return { success: false, error: "Board published, but failed to update submission status in database." };
  }

  // After every write has succeeded. Wording says "approved", not "live":
  // the page only goes live after the next commit + deploy.
  await sendEmail("listing-approved", sub.contact_email || sub.contactEmail, {
    first_name: firstNameFrom(sub.contact_name || sub.contactName),
    board_name: boardName,
    board_url: boardUrl(slug),
  });

  revalidatePath("/admin");
  return {
    success: true,
    message: writeResult?.mode === "github"
      ? "Approved. Saved to GitHub; Vercel is rebuilding and the board will be live in about 2 minutes."
      : "Approved. Board files written locally: commit and push to publish.",
  };
}

export async function updateSubmissionStatusAction(submissionId, status) {
  if (!(await isAdmin())) return NOT_AUTHORIZED;

  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    if (!supabaseAdmin) {
      return { success: false, error: "Database client not configured." };
    }

    const { error } = await supabaseAdmin
      .from('board_submissions')
      .update({ status: status })
      .eq('id', submissionId);

    if (error) {
      console.error("Supabase status update error:", error);
      return { success: false, error: "Failed to update submission status." };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("Error updating submission status:", e);
    return { success: false, error: "Failed to update submission status." };
  }
}

export async function hardDeleteSubmissionAction(submissionId) {
  if (!(await isAdmin())) return NOT_AUTHORIZED;

  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    if (!supabaseAdmin) {
      return { success: false, error: "Database client not configured." };
    }

    const { error } = await supabaseAdmin
      .from('board_submissions')
      .delete()
      .eq('id', submissionId);

    if (error) {
      console.error("Supabase delete error:", error);
      return { success: false, error: "Failed to delete submission." };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("Error hard deleting submission:", e);
    return { success: false, error: "Failed to hard delete submission." };
  }
}




// ---- Review moderation (admin, local) ----
// Reviews live in Supabase, so approving takes effect without a deploy: board
// pages re-read approved reviews every few minutes (see app/board/[slug]).
export async function setReviewStatusAction(reviewId, status) {
  if (!(await isAdmin())) return NOT_AUTHORIZED;
  if (!["published", "rejected", "submitted"].includes(status)) {
    return { success: false, error: "Invalid status." };
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase");
    if (!supabaseAdmin) return { success: false, error: "Database client not configured." };

    const { data: before, error: readErr } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .single();
    if (readErr || !before) return { success: false, error: "Review not found." };

    const { error: updateErr } = await supabaseAdmin
      .from("reviews")
      .update(status === "published" && !before.published_at ? { status, published_at: new Date().toISOString() } : { status })
      .eq("id", reviewId);
    if (updateErr) {
      console.error("Review status update error:", updateErr);
      return { success: false, error: "Failed to update review." };
    }

    const board = getAllBoards().find((b) => b.name === before.board_name);

    // Email the reviewer only the first time a review goes live. Members via
    // their account email; guests via the email they entered.
    if (status === "published" && !["published", "approved"].includes(before.status) && !before.published_at) {
      let email = before.reviewer_email || null;
      let meta = {};
      if (before.user_id) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(before.user_id);
        email = userData?.user?.email || email;
        meta = userData?.user?.user_metadata || {};
      }
      await sendEmail("review-published", email, {
        first_name: firstNameFrom(meta.full_name || meta.name),
        board_name: before.board_name,
        review_url: board ? `${boardUrl(board.slug)}#reviews` : `${linkBase()}/directory`,
      });
    }

    // Show the change on the site now, not after the 5-minute refresh.
    updateTag(REVIEWS_TAG);
    if (board) {
      revalidatePath(`/board/${board.slug}`);
      revalidatePath(`/category/${board.categorySlug}`);
    }
    revalidatePath("/directory");
    revalidatePath("/categories");
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("Error updating review status:", e);
    return { success: false, error: "Failed to update review." };
  }
}

// Admin checked the reviewer by hand (e.g. their LinkedIn profile): the
// review gets the Verified badge.
export async function verifyReviewAction(reviewId) {
  if (!(await isAdmin())) return NOT_AUTHORIZED;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase");
    if (!supabaseAdmin) return { success: false, error: "Database client not configured." };
    const { data: before } = await supabaseAdmin.from("reviews").select("id, board_name, linkedin_url, verified_at").eq("id", reviewId).single();
    if (!before) return { success: false, error: "Review not found." };
    if (before.verified_at) return { success: true };
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("reviews")
      .update({ verified_at: now, verification_method: before.linkedin_url ? "linkedin" : "admin" })
      .eq("id", reviewId);
    if (error) return { success: false, error: "Failed to update review." };
    const board = getAllBoards().find((b) => b.name === before.board_name);
    updateTag(REVIEWS_TAG);
    if (board) revalidatePath(`/board/${board.slug}`);
    revalidatePath("/admin");
    return { success: true, verifiedAt: now };
  } catch (e) {
    console.error("Error verifying review:", e);
    return { success: false, error: "Failed to update review." };
  }
}

// Records that the thank-you voucher was sent. Payouts themselves are manual.
export async function setVoucherIssuedAction(reviewId, issued) {
  if (!(await isAdmin())) return NOT_AUTHORIZED;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase");
    if (!supabaseAdmin) return { success: false, error: "Database client not configured." };
    const { error } = await supabaseAdmin
      .from("reviews")
      .update({ voucher_status: issued ? "issued" : "none" })
      .eq("id", reviewId);
    if (error) return { success: false, error: "Failed to update review." };
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("Error updating voucher status:", e);
    return { success: false, error: "Failed to update review." };
  }
}
