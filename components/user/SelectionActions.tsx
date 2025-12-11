import palette from "@/styles/palette";
import { alpha, IconButton, Tooltip } from "@mui/material";
import { ReactNode } from "react";

interface SelectionActionsProps {
  checked: Record<string, boolean>;
  action: () => void;
  actionTitle: string;
  icon: ReactNode;
  color?: "primary" | "error" | "warning";
}

export default function SelectionActions({
  checked,
  icon,
  action,
  actionTitle,
  color = "primary",
}: SelectionActionsProps) {
  const selectedCount = Object.values(checked).filter(Boolean).length;

  if (selectedCount === 0) {
    return null;
  }

  const colorMap = {
    primary: palette.primary.main,
    error: palette.error.main,
    warning: palette.warning.main,
  };

  return (
    <Tooltip title={actionTitle}>
      <IconButton
        onClick={action}
        aria-label={actionTitle}
        sx={{
          p: "10px",
          color: colorMap[color],
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: alpha(colorMap[color], 0.1),
            transform: "scale(1.05)",
          },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
}
