import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import router from "next/router";
import { CARD_HEIGHT } from "./cardConstants";

type LinkCardProps = {
  title: string;
  subtitle: string;
  buttonTitle: string;
  link: string;
  dataCy?: string;
};

export default function LinkCard({
  title,
  subtitle,
  buttonTitle,
  link,
  dataCy,
}: LinkCardProps) {
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
          {buttonTitle}
        </Button>
      </CardActions>
    </Card>
  );
}
