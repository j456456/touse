import { NextResponse } from "next/server";
import type { Feedback } from "@/lib/types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-3.5-turbo";

export async function POST(request: Request) {
  try {
    const { feedbackItems }: { feedbackItems: Feedback[] } =
      await request.json();

    if (!feedbackItems?.length) {
      return NextResponse.json(
        { error: "feedbackItems array is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 },
      );
    }

    const language = feedbackItems[0].language;
    const feedbackSummary = feedbackItems
      .map(
        (f, i) =>
          `${i + 1}. [${f.category}] "${f.description}"${f.suggestedFix ? ` → Suggested: "${f.suggestedFix}"` : ""}
   Response excerpt: "${f.originalResponse.slice(0, 200)}"`,
      )
      .join("\n");

    const systemPrompt = `You are a linguistic quality expert. Given user feedback about AI-generated ${language} text, create a single concise, reusable rule that would prevent the reported issues in future responses.

Output format (JSON):
{
  "rule": "A clear, actionable instruction for the AI (1-2 sentences)",
  "examples": [{"bad": "example of what to avoid", "good": "better alternative"}]
}

Rules must be:
- Specific and actionable (not vague like "be more natural")
- About the language/culture, not about the content topic
- Written as instructions to the AI model`;

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here are ${feedbackItems.length} feedback reports for ${language} responses:\n\n${feedbackSummary}\n\nCreate a reusable rule based on these reports.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        { error: `OpenAI error (${res.status}): ${body}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ rule: raw.trim(), examples: [] });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      rule: parsed.rule || raw.trim(),
      examples: parsed.examples || [],
    });
  } catch (err) {
    console.error("[rules/suggest]", err);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 },
    );
  }
}
