import palette from "@/styles/palette";
import { GridView, QueueOutlined, Search, ViewList } from "@mui/icons-material";
import {
  alpha,
  Box,
  Divider,
  IconButton,
  InputBase,
  Tooltip,
  Typography,
} from "@mui/material";

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

export default function BookSearchBar({
  handleInputChange,
  handleNewBook,
  bookSearchInput,
  toggleView,
  detailView,
  searchResultNumber,
  showNewBookControl = true,
}: BookSearchBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        px: { xs: 2, md: 10 },
        my: 4,
      }}
    >
      <Box
        component="form"
        onSubmit={(e) => e.preventDefault()}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 2,
          py: 1,
          width: "100%",
          maxWidth: 500,
          borderRadius: 3,
          bgcolor: alpha(palette.background.paper, 0.9),
          backdropFilter: "blur(12px)",
          border: `1px solid ${alpha(palette.primary.main, 0.12)}`,
          boxShadow: `0 4px 20px ${alpha(palette.primary.main, 0.08)}`,
          transition: "all 0.3s ease",
          "&:hover": {
            border: `1px solid ${alpha(palette.primary.main, 0.25)}`,
            boxShadow: `0 6px 24px ${alpha(palette.primary.main, 0.12)}`,
          },
          "&:focus-within": {
            border: `1px solid ${palette.primary.main}`,
            boxShadow: `0 6px 24px ${alpha(palette.primary.main, 0.15)}`,
          },
        }}
      >
        {/* View Toggle */}
        <Tooltip title="Ansicht wechseln">
          <IconButton
            onClick={toggleView}
            sx={{
              color: palette.text.secondary,
              "&:hover": {
                bgcolor: alpha(palette.primary.main, 0.1),
                color: palette.primary.main,
              },
            }}
          >
            {detailView ? <GridView /> : <ViewList />}
          </IconButton>
        </Tooltip>

        {/* Search Icon & Input */}
        <Search sx={{ color: palette.text.disabled, ml: 0.5 }} />
        <InputBase
          value={bookSearchInput}
          onChange={handleInputChange}
          placeholder="Buch suchen..."
          data-cy="rental_input_searchbook"
          inputProps={{
            "aria-label": "search books",
          }}
          sx={{
            flex: 1,
            ml: 1,
            "& input": {
              py: 0.75,
              "&::placeholder": {
                color: palette.text.disabled,
                opacity: 1,
              },
            },
          }}
        />

        {/* Result Count */}
        {searchResultNumber > 0 && (
          <Typography
            variant="caption"
            sx={{
              color: palette.text.secondary,
              bgcolor: alpha(palette.primary.main, 0.08),
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontWeight: 500,
            }}
          >
            {searchResultNumber}
          </Typography>
        )}

        {/* Create Book Button */}
        {showNewBookControl && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Tooltip title="Neues Buch erzeugen">
              <IconButton
                onClick={handleNewBook}
                data-cy="create_book_button"
                sx={{
                  color: palette.primary.main,
                  "&:hover": {
                    bgcolor: alpha(palette.primary.main, 0.1),
                  },
                }}
              >
                <QueueOutlined />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );
}
