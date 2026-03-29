"use client";

import { useState } from "react";

interface Props {
  steps: {
    translatedPrompt?: string;
    englishResponse?: string;
  };
  onToggle?: (open: boolean) => void;
}

export default function IntermediateSteps({ steps, onToggle }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!steps.translatedPrompt && !steps.englishResponse) return null;

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    onToggle?.(next);
  };

  return (
    <div className="mt-1 ml-1">
      <button
        onClick={toggle}
        className="text-xs text-black/40 hover:text-black/60 font-sans transition-colors flex items-center gap-1"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        View translation steps
      </button>

      {isOpen && (
        <div className="mt-2 space-y-3 border-l-2 border-celadon/40 pl-3">
          {steps.translatedPrompt && (
            <div>
              <p className="text-[11px] font-medium text-black/50 font-sans uppercase tracking-wider">
                English Prompt
              </p>
              <p className="text-xs text-black/70 font-sans mt-0.5">
                {steps.translatedPrompt}
              </p>
            </div>
          )}
          {steps.englishResponse && (
            <div>
              <p className="text-[11px] font-medium text-black/50 font-sans uppercase tracking-wider">
                English Response
              </p>
              <p className="text-xs text-black/70 font-sans mt-0.5 whitespace-pre-wrap">
                {steps.englishResponse}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
