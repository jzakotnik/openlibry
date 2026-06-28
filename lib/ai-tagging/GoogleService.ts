import { GoogleGenAI, Type } from "@google/genai";
import {
  buildUserMessage,
  computeMaxOutputTokens,
  getPromptMaxTags,
  parseTagResults,
  SYSTEM_PROMPT,
} from "./prompt";
import type { AiTaggingService } from "./types";

// Flash tier is the right cost/latency point for high-volume classification.
// Overridable; kept separate from AI_TAGGING_MODEL so an Anthropic model name
// can't leak into the Google call.
const MODEL = process.env.GOOGLE_AI_TAGGING_MODEL || "gemini-2.5-flash";

/** Response schema constraining Gemini to a parseable per-book tag list. */
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    results: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ref: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["ref", "tags"],
      },
    },
  },
  required: ["results"],
};

export const GoogleService: AiTaggingService = {
  name: "Google",

  async suggest(books, vocabulary, candidates, examples) {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // maxTags is enforced deterministically in reconcile; we still pass it so
    // the model aims for the right count.
    const maxTags = getPromptMaxTags();

    const response = await client.models.generateContent({
      model: MODEL,
      contents: buildUserMessage(
        books,
        vocabulary,
        maxTags,
        candidates,
        examples,
      ),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0, // determinism — same input yields the same proposals
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        maxOutputTokens: computeMaxOutputTokens(books.length, maxTags),
        // Tagging needs no chain-of-thought; disabling thinking keeps the call
        // fast/cheap and the token budget spent on the JSON answer.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    return parseTagResults(response.text);
  },
};
