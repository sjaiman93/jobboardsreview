const fs = require("fs");
const path = require("path");

// Mock rate limiting logic exactly as in actions.js
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

function simulateSubmit({ submission, ip }) {
  // Honeypot check
  if (submission.website_hp) {
    return { success: false, error: "Spam verification failed (honeypot)." };
  }

  // Timestamp validation (minimum 3 seconds)
  const submitTime = Date.now();
  if (!submission.formLoadTime || submitTime - submission.formLoadTime < 3000) {
    return { success: false, error: "Spam verification failed (too fast)." };
  }

  // IP rate limiting
  if (!checkRateLimit(ip)) {
    return { success: false, error: "Too many requests. Please try again in an hour." };
  }

  const storageDir = path.join(__dirname, "..", "storage");
  const submissionsPath = path.join(storageDir, "submissions.json");

  // Ensure storage folder exists
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  let submissions = [];
  if (fs.existsSync(submissionsPath)) {
    const fileData = fs.readFileSync(submissionsPath, "utf-8");
    submissions = JSON.parse(fileData);
  }

  const { website_hp, formLoadTime, ...cleanSubmission } = submission;

  const newSubmission = {
    id: Date.now(),
    submittedAt: new Date().toISOString(),
    ...cleanSubmission
  };
  submissions.push(newSubmission);

  fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2), "utf-8");
  return { success: true, data: newSubmission };
}

// Running Tests
console.log("--- STARTING TESTS ---");

// Test 1: Successful submission
console.log("\nTest 1: Valid submission...");
const validPayload = {
  submitterType: "Job Board Team",
  contactName: "Jane Doe",
  contactEmail: "jane@company.com",
  boardName: "Test Board",
  websiteUrl: "https://testboard.com",
  category: "Tech",
  categorySlug: "tech",
  bestFor: "Remote hiring",
  shortDescription: "A wonderful job board for tech hiring with a long description.",
  targetAudience: ["Startups", "Enterprise"],
  pricingModel: "Free",
  pricingInfo: "Always free",
  freeTrial: "Yes",
  claimListing: true,
  linkedinPage: "https://linkedin.com/company/testboard",
  website_hp: "",
  formLoadTime: Date.now() - 4000 // 4 seconds ago
};

const res1 = simulateSubmit({ submission: validPayload, ip: "1.2.3.4" });
console.log("Result:", res1);
if (res1.success && fs.existsSync(path.join(__dirname, "..", "storage", "submissions.json"))) {
  console.log("PASS: Saved to storage/submissions.json");
} else {
  console.log("FAIL");
}

// Test 2: Honeypot trigger
console.log("\nTest 2: Honeypot validation...");
const spamPayload = { ...validPayload, website_hp: "bot-value" };
const res2 = simulateSubmit({ submission: spamPayload, ip: "1.2.3.4" });
console.log("Result:", res2);
if (!res2.success && res2.error.includes("honeypot")) {
  console.log("PASS: Spam honeypot rejected");
} else {
  console.log("FAIL");
}

// Test 3: Fast submission trigger
console.log("\nTest 3: Fast submission validation...");
const fastPayload = { ...validPayload, formLoadTime: Date.now() - 1000 }; // 1 second ago
const res3 = simulateSubmit({ submission: fastPayload, ip: "1.2.3.4" });
console.log("Result:", res3);
if (!res3.success && res3.error.includes("too fast")) {
  console.log("PASS: Fast submission rejected");
} else {
  console.log("FAIL");
}

// Test 4: Rate limiting
console.log("\nTest 4: Rate limit validation...");
// We already did 1 successful submission for IP 1.2.3.4. Let's do 2 more.
const payloadLim = { ...validPayload, formLoadTime: Date.now() - 4000 };
console.log("Submission 2:", simulateSubmit({ submission: payloadLim, ip: "1.2.3.4" }));
console.log("Submission 3:", simulateSubmit({ submission: payloadLim, ip: "1.2.3.4" }));
console.log("Submission 4 (Should be rate limited):");
const res4 = simulateSubmit({ submission: payloadLim, ip: "1.2.3.4" });
console.log("Result:", res4);
if (!res4.success && res4.error.includes("Too many requests")) {
  console.log("PASS: Rate limited successfully");
} else {
  console.log("FAIL");
}

// Clean up
console.log("\nCleaning up test submission files...");
try {
  const submissionsPath = path.join(__dirname, "..", "storage", "submissions.json");
  if (fs.existsSync(submissionsPath)) {
    fs.unlinkSync(submissionsPath);
    console.log("Removed storage/submissions.json");
  }
} catch (err) {
  console.error("Cleanup error:", err);
}

console.log("\n--- TESTS FINISHED ---");
