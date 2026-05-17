"use client";

import { useState, useRef } from "react";
import { importCsvAction } from "./actions";

export default function CsvTools({ boards }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const escapeCSV = (str) => {
    if (typeof str !== "string") str = String(str || "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = [
    "name",
    "slug",
    "websiteUrl",
    "logo",
    "category",
    "subcategory",
    "briefOverview",
    "fullOverview",
    "pros",
    "cons",
    "features",
    "pricing"
  ];

  const handleExport = () => {
    const rows = boards.map((b) => {
      const pros = b._pros?.join("|") || "";
      const cons = b._cons?.join("|") || "";
      const features = b.features?.join("|") || "";

      return [
        escapeCSV(b.name),
        escapeCSV(b.slug),
        escapeCSV(b.website),
        escapeCSV(b.logo),
        escapeCSV(b.category),
        escapeCSV(b.subcategory || ""),
        escapeCSV(b.shortDescription),
        escapeCSV(b.fullDescription),
        escapeCSV(pros),
        escapeCSV(cons),
        escapeCSV(features),
        escapeCSV(b.pricing || "")
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    triggerDownload(csvContent, "job_boards_export.csv");
  };

  const handleDownloadSample = () => {
    const sampleRow = [
      "Allied Health Job Cafe",
      "allied-health-job-cafe",
      "https://example.com",
      "/logos/alliedhealthjobcafe.png",
      "Healthcare",
      "Allied Health",
      "Short desc",
      "Full desc",
      "Pro1|Pro2",
      "Con1|Con2",
      "Feature1|Feature2",
      "Pay per listing"
    ].map(escapeCSV).join(",");

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), sampleRow].join("\n");
    triggerDownload(csvContent, "job_boards_sample.csv");
  };

  const triggerDownload = (content, filename) => {
    const encodedUri = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const res = await importCsvAction(text);
      setLoading(false);
      if (res.success) {
        setMessage({ type: "success", text: `Successfully imported ${res.count} boards.` });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage({ type: "error", text: res.error || "Failed to import." });
      }
    };
    reader.onerror = () => {
      setLoading(false);
      setMessage({ type: "error", text: "Error reading file." });
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-3 items-end">
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={handleDownloadSample}
          className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          Download Sample CSV
        </button>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImport}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Importing..." : "Import CSV"}
        </button>
        <button
          onClick={handleExport}
          className="px-5 py-2.5 border-2 border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          Export CSV
        </button>
      </div>
      {message && (
        <div className={`text-sm font-bold ${message.type === "success" ? "text-teal-600" : "text-red-500"}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
