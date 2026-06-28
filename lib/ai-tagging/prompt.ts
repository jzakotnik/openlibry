import { LOCALE } from "@/lib/i18n";
import type { BookTagInput, RankedTag, SourcedTag } from "./types";

/**
 * Shared prompt construction and response parsing for every AI tagging
 * provider. Keeping these here means each provider (Anthropic, Google, …) only
 * owns its SDK call + schema shape, not the wording or the JSON contract — so
 * the providers stay comparable and a prompt change lands in one place.
 */

/** Human language name for the deployment locale — the tag output language. */
const TARGET_LANGUAGE: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  es: "Español",
};

export const SYSTEM_PROMPT = [
  "Du bist die Assistenz einer Schulbibliothek und vergibst Schlagwörter (Tags)",
  "für Bücher. Deine Aufgabe ist NICHT, frei zu erfinden, sondern vorgegebene",
  "Kandidaten zu prüfen, zu normalisieren und auszuwählen.",
  "",
  "Du erhältst pro Buch: bibliografische Daten, die bereits in der Bibliothek",
  "verwendeten Schlagwörter sowie KANDIDATEN aus Bibliothekskatalogen (Deutsche",
  "Nationalbibliothek, Open Library, Wikidata) und von anderen Büchern desselben",
  "Autors. Englische Kandidaten ins Deutsche übersetzen.",
  "",
  "Regeln:",
  "- Schlage pro Buch höchstens die angegebene Anzahl Schlagwörter vor.",
  "- Wähle bevorzugt aus den Kandidaten und den vorhandenen Schlagwörtern.",
  "- Normalisiere lange/förmliche Katalogbegriffe zu kurzen, kindgerechten",
  "  Schlagwörtern (z. B. „Künste, Bildende Kunst allgemein\" → „Kunst\").",
  "- Bevorzuge die vorhandene Schreibweise eines Schlagworts, wenn es sie gibt.",
  "- Erfinde nur dann ein neues Schlagwort, wenn die Kandidaten das Buch nicht",
  "  abdecken.",
  `- Gib ALLE Schlagwörter in dieser Sprache aus: ${TARGET_LANGUAGE[LOCALE] ?? "Deutsch"}.`,
  "  Übersetze fremdsprachige Kandidaten entsprechend.",
  "- Schlagwörter sind kurze Substantive oder Nominalphrasen, kein Satz.",
  "- Verwende niemals ein Semikolon in einem Schlagwort.",
].join("\n");

/** Configured max tags per book (default 5), as the model should aim for. */
export function getPromptMaxTags(): number {
  const n = Number(process.env.AI_TAGGING_MAX_TAGS);
  return Number.isFinite(n) && n > 0 ? n : 5;
}

export function buildUserMessage(
  books: BookTagInput[],
  vocabulary: RankedTag[],
  maxTags: number,
  candidates: Record<string, SourcedTag[]> = {},
): string {
  const vocabList =
    vocabulary.length > 0
      ? vocabulary.map((v) => v.tag).join(", ")
      : "(noch keine vorhandenen Schlagwörter)";

  const bookList = books.map((b) => ({
    ref: b.ref,
    title: b.title,
    subtitle: b.subtitle,
    author: b.author,
    summary: b.summary,
    existingTopics: b.topics,
    publisher: b.publisherName,
    year: b.publisherDate,
    minAge: b.minAge,
    maxAge: b.maxAge,
    // Grounded candidates with provenance — the model should lean on these.
    candidates: (candidates[b.ref] ?? []).map((c) => `${c.tag} (${c.source})`),
  }));

  return [
    `Maximale Schlagwörter pro Buch: ${maxTags}`,
    "",
    "Vorhandene Schlagwörter der Bibliothek (bevorzugen):",
    vocabList,
    "",
    "Bücher mit Kandidaten (als JSON):",
    JSON.stringify(bookList, null, 2),
  ].join("\n");
}

/**
 * Budget output tokens by batch size so a large batch's JSON isn't truncated
 * (truncation makes it unparseable and loses every book's tags). Roughly ~12
 * tokens per tag plus a per-book envelope, with a floor for tiny batches.
 */
export function computeMaxOutputTokens(
  bookCount: number,
  maxTags: number,
): number {
  return Math.min(8192, 512 + bookCount * (maxTags * 12 + 24));
}

/**
 * Parses the model's JSON text into a ref→tags map. Tolerant of malformed
 * output: a parse failure or unexpected shape yields {} (the caller then
 * proposes nothing for those books rather than crashing the workflow).
 */
export function parseTagResults(text: string | undefined): Record<string, string[]> {
  if (!text) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {};
  }
  // JSON.parse can yield null, a primitive, or an array — guard before reaching
  // for `.results` so malformed model output degrades to {} instead of crashing.
  if (!parsed || typeof parsed !== "object") return {};
  const results = (parsed as { results?: unknown }).results;

  const out: Record<string, string[]> = {};
  for (const r of (Array.isArray(results) ? results : []) as Array<{
    ref?: unknown;
    tags?: unknown;
  }>) {
    if (r && typeof r.ref === "string" && Array.isArray(r.tags)) {
      out[r.ref] = r.tags.filter((t): t is string => typeof t === "string");
    }
  }
  return out;
}
