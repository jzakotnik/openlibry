import {
  countUser,
  getAllUsersBySchoolGrade,
  getAllUsersOrderById,
  getUser,
  getUsersInIdRange,
  getUsersInIdRangeForSchoolgrade,
} from "@/entities/user";
import { chunkArray } from "@/lib/utils/chunkArray";
import { resolveCustomPath } from "@/lib/utils/customPath";
import { UserLabelConfig } from "@/lib/utils/userLabelConfig";
import { loadUserLabelConfig } from "@/lib/utils/userLabelConfigServer";
import ReactPDF, {
  Document,
  Page,
  Image as PdfImage,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import bwipjs from "bwip-js";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

import { prisma } from "@/entities/db";

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_BARCODE_MINCODELENGTH = 4;
const CUSTOM_DIR = path.join(process.cwd(), "database", "custom");

// =============================================================================
// Image loading (per-request)
// =============================================================================

interface ImageData {
  src: string | null; // base64 data URI, e.g. "data:image/jpeg;base64,..."
}

/**
 * Checks whether a JPEG buffer is a progressive JPEG.
 * pdfkit (used by react-pdf) only supports baseline JPEGs.
 * Progressive JPEGs cause the "Unknown version" error.
 */
function isProgressiveJpeg(buffer: Buffer): boolean {
  // Scan for SOF2 marker (0xFFC2) which indicates progressive JPEG
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === 0xff && buffer[i + 1] === 0xc2) {
      return true;
    }
  }
  return false;
}

function loadLabelImage(imageFilename: string): ImageData {
  const tryLoad = (filePath: string): ImageData | null => {
    if (!fs.existsSync(filePath)) {
      console.log(`[userlabels] Not found: ${filePath}`);
      return null;
    }
    try {
      const buffer = fs.readFileSync(filePath);
      const ext = filePath.split(".").pop()?.toLowerCase();
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";

      // Warn if progressive JPEG — pdfkit will fail silently or with "Unknown version"
      if (mimeType === "image/jpeg" && isProgressiveJpeg(buffer)) {
        console.error(
          `[userlabels] WARNING: "${filePath}" is a PROGRESSIVE JPEG. ` +
            `pdfkit only supports baseline JPEGs. ` +
            `Please re-save the image as a baseline (standard) JPEG in any image editor.`,
        );
      }

      const base64 = buffer.toString("base64");
      const src = `data:${mimeType};base64,${base64}`;
      console.log(
        `[userlabels] Loaded: ${filePath} (${buffer.length} bytes, ${mimeType})`,
      );
      return { src };
    } catch (e) {
      console.warn(`[userlabels] Could not read: ${filePath}`, e);
      return null;
    }
  };

  // 1. Uploaded file in database/custom/
  for (const ext of ["jpg", "jpeg", "png"]) {
    const p = path.join(CUSTOM_DIR, `userlabel-background.${ext}`);
    const result = tryLoad(p);
    if (result) return result;
  }

  // 2. resolveCustomPath (database/custom/ -> public/)
  try {
    const resolvedPath = resolveCustomPath(imageFilename);
    const result = tryLoad(resolvedPath);
    if (result) return result;
  } catch (e) {
    console.warn(
      `[userlabels] resolveCustomPath failed for "${imageFilename}":`,
      e,
    );
  }

  // 3. public/ directly
  const publicPath = path.join(process.cwd(), "public", imageFilename);
  const result = tryLoad(publicPath);
  if (result) return result;

  console.error(`[userlabels] No usable image found for "${imageFilename}".`);
  return { src: null };
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  pageContainer: {
    flexDirection: "column",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
});

// =============================================================================
// Helper: replace User.* placeholders with actual values
// =============================================================================

function replacePlaceholder(text: string, user: any): string {
  try {
    let result = text;
    while (result.includes("User.")) {
      const token = result.split(" ").find((item) => item.includes("User."));
      if (!token) break;
      const propertyName = token.split(".")[1] as keyof any;
      const userValue = user[propertyName];
      result = result.replaceAll(
        token,
        userValue != null ? String(userValue) : "",
      );
    }
    return result;
  } catch (error) {
    console.error("[userlabels] Error replacing placeholder:", error);
    return "Configuration error";
  }
}

// =============================================================================
// Helper: convert a "75%" string to cm given the total dimension in cm.
// react-pdf / yoga does not reliably resolve % on absolutely positioned
// children, so we convert everything to explicit cm values.
// Non-percentage values (e.g. "2cm") are passed through unchanged.
// =============================================================================

