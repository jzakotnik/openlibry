import Layout from "@/components/layout/Layout";
import TitleTile from "@/components/title/TitleTile";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Inter } from "next/font/google";

import { publicNavItems } from "@/components/layout/navigationItems";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const onClick = (e: any, slug: string) => {
    console.log("Selected", slug);
    router.push(slug);
  };

  return (
    <div
      style={{
        backgroundImage:
          "linear-gradient(135deg, #fff3e0 0%, #ffcc80 50%, #fb8c00 100%)",
      }}
    >
      <Layout>
        <Grid
          container
          alignItems="center"
          direction="column"
          sx={{
            py: 4,
          }}
        >
          <Grid>
            <Typography
              variant="h1"
              id="title_headline"
              data-cy="indexpage"
              align="center"
              sx={{ fontWeight: "bold", fontSize: 50 }}
            >
              Open Libry - die <b>einfache</b> Bücherei Verwaltung
            </Typography>
          </Grid>

          <Grid container alignItems="center" sx={{ pt: 6, mt: 8 }}>
            <Grid
              container
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={4}
              sx={{ px: 10 }}
            >
              {publicNavItems.map((p) => {
                //console.log("index_" + p.slug.substring(1) + "_button");
                return (
                  <Grid
                    key={p.slug}
                    size={{ xs: 12, sm: 6, md: 3 }}
                    justifyContent="center"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      position: "relative",
                      mb: 0,
                      my: 5,
                    }}
                  >
                    <TitleTile
                      title={p.title}
                      subtitle={p.subtitle}
                      slug={p.slug}
                      onClick={(e: any) => onClick(e, p.slug)}
                    />
                  </Grid>
                );
              })}
            </Grid>{" "}
          </Grid>
        </Grid>
      </Layout>{" "}
    </div>
  );
}
