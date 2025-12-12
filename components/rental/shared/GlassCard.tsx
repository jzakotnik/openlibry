import { Box, SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

export default function GlassCard({ children, sx = {} }: GlassCardProps) {
  return (
    <Box
      sx={{
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(16px)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow:
          "0 8px 32px rgba(18, 85, 111, 0.08), 0 2px 8px rgba(18, 85, 111, 0.04)",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
