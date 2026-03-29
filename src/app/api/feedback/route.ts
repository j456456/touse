import { NextResponse } from "next/server";
import { getFeedback, addFeedback } from "@/lib/store";
import type { Feedback, FeedbackCategory } from "@/lib/types";

const VALID_CATEGORIES: FeedbackCategory[] = [
  "tone",
  "grammar",
  "offensive",
  "accuracy",
  "fluency",
  "other",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || undefined;
  return NextResponse.json(getFeedback(language));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messageId, language, category, description, suggestedFix, originalResponse, prompt } = body;

    if (!messageId || !language || !category || !description || !originalResponse || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 },
      );
    }

    const entry: Feedback = {
      id: crypto.randomUUID(),
      messageId,
      language: language.toUpperCase(),
      category,
      description,
      suggestedFix: suggestedFix || undefined,
      originalResponse,
      prompt,
      timestamp: Date.now(),
    };

    addFeedback(entry);
    return NextResponse.json({ ok: true, id: entry.id });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
