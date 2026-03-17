/**
 * GET  /api/labels/templates         — list all templates
 * GET  /api/labels/templates?id=...  — get a single template
 * POST /api/labels/templates         — save/update a template
 */

import {
  getTemplate,
  listTemplates,
  saveTemplate,
} from "@/lib/labels/labelConfig";
import type { LabelTemplate } from "@/lib/labels/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET": {
        // Single template by ID
        if (req.query.id) {
          const id = req.query.id as string;
          const template = getTemplate(id);
          if (!template) {
            return res
              .status(404)
              .json({ error: `Template "${id}" not found` });
          }
          return res.status(200).json(template);
        }

        // List all templates
        const templates = listTemplates();
        return res.status(200).json(templates);
      }

      case "POST": {
        const template = req.body as LabelTemplate;

        // Validate required fields
        if (!template.id || !template.name || !template.fields) {
          return res.status(400).json({
            error: "Template must include id, name, sheetConfigId, and fields",
          });
        }

        // Validate field content values
        const validContents = [
          "title",
          "subtitle",
          "author",
          "id",
          "barcode",
          "school",
          "topics",
          "none",
        ];
        const fieldKeys = [
          "spine",
          "horizontal1",
          "horizontal2",
          "horizontal3",
        ] as const;
        for (const key of fieldKeys) {
          const field = template.fields[key];
          if (!field) {
            return res
              .status(400)
              .json({ error: `Missing field configuration for "${key}"` });
          }
          if (!validContents.includes(field.content)) {
            return res.status(400).json({
              error: `Invalid content "${field.content}" for field "${key}". Valid: ${validContents.join(", ")}`,
            });
          }
        }

        // Sanitize ID (filesystem safe)
        template.id = template.id
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "-")
          .replace(/-+/g, "-");

        saveTemplate(template);
        return res.status(200).json({ success: true, template });
      }

      default:
        return res.status(405).end(`${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Error in templates API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
