import Layout from "@/components/layout/Layout";
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

const statusConfig = {
  ok: {
    cssVar: "var(--success)",
    bg: "bg-success-light",
    text: "text-success",
    icon: CheckCircle,
    label: "Alles in Ordnung",
    gradientFrom: "from-success/10",
    gradientTo: "to-success/5",
    borderClass: "border-success/20",
  },
  warning: {
    cssVar: "var(--warning)",
    bg: "bg-warning-light",
    text: "text-warning",
    icon: AlertTriangle,
    label: "Warnungen vorhanden",
    gradientFrom: "from-warning/10",
    gradientTo: "to-warning/5",
    borderClass: "border-warning/20",
  },
  error: {
    cssVar: "var(--destructive)",
    bg: "bg-destructive-light",
    text: "text-destructive",
    icon: XCircle,
    label: "Fehler erkannt",
    gradientFrom: "from-destructive/10",
    gradientTo: "to-destructive/5",
    borderClass: "border-destructive/20",
  },
};

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

function ActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  colorVar = "var(--primary)",
  loading = false,
  dataCy,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  colorVar?: string;
  loading?: boolean;
  dataCy?: string;
}) {
  return (
    <button
      data-cy={dataCy}
      onClick={onClick}
      disabled={loading}
      className="w-full h-full text-left bg-card rounded-xl border border-border shadow-sm p-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-70"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `color-mix(in srgb, ${colorVar} 8%, transparent)`,
          }}
        >
          {loading ? (
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: colorVar }}
            />
          ) : (
            <Icon className="w-6 h-6" style={{ color: colorVar }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />
      </div>
    </button>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  colorVar = "var(--primary)",
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorVar?: string;
  subtitle?: string;
}) {
  return (
    <div
      className="h-full bg-card rounded-xl shadow-sm p-4 border-l-4 border-y border-r border-border"
      style={{ borderLeftColor: colorVar }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `color-mix(in srgb, ${colorVar} 8%, transparent)`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: colorVar }} />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">
            {typeof value === "number" ? value.toLocaleString("de-DE") : value}
          </p>
          <p className="text-sm text-muted-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70">{subtitle}</p>
          )}
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
      ? "bg-destructive"
      : percent > 70
        ? "bg-warning"
        : "bg-success";

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Speichernutzung</span>
        </div>
        <span className="text-sm font-semibold text-foreground">
          {formatBytes(used)} / {formatBytes(total)}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
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
      <span className="text-sm text-muted-foreground">{label}</span>
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
    default: "bg-muted text-muted-foreground",
    success: "bg-success-light text-success",
    warning: "bg-warning-light text-warning",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes[variant]}`}
    >
      {label}
    </span>
  );
}

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
      if (!response.ok) throw new Error("Fehler beim Erstellen des Backups!");
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
        <h2 className="text-base font-semibold text-foreground mb-3">
          Schnellaktionen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <ActionCard
            title="Excel-Backup"
            dataCy="admin-excel-backup-button"
            description="Alle Daten als Excel herunterladen"
            icon={Download}
            onClick={handleBackup}
            colorVar="var(--success)"
            loading={backupLoading}
          />
          <ActionCard
            title="System-Health"
            description="Detaillierte Systemdiagnose"
            icon={HeartPulse}
            onClick={() => router.push("/admin/health")}
            colorVar="var(--info)"
          />
          <ActionCard
            title="Einstellungen"
            description="Konfiguration anzeigen"
            icon={Settings}
            onClick={() => router.push("/admin/settings")}
            colorVar="var(--secondary)"
          />
        </div>

        <div
          className={`rounded-2xl border p-5 mb-8 bg-gradient-to-br ${mainConfig.gradientFrom} ${mainConfig.gradientTo} ${mainConfig.borderClass}`}
        >
          {loading && !data ? (
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Lade Systemstatus...
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Fehler beim Laden
                </p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : data ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${mainConfig.cssVar} 12%, transparent)`,
                  }}
                >
                  <MainIcon
                    className="w-7 h-7"
                    style={{ color: mainConfig.cssVar }}
                  />
                </div>
                <div>
                  <p className={`text-base font-bold ${mainConfig.text}`}>
                    {mainConfig.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Version {data.version || "unbekannt"} · Aktualisiert:{" "}
                    {new Date(data.timestamp).toLocaleTimeString("de-DE")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/admin/health")}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-muted/50 ${mainConfig.text} ${mainConfig.borderClass}`}
              >
                <HeartPulse className="w-4 h-4" />
                Details anzeigen
              </button>
            </div>
          ) : null}
        </div>

        {data && (
          <>
            <h2 className="text-base font-semibold text-foreground mb-3">
              Statistiken
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <StatCard
                title="Bücher"
                value={(data.checks.data.details?.books as number) ?? "-"}
                icon={Book}
                colorVar="var(--primary)"
              />
              <StatCard
                title="Nutzer"
                value={(data.checks.data.details?.users as number) ?? "-"}
                icon={Users}
                colorVar="var(--secondary)"
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

            <h2 className="text-base font-semibold text-foreground mb-3">
              Systeminfo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
                <MemoryBar
                  percent={data.system.memory.usedPercent}
                  used={data.system.memory.used}
                  total={data.system.memory.total}
                />
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Uptime
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatUptime(data.system.uptime)}
                  </span>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border shadow-sm p-5">
                <div className="divide-y divide-border">
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
                    <span className="text-sm font-semibold text-foreground">
                      {data.environment.nodeVersion}
                    </span>
                  </InfoRow>
                  <InfoRow label="Plattform">
                    <span className="text-sm font-semibold text-foreground">
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

            {data.stats?.lastActivity && (
              <div className="mt-6 flex items-center gap-2 text-muted-foreground">
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
