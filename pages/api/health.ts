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

// Generate styled HTML output
function generateHtmlResponse(data: HealthCheckResponse): string {
  const statusColors = {
    ok: { bg: "#10b981", text: "#065f46", light: "#d1fae5" },
    warning: { bg: "#f59e0b", text: "#92400e", light: "#fef3c7" },
    error: { bg: "#ef4444", text: "#991b1b", light: "#fee2e2" },
  };

  const statusIcons = {
    ok: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
  };

  const statusLabels = {
    ok: "Alles in Ordnung",
    warning: "Warnungen vorhanden",
    error: "Fehler erkannt",
  };

  const checkLabels: Record<string, { title: string; icon: string }> = {
    database: {
      title: "Datenbank",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
    },
    data: {
      title: "Datenbestand",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
    },
    folders: {
      title: "Verzeichnisse",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
    },
    files: {
      title: "Dateien",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`,
    },
  };

  const mainColor = statusColors[data.status];

  const renderDetails = (details?: Record<string, unknown>): string => {
    if (!details) return "";

    const formatValue = (key: string, value: unknown): string => {
      // Handle nested objects with specific formatting
      if (typeof value === "object" && value !== null) {
        const obj = value as Record<string, unknown>;

        // Folder status objects (with optional fileCount)
        if ("exists" in obj && "writable" in obj && !("configured" in obj)) {
          const exists = obj.exists ? "✓ vorhanden" : "✗ fehlt";
          const writable = obj.writable ? ", beschreibbar" : "";
          const fileCount =
            typeof obj.fileCount === "number"
              ? ` (${obj.fileCount.toLocaleString("de-DE")} Bilder)`
              : "";
          return `${exists}${writable}${fileCount}`;
        }

        // File status objects
        if ("exists" in obj && "configured" in obj) {
          const status = obj.exists ? "✓ vorhanden" : "✗ fehlt";
          const configured = obj.configured ? " (konfiguriert)" : " (Standard)";
          return `${status}${configured}`;
        }

        // Generic object - format as key-value pairs
        return Object.entries(obj)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      }

      // Format numbers with German locale
      if (typeof value === "number") {
        return value.toLocaleString("de-DE");
      }

      // Boolean values
      if (typeof value === "boolean") {
        return value ? "Ja" : "Nein";
      }

      return String(value);
    };

    const getKeyLabel = (key: string): string => {
      const labels: Record<string, string> = {
        path: "Pfad",
        books: "Bücher",
        users: "Nutzer",
        loginUsers: "Login-Benutzer",
        error: "Fehler",
        databaseUrl: "Datenbank-URL",
        database: "Datenbank",
        public: "Public-Ordner",
        prisma: "Prisma-Ordner",
        covers: "Cover-Bilder",
        fileCount: "Anzahl Bilder",
      };
      return labels[key] || key;
    };

    return `
      <div class="details">
        ${Object.entries(details)
          .map(
            ([key, value]) => `
          <div class="detail-row">
            <span class="detail-key">${getKeyLabel(key)}:</span>
            <span class="detail-value">${formatValue(key, value)}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  };

  const renderCheck = (key: string, check: CheckResult): string => {
    const colors = statusColors[check.status];
    const label = checkLabels[key] || { title: key, icon: "" };
    return `
      <div class="check-card">
        <div class="check-header">
          <div class="check-icon" style="color: ${colors.bg}">
            ${label.icon}
          </div>
          <div class="check-title">${label.title}</div>
          <div class="status-badge" style="background: ${colors.light}; color: ${colors.text}">
            ${statusIcons[check.status]}
            <span>${check.status.toUpperCase()}</span>
          </div>
        </div>
        <div class="check-message">${check.message}</div>
        ${renderDetails(check.details)}
      </div>
    `;
  };

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenLibry Health Check</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #1e3a5f 0%, #0f1c2e 100%);
      min-height: 100vh;
      padding: 2rem;
      color: #1f2937;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .logo svg {
      width: 48px;
      height: 48px;
      color: #60a5fa;
    }

    .logo-text {
      font-size: 2rem;
      font-weight: 700;
      color: white;
      letter-spacing: -0.5px;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 1.1rem;
    }

    .main-status {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .status-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .status-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${mainColor.light};
      color: ${mainColor.bg};
    }

    .status-icon svg {
      width: 32px;
      height: 32px;
    }

    .status-info h1 {
      font-size: 1.5rem;
      color: ${mainColor.text};
      margin-bottom: 0.25rem;
    }

    .status-info p {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .meta-info {
      display: flex;
      gap: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      margin-top: 1rem;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .meta-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #9ca3af;
    }

    .meta-value {
      font-weight: 600;
      color: #374151;
    }

    .checks-grid {
      display: grid;
      gap: 1rem;
    }

    .check-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 0.75rem;
      padding: 1.25rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .check-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.15);
    }

    .check-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .check-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .check-title {
      font-weight: 600;
      font-size: 1rem;
      flex-grow: 1;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.025em;
    }

    .status-badge svg {
      width: 14px;
      height: 14px;
    }

    .check-message {
      color: #4b5563;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .details {
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 0.5rem;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 0.8rem;
    }

    .detail-row {
      display: flex;
      gap: 0.5rem;
      padding: 0.25rem 0;
    }

    .detail-key {
      color: #6b7280;
      min-width: 100px;
    }

    .detail-value {
      color: #111827;
      word-break: break-all;
    }

    .footer {
      text-align: center;
      margin-top: 2rem;
      color: #64748b;
      font-size: 0.85rem;
    }

    .footer a {
      color: #60a5fa;
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    .refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 0.5rem;
      color: white;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .refresh-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    @media (max-width: 640px) {
      body {
        padding: 1rem;
      }

      .meta-info {
        flex-wrap: wrap;
        gap: 1rem;
      }

      .status-header {
        flex-direction: column;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <span class="logo-text">OpenLibry</span>
      </div>
      <p class="subtitle">Installation Health Check</p>
    </header>

    <div class="main-status">
      <div class="status-header">
        <div class="status-icon">
          ${statusIcons[data.status]}
        </div>
        <div class="status-info">
          <h1>${statusLabels[data.status]}</h1>
          <p>Systemstatus zum ${new Date(data.timestamp).toLocaleString("de-DE")}</p>
        </div>
      </div>
      <div class="meta-info">
        <div class="meta-item">
          <span class="meta-label">Version</span>
          <span class="meta-value">${data.version || "unbekannt"}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Umgebung</span>
          <span class="meta-value">${data.environment.nodeEnv}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Authentifizierung</span>
          <span class="meta-value">${data.environment.authEnabled ? "Aktiviert" : "Deaktiviert"}</span>
        </div>
      </div>
    </div>

    <div class="checks-grid">
      ${Object.entries(data.checks)
        .map(([key, check]) => renderCheck(key, check))
        .join("")}
    </div>

    <footer class="footer">
      <button class="refresh-btn" onclick="location.reload()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        Aktualisieren
      </button>
      <p style="margin-top: 1rem;">
        <a href="/api/health">JSON-Ausgabe</a> · 
        <a href="https://github.com/jzakotnik/openlibry" target="_blank">GitHub</a>
      </p>
    </footer>
  </div>
</body>
</html>`;
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
  res: NextApiResponse<HealthCheckResponse | { error: string } | string>,
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
    { name: "database", path: path.dirname(dbPath), mustBeWritable: true },
    {
      name: "public",
      path: path.join(process.cwd(), "public"),
      mustBeWritable: false,
    },
    {
      name: "prisma",
      path: path.join(process.cwd(), "prisma"),
      mustBeWritable: false,
    },
  ];

  // Add cover images folder if configured
  const coverImagePath = process.env.COVERIMAGE_FILESTORAGE_PATH;
  if (coverImagePath) {
    requiredFolders.push({
      name: "covers",
      path: coverImagePath,
      mustBeWritable: true,
    });
  }

  const folderResults: Record<
    string,
    { exists: boolean; writable: boolean; fileCount?: number }
  > = {};
  const folderIssues: string[] = [];

  for (const folder of requiredFolders) {
    const check = checkPath(folder.path, "directory");
    const result: { exists: boolean; writable: boolean; fileCount?: number } = {
      exists: check.exists,
      writable: check.writable || false,
    };

    // Count files in covers folder
    if (folder.name === "covers" && check.exists) {
      try {
        const files = fs.readdirSync(folder.path);
        const imageFiles = files.filter((f) =>
          /\.(jpg|jpeg|png|gif|webp)$/i.test(f),
        );
        result.fileCount = imageFiles.length;
      } catch {
        // Ignore counting errors
      }
    }

    folderResults[folder.name] = result;

    if (!check.exists) {
      folderIssues.push(`${folder.name}: nicht gefunden`);
    } else if (!check.writable && folder.mustBeWritable) {
      folderIssues.push(`${folder.name}: nicht beschreibbar`);
    }
  }

  // Warn if cover path is not configured (this is optional, not an error)
  if (!coverImagePath) {
    folderResults["covers"] = {
      exists: false,
      writable: false,
    };
    // Don't add to folderIssues - missing cover path is just informational
  }

  // Separate critical issues from warnings
  const criticalFolderIssues = folderIssues.filter(
    (issue) => !issue.startsWith("covers:"),
  );
  const coverIssues = folderIssues.filter((issue) =>
    issue.startsWith("covers:"),
  );

  if (criticalFolderIssues.length > 0) {
    response.checks.folders = {
      status: "error",
      message: `Probleme mit Verzeichnissen: ${criticalFolderIssues.join(", ")}`,
      details: folderResults,
    };
    response.status = "error";
  } else if (coverIssues.length > 0 || !coverImagePath) {
    response.checks.folders = {
      status: "warning",
      message: !coverImagePath
        ? "COVERIMAGE_FILESTORAGE_PATH nicht konfiguriert - Cover-Bilder werden nicht funktionieren"
        : `Cover-Verzeichnis: ${coverIssues.join(", ")}`,
      details: folderResults,
    };
    if (response.status === "ok") {
      response.status = "warning";
    }
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

  // Check if HTML output is requested
  const wantsHtml =
    req.query.html !== undefined ||
    req.query.format === "html" ||
    (req.headers.accept?.includes("text/html") &&
      !req.headers.accept?.includes("application/json"));

  if (wantsHtml) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(httpStatus).send(generateHtmlResponse(response));
  }

  return res.status(httpStatus).json(response);
}
