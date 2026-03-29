"use client";

import { useState, useRef, useCallback } from "react";
import type { UIMessage, EvaluationScore } from "@/lib/types";
import { nativeName } from "@/lib/languages";
import IntermediateSteps from "./IntermediateSteps";
import FeedbackButton from "./FeedbackButton";

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Poor", color: "bg-red-100 text-red-700" },
  2: { label: "Weak", color: "bg-red-100 text-red-700" },
  3: { label: "Okay", color: "bg-yellow-100 text-yellow-700" },
  4: { label: "Good", color: "bg-green-100 text-green-700" },
  5: { label: "Excellent", color: "bg-green-100 text-green-700" },
};

function ScoreBadge({ evaluation }: { evaluation: EvaluationScore }) {
  const { label, color } = SCORE_LABELS[evaluation.score] ?? SCORE_LABELS[3];

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${color}`}
        >
          M-Prometheus: {evaluation.score}/5 — {label}
        </span>
      </div>
      {evaluation.feedback && (
        <p className="text-[11px] text-black/40 font-sans leading-relaxed">
          {evaluation.feedback}
        </p>
      )}
    </div>
  );
}

export default function CompareView({
  message,
  userPrompt,
}: {
  message: UIMessage;
  userPrompt?: string;
}) {
  const [vote, setVote] = useState<"native" | "translated" | null>(
    message.vote || null,
  );
  const [stepsOpen, setStepsOpen] = useState(false);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);
  const nativeRef = useRef<HTMLDivElement>(null);

  const handleStepsToggle = useCallback((open: boolean) => {
    if (open && nativeRef.current) {
      setLockedHeight(nativeRef.current.offsetHeight);
    } else {
      setLockedHeight(null);
    }
    setStepsOpen(open);
  }, []);

  const native = message.nativeResult;
  const translated = message.translatedResult;

  return (
    <div className="w-full">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          stepsOpen ? "md:items-start" : "md:items-stretch"
        }`}
      >
        {/* ── Native result ─────────────────────────────────── */}
        <div
          ref={nativeRef}
          style={lockedHeight ? { height: lockedHeight } : undefined}
          className={`rounded-2xl p-5 shadow-sm transition-colors duration-200 flex flex-col ${
            vote === "native"
              ? "bg-celadon/20 ring-2 ring-celadon"
              : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium font-sans text-black/50 uppercase tracking-wider">
              Native
            </span>
            {native?.detectedLanguage && (
              <span className="text-[11px] text-black/30 font-sans">
                {nativeName(native.detectedLanguage)}
              </span>
            )}
          </div>

          {native?.imageData && native.imageMimeType && (
            <img
              src={`data:${native.imageMimeType};base64,${native.imageData}`}
              alt="Native generated"
              className="max-w-full rounded-lg mb-3"
            />
          )}
          <p className="text-sm font-sans whitespace-pre-wrap text-black">
            {native?.content}
          </p>

          <div className="flex-1" />

          <div className="mt-4 pt-4 border-t border-black/5 space-y-3">
            {native?.evaluation && (
              <ScoreBadge evaluation={native.evaluation} />
            )}

            <button
              onClick={() => setVote("native")}
              className={`w-full py-2 rounded-xl text-xs font-medium font-sans transition-all ${
                vote === "native"
                  ? "bg-celadon text-black"
                  : "border border-black/10 text-black/50 hover:border-black/30 hover:text-black"
              }`}
            >
              {vote === "native" ? "✓ Selected" : "Vote Native"}
            </button>

            {native && (
              <FeedbackButton
                messageId={message.id + "-native"}
                language={native.detectedLanguage || "EN"}
                originalResponse={native.content}
                prompt={userPrompt || message.content}
              />
            )}
          </div>
        </div>

        {/* ── Via-English result ─────────────────────────────── */}
        <div
          className={`rounded-2xl p-5 shadow-sm transition-colors duration-200 flex flex-col ${
            vote === "translated"
              ? "bg-celadon/20 ring-2 ring-celadon"
              : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium font-sans text-black/50 uppercase tracking-wider">
              Via English
            </span>
            {translated?.detectedLanguage && (
              <span className="text-[11px] text-black/30 font-sans">
                {nativeName(translated.detectedLanguage)}
              </span>
            )}
          </div>

          {translated?.imageData && translated.imageMimeType && (
            <img
              src={`data:${translated.imageMimeType};base64,${translated.imageData}`}
              alt="Translated generated"
              className="max-w-full rounded-lg mb-3"
            />
          )}
          <p className="text-sm font-sans whitespace-pre-wrap text-black">
            {translated?.content}
          </p>

          <div className="flex-1" />

          <div className="mt-4 pt-4 border-t border-black/5 space-y-3">
            {translated?.intermediateSteps && (
              <IntermediateSteps
                steps={translated.intermediateSteps}
                onToggle={handleStepsToggle}
              />
            )}

            {translated?.evaluation && (
              <ScoreBadge evaluation={translated.evaluation} />
            )}

            <button
              onClick={() => setVote("translated")}
              className={`w-full py-2 rounded-xl text-xs font-medium font-sans transition-all ${
                vote === "translated"
                  ? "bg-celadon text-black"
                  : "border border-black/10 text-black/50 hover:border-black/30 hover:text-black"
              }`}
            >
              {vote === "translated" ? "✓ Selected" : "Vote Via English"}
            </button>

            {translated && (
              <FeedbackButton
                messageId={message.id + "-translated"}
                language={translated.detectedLanguage || "EN"}
                originalResponse={translated.content}
                prompt={userPrompt || message.content}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
