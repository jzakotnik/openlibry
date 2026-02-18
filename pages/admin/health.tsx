import Layout from "@/components/layout/Layout";

import {
  AlertTriangle,
  ArrowLeft,
  Book,
  Braces,
  CalendarClock,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  FileText,
  FolderOpen,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

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
    nodeVersion: string;
    authEnabled: boolean;
    port: string;
  };
  system: {
    platform: string;
    arch: string;
    uptime: number;
    memory: {
      total: number;
      free: number;
      used: number;
      usedPercent: number;
    };
  };
  stats?: {
    activeRentals: number;
    overdueBooks: number;
    lastActivity?: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ✅ hex colors → CSS variable strings; Tailwind defaults → design token classes
// ─────────────────────────────────────────────────────────────────────────────

const statusConfig = {
  ok: {
    cssVar: "var(--success)", // was: color: "#10b981"
    bg: "bg-success-light", // was: "bg-emerald-100"
    text: "text-success", // was: "text-emerald-800"
    border: "border-success", // was: "border-emerald-500"
    icon: CheckCircle,
    label: "OK",
    gradientFrom: "from-success/10", // was: "from-emerald-500/10"
    gradientTo: "to-success/5", // was: "to-emerald-500/5"
    borderOpacity: "border-success/20", // replaces `${color}33` hex trick
  },
  warning: {
    cssVar: "var(--warning)", // was: color: "#f59e0b"
    bg: "bg-warning-light", // was: "bg-amber-100"
    text: "text-warning", // was: "text-amber-800"
    border: "border-warning", // was: "border-amber-500"
    icon: AlertTriangle,
    label: "Warnung",
    gradientFrom: "from-warning/10", // was: "from-amber-500/10"
    gradientTo: "to-warning/5", // was: "to-amber-500/5"
    borderOpacity: "border-warning/20",
  },
  error: {
    cssVar: "var(--destructive)", // was: color: "#ef4444"
    bg: "bg-destructive-light", // was: "bg-red-100"
    text: "text-destructive", // was: "text-red-800"
    border: "border-destructive", // was: "border-red-500"
    icon: XCircle,
    label: "Fehler",
    gradientFrom: "from-destructive/10", // was: "from-red-500/10"
    gradientTo: "to-destructive/5", // was: "to-red-500/5"
    borderOpacity: "border-destructive/20",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CheckStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    // ✅ bg/text already use design token classes from statusConfig
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

// ✅ StatCard: remove generic `color` prop; each call site uses a semantic token instead
function StatCard({
  title,
  value,
  icon: Icon,
  colorVar = "var(--primary)", // ✅ CSS variable string, not a raw hex
  valueClass = "text-foreground", // ✅ was: style={{ color: palette.text.primary }}
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorVar?: string;
  valueClass?: string;
}) {
  return (
    // ✅ was: border-gray-100
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 text-center hover:shadow-md transition-shadow">
      <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: colorVar }} />
      <p className={`text-2xl font-bold ${valueClass}`}>
        {typeof value === "number" ? value.toLocaleString("de-DE") : value}
      </p>
      {/* ✅ was: text-gray-500 */}
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}

function CheckCard({
  title,
  icon: Icon,
  check,
}: {
  title: string;
  icon: React.ElementType;
  check: CheckResult;
}) {
  const config = statusConfig[check.status];

  const formatDetailValue = (key: string, value: unknown): string => {
    if (typeof value === "object" && value !== null) {
      const obj = value as Record<string, unknown>;
      if ("exists" in obj && "writable" in obj && !("configured" in obj)) {
        const exists = obj.exists ? "✓ vorhanden" : "✗ fehlt";
        const writable = obj.writable ? ", beschreibbar" : "";
        const fileCount =
          typeof obj.fileCount === "number"
            ? ` (${obj.fileCount.toLocaleString("de-DE")} Bilder)`
            : "";
        return `${exists}${writable}${fileCount}`;
      }
      if ("exists" in obj && "configured" in obj) {
        const status = obj.exists ? "✓ vorhanden" : "✗ fehlt";
        const configured = obj.configured ? " (konfiguriert)" : " (Standard)";
        return `${status}${configured}`;
      }
      return JSON.stringify(obj);
    }
    if (typeof value === "number") return value.toLocaleString("de-DE");
    if (typeof value === "boolean") return value ? "Ja" : "Nein";
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
      database: "Datenbank-Ordner",
      public: "Public-Ordner",
      prisma: "Prisma-Ordner",
      covers: "Cover-Bilder",
      size: "Größe",
      sizeFormatted: "Dateigröße",
    };
    return labels[key] || key;
  };

  const filteredDetails = check.details
    ? Object.fromEntries(
        Object.entries(check.details).filter(
          ([key]) => !(key === "size" && check.details?.sizeFormatted),
        ),
      )
    : undefined;

  return (
    // ✅ was: border-gray-100 + style borderLeftColor hex
    // borderLeftColor still needs inline style since it's driven by status dynamically
    <div
      className="h-full bg-card rounded-xl border border-border shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
      style={{ borderLeftWidth: 4, borderLeftColor: config.cssVar }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* ✅ icon color driven by CSS variable */}
            <Icon className="w-5 h-5" style={{ color: config.cssVar }} />
            {/* ✅ was: text-gray-900 */}
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
          </div>
          <StatusBadge status={check.status} />
        </div>

        {/* ✅ was: text-gray-500 */}
        <p className="text-sm text-muted-foreground mb-2">{check.message}</p>

        {filteredDetails && Object.keys(filteredDetails).length > 0 && (
          // ✅ was: bg-gray-50
          <div className="mt-3 p-3 bg-muted rounded-lg font-mono text-xs space-y-0.5">
            {Object.entries(filteredDetails).map(([key, value]) => (
              <div key={key} className="flex gap-2 flex-wrap">
                {/* ✅ was: text-gray-500 / text-gray-900 */}
                <span className="text-muted-foreground min-w-[120px]">
                  {getKeyLabel(key)}:
                </span>
                <span className="text-foreground break-all">
                  {formatDetailValue(key, value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemoryBar({
  percent,
  used,
  total,
}: {
  percent: number;
  used: number;
  total: number;
}) {
  // ✅ These three states are genuinely semantic — keep as design tokens
  const barColor =
    percent > 90
      ? "bg-destructive"
      : percent > 70
        ? "bg-warning"
        : "bg-success";

  return (
    // ✅ was: border-gray-100
    <div className="bg-card rounded-xl border border-border shadow-sm p-4">
      <div className="flex justify-between items-center mb-2">
        {/* ✅ was: text-gray-500 / text-gray-900 */}
        <span className="text-sm text-muted-foreground">Speichernutzung</span>
        <span className="text-sm text-foreground">
          {formatBytes(used)} / {formatBytes(total)}
        </span>
      </div>
      {/* ✅ was: bg-gray-200 */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function HealthPage() {
  const router = useRouter();
  const [data, setData] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health");
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData(json);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const mainStatus = data?.status || "ok";
  const mainConfig = statusConfig[mainStatus];
  const MainIcon = mainConfig.icon;

  return (
    <Layout>
      <Head>
        <title>System Health | OpenLibry</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          {/* ✅ was: text-gray-500 hover:bg-gray-100 hover:text-gray-700 */}
          <button
            onClick={() => router.push("/admin")}
            title="Zurück zur Administration"
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={fetchHealth}
            disabled={loading}
            title="Aktualisieren"
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Main Status Card */}
        {/* ✅ was: style={{ borderColor: `${mainConfig.color}33` }} → use borderOpacity class from config */}
        <div
          className={`rounded-2xl border p-6 mb-6 bg-gradient-to-br ${mainConfig.gradientFrom} ${mainConfig.gradientTo} ${mainConfig.borderOpacity}`}
        >
          {loading && !data ? (
            <div className="text-center py-8">
              {/* ✅ was: text-gray-400 */}
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Lade Systemstatus...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 mx-auto text-destructive mb-3" />
              {/* ✅ was: text-red-700 */}
              <h2 className="text-xl font-bold text-destructive">
                Fehler beim Laden
              </h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : data ? (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                {/* ✅ bg uses CSS var with opacity; color uses CSS var */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${mainConfig.cssVar} 12%, transparent)`,
                  }}
                >
                  <MainIcon
                    className="w-8 h-8"
                    style={{ color: mainConfig.cssVar }}
                  />
                </div>
                <div className="text-center sm:text-left">
                  {/* ✅ color driven by CSS variable */}
                  <h2
                    className="text-xl font-bold"
                    style={{ color: mainConfig.cssVar }}
                  >
                    {mainStatus === "ok" && "Alles in Ordnung"}
                    {mainStatus === "warning" && "Warnungen vorhanden"}
                    {mainStatus === "error" && "Fehler erkannt"}
                  </h2>
                  {/* ✅ was: text-gray-500 */}
                  <p className="text-sm text-muted-foreground">
                    Stand: {new Date(data.timestamp).toLocaleString("de-DE")}
                  </p>
                </div>
              </div>

              {/* ✅ was: bg-gray-200 */}
              <div className="h-px bg-border my-4" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(
                  [
                    "Version",
                    "Umgebung",
                    "Authentifizierung",
                    "Node.js",
                  ] as const
                ).map((label, i) => (
                  <div key={label}>
                    {/* ✅ was: text-gray-400 / text-gray-900 */}
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {i === 0 && (data.version || "unbekannt")}
                      {i === 1 && data.environment.nodeEnv}
                      {i === 2 &&
                        (data.environment.authEnabled
                          ? "Aktiviert"
                          : "Deaktiviert")}
                      {i === 3 && data.environment.nodeVersion}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {data && (
          <>
            {/* System Stats */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard
                title="Speicher belegt"
                value={`${data.system.memory.usedPercent}%`}
                icon={Cpu}
                colorVar="var(--secondary)"
              />
              <StatCard
                title="Uptime"
                value={formatUptime(data.system.uptime)}
                icon={Clock}
                colorVar="var(--info)"
              />
              <StatCard
                title="Aktive Ausleihen"
                value={data.stats?.activeRentals ?? "-"}
                icon={Book}
                colorVar="var(--success)"
              />
              <StatCard
                title="Überfällig"
                value={data.stats?.overdueBooks ?? "-"}
                icon={CalendarClock}
                colorVar={
                  data.stats?.overdueBooks && data.stats.overdueBooks > 0
                    ? "var(--destructive)"
                    : "var(--success)"
                }
              />
            </div>

            {/* Memory Bar */}
            <div className="mb-6">
              <MemoryBar
                percent={data.system.memory.usedPercent}
                used={data.system.memory.used}
                total={data.system.memory.total}
              />
            </div>

            {/* Check Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <CheckCard
                title="Datenbank"
                icon={Database}
                check={data.checks.database}
              />
              <CheckCard
                title="Datenbestand"
                icon={Braces}
                check={data.checks.data}
              />
              <CheckCard
                title="Verzeichnisse"
                icon={FolderOpen}
                check={data.checks.folders}
              />
              <CheckCard
                title="Dateien"
                icon={FileText}
                check={data.checks.files}
              />
            </div>

            {/* Footer */}
            {/* ✅ was: style={{ color: palette.primary.main }} */}
            <p className="text-center text-sm text-muted-foreground">
              <a href="/api/health" className="text-primary hover:underline">
                JSON-API
              </a>
              <a
                href="https://github.com/jzakotnik/openlibry"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub
              </a>
              {data.system.platform} ({data.system.arch})
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}
