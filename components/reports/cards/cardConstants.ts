import type { SxProps, Theme } from "@mui/material";
import palette from "@/styles/palette";

export const CARD_HEIGHT = 210;

export type TopicCount = {
  topic: string;
  count: number;
};

// Shared card elevation & shape
export const cardBaseSx: SxProps<Theme> = {
  minWidth: 275,
  minHeight: CARD_HEIGHT,
  borderRadius: "16px",
  border: "none",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
  transition: "box-shadow 0.25s ease, transform 0.25s ease",
  overflow: "hidden",
  "&:hover": {
    boxShadow: "0 4px 16px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06)",
    transform: "translateY(-2px)",
  },
};

// Accent bar at the top of a card
export const cardAccentSx = (
  color: string = palette.primary.main,
): SxProps<Theme> => ({
  height: 4,
  width: "100%",
  background: `linear-gradient(90deg, ${color}, ${color}80)`,
});

// Primary action button style
export const cardActionButtonSx: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.8125rem",
  borderRadius: "8px",
  px: 2,
  py: 0.75,
  color: palette.primary.main,
  "&:hover": {
    backgroundColor: `${palette.primary.main}0D`,
  },
};

// Large metric number style
export const metricSx: SxProps<Theme> = {
  fontSize: "2rem",
  fontWeight: 700,
  color: palette.primary.main,
  lineHeight: 1.2,
};

// Input fields within cards
export const cardInputSx: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: "0.875rem",
    "& fieldset": {
      borderColor: "#e0e0e0",
    },
    "&:hover fieldset": {
      borderColor: palette.primary.light,
    },
    "&.Mui-focused fieldset": {
      borderColor: palette.primary.main,
      borderWidth: "1.5px",
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.8125rem",
  },
};
