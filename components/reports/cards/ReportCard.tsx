import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import router from "next/router";
import {
  cardAccentSx,
  cardActionButtonSx,
  cardBaseSx,
  metricSx,
} from "./cardConstants";
import palette from "@/styles/palette";

type ReportCardProps = {
  title: string;
  subtitle: string;
  unit: string;
  link: string;
  totalNumber: number;
};

export default function ReportCard({
  title,
  subtitle,
  unit,
  link,
  totalNumber,
}: ReportCardProps) {
  const dataCy = `report-card-${unit}`;

  return (
    <Card sx={cardBaseSx} data-cy={dataCy}>
      <Box sx={cardAccentSx(palette.secondary.main)} />
      <CardContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, color: palette.text.secondary, mb: 2 }}
          data-cy={`${dataCy}-title`}
        >
          {title}
        </Typography>

        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1 }}>
          <Typography sx={metricSx} data-cy={`${dataCy}-count`}>
            {totalNumber.toLocaleString("de-DE")}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: palette.text.disabled,
              fontWeight: 500,
            }}
          >
            {unit}
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          sx={{ color: palette.text.disabled, lineHeight: 1.5 }}
          data-cy={`${dataCy}-subtitle`}
        >
          {subtitle}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 3, pb: 2 }}>
        <Button
          size="small"
          onClick={() => router.push(link)}
          sx={cardActionButtonSx}
          data-cy={`${dataCy}-button`}
        >
          Erzeuge Tabelle
        </Button>
      </CardActions>
    </Card>
  );
}
