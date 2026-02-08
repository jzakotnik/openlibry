import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import router from "next/router";
import { CARD_HEIGHT } from "./cardConstants";

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
    <Card
      variant="outlined"
      sx={{ minWidth: 275, minHeight: CARD_HEIGHT }}
      data-cy={dataCy}
    >
      <CardContent>
        <Typography variant="h5" component="div" data-cy={`${dataCy}-title`}>
          {title}
        </Typography>
        <Typography
          sx={{ mb: 1.5 }}
          color="text.secondary"
          data-cy={`${dataCy}-count`}
        >
          {totalNumber}
        </Typography>
        <Typography variant="body2" data-cy={`${dataCy}-subtitle`}>
          {subtitle}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => router.push(link)}
          data-cy={`${dataCy}-button`}
        >
          Erzeuge Tabelle
        </Button>
      </CardActions>
    </Card>
  );
}
