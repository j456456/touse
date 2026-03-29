/**
 * Response evaluation using the M-Prometheus rubric.
 *
 * Uses the exact prompt template and scoring rubric from M-Prometheus
 * (arXiv 2504.04953), routed through OpenAI for hosted inference.
 *
 * Supported languages sourced from the M-Prometheus paper.
 */

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-3.5-turbo";

/** DeepL language code → language name, for languages M-Prometheus was evaluated on. */
const SUPPORTED_LANGUAGES: Record<string, string> = {
  AR: "Arabic",
  BG: "Bulgarian",
  ZH: "Chinese",
  CS: "Czech",
  NL: "Dutch",
  EN: "English",
  FR: "French",
  DE: "German",
  EL: "Greek",
  HI: "Hindi",
  ID: "Indonesian",
  IT: "Italian",
  JA: "Japanese",
  KO: "Korean",
  PL: "Polish",
  PT: "Portuguese",
  RO: "Romanian",
  RU: "Russian",
  ES: "Spanish",
  TR: "Turkish",
  UK: "Ukrainian",
  VI: "Vietnamese",
};

export function isLanguageSupported(deeplCode: string): boolean {
  return deeplCode in SUPPORTED_LANGUAGES;
}

function buildPrompt(instruction: string, response: string): string {
  return [
    "Rate the following AI response on a scale of 1-5 based on accuracy, fluency (naturalness of language), and helpfulness.",
    "",
    "Score meanings:",
    "1=Incorrect/incoherent, 2=Partially correct but flawed, 3=Acceptable but lacks depth, 4=Accurate and well-structured, 5=Excellent and comprehensive",
    "",
    "Instruction: " + instruction,
    "",
    "Response: " + response.slice(0, 2000),
    "",
    "Output EXACTLY in this format (score FIRST, then explanation):",
    "[RESULT] <score 1-5> <explanation>",
    "",
    "If the score is below 5, you MUST specifically explain what is wrong — e.g. unnatural phrasing, clunky grammar, missing details, factual errors, or awkward translations. Be concrete and cite examples from the response. 2-3 sentences.",
    "If the score is 5, a single sentence confirming quality is sufficient.",
  ].join("\n");
}

function parseResult(text: string): { score: number; feedback: string } | null {
  // Try strict format first: [RESULT] 4
  const strict = text.match(/\[RESULT\]\s*(\d)([\s\S]*)/);
  if (strict) {
    const score = parseInt(strict[1], 10);
    if (score >= 1 && score <= 5) return { score, feedback: strict[2]?.trim() || "" };
  }
  // Fallback: [4] or [RESULT]4 or just a leading digit
  const loose = text.match(/\[(\d)\]|^\s*(\d)\s*[.:\-\/]|Score:\s*(\d)/m);
  if (loose) {
    const score = parseInt(loose[1] || loose[2] || loose[3], 10);
    if (score >= 1 && score <= 5) return { score, feedback: text.trim() };
  }
  return null;
}

/**
 * Evaluate a single response using the M-Prometheus rubric.
 * Returns a score 1–5 with feedback, or null if the language is
 * unsupported or the API call fails.
 */
export async function evaluateResponse(
  instruction: string,
  response: string,
  languageCode: string,
): Promise<{ score: number; feedback: string } | null> {
  if (!isLanguageSupported(languageCode)) return null;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!response.trim()) return null;

  const prompt = buildPrompt(instruction, response);

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[evaluate] API error ${res.status}:`, body);
      return null;
    }

    const data = await res.json();
    const generated: string = data.choices?.[0]?.message?.content ?? "";

    const result = parseResult(generated);
    if (!result) {
      console.warn("[evaluate] Could not parse score from:", generated.slice(0, 300));
      return null;
    }

    return result;
  } catch (err) {
    console.error("[evaluate] Exception:", err);
    return null;
  }
}
