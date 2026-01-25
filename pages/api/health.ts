import { prisma } from "@/entities/db";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

// Health check types
type CheckStatus = "ok" | "warning" | "error";

interface CheckResult {
  status: CheckStatus;
  message: string;
  details?: Record<string, unknown>;
}

interface HealthCheckResponse {
  status: CheckStatus;
  timestamp: string;
  version?: string;
  checks: {
    database: CheckResult;
    data: CheckResult;
    folders: CheckResult;
    files: CheckResult;
  };
  environment: {
    nodeEnv: string;
    authEnabled: boolean;
  };
}

// Helper to check if a path exists and is accessible
function checkPath(
  filePath: string,
  type: "file" | "directory",
): { exists: boolean; readable: boolean; writable?: boolean } {
  try {
    const stats = fs.statSync(filePath);
    const isCorrectType =
      type === "file" ? stats.isFile() : stats.isDirectory();

    if (!isCorrectType) {
      return { exists: false, readable: false };
    }

    // Check read access
    let readable = true;
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
    } catch {
      readable = false;
    }

    // Check write access for directories
    let writable: boolean | undefined;
    if (type === "directory") {
      writable = true;
      try {
        fs.accessSync(filePath, fs.constants.W_OK);
      } catch {
        writable = false;
      }
    }

    return { exists: true, readable, writable };
  } catch {
    return { exists: false, readable: false };
  }
}

