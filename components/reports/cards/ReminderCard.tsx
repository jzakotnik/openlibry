import palette from "@/styles/palette";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import {
  cardAccentSx,
  cardActionButtonSx,
  cardBaseSx,
  metricSx,
} from "./cardConstants";

export type ReminderMode = "all" | "non-extendable";

type ReminderCardProps = {
  title: string;
  subtitle: string;
  link: string;
  overdueCount: number;
  nonExtendableCount: number;
};

export default function ReminderCard({
  title,
  subtitle,
  link,
  overdueCount,
  nonExtendableCount,
}: ReminderCardProps) {
  const [mode, setMode] = useState<ReminderMode>("all");
  const { enqueueSnackbar } = useSnackbar();

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: ReminderMode | null,
  ) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const getReminderUrl = () => {
    return `${link}?mode=${mode}`;
  };

  const currentCount = mode === "all" ? overdueCount : nonExtendableCount;

  const handleGenerateClick = () => {
    if (currentCount === 0) {
      const message =
        mode === "all"
          ? "Keine überfälligen Ausleihen vorhanden."
          : "Keine nicht verlängerbaren überfälligen Ausleihen vorhanden.";
      enqueueSnackbar(message, { variant: "info" });
      return;
    }
    window.open(getReminderUrl(), "_blank");
  };

  return (
    <Card sx={cardBaseSx} data-cy="reminder-card">
      <Box sx={cardAccentSx(palette.error.main)} />
      <CardContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, color: palette.text.secondary, mb: 2 }}
          data-cy="reminder-card-title"
        >
          {title}
        </Typography>

        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}>
          <Typography
            sx={{
              ...metricSx,
              color:
                currentCount > 0 ? palette.error.main : palette.success.main,
            }}
            data-cy="reminder-card-count"
          >
            {currentCount}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: palette.text.disabled,
              fontWeight: 500,
            }}
          >
            {currentCount === 1 ? "Mahnung" : "Mahnungen"}
          </Typography>
        </Stack>

        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          size="small"
          sx={{
            mb: 1.5,
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontSize: "0.75rem",
              fontWeight: 500,
              px: 1.5,
              py: 0.5,
              borderRadius: "8px !important",
              border: `1px solid #e0e0e0`,
              color: palette.text.secondary,
              "&.Mui-selected": {
                backgroundColor: `${palette.primary.main}12`,
                color: palette.primary.main,
                borderColor: `${palette.primary.main}40`,
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: `${palette.primary.main}1A`,
                },
              },
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            },
            "& .MuiToggleButtonGroup-grouped:not(:first-of-type)": {
              ml: 0.5,
              borderLeft: `1px solid #e0e0e0`,
            },
          }}
          data-cy="reminder-mode-toggle"
        >
          <ToggleButton value="all" data-cy="reminder-mode-all">
            Alle Mahnungen
          </ToggleButton>
          <ToggleButton
            value="non-extendable"
            data-cy="reminder-mode-non-extendable"
          >
            Nur nicht verlängerbare
          </ToggleButton>
        </ToggleButtonGroup>

        <Typography
          variant="body2"
          sx={{ color: palette.text.disabled, lineHeight: 1.5 }}
          data-cy="reminder-card-subtitle"
        >
          {subtitle}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 3, pb: 2 }}>
        <Button
          size="small"
          onClick={handleGenerateClick}
          sx={cardActionButtonSx}
          data-cy="reminder-card-button"
        >
          Erzeuge Word
        </Button>
      </CardActions>
    </Card>
  );
}
