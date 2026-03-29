import type { ConversationMessage } from "./types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-3.5-turbo";

function getApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key)
    throw new Error("OPENAI_API_KEY is not configured. Add it to .env.local");
  return key;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function generateResponse(
  prompt: string,
  history?: ConversationMessage[],
  systemPrompt?: string,
): Promise<{ text?: string; imageData?: string; imageMimeType?: string }> {
  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  for (const msg of history || []) {
    messages.push({
      role: (msg.role === "model" ? "assistant" : "user") as "user" | "assistant",
      content: msg.content,
    });
  }
  messages.push({ role: "user", content: prompt });

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || undefined;

  return { text };
}
