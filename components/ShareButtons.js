"use client";

import { useState } from "react";

export default function ShareButtons({ shareUrl, shareText }) {
  const [copied, setCopied] = useState(false);
  const shareUrlEnc = encodeURIComponent(shareUrl);
  const shareTextEnc = encodeURIComponent(shareText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a href={`https://twitter.com/intent/tweet?url=${shareUrlEnc}&text=${shareTextEnc}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-[#0F1419] text-white text-sm font-bold hover:opacity-90 transition-opacity">
        X (Twitter)
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrlEnc}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-[#0A66C2] text-white text-sm font-bold hover:opacity-90 transition-opacity">
        LinkedIn
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrlEnc}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-[#1877F2] text-white text-sm font-bold hover:opacity-90 transition-opacity">
        Facebook
      </a>
      <a href={`https://reddit.com/submit?url=${shareUrlEnc}&title=${shareTextEnc}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-[#FF4500] text-white text-sm font-bold hover:opacity-90 transition-opacity">
        Reddit
      </a>
      <a href={`https://api.whatsapp.com/send?text=${shareTextEnc}%20${shareUrlEnc}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:opacity-90 transition-opacity">
        WhatsApp
      </a>
      <button onClick={handleCopy} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors w-28 text-center">
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
