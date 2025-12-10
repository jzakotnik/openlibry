import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import GridViewIcon from "@mui/icons-material/GridView";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  IconButton,
  InputBase,
  Tooltip,
  Typography,
  Zoom,
  type SxProps,
  type Theme,
} from "@mui/material";
import { memo, useCallback, useRef } from "react";

import palette from "@/styles/palette";
import ViewListIcon from "@mui/icons-material/ViewList";

// =============================================================================
// Constants
// =============================================================================

const SEARCH_BAR_HEIGHT = 56;
const ICON_BUTTON_SIZE = 40;

// =============================================================================
// Reusable Styles
// =============================================================================

const glassStyle: SxProps<Theme> = {
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.5)",
};

const iconButtonStyle: SxProps<Theme> = {
  width: ICON_BUTTON_SIZE,
  height: ICON_BUTTON_SIZE,
  transition: "all 0.2s ease",
  "&:focus-visible": {
    outline: `2px solid ${palette.primary.main}`,
    outlineOffset: 2,
  },
};

// =============================================================================
// Sub-Components
// =============================================================================

interface ResultCounterProps {
  count: number;
}

const ResultCounter = memo(function ResultCounter({
  count,
}: ResultCounterProps) {
  const formattedCount = count.toLocaleString("de-DE");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${palette.primary.main}, ${palette.primary.dark})`,
        boxShadow: "0 2px 8px rgba(18, 85, 111, 0.3)",
      }}
      role="status"
      aria-live="polite"
      aria-label={`${count} Bücher gefunden`}
    >
      <Typography
        component="span"
        sx={{
          fontSize: "0.85rem",
          fontWeight: 700,
          color: "#fff",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formattedCount}
      </Typography>
      <Typography
        component="span"
        sx={{
          fontSize: "0.7rem",
          color: "rgba(255, 255, 255, 0.8)",
          fontWeight: 500,
          display: { xs: "none", sm: "inline" },
        }}
      >
        Bücher
      </Typography>
    </Box>
  );
});

interface ViewToggleProps {
  detailView: boolean;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
}

const ViewToggle = memo(function ViewToggle({
  detailView,
  onToggle,
}: ViewToggleProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.04)",
        borderRadius: "12px",
        p: 0.5,
      }}
      role="group"
      aria-label="Ansicht wählen"
    >
      <Tooltip title="Listenansicht" arrow>
        <IconButton
          onClick={detailView ? onToggle : undefined}
          aria-label="Listenansicht"
          aria-pressed={!detailView}
          sx={{
            ...iconButtonStyle,
            width: 36,
            height: 36,
            borderRadius: "10px",
            backgroundColor: !detailView ? palette.primary.main : "transparent",
            color: !detailView ? "#fff" : palette.text.secondary,
            "&:hover": {
              backgroundColor: !detailView
                ? palette.primary.main
                : "rgba(0, 0, 0, 0.08)",
            },
          }}
        >
          <ViewListIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Coveransicht" arrow>
        <IconButton
          onClick={!detailView ? onToggle : undefined}
          aria-label="Coveransicht"
          aria-pressed={detailView}
          sx={{
            ...iconButtonStyle,
            width: 36,
            height: 36,
            borderRadius: "10px",
            backgroundColor: detailView ? palette.primary.main : "transparent",
            color: detailView ? "#fff" : palette.text.secondary,
            "&:hover": {
              backgroundColor: detailView
                ? palette.primary.main
                : "rgba(0, 0, 0, 0.08)",
            },
          }}
        >
          <GridViewIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
});

// =============================================================================
// Main Component
// =============================================================================

interface BookSearchBarProps {
  handleInputChange: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  >;
  handleNewBook: React.MouseEventHandler<HTMLButtonElement>;
  bookSearchInput: string;
  toggleView: React.MouseEventHandler<HTMLButtonElement>;
  detailView: boolean;
  searchResultNumber: number;
  showNewBookControl?: boolean;
}

function BookSearchBar({
  handleInputChange,
  handleNewBook,
  bookSearchInput,
  toggleView,
  detailView,
  searchResultNumber,
  showNewBookControl = true,
}: BookSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClearSearch = useCallback(() => {
    // Create a synthetic event to clear the input
    const syntheticEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
    inputRef.current?.focus();
  }, [handleInputChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        px: { xs: 2, sm: 4, md: 10 },
        my: { xs: 3, sm: 5 },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
          width: "100%",
          maxWidth: 700,
          flexWrap: { xs: "wrap", md: "nowrap" },
          justifyContent: "center",
        }}
      >
        {/* Search Input Container */}
        <Box
          sx={{
            flex: 1,
            minWidth: { xs: "100%", sm: 280 },
            height: SEARCH_BAR_HEIGHT,
            display: "flex",
            alignItems: "center",
            borderRadius: "16px",
            ...glassStyle,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            transition: "all 0.3s ease",
            overflow: "hidden",
            "&:hover": {
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)",
              borderColor: "rgba(18, 85, 111, 0.3)",
            },
            "&:focus-within": {
              boxShadow: `0 0 0 3px rgba(18, 85, 111, 0.15), 0 8px 32px rgba(18, 85, 111, 0.2)`,
              borderColor: palette.primary.main,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
            },
          }}
        >
          {/* Search Icon */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pl: 2,
              pr: 1,
              color: palette.primary.main,
            }}
            aria-hidden="true"
          >
            <SearchIcon sx={{ fontSize: 22 }} />
          </Box>

          {/* Input Field */}
          <InputBase
            inputRef={inputRef}
            value={bookSearchInput}
            onChange={handleInputChange}
            placeholder="Buch suchen..."
            inputProps={{
              "aria-label": "Bücher suchen",
              "data-cy": "rental_input_searchbook",
            }}
            sx={{
              flex: 1,
              fontSize: "1rem",
              "& input": {
                padding: "12px 0",
                "&::placeholder": {
                  color: palette.text.secondary,
                  opacity: 0.7,
                },
              },
            }}
          />

          {/* Clear Button */}
          <Zoom in={bookSearchInput.length > 0}>
            <IconButton
              onClick={handleClearSearch}
              aria-label="Suche löschen"
              sx={{
                ...iconButtonStyle,
                mr: 1,
                color: palette.text.secondary,
                "&:hover": {
                  color: palette.error.main,
                  backgroundColor: "rgba(200, 5, 56, 0.08)",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Zoom>

          {/* Result Counter - inside search bar on mobile */}
          <Box
            sx={{
              pr: 1.5,
              display: { xs: "flex", sm: "none" },
            }}
          >
            <ResultCounter count={searchResultNumber} />
          </Box>
        </Box>

        {/* Actions Container */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            height: SEARCH_BAR_HEIGHT,
            px: { xs: 0, sm: 1 },
          }}
        >
          {/* View Toggle */}
          <ViewToggle detailView={detailView} onToggle={toggleView} />

          {/* New Book Button */}
          {showNewBookControl && (
            <Tooltip title="Neues Buch anlegen" arrow>
              <IconButton
                onClick={handleNewBook}
                aria-label="Neues Buch anlegen"
                data-cy="create_book_button"
                sx={{
                  ...iconButtonStyle,
                  width: ICON_BUTTON_SIZE + 4,
                  height: ICON_BUTTON_SIZE + 4,
                  borderRadius: "14px",
                  background: `linear-gradient(135deg, ${palette.secondary.main}, ${palette.secondary.dark})`,
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(215, 153, 0, 0.4)",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 6px 20px rgba(215, 153, 0, 0.5)",
                  },
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                <AddIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Result Counter - visible on larger screens */}
          <Box sx={{ display: { xs: "none", sm: "flex" } }}>
            <ResultCounter count={searchResultNumber} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(BookSearchBar);
