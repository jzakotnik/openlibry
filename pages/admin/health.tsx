import Layout from "@/components/layout/Layout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { t } from "@/lib/i18n";
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
  Info,
  KeyRound,
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
    apiKeys: CheckResult;
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
// Status config — labels resolved once at module load (locale is fixed)
// ─────────────────────────────────────────────────────────────────────────────

const statusConfig = {
  ok: {
    cssVar: "var(--success)",
    bg: "bg-success-light",
    text: "text-success",
    border: "border-success",
    icon: CheckCircle,
    label: t("healthPage.statusOk"),
    gradientFrom: "from-success/10",
    gradientTo: "to-success/5",
    borderOpacity: "border-success/20",
  },
  warning: {
    cssVar: "var(--warning)",
    bg: "bg-warning-light",
    text: "text-warning",
    border: "border-warning",
    icon: AlertTriangle,
    label: t("healthPage.statusWarning"),
    gradientFrom: "from-warning/10",
    gradientTo: "to-warning/5",
    borderOpacity: "border-warning/20",
  },
  error: {
    cssVar: "var(--destructive)",
    bg: "bg-destructive-light",
    text: "text-destructive",
    border: "border-destructive",
    icon: XCircle,
    label: t("healthPage.statusError"),
    gradientFrom: "from-destructive/10",
    gradientTo: "to-destructive/5",
    borderOpacity: "border-destructive/20",
  },
};

