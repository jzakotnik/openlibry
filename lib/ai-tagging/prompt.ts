import { LOCALE } from "@/lib/i18n";
import { FACET_ORDER } from "./config";
import type { BookTagInput, RankedTag, SourcedTag, TagExample } from "./types";

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
  "für Bücher. Du prüfst und normalisierst vorgegebene Kandidaten UND wählst",
  "zusätzlich passende Schlagwörter aus dem vorhandenen Schlagwortbestand der",
  "Bibliothek aus. Völlig neue, frei erfundene Begriffe bleiben die Ausnahme.",
  "",
  "Du erhältst pro Buch: bibliografische Daten, die bereits in der Bibliothek",
  "verwendeten Schlagwörter sowie KANDIDATEN aus Bibliothekskatalogen (Deutsche",
  "Nationalbibliothek, Open Library, Wikidata) und von anderen Büchern desselben",
  "Autors. Englische Kandidaten ins Deutsche übersetzen.",
  "",
  "Regeln:",
  "- Die angegebene Anzahl ist eine OBERGRENZE, kein Ziel. Lieber wenige",
  "  treffende Schlagwörter als viele. Fülle niemals auf, nur um die Anzahl zu",
  "  erreichen; zwei passende Schlagwörter sind besser als fünf mittelmäßige.",
  "- Wähle bevorzugt aus den Kandidaten und den vorhandenen Schlagwörtern.",
  "- Zu jedem Buch sind ähnliche, bereits in DIESER Bibliothek verschlagwortete",
  "  Bücher beigefügt (Feld „aehnlicheBuecher\"). Orientiere dich stark an deren",
  "  Stil, Granularität und typischen Schlagwort-Kombinationen — sie zeigen, wie",
  "  diese Bibliothek vergleichbare Bücher verschlagwortet (z. B. bei Lyrik",
  "  zusätzlich Epoche, Land und Strömung).",
  "- Nutze dein Wissen über das Buch (Epoche, Land oder Region, Gattung, Themen),",
  "  um passende VORHANDENE Schlagwörter der Bibliothek auszuwählen, auch wenn",
  "  sie nicht unter den Kandidaten stehen (z. B. „19. Jahrhundert\", „Deutschland\",",
  "  „Romantik\" für einen Maler der Romantik). Wenn Autor, Epoche, Herkunftsland",
  "  oder Gattung erkennbar sind, vergib die entsprechenden vorhandenen Schlagwörter",
  "  aktiv — solche offensichtlichen Einordnungen sollten selten fehlen. Nur bei",
  "  echter Unsicherheit weglassen.",
  "- Bevorzuge ein vorhandenes Schlagwort der Bibliothek, selbst wenn ein neuer",
  "  Begriff kürzer oder allgemeiner wäre (z. B. vorhandenes „Kunstgeschichte\"",
  "  verwenden statt neu „Kunst\"). Übernimm die vorhandene Schreibweise unverändert.",
  "- Keine Dopplungen innerhalb derselben Art: kein Synonym eines bereits",
  "  gewählten Schlagworts (nicht „Plastik\" UND „Skulptur\" — eines genügt).",
  "  Verschiedene Arten ergänzen sich dagegen (z. B. Gattung „Exilliteratur\"",
  "  zusammen mit Thema „Exil\" ist erwünscht).",
  "- Normalisiere lange/förmliche Katalogbegriffe zu kurzen Schlagwörtern",
  "  (z. B. „Geschichte des 20. Jahrhunderts\" → „20. Jahrhundert\").",
  "- Ein völlig neues Schlagwort (weder Kandidat noch im Bestand) nur, wenn weder",
  "  Kandidaten noch vorhandene Schlagwörter das Buch abdecken, und nur wenn es",
  "  zum Stil der Bibliothek passt (gleiche Körnung und Sprache). Vergib keinen",
  "  bloßen Eigennamen aus Titel oder Autor als neues Schlagwort (etwa den",
  "  Künstler- oder Personennamen), außer solche Namen sind hier üblich.",
  `- Gib ALLE Schlagwörter in dieser Sprache aus: ${TARGET_LANGUAGE[LOCALE] ?? "Deutsch"}.`,
  "  Übersetze fremdsprachige Kandidaten entsprechend.",
  "- Schlagwörter sind kurze Substantive oder Nominalphrasen, kein Satz.",
  "- Verwende niemals ein Semikolon in einem Schlagwort.",
].join("\n");

