import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

export default function Footer() {
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
        <Grid container item columnSpacing={2} xs={12} md="auto">
          <Grid item xs={12} md={4}>
            <Typography variant="body2">Copyright</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2">Impressum</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2">Datenschutz</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
