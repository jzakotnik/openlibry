import {
  Button,
  Card,
  CardActions,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { CARD_HEIGHT } from "./cardConstants";

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

  return (
    <Card
      variant="outlined"
      sx={{ minWidth: 275, minHeight: CARD_HEIGHT }}
      data-cy="reminder-card"
    >
      <CardContent>
        <Typography variant="h5" component="div" data-cy="reminder-card-title">
          {title}
        </Typography>

        <Typography
          sx={{ mb: 1.5 }}
          color="text.secondary"
          data-cy="reminder-card-count"
        >
          {currentCount} {currentCount === 1 ? "Mahnung" : "Mahnungen"}
        </Typography>

        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          size="small"
          sx={{ mt: 1, mb: 1 }}
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

        <Typography variant="body2" data-cy="reminder-card-subtitle">
          {subtitle}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => window.open(getReminderUrl(), "_blank")}
          data-cy="reminder-card-button"
        >
          Erzeuge Word
        </Button>
      </CardActions>
    </Card>
  );
}
