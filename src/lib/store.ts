import fs from "fs";
import path from "path";
import type { Feedback, LanguageRule } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const FEEDBACK_PATH = path.join(DATA_DIR, "feedback.json");
const RULES_PATH = path.join(DATA_DIR, "rules.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON<T>(filePath: string): T[] {
  ensureDir();
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeJSON<T>(filePath: string, data: T[]) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Feedback ───────────────────────────────────────────────────────────────

export function getFeedback(language?: string): Feedback[] {
  const all = readJSON<Feedback>(FEEDBACK_PATH);
  if (!language) return all;
  return all.filter(
    (f) => f.language.toUpperCase() === language.toUpperCase(),
  );
}

export function addFeedback(entry: Feedback) {
  const all = readJSON<Feedback>(FEEDBACK_PATH);
  all.push(entry);
  writeJSON(FEEDBACK_PATH, all);
}

// ─── Rules ──────────────────────────────────────────────────────────────────

export function getRules(language?: string): LanguageRule[] {
  const all = readJSON<LanguageRule>(RULES_PATH);
  if (!language) return all;
  return all.filter(
    (r) => r.language.toUpperCase() === language.toUpperCase(),
  );
}

export function addRule(rule: LanguageRule) {
  const all = readJSON<LanguageRule>(RULES_PATH);
  all.push(rule);
  writeJSON(RULES_PATH, all);
}

export function deleteRule(id: string): boolean {
  const all = readJSON<LanguageRule>(RULES_PATH);
  const filtered = all.filter((r) => r.id !== id);
  if (filtered.length === all.length) return false;
  writeJSON(RULES_PATH, filtered);
  return true;
}