// Extract database path from DATABASE_URL
function getDatabasePath(): string {
  const dbUrl = process.env.DATABASE_URL || "file:./database/dev.db";
  // Handle both "file:./path" and "file:/path" formats
  const match = dbUrl.match(/^file:(\.\/)?(.+)$/);
  if (match) {
    const relativePath = match[2];
    // If it starts with /, it's absolute in Docker context
    if (relativePath.startsWith("/")) {
      return relativePath;
    }
    return path.join(process.cwd(), relativePath);
  }
  return path.join(process.cwd(), "database", "dev.db");
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse | { error: string }>,
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `${req.method} Not Allowed` });
  }

  const response: HealthCheckResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: "ok", message: "" },
      data: { status: "ok", message: "" },
      folders: { status: "ok", message: "" },
      files: { status: "ok", message: "" },
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || "development",
      authEnabled: process.env.AUTH_ENABLED === "true",
    },
  };

  // Try to read package.json for version
  try {
    const packagePath = path.join(process.cwd(), "package.json");
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
      response.version = packageJson.version;
    }
  } catch {
    // Version is optional, ignore errors
  }

  // 1. Check database connectivity
  const dbPath = getDatabasePath();
  const dbCheck = checkPath(dbPath, "file");

  if (!dbCheck.exists) {
    response.checks.database = {
      status: "error",
      message: "Datenbankdatei nicht gefunden",
      details: {
        path: dbPath,
        databaseUrl: process.env.DATABASE_URL,
      },
    };
    response.status = "error";
  } else if (!dbCheck.readable) {
    response.checks.database = {
      status: "error",
      message: "Datenbankdatei nicht lesbar (Berechtigungsfehler)",
      details: { path: dbPath },
    };
    response.status = "error";
  } else {
    // File exists and is readable, try to actually query
    try {
      await prisma.$queryRaw`SELECT 1`;
      response.checks.database = {
        status: "ok",
        message: "Datenbankverbindung erfolgreich",
        details: { path: dbPath },
      };
    } catch (error) {
      response.checks.database = {
        status: "error",
        message: "Datenbankverbindung fehlgeschlagen",
        details: {
          path: dbPath,
          error: error instanceof Error ? error.message : String(error),
        },
      };
      response.status = "error";
    }
  }

  // 2. Check if database has data (only if connection is ok)
  if (response.checks.database.status === "ok") {
    try {
      const [bookCount, userCount, loginUserCount] = await Promise.all([
        prisma.book.count(),
        prisma.user.count(),
        prisma.loginUser.count(),
      ]);

      const hasBooks = bookCount > 0;
      const hasUsers = userCount > 0;
      const hasLoginUsers = loginUserCount > 0;

      if (!hasBooks && !hasUsers) {
        response.checks.data = {
          status: "warning",
          message: "Datenbank ist leer - keine Bücher oder Nutzer vorhanden",
          details: {
            books: bookCount,
            users: userCount,
            loginUsers: loginUserCount,
          },
        };
        if (response.status === "ok") {
          response.status = "warning";
        }
      } else if (!hasLoginUsers && process.env.AUTH_ENABLED === "true") {
        response.checks.data = {
          status: "warning",
          message:
            "Keine Login-Benutzer vorhanden, aber Authentifizierung ist aktiviert",
          details: {
            books: bookCount,
            users: userCount,
            loginUsers: loginUserCount,
          },
        };
        if (response.status === "ok") {
          response.status = "warning";
        }
      } else {
        response.checks.data = {
          status: "ok",
          message: "Daten vorhanden",
          details: {
            books: bookCount,
            users: userCount,
            loginUsers: loginUserCount,
          },
        };
      }
    } catch (error) {
      response.checks.data = {
        status: "error",
        message: "Fehler beim Abfragen der Datenbank",
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
      response.status = "error";
    }
  } else {
    response.checks.data = {
      status: "error",
      message: "Übersprungen - Datenbankverbindung fehlgeschlagen",
    };
  }

  // 3. Check required folders
  const requiredFolders = [
    { name: "database", path: path.dirname(dbPath) },
    { name: "public", path: path.join(process.cwd(), "public") },
    { name: "prisma", path: path.join(process.cwd(), "prisma") },
  ];

  const folderResults: Record<string, { exists: boolean; writable: boolean }> =
    {};
  const folderIssues: string[] = [];

  for (const folder of requiredFolders) {
    const check = checkPath(folder.path, "directory");
    folderResults[folder.name] = {
      exists: check.exists,
      writable: check.writable || false,
    };

    if (!check.exists) {
      folderIssues.push(`${folder.name}: nicht gefunden`);
    } else if (!check.writable && folder.name === "database") {
      // Only database folder needs to be writable
      folderIssues.push(`${folder.name}: nicht beschreibbar`);
    }
  }

  if (folderIssues.length > 0) {
    response.checks.folders = {
      status: "error",
      message: `Probleme mit Verzeichnissen: ${folderIssues.join(", ")}`,
      details: folderResults,
    };
    response.status = "error";
  } else {
    response.checks.folders = {
      status: "ok",
      message: "Alle erforderlichen Verzeichnisse vorhanden",
      details: folderResults,
    };
  }

  // 4. Check optional files from environment variables
  const publicDir = path.join(process.cwd(), "public");
  const optionalFiles = [
    {
      name: "Logo (BOOKLABEL_LOGO)",
      envVar: "BOOKLABEL_LOGO",
      defaultValue: "school_logo.png",
      required: false,
    },
    {
      name: "Mahnungs-Template (REMINDER_TEMPLATE_DOC)",
      envVar: "REMINDER_TEMPLATE_DOC",
      defaultValue: "mahnung-template.docx",
      required: false,
    },
    {
      name: "Benutzerausweis-Hintergrund (USERID_LABEL_IMAGE)",
      envVar: "USERID_LABEL_IMAGE",
      defaultValue: "ausweis_hintergrund.png",
      required: false,
    },
    {
      name: "Antolin-Daten",
      envVar: null,
      fixedPath: "antolin/antolingesamt.csv",
      required: false,
    },
  ];

  const fileResults: Record<
    string,
    { configured: boolean; exists: boolean; path: string }
  > = {};
  const fileWarnings: string[] = [];

  for (const file of optionalFiles) {
    let filePath: string;
    let isConfigured: boolean;

    if (file.fixedPath) {
      filePath = path.join(publicDir, file.fixedPath);
      isConfigured = true; // Fixed path, always "configured"
    } else {
      const envValue = file.envVar ? process.env[file.envVar] : null;
      isConfigured = !!envValue;
      const fileName = envValue || file.defaultValue;
      filePath = path.join(publicDir, fileName || "");
    }

    const check = checkPath(filePath, "file");
    fileResults[file.name] = {
      configured: isConfigured,
      exists: check.exists,
      path: filePath,
    };

    // Only warn if explicitly configured but missing
    if (isConfigured && !check.exists && file.envVar) {
      fileWarnings.push(`${file.name}: konfiguriert aber nicht gefunden`);
    }
  }

  if (fileWarnings.length > 0) {
    response.checks.files = {
      status: "warning",
      message: `Einige konfigurierte Dateien fehlen: ${fileWarnings.join(", ")}`,
      details: fileResults,
    };
    if (response.status === "ok") {
      response.status = "warning";
    }
  } else {
    response.checks.files = {
      status: "ok",
      message: "Alle konfigurierten Dateien vorhanden",
      details: fileResults,
    };
  }

  // Set appropriate HTTP status code
  const httpStatus =
    response.status === "error"
      ? 503
      : response.status === "warning"
        ? 200
        : 200;

  return res.status(httpStatus).json(response);
}
