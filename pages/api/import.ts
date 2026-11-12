import { importHandler } from "@/lib/spreadsheet/handlers";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // bump as needed
    },
  },
};

/** POST /api/import — receives rows parsed in the browser (format-agnostic). */
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).end(`${req.method} Not Allowed`);
  return importHandler(req, res);
}