// Environment table labels — built once so we can index by position
const ENV_LABELS = [
  t("healthPage.envLabels.version"),
  t("healthPage.envLabels.environment"),
  t("healthPage.envLabels.auth"),
  t("healthPage.envLabels.node"),
] as const;

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
  colorVar = "var(--primary)",
  valueClass = "text-foreground",
  tooltip,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorVar?: string;
  valueClass?: string;
  tooltip?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 text-center hover:shadow-md transition-shadow">
      <div className="relative">
        <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: colorVar }} />
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="absolute top-0 right-0 text-muted-foreground/60 hover:text-muted-foreground cursor-help transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <p className={`text-2xl font-bold ${valueClass}`}>
        {typeof value === "number"
          ? value.toLocaleString(t("formats.numberLocale"))
          : value}
      </p>
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
        const exists = obj.exists
          ? t("healthPage.detail.exists")
          : t("healthPage.detail.missing");
        const writable = obj.writable ? t("healthPage.detail.writable") : "";
        const fileCount =
          typeof obj.fileCount === "number"
            ? ` (${obj.fileCount.toLocaleString(t("formats.numberLocale"))} ${t("healthPage.detail.files")})`
            : "";
        return `${exists}${writable}${fileCount}`;
      }
      if ("exists" in obj && "configured" in obj) {
        const status = obj.exists
          ? t("healthPage.detail.exists")
          : t("healthPage.detail.missing");
        const configured = obj.configured
          ? ` ${t("healthPage.detail.configured")}`
          : ` ${t("healthPage.detail.standard")}`;
        return `${status}${configured}`;
      }
      if ("loaded" in obj) {
        const loaded = obj.loaded
          ? t("healthPage.detail.loaded")
          : t("healthPage.detail.notLoaded");
        const active = obj.active ? `, ${t("healthPage.detail.active")}` : "";
        const purpose =
          typeof obj.purpose === "string" ? ` (${obj.purpose})` : "";
        return `${loaded}${active}${purpose}`;
      }
      return JSON.stringify(obj);
    }
    if (typeof value === "number")
      return value.toLocaleString(t("formats.numberLocale"));
    if (typeof value === "boolean")
      return value ? t("healthPage.detail.yes") : t("healthPage.detail.no");
    return String(value);
  };

  const getKeyLabel = (key: string): string => {
    const labels: Record<string, string> = {
      path: t("healthPage.detailKey.path"),
      books: t("healthPage.detailKey.books"),
      users: t("healthPage.detailKey.users"),
      loginUsers: t("healthPage.detailKey.loginUsers"),
      error: t("healthPage.detailKey.error"),
      databaseUrl: t("healthPage.detailKey.databaseUrl"),
      database: t("healthPage.detailKey.database"),
      public: t("healthPage.detailKey.public"),
      prisma: t("healthPage.detailKey.prisma"),
      covers: t("healthPage.detailKey.covers"),
      size: t("healthPage.detailKey.size"),
      sizeFormatted: t("healthPage.detailKey.sizeFormatted"),
      apiKeys: t("healthPage.detailKey.apiKeys"),
      activeAiProvider: t("healthPage.detailKey.activeAiProvider"),
      pinnedAiProvider: t("healthPage.detailKey.pinnedAiProvider"),
    };
    return labels[key] ?? key;
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
      className="h-full bg-card rounded-xl border border-border shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
      style={{ borderLeftWidth: 4, borderLeftColor: config.cssVar }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" style={{ color: config.cssVar }} />
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
          </div>
          <StatusBadge status={check.status} />
        </div>

        <p className="text-sm text-muted-foreground mb-2">{check.message}</p>

        {filteredDetails && Object.keys(filteredDetails).length > 0 && (
          <div className="mt-3 p-3 bg-muted rounded-lg font-mono text-xs space-y-0.5">
            {Object.entries(filteredDetails).map(([key, value]) => (
              <div key={key} className="flex gap-2 flex-wrap">
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
  const barColor =
    percent > 90
      ? "bg-destructive"
      : percent > 70
        ? "bg-warning"
        : "bg-success";

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">
          {t("healthPage.memoryUsage")}
        </span>
        <span className="text-sm text-foreground">
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
      setError(
        err instanceof Error ? err.message : t("healthPage.errorLoading"),
      );
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
        <title>{t("healthPage.pageTitle")}</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/admin")}
            title={t("healthPage.backButton")}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={fetchHealth}
            disabled={loading}
            title={t("healthPage.refreshButton")}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Main Status Card */}
        <div
          className={`rounded-2xl border p-6 mb-6 bg-gradient-to-br ${mainConfig.gradientFrom} ${mainConfig.gradientTo} ${mainConfig.borderOpacity}`}
        >
          {loading && !data ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{t("healthPage.loading")}</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 mx-auto text-destructive mb-3" />
              <h2 className="text-xl font-bold text-destructive">
                {t("healthPage.errorLoading")}
              </h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : data ? (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
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
                  <h2
                    className="text-xl font-bold"
                    style={{ color: mainConfig.cssVar }}
                  >
                    {mainStatus === "ok" && t("healthPage.allOk")}
                    {mainStatus === "warning" && t("healthPage.hasWarnings")}
                    {mainStatus === "error" && t("healthPage.hasErrors")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("healthPage.timestamp")}:{" "}
                    {new Date(data.timestamp).toLocaleString(
                      t("formats.timeLocale"),
                    )}
                  </p>
                </div>
              </div>

              <div className="h-px bg-border my-4" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {ENV_LABELS.map((label, i) => (
                  <div key={label}>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {i === 0 &&
                        (data.version || t("healthPage.versionUnknown"))}
                      {i === 1 && data.environment.nodeEnv}
                      {i === 2 &&
                        (data.environment.authEnabled
                          ? t("healthPage.authEnabled")
                          : t("healthPage.authDisabled"))}
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
                title={t("healthPage.stat.memory")}
                value={`${data.system.memory.usedPercent}%`}
                icon={Cpu}
                colorVar="var(--secondary)"
                tooltip={t("healthPage.stat.memoryTooltip")}
              />
              <StatCard
                title={t("healthPage.stat.uptime")}
                value={formatUptime(data.system.uptime)}
                icon={Clock}
                colorVar="var(--info)"
                tooltip={t("healthPage.stat.uptimeTooltip")}
              />
              <StatCard
                title={t("healthPage.stat.activeRentals")}
                value={data.stats?.activeRentals ?? "-"}
                icon={Book}
                colorVar="var(--success)"
                tooltip={t("healthPage.stat.activeRentalsTooltip")}
              />
              <StatCard
                title={t("healthPage.stat.overdue")}
                value={data.stats?.overdueBooks ?? "-"}
                icon={CalendarClock}
                colorVar={
                  data.stats?.overdueBooks && data.stats.overdueBooks > 0
                    ? "var(--destructive)"
                    : "var(--success)"
                }
                tooltip={t("healthPage.stat.overdueTooltip")}
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
                title={t("healthPage.check.database")}
                icon={Database}
                check={data.checks.database}
              />
              <CheckCard
                title={t("healthPage.check.data")}
                icon={Braces}
                check={data.checks.data}
              />
              <CheckCard
                title={t("healthPage.check.folders")}
                icon={FolderOpen}
                check={data.checks.folders}
              />
              <CheckCard
                title={t("healthPage.check.files")}
                icon={FileText}
                check={data.checks.files}
              />
              <CheckCard
                title={t("healthPage.check.apiKeys")}
                icon={KeyRound}
                check={data.checks.apiKeys}
              />
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground">
              <a
                href="/api/health"
                className="text-primary hover:underline mr-4"
              >
                {t("healthPage.footer.jsonApi")}
              </a>
              <a
                href="https://github.com/jzakotnik/openlibry"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline mr-4"
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
