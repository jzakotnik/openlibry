import { UserType } from "@/entities/UserType";
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
import ReactPDF, {
  Canvas,
  Document,
  Page,
  Image as PdfImage,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import bwipjs from "bwip-js";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/entities/db";
var fs = require("fs");

// =============================================================================
// Default configuration values (matching documentation in environment-variables.md)
// =============================================================================
const DEFAULT_USERLABEL_IMAGE = "userlabeltemplate.jpg";
const DEFAULT_USERLABEL_WIDTH = "42vw";
const DEFAULT_USERLABEL_PER_PAGE = 6;
const DEFAULT_USERLABEL_BARCODE: [string, string, string, string, string] = [
  "80%",
  "63%",
  "3cm",
  "1.6cm",
  "code128",
];
const DEFAULT_BARCODE_MINCODELENGTH = 4;

// Default user label lines if none configured in environment
const DEFAULT_USERLABEL_LINES: Array<
  [string, string, string, string, string, string, number]
> = [
  ["User.firstName User.lastName", "75%", "3%", "35vw", "2pt", "black", 14],
  ["User.schoolGrade", "80%", "3%", "35vw", "2pt", "black", 12],
];

// =============================================================================
// Configuration loading with fallbacks
// =============================================================================

// Load background image with fallback and error handling
// Checks database/custom/ first, falls back to public/
const labelImagePath =
  process.env.USERID_LABEL_IMAGE || DEFAULT_USERLABEL_IMAGE;
let base64Image: string | null = null;
try {
  const resolvedImagePath = resolveCustomPath(labelImagePath);
  base64Image = fs.readFileSync(resolvedImagePath, { encoding: "base64" });
  console.log(`User label background loaded: ${resolvedImagePath}`);
} catch (error) {
  console.warn(
    `Warning: Could not load user label image "${labelImagePath}" ` +
      `in database/custom/ or public/. Please ensure the file exists or set USERID_LABEL_IMAGE in your .env file.`,
  );
}

// Barcode settings: [top, left, width, height, barcode_type]
const BARCODE_SETTINGS: [string, string, string, string, string] | null =
  process.env.USERLABEL_BARCODE != null
    ? JSON.parse(process.env.USERLABEL_BARCODE)
    : DEFAULT_USERLABEL_BARCODE;

// Labels per page (typically 6 or 8)
const labelsPerPage: number =
  process.env.USERLABEL_PER_PAGE != null
    ? Number(process.env.USERLABEL_PER_PAGE)
    : DEFAULT_USERLABEL_PER_PAGE;

// Label width (CSS units: cm, px, vw)
const labelWidth: string =
  process.env.USERLABEL_WIDTH || DEFAULT_USERLABEL_WIDTH;

// Minimum barcode length (will be zero-padded)
const barcodeMinLength: number =
  process.env.BARCODE_MINCODELENGTH != null
    ? parseInt(process.env.BARCODE_MINCODELENGTH)
    : DEFAULT_BARCODE_MINCODELENGTH;

// =============================================================================
// Styles
// =============================================================================
const styles = StyleSheet.create({
  image: {
    width: labelWidth,
    height: "auto",
  },
  pageContainer: {
    flexDirection: "column",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
});

// =============================================================================
// Helper functions
// =============================================================================

/**
 * Get configured label lines from environment or use defaults.
 * Lines are sorted by their key name (USERLABEL_LINE_1, USERLABEL_LINE_2, etc.)
 */
const getLabelLineConfigs = (): Array<
  [string, string, string, string, string, string, number]
> => {
  const envLines = Object.entries(process.env)
    .filter(
      ([key, value]) => key.startsWith("USERLABEL_LINE_") && value != null,
    )
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([_, value]) => JSON.parse(value!));

  if (envLines.length > 0) {
    return envLines;
  }
  return DEFAULT_USERLABEL_LINES;
};

/**
 * Replace User.* placeholders with actual user data.
 * Example: "User.firstName User.lastName" -> "Max Mustermann"
 */
const replacePlaceholder = (text: string, user: UserType): string => {
  try {
    let result = text;
    while (result.includes("User.")) {
      const nextReplace = String(
        result.split(" ").find((item: string) => item.includes("User.")),
      );
      const propertyName = nextReplace.split(".")[1] as keyof UserType;
      const userValue = user[propertyName];
      result = result.replaceAll(
        nextReplace,
        userValue != null ? String(userValue) : "",
      );
    }
    return result;
  } catch (error) {
    console.error("Error replacing placeholder in user label:", error);
    return "Configuration error in environment";
  }
};

/**
 * Generate text lines for a user label based on configuration.
 */
const generateInfolines = (user: UserType) => {
  const lineConfigs = getLabelLineConfigs();

  return lineConfigs.map((valueArr, index) => {
    const replacement = replacePlaceholder(valueArr[0], user);
    const style = {
      position: "absolute",
      top: valueArr[1],
      left: valueArr[2],
      width: valueArr[3],
      margin: valueArr[4],
      color: valueArr[5],
      fontSize: valueArr[6],
    } as any;
    return (
      <Text key={`${user.id}-line-${index}`} style={style}>
        {replacement}
      </Text>
    );
  });
};

/**
 * Generate optional colorbar element.
 * Configuration: USERLABEL_SEPARATE_COLORBAR=[width, height, color]
 */
const colorbar = ({ id }: { id: number | string }) => {
  if (process.env.USERLABEL_SEPARATE_COLORBAR == null) {
    return null;
  }

  const colorbarConfig = JSON.parse(process.env.USERLABEL_SEPARATE_COLORBAR);
  if (colorbarConfig == null) {
    return null;
  }

  return (
    <Canvas
      key={`colorbar-${id}`}
      paint={(painterObject) =>
        painterObject
          .save()
          .rect(0, 0, colorbarConfig[0], colorbarConfig[1])
          .fill(colorbarConfig[2])
      }
    />
  );
};

/**
 * Generate barcode image for a user ID.
 */
const generateBarcode = async (id: string) => {
  if (BARCODE_SETTINGS == null) return null;

  // Pad the ID to minimum length with leading zeros
  const barId = id.padStart(barcodeMinLength, "0");

  try {
    const png = await bwipjs.toBuffer({
      bcid: BARCODE_SETTINGS[4], // Barcode type (e.g., 'code128')
      text: barId,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });

    return (
      <PdfImage
        src={"data:image/png;base64, " + png.toString("base64")}
        style={{
          position: "absolute",
          width: BARCODE_SETTINGS[2],
          height: BARCODE_SETTINGS[3],
          top: BARCODE_SETTINGS[0],
          left: BARCODE_SETTINGS[1],
        }}
      />
    );
  } catch (error) {
    console.error(`Error generating barcode for ID ${id}:`, error);
    return null;
  }
};

/**
 * Generate label elements for all users.
 */
const generateLabels = async (users: Array<UserType>) => {
  const allcodes = await Promise.all(
    users.map(async (u: UserType, i: number) => {
      // Calculate position on page (2 columns layout)
      const pos = {
        left: (i % labelsPerPage <= labelsPerPage / 2 - 1 ? 1 : 11) + "cm",
        top:
          (29 / (labelsPerPage / 2) + 0.5) * (i % (labelsPerPage / 2)) + "cm",
      };

      const infolines = generateInfolines(u);
      const barcode = await generateBarcode(u.id!.toString());

      return (
        <View
          key={u.id!}
          style={{
            position: "absolute",
            flexDirection: "column",
            left: pos.left,
            top: pos.top,
            width: "42vw",
            padding: 0,
            margin: 0,
          }}
        >
          <View
            style={{
              flexDirection: "column",
            }}
          >
            {base64Image && (
              <PdfImage
                key={`img-${u.id}`}
                style={styles.image}
                src={"data:image/jpg;base64, " + base64Image}
              />
            )}
            {colorbar({ id: u.id! })}
            {infolines}
            {barcode}
          </View>
        </View>
      );
    }),
  );
  return allcodes;
};

/**
 * Create PDF document with user labels.
 */
async function createUserPDF(users: Array<UserType>) {
  const barcodes = await generateLabels(users);
  console.log("Labels per page:", labelsPerPage);
  const barcodesSections = chunkArray(barcodes, labelsPerPage);

  const pdfstream = await ReactPDF.renderToStream(
    <Document>
      {barcodesSections.map((chunk: any, i: any) => (
        <Page
          wrap
          key={i}
          size="A4"
          style={{
            flexDirection: "column",
            backgroundColor: "#FFFFFF",
          }}
        >
          <View key={`page-${i}`} style={styles.pageContainer}>
            {chunk}
          </View>
        </Page>
      ))}
    </Document>,
  );

  return pdfstream;
}

// =============================================================================
// API Handler
// =============================================================================
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET":
      console.log("Printing user labels via API");
      try {
        // Four different ways to call:
        // - start & end: for last created users ordered by ID (with optional schoolGrade filter)
        // - startId & endId: for users in ID range (with optional schoolGrade filter)
        // - id: specific single user
        // - (no params): all users
        let printableUsers;

        if ("start" in req.query || "schoolGrade" in req.query) {
          // Filter by school grade and/or slice by position
          const users =
            "schoolGrade" in req.query
              ? ((await getAllUsersBySchoolGrade(
                  prisma,
                  req.query.schoolGrade as string,
                )) as any)
              : ((await getAllUsersOrderById(prisma)) as any);

          const startUserID = "start" in req.query ? req.query.start : "0";
          const endUserID =
            "end" in req.query ? req.query.end : String(users.length);

          printableUsers = users
            .reverse()
            .slice(
              parseInt(startUserID as string),
              parseInt(endUserID as string),
            );

          console.log(
            "Printing labels for users (by position):",
            startUserID,
            "to",
            endUserID,
            "count:",
            printableUsers.length,
          );
        } else if ("startId" in req.query) {
          // Filter by ID range
          let startId =
            "startId" in req.query ? parseInt(req.query.startId as string) : 0;
          let endId =
            "endId" in req.query
              ? parseInt(req.query.endId as string)
              : await countUser(prisma);

          // Swap if user mixed up start and end
          if (startId > endId) {
            console.log("Swapping startId and endId (were reversed)");
            const temp = endId;
            endId = startId;
            startId = temp;
          }

          printableUsers =
            "schoolGrade" in req.query
              ? ((await getUsersInIdRangeForSchoolgrade(
                  prisma,
                  startId,
                  endId,
                  req.query.schoolGrade as string,
                )) as any)
              : await getUsersInIdRange(prisma, startId, endId);

          console.log(
            "Printing labels for users (by ID range):",
            startId,
            "to",
            endId,
            "count:",
            printableUsers?.length,
          );
        } else if ("id" in req.query) {
          // Single user by ID
          printableUsers = new Array<any>();
          const user = await getUser(prisma, parseInt(req.query.id as string));
          if (user) {
            printableUsers.push(user);
          }
          console.log("Printing label for single user ID:", req.query.id);
        } else {
          // Default: print all users
          printableUsers = await getAllUsersOrderById(prisma);
          console.log(
            "Printing labels for all users, count:",
            printableUsers?.length,
          );
        }

        // Validate we have users to print
        if (!printableUsers) {
          return res.status(400).json({ data: "ERROR: Users not found" });
        }

        if (printableUsers.length === 0 || printableUsers[0] == null) {
          return res
            .status(400)
            .json({ data: "ERROR: No users match search criteria" });
        }

        // Generate and return PDF
        const labels = await createUserPDF(printableUsers);
        res.writeHead(200, {
          "Content-Type": "application/pdf",
        });
        labels.pipe(res);
      } catch (error) {
        console.error("Error generating user labels:", error);
        res.status(400).json({ data: "ERROR: " + error });
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
