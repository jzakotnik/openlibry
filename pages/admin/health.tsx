import Layout from "@/components/layout/Layout";
import palette from "@/styles/palette";
import {
  ArrowBack,
  Book,
  CheckCircle,
  DataObject,
  Error as ErrorIcon,
  EventNote,
  Folder,
  InsertDriveFile,
  Memory,
  Refresh,
  Schedule,
  Storage,
  Warning,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// Types matching the API response
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

// Status styling
const statusConfig = {
  ok: {
    color: "#10b981",
    bgColor: "#d1fae5",
    textColor: "#065f46",
    icon: CheckCircle,
    label: "OK",
  },
  warning: {
    color: "#f59e0b",
    bgColor: "#fef3c7",
    textColor: "#92400e",
    icon: Warning,
    label: "Warnung",
  },
  error: {
    color: "#ef4444",
    bgColor: "#fee2e2",
    textColor: "#991b1b",
    icon: ErrorIcon,
    label: "Fehler",
  },
};

// Format bytes
function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
}

// Format uptime
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

// Status badge component
function StatusBadge({ status }: { status: CheckStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Chip
      icon={<Icon sx={{ fontSize: 16 }} />}
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bgColor,
        color: config.textColor,
        fontWeight: 600,
        "& .MuiChip-icon": { color: config.color },
      }}
    />
  );
}

