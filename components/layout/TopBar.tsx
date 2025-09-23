import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import * as React from "react";

import { publicNavItems } from "./navigationItems";

const BACKUP_BUTTON_SWITCH = process.env.BACKUP_BUTTON_SWITCH
  ? parseInt(process.env.BACKUP_BUTTON_SWITCH)
  : 1;

export default function TopBar() {
  const router = useRouter();
  const theme = useTheme();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = (e: any, page: any) => {
    console.log("Navigating to ", e, page);
    if (page == "backdropClick") setAnchorElNav(null);
    else router.push(page);
  };

  // Backup-Funktion
  const BackupFunc = () => {
    alert("Backup gestartet!");
    // Hier deine eigentliche Backup-Logik
  };

  return (
    <AppBar position="static" color="secondary">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <LibraryBooksIcon
            sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
          />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },

              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            OpenLibry
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {publicNavItems.map((page) => (
                <MenuItem
                  key={page.title}
                  onClick={(event) => handleCloseNavMenu(event, page.slug)}
                >
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <LibraryBooksIcon
            sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
          />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            OpenLibry
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {publicNavItems.map((page) => (
              <Button
                key={page.title}
                onClick={(event) => handleCloseNavMenu(event, page.slug)}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page.title}
              </Button>
            ))}
          </Box>
          {
            BACKUP_BUTTON_SWITCH === 1 && (
              <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={BackupFunc}
                  sx={{ ml: 2 }}
                >
                  Datensicherung //TODO Abfrage ob überhaupt angezeit aus env, verwenden der fertigen Sicherungsfunktion, Speicherung unter statt einfacher download
                </Button>


              </Box>
            )
          }

        </Toolbar>
      </Container>
    </AppBar>
  );
}
