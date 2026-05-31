import { jsPDF } from "jspdf";

// Client-side helper to generate and download a branded executive budget report PDF
export function generateBudgetPDF(data) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Color Palette Constants
  const primaryColor = [15, 23, 42];  // Slate-900
  const accentColor = [255, 86, 48];  // Coral-500 (#FF5630)
  const mutedColor = [100, 116, 139]; // Slate-500
  const lightBg = [248, 250, 252];    // Slate-50

  // Page Dimensions: A4 = 210mm x 297mm
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - (margin * 2); // 170mm

  // 1. Header Band
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageW, 35, "F");

  // Accent Line
  doc.setFillColor(...accentColor);
  doc.rect(0, 35, pageW, 2.5, "F");

  // JBR Logo block
  doc.setFillColor(...accentColor);
  doc.rect(margin, 10, 13, 13, "F");
  
  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("JBR", margin + 2.5, 18.5);

  // Logo Brand text
  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14.5);
  doc.text("JobBoardsReview", margin + 17, 18);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 188, 200);
  doc.text("RECRUITMENT PLATFORMS INTEL", margin + 17, 23.5);

  // Right Header Text (Report Category & Date)
  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("Hiring Spend & Performance", pageW - margin, 18, { align: "right" });
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 188, 200);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageW - margin, 23, { align: "right" });

  let y = 52;

  // Title
  doc.setTextColor(...primaryColor);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("JobBoardsReview Hiring Budget Analysis", margin, y);

  y += 6.5;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text(`A performance analysis for recruiting channel: ${data.boardName}`, margin, y);

  // Divider line
  y += 7;
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(margin, y, pageW - margin, y);

  // Overview Table Box
  y += 9;
  doc.setTextColor(...primaryColor);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Report Parameters Summary", margin, y);

  y += 5.5;
  const hasPreparedBy = data.preparedBy && data.preparedBy.trim() !== "";
  const hasPreparedFor = data.preparedFor && data.preparedFor.trim() !== "";
  
  let boxHeight = 20;
  if (hasPreparedBy || hasPreparedFor) {
    boxHeight = 32;
  }

  doc.setFillColor(...lightBg);
  doc.rect(margin, y, contentW, boxHeight, "F");

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("User Profile Type:", margin + 5, y + 6.5);
  doc.text("Recruiting Channel:", margin + 5, y + 13.5);
  doc.text("Evaluation Period:", margin + 90, y + 6.5);
  doc.text("Campaign Entry Source:", margin + 90, y + 13.5);

  doc.setTextColor(...primaryColor);
  doc.setFont("Helvetica", "bold");
  doc.text(data.userType === "agency" ? "Staffing Agency" : "Corporate Hiring Team", margin + 35, y + 6.5);
  doc.text(data.boardName, margin + 35, y + 13.5);
  doc.text("Monthly Spend Cycle", margin + 128, y + 6.5);
  
  let srcLabel = "Direct URL Entry";
  if (data.sourceLocation === "board_page") srcLabel = "Job Board Profile Sidebar";
  else if (data.sourceLocation === "header") srcLabel = "Header Navigation";
  else if (data.sourceLocation === "footer") srcLabel = "Footer Navigation";
  doc.text(srcLabel, margin + 128, y + 13.5);

  // Draw Prepared By / Prepared For side-by-side in columns, with labels and values stacked vertically
  if (hasPreparedBy) {
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(...mutedColor);
    doc.setFontSize(9);
    doc.text("Prepared By:", margin + 5, y + 20.5);
    
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(data.preparedBy.trim(), margin + 5, y + 26);
  }
  
  if (hasPreparedFor) {
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(...mutedColor);
    doc.setFontSize(9);
    doc.text("Prepared For:", margin + 90, y + 20.5);
    
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(data.preparedFor.trim(), margin + 90, y + 26);
  }

  // Section: Executive Summary
  y += boxHeight + 10;
  doc.setTextColor(...primaryColor);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Executive Narrative Summary", margin, y);

  y += 6;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85); // Slate-700
  
  // Wrap dynamic executive narrative paragraph nicely
  const splitSummary = doc.splitTextToSize(data.executiveSummary, contentW);
  doc.text(splitSummary, margin, y);

  y += (splitSummary.length * 5) + 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);

  // Section: Funnel Efficiency
  const hasFunnel = data.applications !== null && data.applications !== undefined && data.applications !== "" &&
                    data.interviews !== null && data.interviews !== undefined && data.interviews !== "";

  if (hasFunnel) {
    y += 10;
    doc.setTextColor(...primaryColor);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Recruitment Funnel Metrics", margin, y);

    y += 6;
    doc.setFillColor(...lightBg);
    doc.rect(margin, y, contentW, 28, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text("FUNNEL LEVEL", margin + 6, y + 6.5);
    doc.text("METRIC VOLUME", margin + 65, y + 6.5);
    doc.text("CONVERSION YIELD %", margin + 115, y + 6.5);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(...primaryColor);
    doc.text("Applications Stage", margin + 6, y + 13);
    doc.text(String(data.applications), margin + 65, y + 13);
    doc.text("100% (Baseline)", margin + 115, y + 13);

    doc.text("Interviews Stage", margin + 6, y + 18.5);
    doc.text(String(data.interviews), margin + 65, y + 18.5);
    doc.text(`${data.funnel.appToInterviewPct}% conversion (Apps to Interviews)`, margin + 115, y + 18.5);

    doc.text("Placements Stage", margin + 6, y + 24);
    doc.text(String(data.placements), margin + 65, y + 24);
    doc.text(`${data.funnel.interviewToPlacementPct}% conversion (Interviews to Placements)`, margin + 115, y + 24);

    y += 38; // 28 height + 10 spacing
  } else {
    y += 10;
  }

  // Section: Metrics Details Table
  doc.setTextColor(...primaryColor);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Key Cost & Financial Performance Details", margin, y);

  y += 6;
  // Header row fill
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, contentW, 7.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Performance Metric Name", margin + 4, y + 5);
  doc.text("Calculated Value", margin + 70, y + 5);
  doc.text("Functional Definition", margin + 110, y + 5);

  const formatCurrency = (val) =>
    val === null || val === undefined
      ? "N/A"
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(val);

  // Construct list of performance parameters to draw in table rows
  const tableData = [
    { label: "Total Monthly Spend", val: formatCurrency(data.spend), desc: "Total recruiting cost on this channel" },
  ];

  if (data.applications !== null && data.applications !== undefined && data.applications !== "") {
    tableData.push({ label: "Cost Per Application", val: formatCurrency(data.costPerApplication), desc: "Spend divided by applications volume" });
  }

  if (data.interviews !== null && data.interviews !== undefined && data.interviews !== "") {
    tableData.push({ label: "Cost Per Interview", val: formatCurrency(data.costPerInterview), desc: "Spend divided by interviews volume" });
  }

  tableData.push({ label: "Cost Per Placement (Cost per Hire)", val: formatCurrency(data.costPerPlacement), desc: "Spend divided by placements volume" });

  if (data.userType === "agency") {
    tableData.push(
      { label: "Gross Placements Value", val: formatCurrency(data.revenue), desc: "Placements multiplied by placement fee" },
      { label: "Recruiting Net Yield Profit", val: formatCurrency(data.profit), desc: "Gross profit minus monthly spend" },
      { label: "Return on Investment (ROI)", val: `${data.roi.toFixed(1)}%`, desc: "Net profit yield relative to spend" }
    );
  } else {
    if (data.costPerHour) {
      tableData.push(
        { label: "Target Cost Per Hire", val: formatCurrency(data.costPerHour), desc: "Internal hiring target threshold baseline" },
        { label: "Budget Savings / Variance", val: formatCurrency(data.savings), desc: "Estimated target spend minus actual spend" },
        { label: "Hiring Cost Efficiency Yield", val: `${data.roi.toFixed(1)}%`, desc: "Savings yield relative to spend" }
      );
    }
  }

  // Draw rows
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  let curY = y + 7.5;
  tableData.forEach((row, idx) => {
    // Alternating backgrounds
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, curY, contentW, 7, "F");
    }
    
    doc.setTextColor(...primaryColor);
    doc.setFont("Helvetica", idx >= 4 ? "bold" : "normal"); // Make bottom ROI rows bold
    doc.text(row.label, margin + 4, curY + 4.8);
    doc.text(row.val, margin + 70, curY + 4.8);
    
    doc.setTextColor(...mutedColor);
    doc.setFont("Helvetica", "normal");
    doc.text(row.desc, margin + 110, curY + 4.8);
    
    curY += 7;
  });

  // Footer section
  const footerY = pageH - 18;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY, pageW - margin, footerY);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedColor);
  doc.text("JobBoardsReview Recruitment Intelligence — Professional Spend Report", margin, footerY + 5.5);
  doc.text("Generated by JobBoardsReview", pageW - margin, footerY + 5.5, { align: "right" });

  // Download PDF
  const filename = `JobBoardsReview_Hiring_Budget_Analysis_${data.boardName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
}
