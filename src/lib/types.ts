export type Mode = "native" | "translate" | "compare";

export interface ConversationMessage {
  role: "user" | "model";
  content: string;
}

export interface ChatRequest {
  message: string;
  mode: Mode;
  history?: ConversationMessage[];
}

export interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
}

export interface EvaluationScore {
  score: number;
  feedback: string;
}

export interface ModeResult {
  content: string;
  imageData?: string;
  imageMimeType?: string;
  detectedLanguage?: string;
  intermediateSteps?: {
    translatedPrompt?: string;
    englishResponse?: string;
  };
  evaluation?: EvaluationScore;
}

export interface ChatResponse {
  mode?: Mode;
  nativeResult?: ModeResult;
  translatedResult?: ModeResult;
  error?: string;
}

export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  mode: Mode;
  nativeResult?: ModeResult;
  translatedResult?: ModeResult;
  vote?: "native" | "translated";
}

// ─── Feedback & Rules ───────────────────────────────────────────────────────

export type FeedbackCategory =
  | "tone"
  | "grammar"
  | "offensive"
  | "accuracy"
  | "fluency"
  | "other";

export interface Feedback {
  id: string;
  messageId: string;
  language: string;
  category: FeedbackCategory;
  description: string;
  suggestedFix?: string;
  originalResponse: string;
  prompt: string;
  timestamp: number;
}

export interface LanguageRule {
  id: string;
  language: string;
  rule: string;
  examples?: { bad: string; good: string }[];
  sourceCount: number;
  createdAt: number;
}
