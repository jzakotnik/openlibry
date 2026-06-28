import Anthropic from "@anthropic-ai/sdk";
import {
  buildUserMessage,
  computeMaxOutputTokens,
  getPromptMaxTags,
  parseTagResults,
  SYSTEM_PROMPT,
} from "./prompt";
import type { AiTaggingService } from "./types";

// Tagging is high-volume, latency-sensitive classification — Haiku 4.5 is the
// right tier, and it supports temperature 0 + structured JSON output, which is
// what makes the AI step reproducible. Overridable for deployments that want a
// different model.
const MODEL = process.env.AI_TAGGING_MODEL || "claude-haiku-4-5";

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

export const AnthropicService: AiTaggingService = {
  name: "Anthropic",

  async suggest(books, vocabulary, candidates, examples, facetMap, styleProfile) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // maxTags is enforced deterministically in reconcile; we still pass it so
    // the model aims for the right count.
    const maxTags = getPromptMaxTags();

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: computeMaxOutputTokens(books.length, maxTags),
      temperature: 0, // determinism — same input yields the same proposals
      system: SYSTEM_PROMPT,
      output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
      messages: [
        {
          role: "user",
          content: buildUserMessage(
            books,
            vocabulary,
            maxTags,
            candidates,
            examples,
            facetMap,
            styleProfile,
          ),
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return parseTagResults(textBlock?.type === "text" ? textBlock.text : undefined);
  },
};
