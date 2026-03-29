"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Mode, UIMessage, ChatResponse } from "@/lib/types";
import ModeSelector from "./ModeSelector";
import MessageBubble from "./MessageBubble";

export default function ChatInterface() {
  const [mode, setMode] = useState<Mode>("native");
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
      mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const historyForApi = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-10)
        .map((m) => ({
          role: (m.role === "assistant" ? "model" : "user") as
            | "user"
            | "model",
          content: m.content,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          mode,
          history: historyForApi,
        }),
      });

      const data: ChatResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          data.nativeResult?.content ||
          data.translatedResult?.content ||
          "",
        timestamp: Date.now(),
        mode,
        nativeResult: data.nativeResult,
        translatedResult: data.translatedResult,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorContent =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: errorContent,
          timestamp: Date.now(),
          mode,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ModeSelector mode={mode} onModeChange={setMode} disabled={isLoading} />

      {/* ── Messages ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-lg font-sans text-black/30">
              Start a conversation in any language
            </p>
            <p className="text-sm mt-1.5 font-sans text-black/20 max-w-md">
              Select a mode above to control how your prompt is processed.
              Intermediate translation steps are always inspectable.
            </p>
          </div>
        )}
        {messages.map((msg, i) => {
          const userPrompt =
            msg.role === "assistant"
              ? messages
                  .slice(0, i)
                  .findLast((m) => m.role === "user")?.content
              : undefined;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              userPrompt={userPrompt}
            />
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-5 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span
                  className="w-2 h-2 rounded-full bg-black/20 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-black/20 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-black/20 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ───────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 p-4 border-t border-celadon/30"
      >
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message in any language…"
            className="flex-1 px-4 py-3 rounded-xl border border-black/10 bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-celadon focus:border-transparent placeholder:text-black/30"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-black text-white rounded-xl font-sans text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
