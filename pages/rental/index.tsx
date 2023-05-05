import Typography from "@mui/material/Typography";
import Image from "next/image";
import Layout from "@/components/layout/Layout";

import { useRouter } from "next/router";

export default function Rental() {
  const router = useRouter();

  return (
    <Layout>
      <Typography variant="h1">Wird noch gebaut</Typography>
    </Layout>
  );
}