function pctToCm(value: string, totalCm: number): string {
  const trimmed = value.trim();
  if (trimmed.endsWith("%")) {
    const num = parseFloat(trimmed);
    if (!isNaN(num)) {
      return (num / 100) * totalCm + "cm";
    }
  }
  return trimmed; // already "Xcm" or similar
}

// =============================================================================
// Generate text lines for a single label
// =============================================================================

function generateInfolines(user: any, config: UserLabelConfig) {
  const { widthCm, heightCm } = config.label;
  return config.lines.map((line, index) => {
    const text = replacePlaceholder(line.text, user);
    return (
      <Text
        key={`${user.id}-line-${index}`}
        style={
          {
            position: "absolute",
            top: pctToCm(line.top, heightCm),
            left: pctToCm(line.left, widthCm),
            color: line.color,
            fontSize: line.fontSize,
          } as any
        }
      >
        {text}
      </Text>
    );
  });
}

// =============================================================================
// Generate barcode image
// =============================================================================

async function generateBarcode(id: string, config: UserLabelConfig) {
  if (!config.barcode.enabled) return null;

  const minLength = process.env.BARCODE_MINCODELENGTH
    ? parseInt(process.env.BARCODE_MINCODELENGTH)
    : DEFAULT_BARCODE_MINCODELENGTH;

  const barId = id.padStart(minLength, "0");

  try {
    const png = await bwipjs.toBuffer({
      bcid: "code128",
      text: barId,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });

    const { widthCm, heightCm } = config.label;

    return (
      <PdfImage
        src={"data:image/png;base64," + png.toString("base64")}
        style={{
          position: "absolute",
          top: pctToCm(config.barcode.top, heightCm),
          left: pctToCm(config.barcode.left, widthCm),
          width: config.barcode.width,
          height: config.barcode.height,
        }}
      />
    );
  } catch (error) {
    console.error(`[userlabels] Barcode error for ID ${id}:`, error);
    return null;
  }
}

// =============================================================================
// Generate all label elements
// =============================================================================

async function generateLabels(
  users: Array<any>,
  config: UserLabelConfig,
  imageData: ImageData,
) {
  const { grid, label } = config;
  const labelsPerPage = grid.columns * grid.rows;

  return Promise.all(
    users.map(async (user: any, i: number) => {
      const pageIndex = i % labelsPerPage;
      const col = Math.floor(pageIndex / grid.rows);
      const row = pageIndex % grid.rows;

      const leftCm =
        grid.marginLeftCm + col * (label.widthCm + grid.spacingHCm);
      const topCm = grid.marginTopCm + row * (label.heightCm + grid.spacingVCm);

      const infolines = generateInfolines(user, config);
      const barcode = await generateBarcode(user.id!.toString(), config);

      console.log(
        `[userlabels] Rendering label for user ${user.id}: ` +
          `pos=(${leftCm.toFixed(2)}cm, ${topCm.toFixed(2)}cm) ` +
          `size=(${label.widthCm}cm x ${label.heightCm}cm) ` +
          `image=${imageData.src ? "data URI (" + imageData.src.length + " chars)" : "NULL"}`,
      );

      return (
        // Outer View: absolutely placed on the page at the grid position
        <View
          key={user.id!}
          style={{
            position: "absolute",
            left: leftCm + "cm",
            top: topCm + "cm",
            width: label.widthCm + "cm",
            height: label.heightCm + "cm",
            overflow: "hidden",
            border: label.showBorder ? "1pt dashed #aaaaaa" : undefined,
          }}
        >
          {/* Background image: normal flow, fills full label size */}
          {imageData.src && (
            <PdfImage
              src={imageData.src}
              style={{
                width: label.widthCm + "cm",
                height: label.heightCm + "cm",
              }}
            />
          )}

          {/* Overlay View: sits on top of the image, same size, for text + barcode */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: label.widthCm + "cm",
              height: label.heightCm + "cm",
            }}
          >
            {infolines}
            {barcode}
          </View>
        </View>
      );
    }),
  );
}

// =============================================================================
// Create PDF document
// =============================================================================

async function createUserPDF(
  users: Array<any>,
  config: UserLabelConfig,
  imageData: ImageData,
) {
  const labelsPerPage = config.grid.columns * config.grid.rows;
  const labels = await generateLabels(users, config, imageData);
  const pages = chunkArray(labels, labelsPerPage);

  console.log(
    `[userlabels] Generating PDF: ${users.length} users, ${labelsPerPage} per page (${config.grid.columns}×${config.grid.rows})`,
  );

  return ReactPDF.renderToStream(
    <Document>
      {pages.map((chunk: any, i: number) => (
        <Page
          wrap
          key={i}
          size="A4"
          style={{ flexDirection: "column", backgroundColor: "#FFFFFF" }}
        >
          <View key={`page-${i}`} style={styles.pageContainer}>
            {chunk}
          </View>
        </Page>
      ))}
    </Document>,
  );
}

