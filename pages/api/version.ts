// pages/api/version.ts
import type { NextApiRequest, NextApiResponse } from "next";

interface VersionResponse {
  version: string;
  name: string;
}

interface ErrorResponse {
  error: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<VersionResponse | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Dynamic import to handle potential file read issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const packageJson = require("../../package.json");

    if (!packageJson.version) {
      return res
        .status(500)
        .json({ error: "Version not found in package.json" });
    }

    return res.status(200).json({
      version: packageJson.version,
      name: packageJson.name || "openlibry",
    });
  } catch (error) {
    console.error("Error reading package.json:", error);
    return res
      .status(500)
      .json({ error: "Failed to retrieve version information" });
  }
}
