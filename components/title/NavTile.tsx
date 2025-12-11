import palette from "@/styles/palette";
import { alpha, Box, Typography } from "@mui/material";
import { ReactNode } from "react";

interface NavTileProps {
  title: string;
  subtitle: string;
  slug: string;
  icon?: ReactNode;
  onClick: () => void;
}

export default function NavTile({
  title,
  subtitle,
  slug,
  icon,
  onClick,
}: NavTileProps) {
  return (
    <Box
      onClick={onClick}
      data-cy={`index_${slug.substring(1)}_button`}
      sx={{
        width: 220,
        height: 180,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
        borderRadius: 4,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        bgcolor: alpha(palette.background.paper, 0.85),
        backdropFilter: "blur(12px)",
        border: `1px solid ${alpha(palette.primary.main, 0.15)}`,
        boxShadow: `0 8px 32px ${alpha(palette.primary.dark, 0.15)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${palette.primary.main}, ${palette.primary.light})`,
          opacity: 0,
          transition: "opacity 0.3s ease",
        },
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: `0 16px 48px ${alpha(palette.primary.main, 0.25)}`,
          border: `1px solid ${alpha(palette.primary.main, 0.3)}`,
          "&::before": {
            opacity: 1,
          },
          "& .nav-icon": {
            transform: "scale(1.1)",
            color: palette.primary.main,
          },
          "& .nav-title": {
            color: palette.primary.main,
          },
        },
        "&:active": {
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Icon */}
      {icon && (
        <Box
          className="nav-icon"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 3,
            bgcolor: alpha(palette.primary.main, 0.1),
            color: palette.primary.dark,
            mb: 2,
            transition: "all 0.3s ease",
            "& svg": {
              fontSize: 28,
            },
          }}
        >
          {icon}
        </Box>
      )}

      {/* Title */}
      <Typography
        className="nav-title"
        variant="h6"
        sx={{
          fontWeight: 600,
          color: palette.primary.dark,
          mb: 0.5,
          transition: "color 0.3s ease",
        }}
      >
        {title}
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="body2"
        sx={{
          color: palette.text.secondary,
          lineHeight: 1.4,
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}
