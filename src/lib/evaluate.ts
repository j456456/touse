/**
 * Response evaluation using the M-Prometheus rubric
 * (arXiv 2504.04953), routed through OpenAI for hosted inference.
 *
 * Uses the official Prometheus direct-assessment prompt template.
 */

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-3.5-turbo";

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

/**
 * Official M-Prometheus / Prometheus-2 direct-assessment prompt.
 */
function buildPrompt(instruction: string, response: string): string {
  return `###Task Description: An instruction (might include an Input inside it), a response to evaluate, a reference answer that gets a score of 5, and a score rubric representing a evaluation criteria are given.
1. Write a detailed feedback that assess the quality of the response strictly based on the given score rubric, not evaluating in general.
2. After writing a feedback, write a score that is an integer between 1 and 5. You should refer to the score rubric.
3. The output format should look as follows: "Feedback: (write a feedback for criteria) [RESULT] (an integer number between 1 and 5)"
4. Please do not generate any other opening, closing, and explanations.

###The instruction to evaluate:
${instruction}

###Response to evaluate:
${response.slice(0, 2000)}

###Reference Answer (Score 5):
A perfect response would fully and accurately address the instruction in a natural, fluent manner appropriate for the target language and cultural context.

###Score Rubrics: [Accuracy, Fluency, Helpfulness, Brevity, Relevance]
Score 1: The response contains major errors that significantly alter the meaning. It is barely comprehensible, reads like a poor machine translation, and is either far too verbose or fails to address the instruction. The style is completely inconsistent.
Score 2: The response has several inaccuracies that affect the overall meaning. It is difficult to read, with frequent awkward phrasings. It includes noticeable filler or off-topic content. The style only occasionally matches expectations.
Score 3: The response is mostly accurate but has some minor errors. It is generally understandable but lacks natural flow in some parts. It is somewhat concise and mostly on-topic, though it could be tighter. The style is somewhat consistent.
Score 4: The response is accurate with only a few negligible errors. It reads naturally, is concise without omitting important details, and stays focused on the instruction. The style largely matches expectations.
Score 5: The response is highly accurate, conveying the full meaning. It reads as fluently as a native text, is perfectly concise — no unnecessary padding — and directly addresses every aspect of the instruction. The style perfectly captures the appropriate tone and register.

###Feedback:`;
}

function parseResult(text: string): { score: number; feedback: string } | null {
  const match = text.match(/\[RESULT\]\s*(\d)/);
  if (match) {
    const score = parseInt(match[1], 10);
    if (score >= 1 && score <= 5) {
      const feedback = text.replace(/\[RESULT\]\s*\d/, "").trim();
      return { score, feedback };
    }
  }
  const loose = text.match(/\[(\d)\]|Score:\s*(\d)/m);
  if (loose) {
    const score = parseInt(loose[1] || loose[2], 10);
    if (score >= 1 && score <= 5) return { score, feedback: text.trim() };
  }
  return null;
}

/**
 * Evaluate a response using the M-Prometheus rubric via OpenAI.
 * Returns a score 1-5 with feedback, or null if unavailable.
 */
export async function evaluateResponse(
  instruction: string,
  response: string,
  languageCode: string,
): Promise<{ score: number; feedback: string } | null> {
  if (!isLanguageSupported(languageCode)) return null;
  if (!response.trim()) return null;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

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
      console.warn(
        "[evaluate] Could not parse score from:",
        generated.slice(0, 300),
      );
      return null;
    }

    return result;
  } catch (err) {
    console.error("[evaluate] Exception:", err);
    return null;
  }
}
