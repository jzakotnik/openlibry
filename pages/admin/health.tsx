import Layout from "@/components/layout/Layout";
import palette from "@/styles/palette";
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
// Types
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
// ─────────────────────────────────────────────────────────────────────────────

const statusConfig = {
  ok: {
    color: "#10b981",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-500",
    icon: CheckCircle,
    label: "OK",
    gradientFrom: "from-emerald-500/10",
    gradientTo: "to-emerald-500/5",
  },
  warning: {
    color: "#f59e0b",
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-500",
    icon: AlertTriangle,
    label: "Warnung",
    gradientFrom: "from-amber-500/10",
    gradientTo: "to-amber-500/5",
  },
  error: {
    color: "#ef4444",
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-500",
    icon: XCircle,
    label: "Fehler",
    gradientFrom: "from-red-500/10",
    gradientTo: "to-red-500/5",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
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
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color = palette.primary.main,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center hover:shadow-md transition-shadow">
      <Icon className="w-8 h-8 mx-auto mb-2" style={{ color }} />
      <p className="text-2xl font-bold" style={{ color: palette.text.primary }}>
        {typeof value === "number" ? value.toLocaleString("de-DE") : value}
      </p>
      <p className="text-sm text-gray-500">{title}</p>
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
    <div
      className="h-full bg-white rounded-xl border border-gray-100 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
      style={{ borderLeftWidth: 4, borderLeftColor: config.color }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" style={{ color: config.color }} />
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          </div>
          <StatusBadge status={check.status} />
        </div>

        {/* Message */}
        <p className="text-sm text-gray-500 mb-2">{check.message}</p>

        {/* Details */}
        {filteredDetails && Object.keys(filteredDetails).length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg font-mono text-xs space-y-0.5">
            {Object.entries(filteredDetails).map(([key, value]) => (
              <div key={key} className="flex gap-2 flex-wrap">
                <span className="text-gray-500 min-w-[120px]">
                  {getKeyLabel(key)}:
                </span>
                <span className="text-gray-900 break-all">
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

// ─────────────────────────────────────────────────────────────────────────────
// Memory Progress Bar
// ─────────────────────────────────────────────────────────────────────────────

function MemoryBar({
  percent,
  used,
  total,
}: {
  percent: number;
  used: number;
  total: number;
}) {
  const barColor =
    percent > 90
      ? "bg-red-500"
      : percent > 70
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">Speichernutzung</span>
        <span className="text-sm text-gray-900">
          {formatBytes(used)} / {formatBytes(total)}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
          <button
            onClick={() => router.push("/admin")}
            title="Zurück zur Administration"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={fetchHealth}
            disabled={loading}
            title="Aktualisieren"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Main Status Card */}
        <div
          className={`rounded-2xl border p-6 mb-6 bg-gradient-to-br ${mainConfig.gradientFrom} ${mainConfig.gradientTo}`}
          style={{ borderColor: `${mainConfig.color}33` }}
        >
          {loading && !data ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400 mb-3" />
              <p className="text-gray-500">Lade Systemstatus...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 mx-auto text-red-500 mb-3" />
              <h2 className="text-xl font-bold text-red-700">
                Fehler beim Laden
              </h2>
              <p className="text-gray-500">{error}</p>
            </div>
          ) : data ? (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${mainConfig.color}20` }}
                >
                  <MainIcon
                    className="w-8 h-8"
                    style={{ color: mainConfig.color }}
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: mainConfig.color }}
                  >
                    {mainStatus === "ok" && "Alles in Ordnung"}
                    {mainStatus === "warning" && "Warnungen vorhanden"}
                    {mainStatus === "error" && "Fehler erkannt"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Stand: {new Date(data.timestamp).toLocaleString("de-DE")}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-4" />

              {/* Meta info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Version
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {data.version || "unbekannt"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Umgebung
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {data.environment.nodeEnv}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Authentifizierung
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {data.environment.authEnabled ? "Aktiviert" : "Deaktiviert"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Node.js
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {data.environment.nodeVersion}
                  </span>
                </div>
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
                color="#8b5cf6"
              />
              <StatCard
                title="Uptime"
                value={formatUptime(data.system.uptime)}
                icon={Clock}
                color="#06b6d4"
              />
              <StatCard
                title="Aktive Ausleihen"
                value={data.stats?.activeRentals ?? "-"}
                icon={Book}
                color="#10b981"
              />
              <StatCard
                title="Überfällig"
                value={data.stats?.overdueBooks ?? "-"}
                icon={CalendarClock}
                color={
                  data.stats?.overdueBooks && data.stats.overdueBooks > 0
                    ? "#ef4444"
                    : "#10b981"
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
            <p className="text-center text-sm text-gray-400">
              <a
                href="/api/health"
                className="hover:underline"
                style={{ color: palette.primary.main }}
              >
                JSON-API
              </a>
              {" · "}
              <a
                href="https://github.com/jzakotnik/openlibry"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: palette.primary.main }}
              >
                GitHub
              </a>
              {" · "}
              {data.system.platform} ({data.system.arch})
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}
