import Anthropic from "@anthropic-ai/sdk";
import type { AiTaggingService, BookTagInput, RankedTag } from "./types";

// Tagging is high-volume, latency-sensitive classification — Haiku 4.5 is the
// right tier, and it supports temperature 0 + structured JSON output, which is
// what makes the AI step reproducible. Overridable for deployments that want a
// different model.
const MODEL = process.env.AI_TAGGING_MODEL || "claude-haiku-4-5";

const SYSTEM_PROMPT = [
  "Du bist die Assistenz einer Schulbibliothek und vergibst Schlagwörter (Tags)",
  "für Bücher. Du erhältst eine Liste von Büchern und eine Liste der bereits in",
  "der Bibliothek verwendeten Schlagwörter.",
  "",
  "Regeln:",
  "- Schlage pro Buch höchstens die angegebene Anzahl Schlagwörter vor.",
  "- Bevorzuge stark Schlagwörter aus der vorhandenen Liste.",
  "- Erfinde nur dann ein neues Schlagwort, wenn kein vorhandenes passt.",
  "- Schreibe Schlagwörter in derselben Sprache wie die vorhandene Liste.",
  "- Schlagwörter sind kurze Substantive oder Nominalphrasen, kein Satz.",
  "- Verwende niemals ein Semikolon in einem Schlagwort.",
].join("\n");

/** JSON schema constraining the model to a parseable per-book tag list. */
const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          ref: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["ref", "tags"],
      },
    },
  },
  required: ["results"],
} as const;

function buildUserMessage(
  books: BookTagInput[],
  vocabulary: RankedTag[],
  maxTags: number,
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
  }));

  return [
    `Maximale Schlagwörter pro Buch: ${maxTags}`,
    "",
    "Vorhandene Schlagwörter der Bibliothek (bevorzugen):",
    vocabList,
    "",
    "Bücher (als JSON):",
    JSON.stringify(bookList, null, 2),
  ].join("\n");
}

export const AnthropicService: AiTaggingService = {
  name: "Anthropic",

  async suggest(books, vocabulary) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // maxTags is enforced deterministically in postProcess; we still pass it so
    // the model aims for the right count.
    const maxTags = Number(process.env.AI_TAGGING_MAX_TAGS) || 5;

    // Budget output by batch size so a large batch's JSON isn't truncated
    // (truncation makes it unparseable and loses every book's tags). Roughly
    // ~12 tokens per tag plus per-book envelope, with a floor for tiny batches.
    const maxOutputTokens = Math.min(
      8192,
      512 + books.length * (maxTags * 12 + 24),
    );

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxOutputTokens,
      temperature: 0, // determinism — same input yields the same proposals
      system: SYSTEM_PROMPT,
      output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
      messages: [
        {
          role: "user",
          content: buildUserMessage(books, vocabulary, maxTags),
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return {};

    let parsed: { results?: Array<{ ref: string; tags: string[] }> };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return {};
    }

    const out: Record<string, string[]> = {};
    for (const r of parsed.results ?? []) {
      if (r && typeof r.ref === "string" && Array.isArray(r.tags)) {
        out[r.ref] = r.tags.filter((t): t is string => typeof t === "string");
      }
    }
    return out;
  },
};
