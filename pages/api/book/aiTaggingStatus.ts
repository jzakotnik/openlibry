import { isAiTaggingEnabled } from "@/lib/ai-tagging";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Reports whether AI tag suggestions are available (i.e. a provider key is
 * configured). Lets client-only pages like the batch scanner decide whether to
 * render the "Tag all" action without exposing the key. Auth-gated by proxy.ts.
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ enabled: boolean } | { result: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end(`${req.method} Not Allowed`);
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ enabled: isAiTaggingEnabled() });
}