// =============================================================================
// API Handler
// =============================================================================

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).end(`${req.method} Not Allowed`);
  }

  console.log("[userlabels] PDF generation requested");

  try {
    // Load config per-request: JSON file → env vars → defaults
    const config = loadUserLabelConfig();

    // ---- DIAGNOSTIC LOGGING ----
    console.log("[userlabels] process.cwd():", process.cwd());
    console.log("[userlabels] config.label.image:", config.label.image);
    console.log(
      "[userlabels] config.label.widthCm:",
      config.label.widthCm,
      "heightCm:",
      config.label.heightCm,
    );
    console.log("[userlabels] config.grid:", JSON.stringify(config.grid));
    console.log("[userlabels] config.lines:", JSON.stringify(config.lines));

    // List database/custom/ contents
    try {
      const customDir = path.join(process.cwd(), "database", "custom");
      if (fs.existsSync(customDir)) {
        const files = fs.readdirSync(customDir);
        console.log("[userlabels] database/custom/ contents:", files);
      } else {
        console.log("[userlabels] database/custom/ does NOT exist");
      }
    } catch (e) {
      console.log("[userlabels] Could not list database/custom/:", e);
    }

    // List public/ contents (first level)
    try {
      const publicDir = path.join(process.cwd(), "public");
      const files = fs.readdirSync(publicDir);
      console.log("[userlabels] public/ contents:", files);
    } catch (e) {
      console.log("[userlabels] Could not list public/:", e);
    }
    // ---- END DIAGNOSTIC ----

    const imageData = loadLabelImage(config.label.image);
    console.log(
      "[userlabels] Image loaded:",
      imageData.src
        ? "data URI, length=" + imageData.src.length
        : "NULL - no image found",
    );

    // -------------------------------------------------------------------------
    // User selection (four modes)
    // -------------------------------------------------------------------------
    let printableUsers: any[] | undefined;

    if ("start" in req.query || "schoolGrade" in req.query) {
      const users =
        "schoolGrade" in req.query
          ? ((await getAllUsersBySchoolGrade(
              prisma,
              req.query.schoolGrade as string,
            )) as any[])
          : ((await getAllUsersOrderById(prisma)) as any[]);

      const startPos =
        "start" in req.query ? parseInt(req.query.start as string) : 0;
      const endPos =
        "end" in req.query ? parseInt(req.query.end as string) : users.length;

      printableUsers = users.reverse().slice(startPos, endPos);
      console.log(
        `[userlabels] By position ${startPos}–${endPos}: ${printableUsers.length} users`,
      );
    } else if ("startId" in req.query) {
      let startId = parseInt(req.query.startId as string) || 0;
      let endId =
        "endId" in req.query
          ? parseInt(req.query.endId as string)
          : await countUser(prisma);

      if (startId > endId) {
        [startId, endId] = [endId, startId];
        console.log("[userlabels] Swapped startId/endId (were reversed)");
      }

      printableUsers = (
        "schoolGrade" in req.query
          ? await getUsersInIdRangeForSchoolgrade(
              prisma,
              startId,
              endId,
              req.query.schoolGrade as string,
            )
          : await getUsersInIdRange(prisma, startId, endId)
      ) as any[];

      console.log(
        `[userlabels] By ID range ${startId}–${endId}: ${printableUsers?.length} users`,
      );
    } else if ("id" in req.query) {
      printableUsers = [];
      const user = await getUser(prisma, parseInt(req.query.id as string));
      if (user) printableUsers.push(user as any);
      console.log(`[userlabels] Single user ID: ${req.query.id}`);
    } else {
      printableUsers = (await getAllUsersOrderById(prisma)) as any[];
      console.log(`[userlabels] All users: ${printableUsers?.length}`);
    }

    if (!printableUsers || printableUsers.length === 0) {
      return res
        .status(400)
        .json({ data: "ERROR: No users match search criteria" });
    }

    const pdfStream = await createUserPDF(printableUsers, config, imageData);
    res.writeHead(200, { "Content-Type": "application/pdf" });
    pdfStream.pipe(res);
  } catch (error) {
    console.error("[userlabels] Error generating PDF:", error);
    res.status(500).json({ data: "ERROR: " + error });
  }
}
