import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import {
  Backdrop,
  Box,
  Chip,
  Fade,
  IconButton,
  Modal,
  Tooltip,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";

import { BookType } from "@/entities/BookType";
import palette from "@/styles/palette";

// =============================================================================
// Constants
// =============================================================================

const CARD_WIDTH = 200;
const CARD_HEIGHT = 290;
const MAX_VISIBLE_TOPICS = 2;
const BORDER_RADIUS = 16;
const ICON_SIZE = 16;
const ACTION_BUTTON_SIZE = 28;
const RETURN_BUTTON_SIZE = 26;

// =============================================================================
// Reusable Styles
// =============================================================================

const glassStyle: SxProps<Theme> = {
  backdropFilter: "blur(8px)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
};

const actionButtonBase: SxProps<Theme> = {
  color: "#fff",
  backdropFilter: "blur(4px)",
  width: ACTION_BUTTON_SIZE,
  height: ACTION_BUTTON_SIZE,
  transition: "all 0.2s ease",
  "&:focus-visible": {
    outline: `2px solid ${palette.primary.light}`,
    outlineOffset: 2,
  },
};

const topicChipStyle: SxProps<Theme> = {
  height: 18,
  fontSize: "0.55rem",
  fontWeight: 500,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  color: "#fff",
  backdropFilter: "blur(4px)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  "& .MuiChip-label": {
    px: 0.8,
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Parse semicolon-separated topics string into array
 */
const parseTopics = (topics: string | undefined | null): string[] => {
  if (!topics) return [];
  return topics
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean);
};

// =============================================================================
// Sub-Components
// =============================================================================

interface CoverModalProps {
  open: boolean;
  onClose: () => void;
  src: string;
  title: string;
  author: string;
}

const CoverModal = memo(function CoverModal({
  open,
  onClose,
  src,
  title,
  author,
}: CoverModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 300,
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
          },
        },
      }}
      aria-labelledby="cover-modal-title"
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            outline: "none",
            maxWidth: "90vw",
            maxHeight: "90vh",
          }}
        >
          <IconButton
            onClick={onClose}
            aria-label="Schließen"
            sx={{
              position: "absolute",
              top: -48,
              right: 0,
              color: "#fff",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
              "&:focus-visible": {
                outline: "2px solid #fff",
                outlineOffset: 2,
              },
              zIndex: 10,
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            sx={{
              position: "relative",
              width: { xs: "85vw", sm: "70vw", md: "50vw", lg: "400px" },
              height: { xs: "70vh", sm: "75vh", md: "80vh", lg: "600px" },
              maxWidth: 500,
              maxHeight: 750,
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Image
              src={src}
              alt={title ?? "Book cover"}
              fill
              loading="lazy" // Only load when near viewport
              placeholder="blur" // Show blur while loading
              blurDataURL="/coverimages/default.jpg"
              sizes="(max-width: 600px) 85vw, (max-width: 900px) 70vw, 500px"
              style={{
                objectFit: "contain",
                backgroundColor: "#1a1a1a",
              }}
            />
          </Box>

          <Box sx={{ mt: 2, textAlign: "center", color: "#fff" }}>
            <Typography
              id="cover-modal-title"
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 600,
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.7)", mt: 0.5 }}
            >
              {author}
            </Typography>
          </Box>

          <Typography
            sx={{
              position: "absolute",
              bottom: -36,
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
            }}
          >
            Klicken zum Schließen oder ESC drücken
          </Typography>
        </Box>
      </Fade>
    </Modal>
  );
});

interface StatusBadgeProps {
  isRented: boolean;
}

const StatusBadge = memo(function StatusBadge({ isRented }: StatusBadgeProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 4,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.4,
        borderRadius: "20px",
        backgroundColor: isRented
          ? "rgba(200, 5, 56, 0.9)"
          : "rgba(80, 118, 102, 0.9)",
        ...glassStyle,
      }}
      role="status"
      aria-label={isRented ? "Buch ist ausgeliehen" : "Buch ist verfügbar"}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: "#fff",
          animation: isRented ? "none" : "pulse 2s infinite",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.4 },
          },
        }}
      />
      <Typography
        component="span"
        sx={{
          fontSize: "0.65rem",
          fontWeight: 600,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {isRented ? "Ausgeliehen" : "Verfügbar"}
      </Typography>
    </Box>
  );
});

