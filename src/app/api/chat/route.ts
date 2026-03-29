import { NextResponse } from "next/server";
import { generateResponse } from "@/lib/gemini";
import { translateText } from "@/lib/deepl";
import { evaluateResponse } from "@/lib/evaluate";
import { getRules } from "@/lib/store";
import type {
  ChatRequest,
  ChatResponse,
  ConversationMessage,
} from "@/lib/types";

const MAX_RULES = 5;

function buildSystemPrompt(languageCode: string): string | undefined {
  const rules = getRules(languageCode).slice(-MAX_RULES);
  if (!rules.length) return undefined;

  const ruleList = rules
    .map((r, i) => `${i + 1}. ${r.rule}`)
    .join("\n");

  return `You are responding in ${languageCode}. Follow these language-specific rules:\n${ruleList}`;
}

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { message, mode, history } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" } satisfies ChatResponse,
        { status: 400 },
      );
    }

    let result: ChatResponse;

    switch (mode) {
      case "native":
        result = await handleNative(message, history);
        break;
      case "translate":
        result = await handleTranslate(message, history);
        break;
      case "compare":
        result = await handleCompare(message, history);
        break;
      default:
        return NextResponse.json(
          { error: `Invalid mode: ${mode}` } satisfies ChatResponse,
          { status: 400 },
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("[chat/route]", error);
    return NextResponse.json(
      { error: message } satisfies ChatResponse,
      { status: 500 },
    );
  }
}

// ─── Native Mode ────────────────────────────────────────────────────────────
async function handleNative(
  message: string,
  history?: ConversationMessage[],
): Promise<ChatResponse> {
  const translation = await translateText(message, "EN");
  const detectedLanguage = translation.detectedLanguage;
  const systemPrompt = buildSystemPrompt(detectedLanguage);

  const response = await generateResponse(message, history, systemPrompt);
  return {
    mode: "native",
    nativeResult: {
      content: response.text || "",
      imageData: response.imageData,
      imageMimeType: response.imageMimeType,
      detectedLanguage,
    },
  };
}

// ─── Translate-via-English Mode ─────────────────────────────────────────────
async function handleTranslate(
  message: string,
  history?: ConversationMessage[],
): Promise<ChatResponse> {
  const translation = await translateText(message, "EN");
  const detectedLanguage = translation.detectedLanguage;
  const systemPrompt = buildSystemPrompt(detectedLanguage);

  if (detectedLanguage === "EN") {
    const response = await generateResponse(message, history, systemPrompt);
    return {
      mode: "translate",
      translatedResult: {
        content: response.text || "",
        imageData: response.imageData,
        imageMimeType: response.imageMimeType,
        detectedLanguage: "EN",
        intermediateSteps: {
          translatedPrompt: message,
          englishResponse: response.text || "",
        },
      },
    };
  }

  const englishPrompt = translation.translatedText;
  const response = await generateResponse(englishPrompt, history, systemPrompt);

  let finalContent = response.text || "";
  if (response.text && !response.imageData) {
    const backTranslation = await translateText(response.text, detectedLanguage);
    finalContent = backTranslation.translatedText;
  }

  return {
    mode: "translate",
    translatedResult: {
      content: finalContent,
      imageData: response.imageData,
      imageMimeType: response.imageMimeType,
      detectedLanguage,
      intermediateSteps: {
        translatedPrompt: englishPrompt,
        englishResponse: response.text || "",
      },
    },
  };
}

// ─── Compare Mode ───────────────────────────────────────────────────────────
async function handleCompare(
  message: string,
  history?: ConversationMessage[],
): Promise<ChatResponse> {
  const promptTranslation = await translateText(message, "EN");
  const detectedLanguage = promptTranslation.detectedLanguage;
  const englishPrompt = promptTranslation.translatedText;
  const isEnglish = detectedLanguage === "EN";
  const systemPrompt = buildSystemPrompt(detectedLanguage);

  const [nativeResponse, englishResponse] = await Promise.all([
    generateResponse(message, history, systemPrompt),
    isEnglish
      ? generateResponse(message, history, systemPrompt)
      : generateResponse(englishPrompt, history, systemPrompt),
  ]);

  let translatedContent = englishResponse.text || "";
  if (!isEnglish && englishResponse.text && !englishResponse.imageData) {
    const backTranslation = await translateText(
      englishResponse.text,
      detectedLanguage,
    );
    translatedContent = backTranslation.translatedText;
  }

  const nativeContent = nativeResponse.text || "";

  const [nativeEval, translatedEval] = await Promise.all([
    nativeContent
      ? evaluateResponse(message, nativeContent, detectedLanguage)
      : Promise.resolve(null),
    translatedContent
      ? evaluateResponse(message, translatedContent, detectedLanguage)
      : Promise.resolve(null),
  ]);

  return {
    mode: "compare",
    nativeResult: {
      content: nativeContent,
      imageData: nativeResponse.imageData,
      imageMimeType: nativeResponse.imageMimeType,
      detectedLanguage,
      evaluation: nativeEval || undefined,
    },
    translatedResult: {
      content: translatedContent,
      imageData: englishResponse.imageData,
      imageMimeType: englishResponse.imageMimeType,
      detectedLanguage,
      intermediateSteps: {
        translatedPrompt: englishPrompt,
        englishResponse: englishResponse.text || "",
      },
      evaluation: translatedEval || undefined,
    },
  };
}
