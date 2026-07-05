import Anthropic from "@anthropic-ai/sdk";
// Haiku 4.5 (the configured default) is the right tier for high-volume,
// latency-sensitive classification with structured JSON output. Model name
// lives in ./config so it can't diverge from the facet classifier's.
import { ANTHROPIC_MODEL as MODEL } from "./config";
import {
  buildUserMessage,
  computeMaxOutputTokens,
  getPromptMaxTags,
  parseTagResults,
  SYSTEM_PROMPT,
} from "./prompt";
import type { AiTaggingService } from "./types";

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

/**
 * Whether the configured model rejects sampling parameters. temperature 0
 * keeps repeated runs reproducible (the benchmark workflow depends on that),
 * but newer Anthropic models reject temperature with a 400 — so the first
 * rejection flips this flag and every call from then on omits it, instead of
 * an AI_TAGGING_MODEL upgrade permanently breaking the feature.
 */
let modelRejectsTemperature = false;

export const AnthropicService: AiTaggingService = {
  name: "Anthropic",

  async suggest(books, vocabulary, candidates, examples, facetMap, styleProfile) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // maxTags is enforced deterministically in reconcile; we still pass it so
    // the model aims for the right count.
    const maxTags = getPromptMaxTags();

    const params: Anthropic.MessageCreateParamsNonStreaming = {
      model: MODEL,
      max_tokens: computeMaxOutputTokens(books.length, maxTags),
      system: SYSTEM_PROMPT,
      output_config: {
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
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
    };

    let response;
    if (modelRejectsTemperature) {
      response = await client.messages.create(params);
    } else {
      try {
        response = await client.messages.create({ ...params, temperature: 0 });
      } catch (e) {
        if (
          e instanceof Anthropic.BadRequestError &&
          /temperature/i.test(e.message)
        ) {
          modelRejectsTemperature = true;
          response = await client.messages.create(params);
        } else {
          throw e;
        }
      }
    }

    const textBlock = response.content.find((b) => b.type === "text");
    return parseTagResults(textBlock?.type === "text" ? textBlock.text : undefined);
  },
};
