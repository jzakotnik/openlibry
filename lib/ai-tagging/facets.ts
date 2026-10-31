import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI, Type } from "@google/genai";
import {
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import {
  ANTHROPIC_MODEL,
  FACETS,
  GOOGLE_MODEL,
  pickProvider,
  type Facet,
} from "./config";

/**
 * Semantic structuring of the (otherwise flat) tag vocabulary. An LLM assigns
 * each tag a facet once; the result is cached on disk and topped up
 * incrementally as new tags appear. The facets are then shown to the tagging
 * model as a grouped vocabulary, which teaches it the library's granularity
 * ("which Epoche? which Region? which Strömung?") far better than a flat list.
 *
 * The tags themselves stay a flat controlled list — this is metadata layered on
 * top, not a change to the vocabulary.
 *
 * Prod-safety: this is an advisory cache. Every disk and model operation fails
 * soft — a read-only filesystem, a missing key, or a provider outage degrades
 * to "no facets" (flat vocabulary), never an error in the tagging path. Writes
 * are atomic (temp file + rename) so a crash mid-write can't corrupt the cache,
 * and a cooldown prevents an outage from triggering a model call per request.
 */

const CACHE_PATH =
  process.env.AI_TAGGING_FACET_CACHE ||
  join(process.cwd(), "database", "custom", "ai-tag-facets.json");

const REQUEST_TIMEOUT_MS = 20_000;
const COOLDOWN_MS = 5 * 60_000; // after a failure, don't retry for this long

const SYSTEM_PROMPT = [
  "Du ordnest Schlagwörter einer Schulbibliothek jeweils GENAU EINER Kategorie",
  "zu. Erlaubte Kategorien (und nur diese):",
  "- Gattung: Art des Werks (Lyrik, Roman, Sachbuch, Drama, Biografie,",
  "  Anthologie, Ausstellungskatalog, Lexikon, Bilderbuch …).",
  "- Epoche: Zeit oder Periode (Antike, Mittelalter, Frühe Neuzeit,",
  "  18. Jahrhundert, 19. Jahrhundert, 20. Jahrhundert …).",
  "- Region: Ort, Land, Kultur (Deutschland, England, Berlin, Europa,",
  "  Altes Ägypten, Osmanisches Reich …).",
  "- Strömung: Stil oder literarisch-künstlerische Strömung (Romantik, Klassik,",
  "  Moderne, Symbolismus, Neue Sachlichkeit, Vormärz …).",
  "- Thema: inhaltliches Thema oder Motiv (Judentum, Exil, Krieg, Religion,",
  "  Mythologie, Antisemitismus, Nationalsozialismus, Frau …).",
  "- Sonstiges: passt in keine der obigen Kategorien.",
  "Verwende ausschließlich diese Kategorienamen, exakt so geschrieben.",
].join("\n");

const ANTHROPIC_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    assignments: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          tag: { type: "string" },
          facet: { type: "string", enum: [...FACETS] },
        },
        required: ["tag", "facet"],
      },
    },
  },
  required: ["assignments"],
} as const;

const GOOGLE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    assignments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tag: { type: Type.STRING },
          facet: { type: Type.STRING, enum: [...FACETS] },
        },
        required: ["tag", "facet"],
      },
    },
  },
  required: ["assignments"],
};

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("facet categorization timeout")), ms),
    ),
  ]);
}

function parseAssignments(text: string | undefined): Record<string, Facet> {
  if (!text) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== "object") return {};
  const arr = (parsed as { assignments?: unknown }).assignments;
  const out: Record<string, Facet> = {};
  if (!Array.isArray(arr)) return out;
  const allowed = new Set<string>(FACETS);
  for (const a of arr) {
    if (
      a &&
      typeof a.tag === "string" &&
      typeof a.facet === "string" &&
      allowed.has(a.facet)
    ) {
      out[a.tag.toLowerCase()] = a.facet as Facet;
    }
  }
  return out;
}

/** One categorization call for the given tags. Throws on provider/timeout error. */
async function classify(tags: string[]): Promise<Record<string, Facet>> {
  const provider = pickProvider();
  if (!provider) return {};
  const user =
    "Ordne jedes der folgenden Schlagwörter GENAU einer Kategorie zu:\n" +
    JSON.stringify(tags);
  const maxTokens = Math.min(4096, 200 + tags.length * 24);

  if (provider === "anthropic") {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: REQUEST_TIMEOUT_MS,
      maxRetries: 1,
    });
    const res = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      temperature: 0,
      system: SYSTEM_PROMPT,
      output_config: { format: { type: "json_schema", schema: ANTHROPIC_SCHEMA } },
      messages: [{ role: "user", content: user }],
    });
    const block = res.content.find((b) => b.type === "text");
    return parseAssignments(block?.type === "text" ? block.text : undefined);
  }

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await withTimeout(
    client.models.generateContent({
      model: GOOGLE_MODEL,
      contents: user,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: GOOGLE_SCHEMA,
        maxOutputTokens: maxTokens,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
    REQUEST_TIMEOUT_MS,
  );
  return parseAssignments(res.text);
}

// ── disk cache (in-memory mirror + atomic persistence) ──────────────────────

let mem: Record<string, Facet> | null = null;
let cooldownUntil = 0;
let inFlight: Promise<void> | null = null;

function loadCache(): Record<string, Facet> {
  if (mem) return mem;
  try {
    const obj = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
    mem = obj && typeof obj === "object" ? (obj as Record<string, Facet>) : {};
  } catch {
    mem = {}; // missing/unreadable cache → start empty
  }
  return mem;
}

function persistCache(map: Record<string, Facet>): void {
  try {
    mkdirSync(dirname(CACHE_PATH), { recursive: true });
    const tmp = `${CACHE_PATH}.tmp-${process.pid}`;
    writeFileSync(tmp, JSON.stringify(map, null, 2));
    renameSync(tmp, CACHE_PATH); // atomic on the same filesystem
  } catch {
    // Advisory cache only — a read-only/unwritable FS just means we recompute
    // next time. Never surface this to the tagging path.
  }
}

/**
 * Facet for each of `tags` (keyed by the original tag spelling). Uncategorized
 * tags are simply absent. Categorizes any new tags once (bounded, cached); a
 * failure leaves them absent and is not retried until the cooldown elapses.
 */
export async function getFacetMap(
  tags: string[],
): Promise<Record<string, Facet>> {
  const cache = loadCache();
  const missing = tags.filter((t) => !(t.toLowerCase() in cache));

  // Only one categorization call at a time: concurrent requests with the same
  // new tags would otherwise each fire a (paid) provider call. Others skip and
  // use the current cache; the in-flight call populates it for the next request.
  if (missing.length > 0 && Date.now() >= cooldownUntil && !inFlight) {
    inFlight = (async () => {
      try {
        const fresh = await classify(missing);
        if (Object.keys(fresh).length > 0) {
          for (const [k, v] of Object.entries(fresh)) cache[k] = v;
          persistCache(cache);
        }
        // Anything the model skipped (or a total failure) waits out the cooldown
        // rather than re-calling the provider on the very next request.
        if (Object.keys(fresh).length < missing.length) {
          cooldownUntil = Date.now() + COOLDOWN_MS;
        }
      } catch {
        cooldownUntil = Date.now() + COOLDOWN_MS;
      }
    })();
    try {
      await inFlight;
    } finally {
      inFlight = null;
    }
  }

  const out: Record<string, Facet> = {};
  for (const t of tags) {
    const f = cache[t.toLowerCase()];
    if (f) out[t] = f;
  }
  return out;
}
