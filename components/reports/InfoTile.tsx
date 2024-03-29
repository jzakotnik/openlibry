import Box from "@mui/material/Box";
import Card from "@mui/material/Card";

import { Divider, Typography } from "@mui/material";

interface InfoTileType {
  title: string;
  subtitle: string;
  value: number;
}

interface ValueBoxType {
  value: number;
  kind: string;
}

export default function InfoTile({
  title = "No Title",
  subtitle = "No Subtitle",
  value = 0,
}: InfoTileType) {
  //console.log("Info tile", title, subtitle, value);

  const ValueBox = ({ value, kind }: ValueBoxType) => {
    return (
      <Box
        sx={{
          flexDirection: "column",
          display: "flex",
          justifyContent: "center",
          width: "100%",
          py: 1,
        }}
      >
        <Typography
          color="primary"
          sx={{
            fontSize: "14px !important",
            fontWeight: "bold !important",
          }}
        >
          {Number(value).toLocaleString("de-DE")}
        </Typography>
        <Typography variant="button" sx={{ fontSize: 8 }}>
          {kind}
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        textAlign: "center",
        py: 0.5,
      }}
    >
      <Card variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Typography
          color="primary"
          sx={{
            fontSize: "16px !important",
            fontWeight: "bold !important",
            py: 1,
          }}
        >
          {title}
        </Typography>
        <Divider sx={{ mx: 2 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <ValueBox value={value} kind={subtitle} />
        </Box>
        <Divider sx={{ mx: 2 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
          }}
        ></Box>
      </Card>
    </Box>
  );
}