// Check card component
function CheckCard({
  title,
  icon: Icon,
  check,
}: {
  title: string;
  icon: typeof Storage;
  check: CheckResult;
}) {
  const config = statusConfig[check.status];

  const formatDetailValue = (key: string, value: unknown): string => {
    if (typeof value === "object" && value !== null) {
      const obj = value as Record<string, unknown>;

      // Folder status
      if ("exists" in obj && "writable" in obj && !("configured" in obj)) {
        const exists = obj.exists ? "✓ vorhanden" : "✗ fehlt";
        const writable = obj.writable ? ", beschreibbar" : "";
        const fileCount =
          typeof obj.fileCount === "number"
            ? ` (${obj.fileCount.toLocaleString("de-DE")} Bilder)`
            : "";
        return `${exists}${writable}${fileCount}`;
      }

      // File status
      if ("exists" in obj && "configured" in obj) {
        const status = obj.exists ? "✓ vorhanden" : "✗ fehlt";
        const configured = obj.configured ? " (konfiguriert)" : " (Standard)";
        return `${status}${configured}`;
      }

      return JSON.stringify(obj);
    }

    if (typeof value === "number") {
      return value.toLocaleString("de-DE");
    }

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
      database: "Datenbank-Ordner",
      public: "Public-Ordner",
      prisma: "Prisma-Ordner",
      covers: "Cover-Bilder",
      size: "Größe",
      sizeFormatted: "Dateigröße",
    };
    return labels[key] || key;
  };

  // Filter out raw size if formatted size exists
  const filteredDetails = check.details
    ? Object.fromEntries(
        Object.entries(check.details).filter(
          ([key]) => !(key === "size" && check.details?.sizeFormatted),
        ),
      )
    : undefined;

  return (
    <Card
      sx={{
        height: "100%",
        borderLeft: 4,
        borderColor: config.color,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon sx={{ color: config.color }} />
            <Typography variant="h6" component="h3">
              {title}
            </Typography>
          </Stack>
          <StatusBadge status={check.status} />
        </Stack>

        <Typography color="text.secondary" variant="body2" mb={1}>
          {check.message}
        </Typography>

        {filteredDetails && Object.keys(filteredDetails).length > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: "grey.50",
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.8rem",
            }}
          >
            {Object.entries(filteredDetails).map(([key, value]) => (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  gap: 1,
                  py: 0.25,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    color: "text.secondary",
                    minWidth: 120,
                    fontFamily: "inherit",
                    fontSize: "inherit",
                  }}
                >
                  {getKeyLabel(key)}:
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    color: "text.primary",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    wordBreak: "break-all",
                  }}
                >
                  {formatDetailValue(key, value)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// Stat card component
function StatCard({
  title,
  value,
  icon: Icon,
  color = palette.primary.main,
}: {
  title: string;
  value: string | number;
  icon: typeof Book;
  color?: string;
}) {
  return (
    <Paper sx={{ p: 2, textAlign: "center" }}>
      <Icon sx={{ fontSize: 32, color, mb: 1 }} />
      <Typography variant="h4" fontWeight="bold" color={palette.text.primary}>
        {typeof value === "number" ? value.toLocaleString("de-DE") : value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );
}

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

    // Auto-refresh every 30 seconds
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

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={4}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Tooltip title="Zurück zur Administration">
              <IconButton onClick={() => router.push("/admin")}>
                <ArrowBack />
              </IconButton>
            </Tooltip>
          </Stack>
          <Tooltip title="Aktualisieren">
            <IconButton onClick={fetchHealth} disabled={loading}>
              <Refresh
                sx={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Main Status Card */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: loading
              ? undefined
              : `linear-gradient(135deg, ${alpha(mainConfig.color, 0.1)} 0%, ${alpha(mainConfig.color, 0.05)} 100%)`,
            border: `1px solid ${alpha(mainConfig.color, 0.2)}`,
          }}
        >
          {loading && !data ? (
            <Box textAlign="center" py={4}>
              <CircularProgress />
              <Typography color="text.secondary" mt={2}>
                Lade Systemstatus...
              </Typography>
            </Box>
          ) : error ? (
            <Box textAlign="center" py={4}>
              <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
              <Typography variant="h5" color="error.main">
                Fehler beim Laden
              </Typography>
              <Typography color="text.secondary">{error}</Typography>
            </Box>
          ) : data ? (
            <>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems="center"
                spacing={2}
                mb={2}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: mainConfig.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MainIcon sx={{ fontSize: 32, color: mainConfig.color }} />
                </Box>
                <Box flex={1}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={mainConfig.textColor}
                  >
                    {mainStatus === "ok" && "Alles in Ordnung"}
                    {mainStatus === "warning" && "Warnungen vorhanden"}
                    {mainStatus === "error" && "Fehler erkannt"}
                  </Typography>
                  <Typography color="text.secondary">
                    Stand: {new Date(data.timestamp).toLocaleString("de-DE")}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Meta info */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    VERSION
                  </Typography>
                  <Typography fontWeight="bold">
                    {data.version || "unbekannt"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    UMGEBUNG
                  </Typography>
                  <Typography fontWeight="bold">
                    {data.environment.nodeEnv}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    AUTHENTIFIZIERUNG
                  </Typography>
                  <Typography fontWeight="bold">
                    {data.environment.authEnabled ? "Aktiviert" : "Deaktiviert"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    NODE.JS
                  </Typography>
                  <Typography fontWeight="bold">
                    {data.environment.nodeVersion}
                  </Typography>
                </Grid>
              </Grid>
            </>
          ) : null}
        </Paper>

        {data && (
          <>
            {/* System Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                  title="Speicher belegt"
                  value={`${data.system.memory.usedPercent}%`}
                  icon={Memory}
                  color="#8b5cf6"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                  title="Uptime"
                  value={formatUptime(data.system.uptime)}
                  icon={Schedule}
                  color="#06b6d4"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                  title="Aktive Ausleihen"
                  value={data.stats?.activeRentals ?? "-"}
                  icon={Book}
                  color="#10b981"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                  title="Überfällig"
                  value={data.stats?.overdueBooks ?? "-"}
                  icon={EventNote}
                  color={
                    data.stats?.overdueBooks && data.stats.overdueBooks > 0
                      ? "#ef4444"
                      : "#10b981"
                  }
                />
              </Grid>
            </Grid>

            {/* Memory Bar */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="body2" color="text.secondary">
                  Speichernutzung
                </Typography>
                <Typography variant="body2">
                  {formatBytes(data.system.memory.used)} /{" "}
                  {formatBytes(data.system.memory.total)}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={data.system.memory.usedPercent}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    bgcolor:
                      data.system.memory.usedPercent > 90
                        ? "error.main"
                        : data.system.memory.usedPercent > 70
                          ? "warning.main"
                          : "success.main",
                    borderRadius: 4,
                  },
                }}
              />
            </Paper>

            {/* Check Cards */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CheckCard
                  title="Datenbank"
                  icon={Storage}
                  check={data.checks.database}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CheckCard
                  title="Datenbestand"
                  icon={DataObject}
                  check={data.checks.data}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CheckCard
                  title="Verzeichnisse"
                  icon={Folder}
                  check={data.checks.folders}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CheckCard
                  title="Dateien"
                  icon={InsertDriveFile}
                  check={data.checks.files}
                />
              </Grid>
            </Grid>

            {/* Footer */}
            <Box textAlign="center" mt={4}>
              <Typography color="text.secondary" variant="body2">
                <a
                  href="/api/health"
                  style={{
                    color: palette.primary.main,
                    textDecoration: "none",
                  }}
                >
                  JSON-API
                </a>
                {" · "}
                <a
                  href="https://github.com/jzakotnik/openlibry"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: palette.primary.main,
                    textDecoration: "none",
                  }}
                >
                  GitHub
                </a>
                {" · "}
                {data.system.platform} ({data.system.arch})
              </Typography>
            </Box>
          </>
        )}
      </Container>
    </Layout>
  );
}
