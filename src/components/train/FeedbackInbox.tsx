"use client";

import type { Feedback } from "@/lib/types";
import { nativeName } from "@/lib/languages";

const CATEGORY_COLORS: Record<string, string> = {
  tone: "bg-purple-100 text-purple-700",
  grammar: "bg-blue-100 text-blue-700",
  offensive: "bg-red-100 text-red-700",
  accuracy: "bg-amber-100 text-amber-700",
  fluency: "bg-teal-100 text-teal-700",
  other: "bg-gray-100 text-gray-600",
};

export default function FeedbackInbox({
  feedback,
  selectedIds,
  onToggle,
}: {
  feedback: Feedback[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col min-h-0 border-r border-celadon/20 overflow-hidden">
      <div className="shrink-0 px-4 py-3 border-b border-black/5">
        <h2 className="text-sm font-sans font-semibold text-black/80 uppercase tracking-wider">
          Feedback Inbox ({feedback.length})
        </h2>
        <p className="text-xs font-sans text-black/50 mt-0.5">
          Select items to generate a rule
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {feedback.length === 0 && (
          <p className="text-base font-sans text-black/50 text-center py-12 px-4">
            No feedback yet. Users can report issues on AI responses from the
            Translate page.
          </p>
        )}

        {feedback.map((item) => {
          const selected = selectedIds.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`w-full text-left px-4 py-3 border-b border-black/5 transition-colors hover:bg-black/[0.02] ${
                selected ? "bg-celadon/10 ring-inset ring-1 ring-celadon/30" : ""
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`mt-0.5 w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                    selected
                      ? "bg-celadon border-celadon"
                      : "border-black/20"
                  }`}
                >
                  {selected && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="text-xs text-black/50 font-sans">
                      {nativeName(item.language)}
                    </span>
                    <span className="text-xs text-black/40 font-sans">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm font-sans text-black/80 line-clamp-2">
                    {item.description}
                  </p>

                  {item.suggestedFix && (
                    <p className="text-xs font-sans text-celadon-dark italic line-clamp-1">
                      Better: &ldquo;{item.suggestedFix}&rdquo;
                    </p>
                  )}

                  <p className="text-xs font-sans text-black/50 line-clamp-1 truncate">
                    Response: &ldquo;{item.originalResponse.slice(0, 100)}&rdquo;
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
