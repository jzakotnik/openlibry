import { Box, Typography } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import palette from "@/styles/palette";

interface RentHintProps {
  userName: string;
}

export default function RentHint({ userName }: RentHintProps) {
  return (
    <Box
      sx={{
        background: `linear-gradient(90deg, ${palette.secondary.main}15 0%, transparent 100%)`,
        borderLeft: `4px solid ${palette.secondary.main}`,
        borderRadius: "0 12px 12px 0",
        padding: "12px 16px",
        marginBottom: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.25,
      }}
      data-cy="rent_hint"
    >
      <LightbulbIcon sx={{ color: palette.secondary.main, fontSize: 24 }} />
      <Typography sx={{ color: "#5A6166", fontSize: "14px" }}>
        Buch auswählen um es an{" "}
        <Box
          component="span"
          sx={{ fontWeight: 600, color: palette.primary.main }}
        >
          {userName}
        </Box>{" "}
        auszuleihen
      </Typography>
    </Box>
  );
}
