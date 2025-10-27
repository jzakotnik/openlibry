import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
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

import { Tooltip } from "@mui/material";
import { publicNavItems } from "./navigationItems";

const BACKUP_BUTTON_SWITCH = parseInt(
  process.env.NEXT_PUBLIC_BACKUP_BUTTON_SWITCH || "1"
);

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

  const BackupFunc = async () => {
    try {
      const response = await fetch("/api/excel", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen des Backups!");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Dynamically generate date string in yyyy-mm-dd format
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const dd = String(today.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}_${mm}_${dd}`;

      // Use the date in the filename
      const filename = `Backup_OpenLibry_${dateStr}.xlsx`;

      // Trigger the download
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
          {BACKUP_BUTTON_SWITCH === 1 && (
            <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
              <Tooltip title="Download Backup als Excel">
                <IconButton
                  sx={{ my: 2, color: "white", display: "block" }}
                  onClick={BackupFunc}
                  aria-label="Backup"
                >
                  <CloudDownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
