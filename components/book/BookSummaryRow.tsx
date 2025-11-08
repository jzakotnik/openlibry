import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import ControlPointDuplicateIcon from "@mui/icons-material/ControlPointDuplicate";

import TaskAltIcon from "@mui/icons-material/TaskAlt";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { BookType } from "@/entities/BookType";

interface BookSummaryRowPropType {
  book: BookType;
  handleCopyBook: React.MouseEventHandler<HTMLButtonElement>;
}

export default function BookSummaryRow({
  book,
  handleCopyBook,
}: BookSummaryRowPropType) {
  const theme = useTheme();
  const router = useRouter();

  const topics = useMemo(
    () =>
      (book.topics ?? "")
        .split(";")
        .map((t) => t.trim())
        .filter(Boolean),
    [book.topics]
  );

  const maxChips = 4;
  const extraCount = Math.max(0, topics.length - maxChips);
  const visibleTopics = topics.slice(0, maxChips);

  const isRented = book.rentalStatus === "rented";

  return (
    <Paper
      elevation={1}
      sx={{
        px: 2,
        py: 1.25,
        my: 1,
        width: "100%",
        borderRadius: 2,
        transition: "box-shadow 120ms ease, transform 120ms ease",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-1px)",
          cursor: "pointer",
        },
      }}
      onClick={() => router.push(`/book/${book.id}`)}
      role="button"
      aria-label={`Open book ${book.title}`}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        useFlexGap
        flexWrap="wrap"
      >
        {/* Status avatar */}
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: isRented ? "error.main" : "success.main",
          }}
        >
          {isRented ? (
            <CancelPresentationIcon fontSize="small" />
          ) : (
            <TaskAltIcon fontSize="small" />
          )}
        </Avatar>

        {/* Title + author (grows) */}
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            noWrap
            title={book.title}
          >
            {book.title || "Untitled"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            title={book.author || ""}
          >
            {book.author}
          </Typography>
        </Box>

        {/* Topics */}
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          flexWrap="wrap"
          sx={{
            maxWidth: { xs: "100%", md: "60%" },
            rowGap: 0.5,
          }}
        >
          {visibleTopics.map((t) => (
            <Chip key={t} label={t} size="small" />
          ))}
          {extraCount > 0 && (
            <Chip
              label={`+${extraCount}`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          )}
        </Stack>

        {/* Actions (don’t trigger row click) */}
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ ml: "auto", display: "flex", alignItems: "center" }}
        >
          <Tooltip title="Buch duplizieren">
            <IconButton
              color="primary"
              aria-label="copy-book"
              onClick={handleCopyBook}
            >
              <ControlPointDuplicateIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>
    </Paper>
  );
}
