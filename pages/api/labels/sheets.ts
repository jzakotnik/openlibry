/**
 * GET /api/labels/sheets
 * GET /api/labels/sheets?id=zweckform-3474
 *
 * List all sheet configurations, or get a single one by ID.
 */

import { getSheetConfig, listSheetConfigs } from "@/lib/labels/labelConfig";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).end(`${req.method} Not Allowed`);
  }

  try {
    // Single sheet by ID
    if (req.query.id) {
      const id = req.query.id as string;
      const sheet = getSheetConfig(id);
      if (!sheet) {
        return res
          .status(404)
          .json({ error: `Sheet config "${id}" not found` });
      }
      return res.status(200).json(sheet);
    }

    // List all sheets
    const sheets = listSheetConfigs();
    return res.status(200).json(sheets);
  } catch (error) {
    console.error("Error loading sheet configs:", error);
    return res
      .status(500)
      .json({ error: "Failed to load sheet configurations" });
  }
}
