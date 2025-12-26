import Layout from "@/components/layout/Layout";
import Box from "@mui/material/Box";
import { useMemo, useState } from "react";

import { AuditType } from "@/entities/AuditType";
import { getAllAudit } from "@/entities/audit";
import { convertDateToTimeString } from "@/lib/utils/dateutils";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import SearchIcon from "@mui/icons-material/Search";
import UpdateIcon from "@mui/icons-material/Update";
import {
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { prisma } from "@/entities/db";

interface AuditPropsType {
  audits: Array<AuditType>;
}

interface ParsedAudit {
  id: number;
  timestamp: string;
  eventType: string;
  sentence: string;
  icon: React.ReactNode;
  color: string;
}

function parseEventContent(
  eventType: string,
  eventContent: string
): { sentence: string; details: Record<string, string> } {
  const details: Record<string, string> = {};

  // Parse common patterns from eventContent
  const userIdMatch = eventContent.match(/User id:\s*(\d+)/i);
  const bookIdMatch =
    eventContent.match(/Book id:\s*(\d+)/i) ||
    eventContent.match(/book id\s*(\d+)/i);
  const bookTitleMatch =
    eventContent.match(/book title:\s*(.+?)(?:,|$)/i) ||
    eventContent.match(/,\s*(.+)$/);

  if (userIdMatch) details.userId = userIdMatch[1];
  if (bookIdMatch) details.bookId = bookIdMatch[1];
  if (bookTitleMatch) details.bookTitle = bookTitleMatch[1].trim();

  // If eventContent is just a number (book ID), treat it as book ID
  if (/^\d+$/.test(eventContent.trim())) {
    details.bookId = eventContent.trim();
  }

  // If eventContent contains "book id X, Title" pattern
  const simpleBookPattern = eventContent.match(/book id\s*(\d+),?\s*(.+)?/i);
  if (simpleBookPattern) {
    details.bookId = simpleBookPattern[1];
    if (simpleBookPattern[2]) details.bookTitle = simpleBookPattern[2].trim();
  }

  // Generate human-readable sentence based on event type
  let sentence = "";

  switch (eventType.toLowerCase()) {
    case "rent book":
      if (details.bookTitle && details.userId) {
        sentence = `Buch "${details.bookTitle}" wurde an Benutzer #${details.userId} ausgeliehen`;
      } else if (details.bookTitle) {
        sentence = `Buch "${details.bookTitle}" wurde ausgeliehen`;
      } else {
        sentence = `Buch #${details.bookId || "?"} wurde ausgeliehen`;
      }
      break;

    case "return book":
      if (details.bookTitle) {
        sentence = `Buch "${details.bookTitle}" wurde zurückgegeben`;
      } else {
        sentence = `Buch #${details.bookId || "?"} wurde zurückgegeben`;
      }
      break;

    case "extend book":
      if (details.bookTitle) {
        sentence = `Ausleihe von "${details.bookTitle}" wurde verlängert`;
      } else {
        sentence = `Ausleihe von Buch #${
          details.bookId || "?"
        } wurde verlängert`;
      }
      break;

    case "add book":
      sentence = `Neues Buch "${eventContent}" wurde hinzugefügt`;
      break;

    case "update book":
      if (details.bookTitle) {
        sentence = `Buch "${details.bookTitle}" wurde aktualisiert`;
      } else {
        sentence = `Buch #${details.bookId || eventContent} wurde aktualisiert`;
      }
      break;

    case "delete book":
      sentence = `Buch #${eventContent} wurde gelöscht`;
      break;

    // User events
    case "add user": {
      const userNameMatch = eventContent.match(/^\d+,\s*(.+)$/);
      if (userNameMatch) {
        sentence = `Neuer Benutzer "${userNameMatch[1]}" wurde angelegt`;
      } else {
        sentence = `Neuer Benutzer wurde angelegt`;
      }
      break;
    }

    case "update user": {
      const userNameMatch = eventContent.match(/^\d+,\s*(.+)$/);
      if (userNameMatch) {
        sentence = `Benutzer "${userNameMatch[1]}" wurde aktualisiert`;
      } else {
        sentence = `Benutzer #${eventContent} wurde aktualisiert`;
      }
      break;
    }

    case "delete user":
      sentence = `Benutzer #${eventContent} wurde gelöscht`;
      break;

    case "disable user":
      sentence = `Benutzer #${eventContent} wurde deaktiviert`;
      break;

    case "enable user":
      sentence = `Benutzer #${eventContent} wurde aktiviert`;
      break;

    default:
      sentence = `${eventType}: ${eventContent}`;
  }

  return { sentence, details };
}

function getEventIcon(eventType: string): {
  icon: React.ReactNode;
  color: string;
} {
  switch (eventType.toLowerCase()) {
    case "rent book":
      return { icon: <MenuBookIcon />, color: "#1976d2" };
    case "return book":
      return { icon: <AssignmentReturnIcon />, color: "#2e7d32" };
    case "extend book":
      return { icon: <UpdateIcon />, color: "#ed6c02" };
    case "add book":
      return { icon: <AddCircleIcon />, color: "#9c27b0" };
    case "update book":
      return { icon: <EditIcon />, color: "#0288d1" };
    case "delete book":
      return { icon: <DeleteIcon />, color: "#d32f2f" };
    // User events
    case "add user":
      return { icon: <PersonAddIcon />, color: "#9c27b0" };
    case "update user":
      return { icon: <PersonIcon />, color: "#0288d1" };
    case "delete user":
      return { icon: <PersonRemoveIcon />, color: "#d32f2f" };
    case "disable user":
      return { icon: <PersonOffIcon />, color: "#f57c00" };
    case "enable user":
      return { icon: <PersonAddIcon />, color: "#388e3c" };
    default:
      return { icon: <HistoryIcon />, color: "#757575" };
  }
}

export default function Audit({ audits }: AuditPropsType) {
  const [searchQuery, setSearchQuery] = useState("");

  const parsedAudits = useMemo((): ParsedAudit[] => {
    return audits.map((audit) => {
      const { sentence } = parseEventContent(
        audit.eventType,
        audit.eventContent
      );
      const { icon, color } = getEventIcon(audit.eventType);

      return {
        id: audit.id!,
        timestamp: audit.createdAt || "",
        eventType: audit.eventType,
        sentence,
        icon,
        color,
      };
    });
  }, [audits]);

  const filteredAudits = useMemo(() => {
    if (!searchQuery.trim()) return parsedAudits;

    const query = searchQuery.toLowerCase();
    return parsedAudits.filter(
      (audit) =>
        audit.sentence.toLowerCase().includes(query) ||
        audit.eventType.toLowerCase().includes(query) ||
        audit.timestamp.toLowerCase().includes(query)
    );
  }, [parsedAudits, searchQuery]);

  return (
    <Layout>
      <Box sx={{ width: "100%", mt: 3, px: 2 }}>
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Suche nach Büchern, Aktionen oder Datum..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Paper>

        <Paper elevation={2} sx={{ maxHeight: "70vh", overflow: "auto" }}>
          {filteredAudits.length > 0 ? (
            <List>
              {filteredAudits.map((audit, index) => (
                <ListItem
                  key={audit.id}
                  divider={index < filteredAudits.length - 1}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: audit.color, minWidth: 48 }}>
                    {audit.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={audit.sentence}
                    secondary={audit.timestamp}
                    primaryTypographyProps={{
                      sx: { fontWeight: 400 },
                    }}
                    secondaryTypographyProps={{
                      sx: { color: "text.secondary", fontSize: "0.85rem" },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                {searchQuery
                  ? "Keine Ergebnisse gefunden"
                  : "Keine Aktivitäten verfügbar"}
              </Typography>
            </Box>
          )}
        </Paper>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, textAlign: "right" }}
        >
          {filteredAudits.length} von {parsedAudits.length} Einträgen
        </Typography>
      </Box>
    </Layout>
  );
}

export async function getServerSideProps() {
  const allAudits = await getAllAudit(prisma);

  const audits = allAudits.map((a: AuditType) => {
    const newAudit = { ...a } as any;
    newAudit.createdAt = convertDateToTimeString(a.createdAt);
    newAudit.updatedAt = convertDateToTimeString(a.updatedAt);
    return newAudit;
  });

  return { props: { audits } };
}
