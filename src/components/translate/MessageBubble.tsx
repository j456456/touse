"use client";

import type { UIMessage } from "@/lib/types";
import { nativeName } from "@/lib/languages";
import IntermediateSteps from "./IntermediateSteps";
import CompareView from "./CompareView";
import FeedbackButton from "./FeedbackButton";

export default function MessageBubble({
  message,
  userPrompt,
}: {
  message: UIMessage;
  userPrompt?: string;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] bg-black text-white rounded-2xl rounded-br-md px-5 py-3">
          <p className="text-sm font-sans whitespace-pre-wrap">
            {message.content}
          </p>
          <span className="block text-[10px] text-white/30 mt-1 text-right font-sans">
            {message.mode}
          </span>
        </div>
      </div>
    );
  }

  if (
    message.mode === "compare" &&
    message.nativeResult &&
    message.translatedResult
  ) {
    return <CompareView message={message} userPrompt={userPrompt} />;
  }

  const result = message.nativeResult || message.translatedResult;
  const displayContent = result?.content || message.content;
  const isError = !result && message.content;

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] space-y-1.5">
        <div
          className={`rounded-2xl rounded-bl-md px-5 py-3 shadow-sm ${
            isError ? "bg-red-50 border border-red-200" : "bg-white"
          }`}
        >
          {result?.imageData && result.imageMimeType && (
            <img
              src={`data:${result.imageMimeType};base64,${result.imageData}`}
              alt="Generated image"
              className="max-w-full rounded-lg mb-3"
            />
          )}
          <p
            className={`text-sm font-sans whitespace-pre-wrap ${
              isError ? "text-red-700" : "text-black"
            }`}
          >
            {displayContent}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-1">
          {result?.detectedLanguage && (
            <span className="text-[11px] text-black/30 font-sans">
              Detected: {nativeName(result.detectedLanguage)}
            </span>
          )}
        </div>

        {result?.intermediateSteps && (
          <IntermediateSteps steps={result.intermediateSteps} />
        )}

        {result && (
          <div className="px-1">
            <FeedbackButton
              messageId={message.id}
              language={result.detectedLanguage || "EN"}
              originalResponse={result.content}
              prompt={userPrompt || message.content}
            />
          </div>
        )}
      </div>
    </div>
  );
}
