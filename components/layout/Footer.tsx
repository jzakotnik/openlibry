import { Link } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

export default function Footer() {
  const [currentVersion, setCurrentVersion] = useState<string>("");

  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => {
        setCurrentVersion(data.version); // adjust based on your API response shape
      })
      .catch((err) => console.error("Failed to fetch version:", err));
  }, []);

  return (
    <Box
      sx={{
        flexGrow: 1,
        textAlign: "center",
        paddingBottom: "24px",
        paddingTop: "48px",
      }}
    >
      <Grid
        container
        alignItems="center"
        justifyContent="space-around"
        rowSpacing={5}
      >
        <Grid container columnSpacing={2} size={{ xs: 12, md: "auto" }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="body2">
              <Link href="https://openlibry.de">Copyright</Link>
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="body2">
              <Link href="https://openlibry.de">Impressum</Link>
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="body2">
              <Link href="https://openlibry.de">Datenschutz</Link>
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="body2">v{currentVersion || "..."}</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
