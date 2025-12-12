import { Chip } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

type StatusType = "available" | "rented" | "overdue" | "lost";

interface StatusBadgeProps {
  status: StatusType;
  compact?: boolean;
}

const statusConfig: Record<
  StatusType,
  { label: string; color: string; icon: React.ReactNode }
> = {
  available: {
    label: "Verfügbar",
    color: "#507666",
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />,
  },
  rented: {
    label: "Ausgeliehen",
    color: "#BD900D",
    icon: <ScheduleIcon sx={{ fontSize: 16 }} />,
  },
  overdue: {
    label: "Überfällig",
    color: "#C80538",
    icon: <WarningAmberIcon sx={{ fontSize: 16 }} />,
  },
  lost: {
    label: "Verloren",
    color: "#5A6166",
    icon: <WarningAmberIcon sx={{ fontSize: 16 }} />,
  },
};

export default function StatusBadge({
  status,
  compact = false,
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.available;

  return (
    <Chip
      icon={config.icon as React.ReactElement}
      label={compact ? undefined : config.label}
      size="small"
      sx={{
        background: `${config.color}15`,
        color: config.color,
        fontWeight: 600,
        fontSize: "12px",
        borderRadius: "20px",
        "& .MuiChip-icon": {
          color: config.color,
          marginLeft: compact ? "4px" : "8px",
          marginRight: compact ? "-6px" : "-4px",
        },
        ...(compact && {
          "& .MuiChip-label": {
            display: "none",
          },
          minWidth: "32px",
          paddingLeft: 0,
          paddingRight: 0,
        }),
      }}
    />
  );
}
