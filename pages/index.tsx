import Layout from "@/components/layout/Layout";
import { publicNavItems } from "@/components/layout/NavigationItems";
import NavTile from "@/components/title/NavTile";
import palette from "@/styles/palette";
import { alpha, Box, Container, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";

interface HomeProps {
  showBackupButton: boolean;
}

export default function Home({ showBackupButton }: HomeProps) {
  const router = useRouter();

  const handleNavigation = (slug: string) => {
    router.push(slug);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          palette.primary.light,
          0.1
        )} 0%, ${alpha(palette.primary.main, 0.05)} 50%, ${alpha(
          palette.background.default,
          1
        )} 100%)`,
        backgroundImage: "url(/splashbanner.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
      }}
    >
      <Layout showBackupButton={showBackupButton}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={6} sx={{ py: { xs: 4, md: 8 } }}>
            {/* Hero Section */}
            <Box
              sx={{
                textAlign: "center",
                maxWidth: 700,
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                id="title_headline"
                data-cy="indexpage"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                  color: palette.primary.dark,
                  mb: 2,
                  textShadow: `0 2px 20px ${alpha(
                    palette.background.paper,
                    0.8
                  )}`,
                }}
              >
                OpenLibry
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 400,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  color: palette.text.secondary,
                  px: 2,
                }}
              >
                Die <strong>einfache</strong> Büchereiverwaltung für Schulen
              </Typography>
            </Box>

            {/* Navigation Tiles */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 3,
                mt: 4,
              }}
            >
              {publicNavItems.map((item) => (
                <NavTile
                  key={item.slug}
                  title={item.title}
                  subtitle={item.subtitle}
                  slug={item.slug}
                  icon={item.icon}
                  onClick={() => handleNavigation(item.slug)}
                />
              ))}
            </Box>

            {/* Footer hint */}
            <Typography
              variant="caption"
              sx={{
                color: palette.text.disabled,
                mt: 4,
                textAlign: "center",
              }}
            >
              Wähle einen Bereich um zu starten
            </Typography>
          </Stack>
        </Container>
      </Layout>
    </Box>
  );
}

export async function getServerSideProps() {
  const showBackupButton =
    parseInt(process.env.BACKUP_BUTTON_SWITCH || "1", 10) === 1;

  return {
    props: {
      showBackupButton,
    },
  };
}
