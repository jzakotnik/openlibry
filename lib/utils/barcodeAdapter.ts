/**
 * Configurable barcode adapter.
 *
 * Some libraries put a longer code on their labels than the plain media id
 * (e.g. the SBC standard: `$` + identifier + base-32 number + `%`). The
 * adapter turns such a scanned/typed code into the media id OpenLibry stores.
 *
 * It is a list of steps run in order. If no step list is configured, or any
 * step does not apply to the input, the input is returned unchanged, so
 * normal searches and plain id/ISBN scans are never affected.
 *
 * Configuration: NEXT_PUBLIC_BARCODE_ADAPTER, either a preset name ("sbc")
 * or a JSON array of steps, e.g.
 *   [{"type":"match","pattern":"^LIB-(\\d+)$"}]
 */

export type BarcodeStep =
  /** Input must match; capture group 1 (or the whole match) becomes the value. */
  | { type: "match"; pattern: string; flags?: string }
  | { type: "slice"; start: number; end?: number }
  | { type: "stripPrefix"; value: string }
  | { type: "stripSuffix"; value: string }
  /** Parse the value as a number in the given base (2-36), output decimal. */
  | { type: "fromBase"; base: number }
  /** Integer-divide a decimal value, e.g. 10 drops a trailing check digit. */
  | { type: "divide"; by: number }
  /**
   * Validate an EAN/UPC-style check digit (last digit) of a decimal value.
   * Fails (adapter skipped) if the check digit is wrong.
   */
  | { type: "eanCheck" }
  | { type: "trimLeadingZeros" };

export const BARCODE_PRESETS: Record<string, BarcodeStep[]> = {
  /**
   * SBC standard (https://sbc-standard.de/): $ + 6 char identifier + 6 char
   * base-32 barcode number + %. The number has 9 decimal digits: 8-digit item
   * id + EAN check digit.
   */
  sbc: [
    { type: "match", pattern: "^\\$[0-9A-V]{6}([0-9A-V]{6})%$", flags: "i" },
    { type: "fromBase", base: 32 },
    { type: "eanCheck" },
    { type: "divide", by: 10 },
  ],
};

function eanCheckValid(digits: string): boolean {
  if (!/^\d{2,}$/.test(digits)) return false;
  const body = digits.slice(0, -1);
  let sum = 0;
  // Weights 3,1,3,1... counted from the right of the body.
  for (let i = 0; i < body.length; i++) {
    const d = Number(body[body.length - 1 - i]);
    sum += i % 2 === 0 ? d * 3 : d;
  }
  return (10 - (sum % 10)) % 10 === Number(digits[digits.length - 1]);
}

function applyStep(value: string, step: BarcodeStep): string | null {
  switch (step.type) {
    case "match": {
      const m = new RegExp(step.pattern, step.flags).exec(value);
      if (!m) return null;
      return m[1] ?? m[0];
    }
    case "slice":
      return value.slice(step.start, step.end);
    case "stripPrefix":
      return value.startsWith(step.value)
        ? value.slice(step.value.length)
        : null;
    case "stripSuffix":
      return value.endsWith(step.value)
        ? value.slice(0, value.length - step.value.length)
        : null;
    case "fromBase": {
      if (!(step.base >= 2 && step.base <= 36)) return null;
      const n = parseInt(value, step.base);
      return Number.isSafeInteger(n) ? String(n) : null;
    }
    case "divide": {
      if (!/^\d+$/.test(value) || !(step.by > 0)) return null;
      return String(Math.floor(Number(value) / step.by));
    }
    case "eanCheck":
      return eanCheckValid(value) ? value : null;
    case "trimLeadingZeros":
      return value.replace(/^0+(?=\d)/, "");
    default:
      return null;
  }
}

/**
 * Parse an adapter config (preset name or JSON step array). Returns an empty
 * list for missing/invalid config so a typo can never break search.
 */
export function parseBarcodeAdapterConfig(
  config: string | undefined | null,
): BarcodeStep[] {
  const raw = (config ?? "").trim();
  if (!raw) return [];
  const preset = BARCODE_PRESETS[raw.toLowerCase()];
  if (preset) return preset;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BarcodeStep[]) : [];
  } catch {
    return [];
  }
}

/** Run the steps; returns the original (trimmed) input if any step fails. */
export function normalizeScanCode(
  raw: string,
  steps: BarcodeStep[] = getConfiguredSteps(),
): string {
  const input = raw.trim();
  if (steps.length === 0 || !input) return raw;
  try {
    let value: string = input;
    for (const step of steps) {
      const next = applyStep(value, step);
      if (next === null || next === "") return raw;
      value = next;
    }
    return value;
  } catch {
    return raw; // e.g. invalid regex in config
  }
}

let cachedSteps: BarcodeStep[] | null = null;
function getConfiguredSteps(): BarcodeStep[] {
  if (cachedSteps === null) {
    // Must be a direct property access so Next inlines it into the client bundle.
    cachedSteps = parseBarcodeAdapterConfig(
      process.env.NEXT_PUBLIC_BARCODE_ADAPTER,
    );
  }
  return cachedSteps;
}
