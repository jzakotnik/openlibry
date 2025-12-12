import { Button, Tooltip } from "@mui/material";
import { ReactNode } from "react";

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
  primary?: boolean;
  disabled?: boolean;
  size?: "small" | "medium";
}

export default function ActionButton({
  icon,
  label,
  onClick,
  color = "#12556F",
  primary = false,
  disabled = false,
  size = "small",
}: ActionButtonProps) {
  const button = (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      sx={{
        minWidth: primary ? "auto" : "40px",
        padding: primary ? "8px 14px" : "8px 10px",
        borderRadius: "10px",
        background: disabled
          ? "#e0e0e0"
          : primary
          ? color
          : `${color}15`,
        color: disabled ? "#999" : primary ? "white" : color,
        fontWeight: 600,
        fontSize: "13px",
        textTransform: "none",
        boxShadow: primary && !disabled ? `0 4px 12px ${color}30` : "none",
        transition: "all 0.2s",
        "&:hover": {
          background: disabled
            ? "#e0e0e0"
            : primary
            ? `${color}dd`
            : `${color}25`,
          boxShadow: primary && !disabled ? `0 6px 16px ${color}40` : "none",
        },
      }}
    >
      {icon}
      {primary && <span style={{ marginLeft: "6px" }}>{label}</span>}
    </Button>
  );

  return primary ? button : <Tooltip title={label}>{button}</Tooltip>;
}
