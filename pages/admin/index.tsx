import Layout from "@/components/layout/Layout";
import palette from "@/styles/palette";
import {
  AlertTriangle,
  ArrowRight,
  Book,
  CalendarClock,
  CheckCircle,
  Clock,
  Cpu,
  Download,
  HeartPulse,
  Info,
  Loader2,
  RefreshCw,
  Settings,
  Users,
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
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    icon: CheckCircle,
    label: "Alles in Ordnung",
    gradientFrom: "from-emerald-500/10",
    gradientTo: "to-emerald-500/5",
  },
  warning: {
    color: "#f59e0b",
    bg: "bg-amber-50",
    text: "text-amber-800",
    icon: AlertTriangle,
    label: "Warnungen vorhanden",
    gradientFrom: "from-amber-500/10",
    gradientTo: "to-amber-500/5",
  },
  error: {
    color: "#ef4444",
    bg: "bg-red-50",
    text: "text-red-800",
    icon: XCircle,
    label: "Fehler erkannt",
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

function ActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  color = palette.primary.main,
  loading = false,
  dataCy,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  color?: string;
  loading?: boolean;
  dataCy?: string;
}) {
  return (
    <button
      data-cy={dataCy}
      onClick={onClick}
      disabled={loading}
      className="w-full h-full text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-70"
      style={{
        borderColor: `${color}33`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${color}33`;
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" style={{ color }} />
          ) : (
            <Icon className="w-6 h-6" style={{ color }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-300 shrink-0" />
      </div>
    </button>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color = palette.primary.main,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  subtitle?: string;
}) {
  return (
    <div
      className="h-full bg-white rounded-xl shadow-sm p-4"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString("de-DE") : value}
          </p>
          <p className="text-sm text-gray-500">{title}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
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
  const barColor =
    percent > 90
      ? "bg-red-500"
      : percent > 70
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Speichernutzung</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">
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

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-gray-600">{label}</span>
      {children}
    </div>
  );
}

function Badge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "success" | "warning";
}) {
  const classes = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes[variant]}`}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);

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
  }, []);

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await fetch("/api/excel", { method: "GET" });

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen des Backups!");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const today = new Date();
      const dateStr = `${today.getFullYear()}_${String(today.getMonth() + 1).padStart(2, "0")}_${String(today.getDate()).padStart(2, "0")}`;
      const filename = `Backup_OpenLibry_${dateStr}.xlsx`;

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Fehler beim Backup-Download!";
      alert(message);
    } finally {
      setBackupLoading(false);
    }
  };

  const mainStatus = data?.status || "ok";
  const mainConfig = statusConfig[mainStatus];
  const MainIcon = mainConfig.icon;

  return (
    <Layout>
      <Head>
        <title>Administration | OpenLibry</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ── Quick Actions ──────────────────────────────────────────── */}
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Schnellaktionen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <ActionCard
            title="Excel-Backup"
            dataCy="admin-excel-backup-button"
            description="Alle Daten als Excel herunterladen"
            icon={Download}
            onClick={handleBackup}
            color="#10b981"
            loading={backupLoading}
          />
          <ActionCard
            title="System-Health"
            description="Detaillierte Systemdiagnose"
            icon={HeartPulse}
            onClick={() => router.push("/admin/health")}
            color="#6366f1"
          />
          <ActionCard
            title="Einstellungen"
            description="Konfiguration anzeigen"
            icon={Settings}
            onClick={() => router.push("/admin/settings")}
            color="#8b5cf6"
          />
        </div>

        {/* ── Health Status Banner ───────────────────────────────────── */}
        <div
          className={`rounded-2xl border p-5 mb-8 bg-gradient-to-br ${mainConfig.gradientFrom} ${mainConfig.gradientTo}`}
          style={{ borderColor: `${mainConfig.color}33` }}
        >
          {loading && !data ? (
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">
                Lade Systemstatus...
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Fehler beim Laden
                </p>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            </div>
          ) : data ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${mainConfig.color}20` }}
                >
                  <MainIcon
                    className="w-7 h-7"
                    style={{ color: mainConfig.color }}
                  />
                </div>
                <div>
                  <p
                    className="text-base font-bold"
                    style={{ color: mainConfig.color }}
                  >
                    {mainConfig.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    Version {data.version || "unbekannt"} · Aktualisiert:{" "}
                    {new Date(data.timestamp).toLocaleTimeString("de-DE")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/admin/health")}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                style={{
                  borderColor: mainConfig.color,
                  color: mainConfig.color,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    `${mainConfig.color}0D`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                }}
              >
                <HeartPulse className="w-4 h-4" />
                Details anzeigen
              </button>
            </div>
          ) : null}
        </div>

        {data && (
          <>
            {/* ── Statistics ──────────────────────────────────────────── */}
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Statistiken
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <StatCard
                title="Bücher"
                value={(data.checks.data.details?.books as number) ?? "-"}
                icon={Book}
                color="#3b82f6"
              />
              <StatCard
                title="Nutzer"
                value={(data.checks.data.details?.users as number) ?? "-"}
                icon={Users}
                color="#8b5cf6"
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

            {/* ── System Info ─────────────────────────────────────────── */}
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Systeminfo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Memory & Uptime */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                <MemoryBar
                  percent={data.system.memory.usedPercent}
                  used={data.system.memory.used}
                  total={data.system.memory.total}
                />

                <div className="h-px bg-gray-100" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Uptime</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatUptime(data.system.uptime)}
                  </span>
                </div>
              </div>

              {/* Right: Environment info */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="divide-y divide-gray-100">
                  <InfoRow label="Umgebung">
                    <Badge
                      label={data.environment.nodeEnv}
                      variant={
                        data.environment.nodeEnv === "production"
                          ? "success"
                          : "warning"
                      }
                    />
                  </InfoRow>
                  <InfoRow label="Node.js">
                    <span className="text-sm font-semibold text-gray-900">
                      {data.environment.nodeVersion}
                    </span>
                  </InfoRow>
                  <InfoRow label="Plattform">
                    <span className="text-sm font-semibold text-gray-900">
                      {data.system.platform} ({data.system.arch})
                    </span>
                  </InfoRow>
                  <InfoRow label="Authentifizierung">
                    <Badge
                      label={
                        data.environment.authEnabled
                          ? "Aktiviert"
                          : "Deaktiviert"
                      }
                      variant={
                        data.environment.authEnabled ? "success" : "default"
                      }
                    />
                  </InfoRow>
                </div>
              </div>
            </div>

            {/* Last Activity */}
            {data.stats?.lastActivity && (
              <div className="mt-6 flex items-center gap-2 text-gray-500">
                <Info className="w-4 h-4" />
                <span className="text-sm">
                  Letzte Aktivität:{" "}
                  {new Date(data.stats.lastActivity).toLocaleString("de-DE")}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
