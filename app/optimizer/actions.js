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

    const dbPayload = {
      board_slug: boardSlug || "",
      board_name: boardName.trim(),
      source_location: sourceLocation || "direct",
      user_type: userType,
      spend: numSpend,
      applications: numApps,
      interviews: numInterviews,
      placements: numPlacements,
      placement_fee: numFee,
      margin: numMargin,
      cost_per_hour: numCostPerHour,
      generated_metrics: generatedMetrics || {}
    };

    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      const { error } = await supabaseAdmin.from('optimizer_submissions').insert([dbPayload]);
      if (error) {
        console.error("Supabase insert error in optimizer:", error);
        return { success: false, error: "Database error." };
      }
    } catch (e) {
      console.error("Error connecting to Supabase in optimizer:", e);
      return { success: false, error: "Database connection failed." };
    }

    console.log("Hiring budget analysis submission saved anonymously to Supabase for:", boardName);
    return { success: true };
  } catch (err) {
    console.error("Failed to save optimizer submission:", err);
    return { success: false, error: "Failed to save submission." };
  }
}
