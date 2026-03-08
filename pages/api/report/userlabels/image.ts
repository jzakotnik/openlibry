import { resolveCustomPath } from "@/lib/utils/customPath";
import formidable from "formidable";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const CUSTOM_DIR = path.join(process.cwd(), "database", "custom");
const UPLOADED_FILENAME_BASE = "userlabel-background";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      // Serve the current label background image.
      // Priority: uploaded userlabel-background.{ext} → resolveCustomPath fallback.
      let imagePath: string | null = null;
      let mimeType = "image/jpeg";

      for (const ext of ["jpg", "jpeg", "png"]) {
        const candidate = path.join(
          CUSTOM_DIR,
          `${UPLOADED_FILENAME_BASE}.${ext}`,
        );
        if (fs.existsSync(candidate)) {
          imagePath = candidate;
          mimeType = ext === "png" ? "image/png" : "image/jpeg";
          break;
        }
      }

      if (!imagePath) {
        try {
          imagePath = resolveCustomPath("userlabeltemplate.jpg");
        } catch {
          return res.status(404).json({ error: "No label image found" });
        }
      }

      try {
        const stat = fs.statSync(imagePath);
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Length", stat.size);
        res.setHeader("Cache-Control", "no-cache, no-store");
        fs.createReadStream(imagePath).pipe(res);
      } catch {
        return res.status(404).json({ error: "Image not found" });
      }
      break;
    }

    case "POST": {
      if (!fs.existsSync(CUSTOM_DIR)) {
        fs.mkdirSync(CUSTOM_DIR, { recursive: true });
      }

      let savedFilename: string | null = null;

      try {
        await new Promise<void>((resolve, reject) => {
          const form = formidable({
            uploadDir: CUSTOM_DIR,
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024,
          });

          form.on("fileBegin", (_name, file) => {
            const originalExt = path
              .extname(file.originalFilename ?? "")
              .toLowerCase();
            const ext = [".jpg", ".jpeg", ".png"].includes(originalExt)
              ? originalExt
              : ".jpg";
            savedFilename = `${UPLOADED_FILENAME_BASE}${ext}`;
            file.filepath = path.join(CUSTOM_DIR, savedFilename);
          });

          form.on("error", reject);
          form.parse(req, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        return res.status(200).json({ success: true, filename: savedFilename });
      } catch (error) {
        console.error("[userlabels/image] Upload error:", error);
        return res.status(500).json({ error: "Upload failed: " + error });
      }
    }

    default:
      return res.status(405).end(`${req.method} Not Allowed`);
  }
}
