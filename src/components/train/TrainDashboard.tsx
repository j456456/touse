"use client";

import { useState, useEffect, useCallback } from "react";
import type { Feedback, LanguageRule } from "@/lib/types";
import { nativeName } from "@/lib/languages";
import FeedbackInbox from "./FeedbackInbox";
import RuleSuggester from "./RuleSuggester";
import ActiveRules from "./ActiveRules";

export default function TrainDashboard() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [rules, setRules] = useState<LanguageRule[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [languageFilter, setLanguageFilter] = useState<string>("");

  const fetchFeedback = useCallback(async () => {
    const url = languageFilter
      ? `/api/feedback?language=${languageFilter}`
      : "/api/feedback";
    const res = await fetch(url);
    if (res.ok) setFeedback(await res.json());
  }, [languageFilter]);

  const fetchRules = useCallback(async () => {
    const res = await fetch("/api/rules");
    if (res.ok) setRules(await res.json());
  }, []);

  useEffect(() => {
    fetchFeedback();
    fetchRules();
  }, [fetchFeedback, fetchRules]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleRuleApproved() {
    setSelectedIds(new Set());
    await fetchRules();
  }

  async function handleRuleDeleted() {
    await fetchRules();
  }

  const languages = Array.from(new Set(feedback.map((f) => f.language))).sort();
  const selectedFeedback = feedback.filter((f) => selectedIds.has(f.id));

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-4 border-b border-celadon/30 flex items-center gap-4">
        <h1 className="text-lg font-serif font-bold text-black">Train</h1>
        <p className="text-xs font-sans text-black/40">
          Review feedback, generate rules, improve responses <em>for all</em>
        </p>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-[11px] font-sans text-black/40 uppercase tracking-wider">
            Language
          </label>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="text-xs font-sans px-2 py-1.5 rounded-lg border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-celadon"
          >
            <option value="">All</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {nativeName(lang)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Three-panel layout ──────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-0 overflow-hidden">
        <FeedbackInbox
          feedback={feedback}
          selectedIds={selectedIds}
          onToggle={toggleSelect}
        />
        <RuleSuggester
          selectedFeedback={selectedFeedback}
          language={selectedFeedback[0]?.language || languageFilter || ""}
          onApproved={handleRuleApproved}
        />
        <ActiveRules rules={rules} onDeleted={handleRuleDeleted} />
      </div>
    </div>
  );
}
