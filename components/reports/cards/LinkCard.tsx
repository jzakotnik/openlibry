import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import router from "next/router";
import { cardAccentSx, cardActionButtonSx, cardBaseSx } from "./cardConstants";
import palette from "@/styles/palette";
import type { ReactNode } from "react";

type LinkCardProps = {
  title: string;
  subtitle: string;
  buttonTitle: string;
  link: string;
  dataCy?: string;
  icon?: ReactNode;
};

export default function LinkCard({
  title,
  subtitle,
  buttonTitle,
  link,
  dataCy,
  icon,
}: LinkCardProps) {
  return (
    <Card sx={cardBaseSx} data-cy={dataCy}>
      <Box sx={cardAccentSx(palette.primary.main)} />
      <CardContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        {icon && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: `${palette.primary.main}0F`,
              color: palette.primary.main,
              mb: 1.5,
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, color: palette.text.secondary, mb: 1 }}
          data-cy={`${dataCy}-title`}
        >
          {title}
        </Typography>
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
          {buttonTitle}
        </Button>
      </CardActions>
    </Card>
  );
}
