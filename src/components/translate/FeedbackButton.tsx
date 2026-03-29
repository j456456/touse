"use client";

import { useState } from "react";
import type { FeedbackCategory } from "@/lib/types";

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "tone", label: "Tone / too direct" },
  { value: "grammar", label: "Grammar" },
  { value: "offensive", label: "Offensive / inappropriate" },
  { value: "accuracy", label: "Inaccurate" },
  { value: "fluency", label: "Unnatural phrasing" },
  { value: "other", label: "Other" },
];

interface FeedbackButtonProps {
  messageId: string;
  language: string;
  originalResponse: string;
  prompt: string;
}

export default function FeedbackButton({
  messageId,
  language,
  originalResponse,
  prompt,
}: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("fluency");
  const [description, setDescription] = useState("");
  const [suggestedFix, setSuggestedFix] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  async function submit() {
    if (!description.trim()) return;
    setStatus("sending");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          language,
          category,
          description: description.trim(),
          suggestedFix: suggestedFix.trim() || undefined,
          originalResponse,
          prompt,
        }),
      });

      if (!res.ok) throw new Error();
      setStatus("done");
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        setDescription("");
        setSuggestedFix("");
      }, 1500);
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <span className="text-xs text-celadon font-sans font-medium">
        Thanks for your feedback!
      </span>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[11px] text-black/30 hover:text-black/60 font-sans transition-colors"
        title="Report an issue with this response"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" />
        </svg>
        Report issue
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 rounded-xl bg-black/[0.03] border border-black/5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium font-sans text-black/50 uppercase tracking-wider">
          Report issue
        </span>
        <button
          onClick={() => setOpen(false)}
          className="text-black/30 hover:text-black/60 text-sm leading-none"
        >
          &times;
        </button>
      </div>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
        className="w-full text-xs font-sans px-3 py-2 rounded-lg border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-celadon"
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What sounded wrong?"
        rows={2}
        className="w-full text-xs font-sans px-3 py-2 rounded-lg border border-black/10 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-celadon placeholder:text-black/30"
      />

      <textarea
        value={suggestedFix}
        onChange={(e) => setSuggestedFix(e.target.value)}
        placeholder="Better phrasing (optional)"
        rows={1}
        className="w-full text-xs font-sans px-3 py-2 rounded-lg border border-black/10 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-celadon placeholder:text-black/30"
      />

      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          disabled={!description.trim() || status === "sending"}
          className="px-4 py-1.5 text-xs font-sans font-medium rounded-lg bg-black text-white hover:bg-black/80 transition-colors disabled:opacity-40"
        >
          {status === "sending" ? "Sending..." : "Submit"}
        </button>
        {status === "error" && (
          <span className="text-xs text-red-500 font-sans">
            Failed to send
          </span>
        )}
      </div>
    </div>
  );
}
