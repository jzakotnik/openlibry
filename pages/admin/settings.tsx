import Layout from "@/components/layout/Layout";
import palette from "@/styles/palette";
import { ArrowBack, Construction } from "@mui/icons-material";
import {
  alpha,
  Box,
  Container,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <Layout>
      <Head>
        <title>Einstellungen | OpenLibry</title>
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <Tooltip title="Zurück zur Administration">
            <IconButton onClick={() => router.push("/admin")}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Einstellungen
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Systemkonfiguration
            </Typography>
          </Box>
        </Stack>

        {/* Coming Soon */}
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            background: `linear-gradient(135deg, ${alpha(palette.primary.main, 0.05)} 0%, ${alpha(palette.primary.main, 0.02)} 100%)`,
            border: `1px solid ${alpha(palette.primary.main, 0.1)}`,
          }}
        >
          <Construction
            sx={{
              fontSize: 64,
              color: palette.primary.main,
              mb: 2,
              opacity: 0.7,
            }}
          />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            In Arbeit
          </Typography>
          <Typography color="text.secondary" maxWidth={400} mx="auto">
            Die Einstellungsseite wird in einer zukünftigen Version verfügbar
            sein. Aktuell können Einstellungen über die <code>.env</code>-Datei
            vorgenommen werden.
          </Typography>
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 1,
              display: "inline-block",
            }}
          >
            <Typography
              variant="body2"
              fontFamily="monospace"
              color="text.secondary"
            >
              Dokumentation:{" "}
              <a
                href="https://github.com/jzakotnik/openlibry#readme"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: palette.primary.main }}
              >
                README.md
              </a>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
}
