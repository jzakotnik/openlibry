import palette from "@/styles/palette";
import {
  CloudDownload,
  LibraryBooks,
  Menu as MenuIcon,
} from "@mui/icons-material";
import {
  alpha,
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { publicNavItems } from "./NavigationItems";

interface TopBarProps {
  showBackupButton?: boolean;
}

export default function TopBar({ showBackupButton = true }: TopBarProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (slug: string) => {
    setMobileMenuOpen(false);
    router.push(slug);
  };

  const isActivePage = (slug: string) => {
    return router.pathname === slug || router.pathname.startsWith(slug + "/");
  };

  const handleBackup = async () => {
    try {
      const response = await fetch("/api/excel", { method: "GET" });

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen des Backups!");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const today = new Date();
      const dateStr = `${today.getFullYear()}_${String(
        today.getMonth() + 1
      ).padStart(2, "0")}_${String(today.getDate()).padStart(2, "0")}`;
      const filename = `Backup_OpenLibry_${dateStr}.xlsx`;

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Fehler beim Backup-Download!");
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        data-cy="topbar"
        sx={{
          background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${
            palette.primary.dark
          } 50%, ${alpha(palette.primary.main, 0.95)} 100%)`,
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${alpha(palette.primary.light, 0.2)}`,
          boxShadow: `0 4px 30px ${alpha(palette.primary.dark, 0.3)}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 70 } }}>
            {/* Logo & Brand - Desktop */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{
                display: { xs: "none", md: "flex" },
                cursor: "pointer",
                mr: 4,
                "&:hover": {
                  "& .logo-icon": {
                    transform: "rotate(-10deg) scale(1.1)",
                  },
                },
              }}
              onClick={() => router.push("/")}
            >
              <Box
                className="logo-icon"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  bgcolor: alpha("#ffffff", 0.15),
                  border: `1px solid ${alpha("#ffffff", 0.2)}`,
                  transition: "all 0.3s ease",
                }}
              >
                <LibraryBooks
                  sx={{ fontSize: 24, color: "#ffffff" }}
                  data-cy="topbar_logo_desktop"
                />
              </Box>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  letterSpacing: ".15rem",
                  color: "#ffffff",
                  textDecoration: "none",
                }}
                data-cy="topbar_title_desktop"
              >
                OpenLibry
              </Typography>
            </Stack>

            {/* Mobile Menu Button */}
            <IconButton
              size="large"
              aria-label="Navigation öffnen"
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                display: { xs: "flex", md: "none" },
                color: "#ffffff",
                mr: 1,
                "&:hover": {
                  bgcolor: alpha("#ffffff", 0.1),
                },
              }}
              data-cy="topbar_menu_button_mobile"
            >
              <MenuIcon />
            </IconButton>

            {/* Logo & Brand - Mobile */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                cursor: "pointer",
              }}
              onClick={() => router.push("/")}
            >
              <LibraryBooks
                sx={{ fontSize: 24, color: "#ffffff" }}
                data-cy="topbar_logo_mobile"
              />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  letterSpacing: ".1rem",
                  color: "#ffffff",
                }}
                data-cy="topbar_title_mobile"
              >
                OpenLibry
              </Typography>
            </Stack>

            {/* Desktop Navigation */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                gap: 0.5,
              }}
            >
              {publicNavItems.map((page) => {
                const isActive = isActivePage(page.slug);
                return (
                  <Button
                    key={page.title}
                    onClick={() => handleNavigation(page.slug)}
                    data-cy={`topbar_nav_button_${page.slug.replace(
                      /\//g,
                      "_"
                    )}`}
                    sx={{
                      px: 2,
                      py: 1,
                      color: "#ffffff",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.9rem",
                      textTransform: "none",
                      borderRadius: 2,
                      position: "relative",
                      bgcolor: isActive
                        ? alpha("#ffffff", 0.15)
                        : "transparent",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: 6,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: isActive ? "60%" : "0%",
                        height: 2,
                        bgcolor: palette.primary.light,
                        borderRadius: 1,
                        transition: "width 0.3s ease",
                      },
                      "&:hover": {
                        bgcolor: alpha("#ffffff", 0.1),
                        "&::after": {
                          width: "60%",
                        },
                      },
                    }}
                  >
                    {page.title}
                  </Button>
                );
              })}
            </Box>

            {/* Backup Button */}
            {showBackupButton && (
              <Tooltip title="Backup als Excel herunterladen">
                <IconButton
                  onClick={handleBackup}
                  aria-label="Backup"
                  data-cy="topbar_backup_button"
                  sx={{
                    ml: 1,
                    color: "#ffffff",
                    bgcolor: alpha("#ffffff", 0.1),
                    border: `1px solid ${alpha("#ffffff", 0.2)}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha("#ffffff", 0.2),
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${alpha(
                        palette.primary.dark,
                        0.4
                      )}`,
                    },
                  }}
                >
                  <CloudDownload />
                </IconButton>
              </Tooltip>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        data-cy="topbar_menu_mobile"
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: palette.background.paper,
            backgroundImage: `linear-gradient(180deg, ${alpha(
              palette.primary.main,
              0.03
            )} 0%, transparent 100%)`,
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: alpha("#ffffff", 0.15),
                border: `1px solid ${alpha("#ffffff", 0.2)}`,
              }}
            >
              <LibraryBooks sx={{ fontSize: 26, color: "#ffffff" }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: ".1rem",
                }}
              >
                OpenLibry
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: alpha("#ffffff", 0.7) }}
              >
                Bibliotheksverwaltung
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Navigation Items */}
        <List sx={{ px: 1, py: 2 }}>
          {publicNavItems.map((page) => {
            const isActive = isActivePage(page.slug);
            return (
              <ListItem key={page.title} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(page.slug)}
                  data-cy={`topbar_menu_item_${page.slug.replace(/\//g, "_")}`}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    bgcolor: isActive
                      ? alpha(palette.primary.main, 0.1)
                      : "transparent",
                    borderLeft: isActive
                      ? `3px solid ${palette.primary.main}`
                      : "3px solid transparent",
                    "&:hover": {
                      bgcolor: alpha(palette.primary.main, 0.08),
                    },
                  }}
                >
                  {page.icon && (
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isActive
                          ? palette.primary.main
                          : palette.text.secondary,
                      }}
                    >
                      {page.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={page.title}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      color: isActive
                        ? palette.primary.main
                        : palette.text.secondary,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Backup Button in Drawer */}
        {showBackupButton && (
          <Box sx={{ px: 2, pb: 2, mt: "auto" }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={handleBackup}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                borderColor: alpha(palette.primary.main, 0.3),
                color: palette.primary.main,
                "&:hover": {
                  borderColor: palette.primary.main,
                  bgcolor: alpha(palette.primary.main, 0.05),
                },
              }}
            >
              Backup herunterladen
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
}
