"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

// Server action to save a validated optimizer submission anonymously
export async function saveOptimizerSubmissionAction(payload) {
  try {
    const {
      boardSlug,
      boardName,
      sourceLocation,
      userType,
      spend,
      applications,
      interviews,
      placements,
      placementFee,
      margin,
      costPerHour,
      generatedMetrics
    } = payload;

    // Strict validation check: do not save empty, invalid, or incomplete submissions
    if (!userType || !["agency", "corporate"].includes(userType)) {
      return { success: false, error: "Invalid user type." };
    }

    if (!boardName || boardName.trim() === "") {
      return { success: false, error: "Board name is required." };
    }

    const numSpend = Number(spend);
    const numPlacements = Number(placements);

    if (isNaN(numSpend) || numSpend <= 0) {
      return { success: false, error: "Monthly spend must be a positive number." };
    }
    if (isNaN(numPlacements) || numPlacements < 0) {
      return { success: false, error: "Placements count must be a non-negative number." };
    }

    let numApps = null;
    if (applications !== undefined && applications !== null && applications !== "") {
      numApps = Number(applications);
      if (isNaN(numApps) || numApps < 0) {
        return { success: false, error: "Applications count must be a non-negative number." };
      }
    }

    let numInterviews = null;
    if (interviews !== undefined && interviews !== null && interviews !== "") {
      numInterviews = Number(interviews);
      if (isNaN(numInterviews) || numInterviews < 0) {
        return { success: false, error: "Interviews count must be a non-negative number." };
      }
    }

    // Additional validations based on userType
    let numFee = null;
    let numMargin = null;
    let numCostPerHour = null;

    if (userType === "agency") {
      numFee = Number(placementFee);
      numMargin = Number(margin);
      if (isNaN(numFee) || numFee < 0) {
        return { success: false, error: "Average placement fee must be a non-negative number." };
      }
      if (isNaN(numMargin) || numMargin < 0 || numMargin > 100) {
        return { success: false, error: "Contract margin percentage must be between 0 and 100." };
      }
    } else {
      if (costPerHour !== undefined && costPerHour !== null && costPerHour !== "") {
        numCostPerHour = Number(costPerHour);
        if (isNaN(numCostPerHour) || numCostPerHour < 0) {
          return { success: false, error: "Target cost per hire must be a non-negative number." };
        }
      }
    }

    // Ensure storage folder exists
    const storageDir = path.join(process.cwd(), "storage");
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const submissionsPath = path.join(storageDir, "channel_analysis_submissions.json");
    let submissions = [];

    if (fs.existsSync(submissionsPath)) {
      try {
        const fileContent = fs.readFileSync(submissionsPath, "utf-8");
        submissions = JSON.parse(fileContent);
      } catch (err) {
        console.error("Error reading channel_analysis_submissions.json:", err);
      }
    }

    // Prepare clean anonymous entry
    const newSubmission = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      boardSlug: boardSlug || "",
      boardName: boardName.trim(),
      sourceLocation: sourceLocation || "direct",
      userType,
      inputs: {
        spend: numSpend,
        applications: numApps,
        interviews: numInterviews,
        placements: numPlacements,
        placementFee: numFee,
        margin: numMargin,
        costPerHour: numCostPerHour
      },
      results: generatedMetrics || {},
    };

    submissions.push(newSubmission);
    fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2), "utf-8");

    console.log("Hiring budget analysis submission saved anonymously:", newSubmission.id);
    return { success: true };
  } catch (err) {
    console.error("Failed to save optimizer submission:", err);
    return { success: false, error: "Failed to save submission." };
  }
}