interface TopicChipsProps {
  topics: string[];
}

const TopicChips = memo(function TopicChips({ topics }: TopicChipsProps) {
  const visibleTopics = topics.slice(0, MAX_VISIBLE_TOPICS);
  const hiddenTopics = topics.slice(MAX_VISIBLE_TOPICS);
  const extraCount = hiddenTopics.length;

  if (visibleTopics.length === 0) return null;

  return (
    <Box
      sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.3 }}
      role="list"
      aria-label="Schlagwörter"
    >
      {visibleTopics.map((topic) => (
        <Chip
          key={topic}
          label={topic}
          size="small"
          sx={topicChipStyle}
          role="listitem"
        />
      ))}
      {extraCount > 0 && (
        <Tooltip title={hiddenTopics.join(", ")} arrow placement="top">
          <Chip
            label={`+${extraCount}`}
            size="small"
            aria-label={`${extraCount} weitere Schlagwörter: ${hiddenTopics.join(
              ", "
            )}`}
            sx={{
              ...topicChipStyle,
              backgroundColor: "rgba(215, 153, 0, 0.5)",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(215, 153, 0, 0.7)",
              },
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
});

// =============================================================================
// Main Component
// =============================================================================

interface BookSummaryCardProps {
  book: BookType;
  returnBook: React.MouseEventHandler<HTMLButtonElement>;
  showDetailsControl?: boolean;
}

function BookSummaryCard({
  book,
  returnBook,
  showDetailsControl = true,
}: BookSummaryCardProps) {
  const [src, setSrc] = useState(`/api/images/${book.id}`);
  const [modalOpen, setModalOpen] = useState(false);

  const isRented = book.rentalStatus === "rented";
  const topics = useMemo(() => parseTopics(book.topics), [book.topics]);

  // Memoized handlers
  const handleOpenModal = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleImageError = useCallback(() => {
    setSrc("/coverimages/default.jpg");
  }, []);

  const handleReturnClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      returnBook(e);
    },
    [returnBook]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setModalOpen(true);
    }
  }, []);

  return (
    <Box
      component="article"
      aria-label={`${book.title} von ${book.author}`}
      sx={{
        position: "relative",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: `${BORDER_RADIUS}px`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        // CSS-based hover effects (better performance than JS state)
        "&:hover, &:focus-within": {
          transform: "translateY(-4px) scale(1.02)",
          boxShadow: `0 20px 40px rgba(18, 85, 111, 0.3), 
                      0 0 20px rgba(18, 85, 111, 0.2),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.1)`,
          "& .cover-image": {
            transform: "scale(1.05)",
          },
          "& .glow-effect": {
            opacity: 1,
          },
          "& .action-buttons": {
            opacity: 1,
          },
          "&::before": {
            background: `linear-gradient(135deg, ${palette.primary.light}, ${palette.secondary.main}, ${palette.primary.main})`,
          },
        },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: -2,
          borderRadius: `${BORDER_RADIUS + 2}px`,
          padding: "2px",
          background: "transparent",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          transition: "all 0.3s ease",
          zIndex: 0,
        },
        "&:focus-visible": {
          outline: `3px solid ${palette.primary.light}`,
          outlineOffset: 2,
        },
      }}
    >
      {/* Cover Image - clickable for modal */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          cursor: "zoom-in",
        }}
        onClick={handleOpenModal}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Cover von ${book.title} vergrößern`}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes={`${CARD_WIDTH}px`}
          className="cover-image"
          style={{
            objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
          onError={handleImageError}
        />
      </Box>

      {/* Gradient Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(
            to top,
            rgba(0, 0, 0, 0.92) 0%,
            rgba(0, 0, 0, 0.8) 25%,
            rgba(0, 0, 0, 0.4) 45%,
            rgba(0, 0, 0, 0.05) 65%,
            transparent 100%
          )`,
          zIndex: 2,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Status Badge */}
      <StatusBadge isRented={isRented} />

      {/* Top Right: Book ID + Return Button */}
      <Box
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 4,
          display: "flex",
          gap: 0.5,
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            px: 0.8,
            py: 0.3,
            borderRadius: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(8px)",
          }}
          aria-label={`Buch-ID: ${book.id}`}
        >
          <Typography
            component="span"
            sx={{
              fontSize: "0.6rem",
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.95)",
            }}
          >
            #{book.id}
          </Typography>
        </Box>

        {isRented && showDetailsControl && (
          <Tooltip title="Buch abgeben" arrow>
            <IconButton
              size="small"
              onClick={handleReturnClick}
              aria-label="Buch abgeben"
              sx={{
                backgroundColor: "rgba(200, 5, 56, 0.85)",
                color: "#fff",
                backdropFilter: "blur(4px)",
                width: RETURN_BUTTON_SIZE,
                height: RETURN_BUTTON_SIZE,
                "&:hover": {
                  backgroundColor: palette.error.main,
                  transform: "scale(1.1)",
                },
                "&:focus-visible": {
                  outline: "2px solid #fff",
                  outlineOffset: 2,
                },
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(200, 5, 56, 0.4)",
              }}
            >
              <KeyboardReturnIcon sx={{ fontSize: ICON_SIZE }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: 1.5,
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          gap: 0.8,
        }}
      >
        {/* Title */}
        <Link
          href={`/book/${book.id}`}
          style={{ textDecoration: "none" }}
          aria-label={`Details zu ${book.title}`}
        >
          <Typography
            component="h3"
            data-cy="book_title"
            sx={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              transition: "color 0.2s ease",
              "&:hover": {
                color: palette.primary.light,
              },
            }}
          >
            {book.title}
          </Typography>
        </Link>

        {/* Author */}
        <Typography
          component="p"
          sx={{
            fontSize: "0.7rem",
            color: "rgba(255, 255, 255, 0.85)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textShadow: "0 1px 2px rgba(0,0,0,0.4)",
          }}
        >
          {book.author}
        </Typography>

        {/* Topics */}
        <TopicChips topics={topics} />

        {/* Action Buttons */}
        {showDetailsControl && (
          <Box
            className="action-buttons"
            sx={{
              display: "flex",
              gap: 0.5,
              mt: 0.5,
              opacity: { xs: 1, sm: 0.7 },
              transition: "all 0.25s ease",
            }}
            role="group"
            aria-label="Aktionen"
          >
            <Tooltip title="Details" arrow>
              <IconButton
                component={Link}
                href={`/book/${book.id}`}
                size="small"
                data-cy="book_card_editbutton"
                aria-label="Buch-Details anzeigen"
                sx={{
                  ...actionButtonBase,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  "&:hover": {
                    backgroundColor: palette.primary.main,
                    transform: "scale(1.1)",
                  },
                }}
              >
                <EditIcon sx={{ fontSize: ICON_SIZE }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Label drucken" arrow>
              <IconButton
                component={Link}
                href={`/reports/print?id=${book.id}`}
                size="small"
                data-cy="book_card_printbutton"
                aria-label="Buchlabel drucken"
                sx={{
                  ...actionButtonBase,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  "&:hover": {
                    backgroundColor: palette.secondary.main,
                    transform: "scale(1.1)",
                  },
                }}
              >
                <LocalPrintshopIcon sx={{ fontSize: ICON_SIZE }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Glow Effect Layer */}
      <Box
        className="glow-effect"
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          borderRadius: `${BORDER_RADIUS}px`,
          opacity: 0,
          transition: "opacity 0.3s ease",
          background: `radial-gradient(
            ellipse at 50% 0%,
            rgba(161, 220, 248, 0.15) 0%,
            transparent 60%
          )`,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Cover Modal */}
      <CoverModal
        open={modalOpen}
        onClose={handleCloseModal}
        src={src}
        title={book.title ?? "Unbekannter Titel"}
        author={book.author ?? "Unbekannter Autor"}
      />
    </Box>
  );
}

export default memo(BookSummaryCard);
