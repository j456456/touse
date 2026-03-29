"use client";

import { useState } from "react";
import type { LanguageRule } from "@/lib/types";
import { nativeName } from "@/lib/languages";

export default function ActiveRules({
  rules,
  onDeleted,
}: {
  rules: LanguageRule[];
  onDeleted: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/rules?id=${id}`, { method: "DELETE" });
      if (res.ok) onDeleted();
    } finally {
      setDeletingId(null);
    }
  }

  const grouped = rules.reduce<Record<string, LanguageRule[]>>((acc, rule) => {
    (acc[rule.language] ??= []).push(rule);
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-0 overflow-hidden">
      <div className="shrink-0 px-4 py-3 border-b border-black/5">
        <h2 className="text-[11px] font-sans font-medium text-black/50 uppercase tracking-wider">
          Active Rules ({rules.length})
        </h2>
        <p className="text-[10px] font-sans text-black/30 mt-0.5">
          Injected into future responses as system context
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rules.length === 0 && (
          <p className="text-sm font-sans text-black/30 text-center py-12 px-4">
            No rules yet. Create rules from feedback to improve future
            responses.
          </p>
        )}

        {Object.entries(grouped).map(([lang, langRules]) => (
          <div key={lang}>
            <div className="sticky top-0 bg-parchment px-4 py-2 border-b border-black/5">
              <span className="text-[11px] font-sans font-medium text-black/50 tracking-wider">
                {nativeName(lang)}
              </span>
              <span className="text-[10px] font-sans text-black/30 ml-2">
                {langRules.length} rule{langRules.length > 1 ? "s" : ""}
              </span>
            </div>

            {langRules.map((rule) => (
              <div
                key={rule.id}
                className="px-4 py-3 border-b border-black/5 group"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-sans text-black/80">
                      {rule.rule}
                    </p>

                    {rule.examples?.map((ex, i) => (
                      <div
                        key={i}
                        className="mt-1.5 text-[11px] font-sans p-1.5 rounded bg-black/[0.02]"
                      >
                        <p className="text-red-500/60 line-through">
                          {ex.bad}
                        </p>
                        <p className="text-green-600/60">{ex.good}</p>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-black/25 font-sans">
                        From {rule.sourceCount} report
                        {rule.sourceCount > 1 ? "s" : ""}
                      </span>
                      <span className="text-[10px] text-black/20 font-sans">
                        {new Date(rule.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(rule.id)}
                    disabled={deletingId === rule.id}
                    className="shrink-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1 rounded"
                    title="Delete rule"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