// Binding/format words and product types that ride along in catalogue metadata
// but are not subjects.
const TOPIC_NOISE =
  /^(hardback|hardcover|softcover|paperback|taschenbuch|gebunden|broschur|broschiert|kartoniert|leinen|e-?book|epub|pdf|buch|set|box|dvd|cd)$/i;

/**
 * Turns a raw topics string into clean subject candidates. Auto-filled
 * catalogue metadata (DNB/VLB) packs control markers like "(Produktform)…",
 * "(VLB-WN)1583:…", binding words and whole exhibition titles into the topics
 * field; handed to the model as "existing tags" that noise drags the
 * suggestions off course. Splits on the separators catalogues actually use,
 * strips parenthetical/code markers, and drops binding/format/over-long junk.
 */
export function sanitizeTopicList(raw: string | undefined | null): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const piece of raw.split(/[;,/]/)) {
    const cleaned = piece
      .replace(/\([^)]*\)/g, "") // (Produktform), (VLB-WN) …
      .replace(/^\s*\d+\s*:/, "") // leading numeric code WITH colon ("1583:")
      .trim();
    if (!cleaned || cleaned.length > 40) continue; // empties + exhibition titles
    if (/^\d+$/.test(cleaned)) continue; // bare codes
    if (TOPIC_NOISE.test(cleaned)) continue; // binding/format words
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(cleaned);
  }
  return out;
}

/** Configured max tags per book (default 5), as the model should aim for. */
export function getPromptMaxTags(): number {
  const n = Number(process.env.AI_TAGGING_MAX_TAGS);
  return Number.isFinite(n) && n > 0 ? n : 5;
}

/**
 * Render the vocabulary for the prompt. With a facet map it's grouped by kind
 * (so the model sees the structure and covers each axis); without one it falls
 * back to a flat comma list. Tags with no facet land under "Sonstiges".
 */
function renderVocabulary(
  vocabulary: RankedTag[],
  facetMap: Record<string, string>,
): string {
  if (vocabulary.length === 0) return "(noch keine vorhandenen Schlagwörter)";
  if (Object.keys(facetMap).length === 0)
    return vocabulary.map((v) => v.tag).join(", ");

  const groups = new Map<string, string[]>();
  for (const v of vocabulary) {
    const facet = facetMap[v.tag] ?? "Sonstiges";
    (groups.get(facet) ?? groups.set(facet, []).get(facet)!).push(v.tag);
  }
  const facetOrder = FACET_ORDER as readonly string[];
  const order = [
    ...facetOrder,
    ...[...groups.keys()].filter((f) => !facetOrder.includes(f)),
  ];
  return order
    .filter((f) => groups.get(f)?.length)
    .map((f) => `${f}: ${groups.get(f)!.join(", ")}`)
    .join("\n");
}

export function buildUserMessage(
  books: BookTagInput[],
  vocabulary: RankedTag[],
  maxTags: number,
  candidates: Record<string, SourcedTag[]> = {},
  examples: Record<string, TagExample[]> = {},
  facetMap: Record<string, string> = {},
  styleProfile = "",
): string {
  const vocabList = renderVocabulary(vocabulary, facetMap);

  const bookList = books.map((b) => ({
    ref: b.ref,
    title: b.title,
    subtitle: b.subtitle,
    author: b.author,
    summary: b.summary,
    existingTopics: sanitizeTopicList(b.topics),
    publisher: b.publisherName,
    year: b.publisherDate,
    minAge: b.minAge,
    maxAge: b.maxAge,
    // Grounded candidates with provenance — the model should lean on these.
    candidates: (candidates[b.ref] ?? []).map((c) => `${c.tag} (${c.source})`),
    // Worked examples: similar books already tagged in THIS library.
    aehnlicheBuecher: (examples[b.ref] ?? []).map((e) => ({
      titel: e.title,
      autor: e.author,
      tags: e.tags,
    })),
  }));

  return [
    `Maximale Schlagwörter pro Buch: ${maxTags}`,
    ...(styleProfile ? ["", styleProfile] : []),
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
 * tokens per tag plus a per-book envelope. The base term is deliberately
 * generous: newer models (Sonnet 5+) run adaptive thinking by default and
 * those thinking tokens count against max_tokens — a JSON-only budget
 * intermittently truncates there. max_tokens is a cap, not a cost, so the
 * headroom is free on models that don't think.
 */
export function computeMaxOutputTokens(
  bookCount: number,
  maxTags: number,
): number {
  return Math.min(8192, 2048 + bookCount * (maxTags * 12 + 24));
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
