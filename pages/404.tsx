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

import { useRouter } from "next/router";
import { publicNavItems } from "@/components/layout/navigationItems";
import palette from "@/styles/palette";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();

  return (
    <Layout>
      {" "}
      <Typography
        variant="h1"
        align="center"
        sx={{ fontWeight: "bold", fontSize: 30 }}
      >
        Die Seite konnte leider nicht gefunden werden - ist der Link korrekt?
      </Typography>
    </Layout>
  );
}
