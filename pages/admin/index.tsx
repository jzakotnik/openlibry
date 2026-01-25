import Layout from "@/components/layout/Layout";
import palette from "@/styles/palette";
import {
  ArrowForward,
  Book,
  CheckCircle,
  CloudDownload,
  Error as ErrorIcon,
  EventNote,
  HealthAndSafety,
  Info,
  Memory,
  People,
  Schedule,
  Settings,
  Warning,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Stack,
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
    label: "Alles in Ordnung",
  },
  warning: {
    color: "#f59e0b",
    bgColor: "#fef3c7",
    textColor: "#92400e",
    icon: Warning,
    label: "Warnungen vorhanden",
  },
  error: {
    color: "#ef4444",
    bgColor: "#fee2e2",
    textColor: "#991b1b",
    icon: ErrorIcon,
    label: "Fehler erkannt",
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

// Quick action card component
function ActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  color = palette.primary.main,
  loading = false,
}: {
  title: string;
  description: string;
  icon: typeof CloudDownload;
  onClick: () => void;
  color?: string;
  loading?: boolean;
}) {
  return (
    <Card
      sx={{
        height: "100%",
        cursor: "pointer",
        transition: "all 0.2s ease",
        border: `1px solid ${alpha(color, 0.2)}`,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
          borderColor: color,
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(color, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color }} />
            ) : (
              <Icon sx={{ color, fontSize: 24 }} />
            )}
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.primary">
              {description}
            </Typography>
          </Box>
          <ArrowForward sx={{ color: "text.disabled" }} />
        </Stack>
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
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: typeof Book;
  color?: string;
  subtitle?: string;
}) {
  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: alpha(color, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ color, fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            {typeof value === "number" ? value.toLocaleString("de-DE") : value}
          </Typography>
          <Typography variant="body2" color="text.primary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.disabled">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
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

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen des Backups!");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const today = new Date();
      const dateStr = `${today.getFullYear()}_${String(
        today.getMonth() + 1,
      ).padStart(2, "0")}_${String(today.getDate()).padStart(2, "0")}`;
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

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={4}
        ></Stack>{" "}
        {/* Quick Actions */}
        <Typography variant="h6" fontWeight={600} mb={2}>
          Schnellaktionen
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <ActionCard
              title="Excel-Backup"
              description="Alle Daten als Excel herunterladen"
              icon={CloudDownload}
              onClick={handleBackup}
              color="#10b981"
              loading={backupLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <ActionCard
              title="System-Health"
              description="Detaillierte Systemdiagnose"
              icon={HealthAndSafety}
              onClick={() => router.push("/admin/health")}
              color="#6366f1"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <ActionCard
              title="Einstellungen"
              description="Konfiguration anzeigen"
              icon={Settings}
              onClick={() => router.push("/admin/settings")}
              color="#8b5cf6"
            />
          </Grid>
        </Grid>
        {/* Health Status Banner */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: loading
              ? undefined
              : `linear-gradient(135deg, ${alpha(mainConfig.color, 0.1)} 0%, ${alpha(mainConfig.color, 0.05)} 100%)`,
            border: `1px solid ${alpha(mainConfig.color, 0.2)}`,
          }}
        >
          {loading && !data ? (
            <Stack direction="row" alignItems="center" spacing={2}>
              <CircularProgress size={24} />
              <Typography color="text.primary">Lade Systemstatus...</Typography>
            </Stack>
          ) : error ? (
            <Stack direction="row" alignItems="center" spacing={2}>
              <ErrorIcon sx={{ color: "error.main" }} />
              <Box>
                <Typography fontWeight={600} color="error.main">
                  Fehler beim Laden
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {error}
                </Typography>
              </Box>
            </Stack>
          ) : data ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: mainConfig.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MainIcon sx={{ fontSize: 28, color: mainConfig.color }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={mainConfig.textColor}
                  >
                    {mainConfig.label}
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    Version {data.version || "unbekannt"} · Aktualisiert:{" "}
                    {new Date(data.timestamp).toLocaleTimeString("de-DE")}
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="outlined"
                startIcon={<HealthAndSafety />}
                onClick={() => router.push("/admin/health")}
                sx={{
                  borderColor: mainConfig.color,
                  color: mainConfig.color,
                  "&:hover": {
                    borderColor: mainConfig.color,
                    bgcolor: alpha(mainConfig.color, 0.05),
                  },
                }}
              >
                Details anzeigen
              </Button>
            </Stack>
          ) : null}
        </Paper>
        {data && (
          <>
            {/* Statistics */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              Statistiken
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                  title="Bücher"
                  value={(data.checks.data.details?.books as number) ?? "-"}
                  icon={Book}
                  color="#3b82f6"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                  title="Nutzer"
                  value={(data.checks.data.details?.users as number) ?? "-"}
                  icon={People}
                  color="#8b5cf6"
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

            {/* System Info */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              Systeminfo
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Memory sx={{ color: "text.primary" }} />
                        <Typography variant="body2" color="text.primary">
                          Speichernutzung
                        </Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={600}>
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
                    <Divider />
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Schedule sx={{ color: "text.primary" }} />
                        <Typography variant="body2" color="text.primary">
                          Uptime
                        </Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={600}>
                        {formatUptime(data.system.uptime)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.primary">
                        Umgebung
                      </Typography>
                      <Chip
                        label={data.environment.nodeEnv}
                        size="small"
                        color={
                          data.environment.nodeEnv === "production"
                            ? "success"
                            : "warning"
                        }
                      />
                    </Stack>
                    <Divider />
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.primary">
                        Node.js
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {data.environment.nodeVersion}
                      </Typography>
                    </Stack>
                    <Divider />
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.primary">
                        Plattform
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {data.system.platform} ({data.system.arch})
                      </Typography>
                    </Stack>
                    <Divider />
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.primary">
                        Authentifizierung
                      </Typography>
                      <Chip
                        label={
                          data.environment.authEnabled
                            ? "Aktiviert"
                            : "Deaktiviert"
                        }
                        size="small"
                        color={
                          data.environment.authEnabled ? "success" : "default"
                        }
                      />
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {/* Last Activity */}
            {data.stats?.lastActivity && (
              <Box mt={3}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  color="text.primary"
                >
                  <Info fontSize="small" />
                  <Typography variant="body2">
                    Letzte Aktivität:{" "}
                    {new Date(data.stats.lastActivity).toLocaleString("de-DE")}
                  </Typography>
                </Stack>
              </Box>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
}
