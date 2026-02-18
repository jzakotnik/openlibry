import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  File,
  Folder,
  Library,
  Loader2,
  RefreshCw,
  Server,
  XCircle,
} from "lucide-react";
import Head from "next/head";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const statusConfig = {
  ok: {
    color: "#10b981",
    bg: "#d1fae5",
    text: "#065f46",
    label: "OK",
    Icon: CheckCircle2,
  },
  warning: {
    color: "#f59e0b",
    bg: "#fef3c7",
    text: "#92400e",
    label: "Warnung",
    Icon: AlertTriangle,
  },
  error: {
    color: "#ef4444",
    bg: "#fee2e2",
    text: "#991b1b",
    label: "Fehler",
    Icon: XCircle,
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: CheckStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.Icon;
  return (
    <Badge
      className="gap-1 font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <Icon size={13} style={{ color: cfg.color }} />
      {cfg.label}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: typeof BookOpen;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: `${color}20` }}
    >
      <div
        className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}14` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <p className="text-2xl font-bold" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString("de-DE") : value}
      </p>
      <p className="mt-0.5 text-xs text-gray-500">{title}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Check Card                                                         */
/* ------------------------------------------------------------------ */

function CheckCard({
  title,
  icon: Icon,
  check,
}: {
  title: string;
  icon: typeof Database;
  check: CheckResult;
}) {
  const cfg = statusConfig[check.status];

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

  const filteredDetails = check.details
    ? Object.fromEntries(
        Object.entries(check.details).filter(
          ([key]) => !(key === "size" && check.details?.sizeFormatted),
        ),
      )
    : undefined;

  return (
    <Card
      className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderLeft: `4px solid ${cfg.color}` }}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={20} style={{ color: cfg.color }} />
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
          <StatusBadge status={check.status} />
        </div>

        <p className="mb-2 text-sm text-gray-500">{check.message}</p>

        {/* Details */}
        {filteredDetails && Object.keys(filteredDetails).length > 0 && (
          <div className="mt-3 rounded-lg bg-gray-50 p-3 font-mono text-xs">
            {Object.entries(filteredDetails).map(([key, value]) => (
              <div key={key} className="flex flex-wrap gap-1 py-0.5">
                <span className="min-w-[120px] text-gray-400">
                  {getKeyLabel(key)}:
                </span>
                <span className="break-all text-gray-700">
                  {formatDetailValue(key, value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Meta item (version, env, etc.)                                     */
/* ------------------------------------------------------------------ */

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="font-bold text-gray-800">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HealthPage() {
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
  const mainCfg = statusConfig[mainStatus];
  const MainIcon = mainCfg.Icon;

  const memPercent = data?.system.memory.usedPercent ?? 0;
  const memColor =
    memPercent > 90 ? "#ef4444" : memPercent > 70 ? "#f59e0b" : "#10b981";

  return (
    <TooltipProvider delayDuration={300}>
      <Head>
        <title>System Health | OpenLibry</title>
      </Head>

      <div
        className="min-h-screen py-6"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f1c2e 100%)",
        }}
      >
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
          {/* ── Header ── */}
          <div className="mb-8 text-center">
            <div className="mb-2 flex items-center justify-center gap-3">
              <Library size={40} className="text-blue-400" />
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                OpenLibry
              </h1>
            </div>
            <p className="text-slate-400">Installation Health Check</p>
          </div>

          {/* ── Main status card ── */}
          <div className="mb-4 rounded-2xl border border-white/10 bg-white p-5 shadow-lg">
            {loading && !data ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 size={36} className="animate-spin text-gray-400" />
                <p className="mt-3 text-sm text-gray-500">
                  Lade Systemstatus...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center py-8">
                <XCircle size={48} className="mb-2 text-red-400" />
                <p className="text-lg font-semibold text-red-600">
                  Fehler beim Laden
                </p>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            ) : data ? (
              <>
                {/* Status + refresh */}
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: mainCfg.bg }}
                  >
                    <MainIcon size={30} style={{ color: mainCfg.color }} />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2
                      className="text-xl font-bold"
                      style={{ color: mainCfg.text }}
                    >
                      {mainStatus === "ok" && "Alles in Ordnung"}
                      {mainStatus === "warning" && "Warnungen vorhanden"}
                      {mainStatus === "error" && "Fehler erkannt"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Stand: {new Date(data.timestamp).toLocaleString("de-DE")}
                    </p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchHealth}
                        disabled={loading}
                        className="shrink-0"
                      >
                        <RefreshCw
                          size={18}
                          className={loading ? "animate-spin" : ""}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Aktualisieren</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Separator className="my-4" />

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MetaItem
                    label="Version"
                    value={data.version || "unbekannt"}
                  />
                  <MetaItem label="Umgebung" value={data.environment.nodeEnv} />
                  <MetaItem
                    label="Authentifizierung"
                    value={
                      data.environment.authEnabled ? "Aktiviert" : "Deaktiviert"
                    }
                  />
                  <MetaItem
                    label="Node.js"
                    value={data.environment.nodeVersion}
                  />
                </div>
              </>
            ) : null}
          </div>

          {data && (
            <>
              {/* ── Stats row ── */}
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                  icon={BookOpen}
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

              {/* ── Memory bar ── */}
              <div className="mb-4 rounded-2xl border border-white/10 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Speichernutzung</span>
                  <span className="text-sm font-medium">
                    {formatBytes(data.system.memory.used)} /{" "}
                    {formatBytes(data.system.memory.total)}
                  </span>
                </div>
                {/* 
                  shadcn Progress doesn't support custom bar color via props,
                  so we use a native div-based bar for full control.
                */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${memPercent}%`,
                      backgroundColor: memColor,
                    }}
                  />
                </div>
              </div>

              {/* ── Check cards ── */}
              <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <CheckCard
                  title="Datenbank"
                  icon={Database}
                  check={data.checks.database}
                />
                <CheckCard
                  title="Datenbestand"
                  icon={Server}
                  check={data.checks.data}
                />
                <CheckCard
                  title="Verzeichnisse"
                  icon={Folder}
                  check={data.checks.folders}
                />
                <CheckCard
                  title="Dateien"
                  icon={File}
                  check={data.checks.files}
                />
              </div>

              {/* ── Footer ── */}
              <div className="mt-6 text-center text-sm text-slate-500">
                <a
                  href="/api/health"
                  className="text-blue-400 transition-colors hover:text-blue-300"
                >
                  JSON-API
                </a>
                {" · "}
                <a
                  href="https://github.com/jzakotnik/openlibry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 transition-colors hover:text-blue-300"
                >
                  GitHub
                </a>
                {" · "}
                {data.system.platform} ({data.system.arch})
              </div>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
