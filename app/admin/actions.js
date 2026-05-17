"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

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
  const pros = formData.get("pros").split("\n").map(s => s.trim()).filter(Boolean);
  const cons = formData.get("cons").split("\n").map(s => s.trim()).filter(Boolean);
  
  // Tags and features still comma-separated
  const tags = formData.get("tags").split(",").map(s => s.trim()).filter(Boolean);
  const features = formData.get("features").split(",").map(s => s.trim()).filter(Boolean);

  const newBoard = {
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
    rating: 0,
    reviewCount: 0,
    yearFounded: new Date().getFullYear(),
    headquarters: "Remote",
    ownership: "Private",
    website,
    features,
    idealFor: [],
    pricingDetails: { employerCost: pricingSummary, includes: [] },
    reviews: []
  };

  const filePath = path.join(process.cwd(), "data", "jobBoards.js");
  let content = fs.readFileSync(filePath, "utf-8");

  // 1. Insert into jobBoards array (top so .find() hits it first)
  const jobBoardsStr = "const jobBoards = [";
  const jobBoardsIndex = content.indexOf(jobBoardsStr) + jobBoardsStr.length;
  content = content.slice(0, jobBoardsIndex) + `\n  ${JSON.stringify(newBoard, null, 2)},` + content.slice(jobBoardsIndex);

  // 2. Insert into boardProsCons (bottom so it overwrites existing keys)
  const prosConsStr = "const boardProsCons = {";
  const prosConsStartIndex = content.indexOf(prosConsStr);
  const prosConsEndIndex = content.indexOf("};", prosConsStartIndex);
  content = content.slice(0, prosConsEndIndex) + `  "${slug}": { pros: ${JSON.stringify(pros)}, cons: ${JSON.stringify(cons)} },\n` + content.slice(prosConsEndIndex);

  // 3. Insert into boardDecisionTags (bottom so it overwrites existing keys)
  const tagsStr = "const boardDecisionTags = {";
  const tagsStartIndex = content.indexOf(tagsStr);
  const tagsEndIndex = content.indexOf("};", tagsStartIndex);
  content = content.slice(0, tagsEndIndex) + `  "${slug}": ${JSON.stringify(tags)},\n` + content.slice(tagsEndIndex);

  fs.writeFileSync(filePath, content, "utf-8");
  
  revalidatePath("/admin");
  revalidatePath("/directory");
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
