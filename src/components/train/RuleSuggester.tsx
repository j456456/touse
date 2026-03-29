"use client";

import { useState, useRef } from "react";
import type { Feedback } from "@/lib/types";

interface SuggestedRule {
  rule: string;
  examples: { bad: string; good: string }[];
}

export default function RuleSuggester({
  selectedFeedback,
  language,
  onApproved,
}: {
  selectedFeedback: Feedback[];
  language: string;
  onApproved: () => void;
}) {
  const [suggestion, setSuggestion] = useState<SuggestedRule | null>(null);
  const [editedRule, setEditedRule] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleSuggest() {
    if (!selectedFeedback.length) return;
    setLoading(true);
    setError("");
    setSuggestion(null);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/rules/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackItems: selectedFeedback }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      if (!data.rule) {
        throw new Error("No rule was generated. Try selecting different feedback items.");
      }

      setSuggestion(data);
      setEditedRule(data.rule);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!editedRule.trim() || !language) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          rule: editedRule.trim(),
          examples: suggestion?.examples || [],
          sourceCount: selectedFeedback.length,
        }),
      });

      if (!res.ok) throw new Error("Failed to save rule");
      setSuggestion(null);
      setEditedRule("");
      setSuccessMsg("Rule created! It will be used in future responses.");
      setTimeout(() => setSuccessMsg(""), 4000);
      onApproved();
    } catch {
      setError("Failed to save rule");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col min-h-0 border-r border-celadon/20 overflow-hidden">
      <div className="shrink-0 px-4 py-3 border-b border-black/5">
        <h2 className="text-[11px] font-sans font-medium text-black/50 uppercase tracking-wider">
          Rule Suggester
        </h2>
        <p className="text-[10px] font-sans text-black/30 mt-0.5">
          GPT analyzes selected feedback and proposes a rule
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {successMsg && (
          <div className="p-3 rounded-xl bg-celadon/20 border border-celadon/40">
            <p className="text-xs font-sans font-medium text-green-800">
              {successMsg}
            </p>
          </div>
        )}

        {selectedFeedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <p className="text-sm font-sans text-black/30">
              Select feedback items from the inbox
            </p>
            <p className="text-xs font-sans text-black/20 mt-1">
              Then click &ldquo;Suggest Rule&rdquo; to have GPT create a
              reusable language rule from the patterns.
            </p>
          </div>
        ) : (
          <>
            <div className="text-xs font-sans text-black/50">
              {selectedFeedback.length} item{selectedFeedback.length > 1 ? "s" : ""}{" "}
              selected{language ? ` (${language})` : ""}
            </div>

            <button
              onClick={handleSuggest}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs font-sans font-medium bg-black text-white hover:bg-black/80 transition-colors disabled:opacity-40"
            >
              {loading ? "Analyzing feedback..." : "Suggest Rule"}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-xs text-red-600 font-sans font-medium">
                  {error}
                </p>
              </div>
            )}

            {suggestion && (
              <div ref={resultRef} className="space-y-3 p-3 rounded-xl bg-celadon/10 border border-celadon/30">
                <div className="text-[11px] font-sans font-medium text-green-800 uppercase tracking-wider">
                  Suggested Rule
                </div>

                <textarea
                  value={editedRule}
                  onChange={(e) => setEditedRule(e.target.value)}
                  rows={3}
                  className="w-full text-sm font-sans px-3 py-2 rounded-lg border border-black/10 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-celadon"
                />

                {suggestion.examples?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-sans text-black/40 uppercase tracking-wider">
                      Examples
                    </span>
                    {suggestion.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="text-xs font-sans p-2 rounded-lg bg-white"
                      >
                        <p className="text-red-600/70 line-through">
                          {ex.bad}
                        </p>
                        <p className="text-green-700/70 mt-0.5">{ex.good}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleApprove}
                  disabled={saving || !editedRule.trim()}
                  className="w-full py-2.5 rounded-xl text-xs font-sans font-medium bg-celadon text-black hover:bg-celadon/80 transition-colors disabled:opacity-40"
                >
                  {saving ? "Saving..." : "Approve & Create Rule"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
