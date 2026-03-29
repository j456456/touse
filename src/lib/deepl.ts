import type { TranslationResult } from "./types";

const DEEPL_API_BASE =
  process.env.DEEPL_API_URL || "https://api-free.deepl.com/v2";

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang?: string,
): Promise<TranslationResult> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey)
    throw new Error("DEEPL_API_KEY is not configured. Add it to .env.local");

  const params = new URLSearchParams();
  params.append("text", text);
  params.append("target_lang", targetLang.toUpperCase());
  if (sourceLang) params.append("source_lang", sourceLang.toUpperCase());

  const response = await fetch(`${DEEPL_API_BASE}/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`DeepL API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const translation = data.translations[0];

  return {
    translatedText: translation.text,
    detectedLanguage: translation.detected_source_language,
  };
}
