import { NextResponse } from "next/server";
import { getRules, addRule, deleteRule } from "@/lib/store";
import type { LanguageRule } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || undefined;
  return NextResponse.json(getRules(language));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { language, rule, examples, sourceCount } = body;

    if (!language || !rule) {
      return NextResponse.json(
        { error: "language and rule are required" },
        { status: 400 },
      );
    }

    const entry: LanguageRule = {
      id: crypto.randomUUID(),
      language: language.toUpperCase(),
      rule,
      examples: examples || undefined,
      sourceCount: sourceCount || 1,
      createdAt: Date.now(),
    };

    addRule(entry);
    return NextResponse.json({ ok: true, id: entry.id });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const deleted = deleteRule(id);
  if (!deleted) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
