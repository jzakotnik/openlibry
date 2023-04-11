import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
import Layout from "@/components/layout/Layout";
import TitleTile from "@/components/title/TitleTile";
import splashbanner from "../components/title/splashbanner.jpg";
import admin_icon from "../components/title/admin-icon.jpg";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const onClick = (e: any) => {};

  return (
    <Layout>
      <Image
        src={splashbanner}
        alt={"image"}
        sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
        fill
        style={{
          objectFit: "fill",
          backgroundPosition: "center",
          backgroundSize: "cover",
          zIndex: "-1",
        }}
      />
      <Grid
        container
        alignItems="center"
        direction="column"
        sx={{
          py: 4,
          minHeight: 600,
        }}
      >
        <Grid item>
          <Typography
            variant="h1"
            align="center"
            sx={{ fontWeight: "bold", fontSize: 40 }}
          >
            Open Libry - die <b>einfache</b> Bücherei Verwaltung
          </Typography>
        </Grid>

        <Grid container alignItems="center" sx={{ pt: 6, mt: 8, m: 8 }}>
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
            sx={{ px: 10 }}
          >
            {" "}
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              justifyContent="center"
              sx={{
                display: "flex",
                justifyContent: "center",
                position: "relative",
                mb: 0,
              }}
            >
              <TitleTile
                title="User"
                subtitle="Verwaltung Nutzerinnen"
                onClick={onClick}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              justifyContent="center"
              sx={{
                display: "flex",
                justifyContent: "center",
                position: "relative",
                mb: 0,
              }}
            >
              <TitleTile
                title="Bücher"
                subtitle="Verwaltung Bücher"
                onClick={onClick}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              justifyContent="center"
              sx={{
                display: "flex",
                justifyContent: "center",
                position: "relative",
                mb: 0,
              }}
            >
              <TitleTile
                title="Admin"
                subtitle="Einstellungen"
                onClick={onClick}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              justifyContent="center"
              sx={{
                display: "flex",
                justifyContent: "center",
                position: "relative",
                mb: 0,
              }}
            >
              <TitleTile
                title="Reports"
                subtitle="Überblick"
                onClick={onClick}
              />
            </Grid>
          </Grid>{" "}
        </Grid>
      </Grid>
    </Layout>
  );
}
