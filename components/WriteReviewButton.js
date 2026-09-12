"use client";
import React, { useState } from "react";
import ReviewModal from "./ReviewModal";

export default function WriteReviewButton({ boardName, className }) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); setShowModal(true); }}
        className={className || "bg-[#FF5630] text-white font-black px-7 py-3.5 rounded-2xl shadow-xl shadow-[#FF5630]/20 hover:scale-105 transition-all text-sm"}
      >
        ✍ Write a Review
      </button>
      <ReviewModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        boardName={boardName} 
      />
    </>
  );
}
