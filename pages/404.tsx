import Layout from "@/components/layout/Layout";
import Typography from "@mui/material/Typography";
import { Inter } from "next/font/google";

import { useRouter } from "next/router";

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
