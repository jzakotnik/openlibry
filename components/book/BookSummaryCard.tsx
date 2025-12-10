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
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { BookType } from "@/entities/BookType";
import palette from "@/styles/palette";

interface BookSummaryCardPropType {
  book: BookType;
  returnBook: React.MouseEventHandler<HTMLButtonElement>;
  showDetailsControl?: boolean;
}

export default function BookSummaryCard({
  book,
  returnBook,
  showDetailsControl = true,
}: BookSummaryCardPropType) {
  const [src, setSrc] = useState(`/api/images/${book.id}`);
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const isRented = book.rentalStatus === "rented";

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Parse topics from semicolon-separated string
  const topics = useMemo(
    () =>
      (book.topics ?? "")
        .split(";")
        .map((t) => t.trim())
        .filter(Boolean),
    [book.topics]
  );

  const maxChips = 2;
  const visibleTopics = topics.slice(0, maxChips);
  const hiddenTopics = topics.slice(maxChips);
  const extraCount = hiddenTopics.length;

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: "relative",
        width: 180,
        height: 260,
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-4px) scale(1.02)" : "none",
        boxShadow: isHovered
          ? `0 20px 40px rgba(18, 85, 111, 0.3), 
             0 0 20px rgba(18, 85, 111, 0.2),
             inset 0 0 0 1px rgba(255, 255, 255, 0.1)`
          : "0 4px 12px rgba(0, 0, 0, 0.1)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: -2,
          borderRadius: "18px",
          padding: "2px",
          background: isHovered
            ? `linear-gradient(135deg, ${palette.primary.light}, ${palette.secondary.main}, ${palette.primary.main})`
            : "transparent",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          transition: "all 0.3s ease",
          zIndex: 0,
        },
      }}
    >
      {/* Cover Image Background - Brighter, clickable for modal */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          cursor: "zoom-in",
        }}
        onClick={handleOpenModal}
      >
        <Image
          src={src}
          alt={book.title ?? "Book cover"}
          fill
          sizes="180px"
          style={{
            objectFit: "cover",
            transition: "transform 0.3s ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
          onError={() => setSrc("/coverimages/default.jpg")}
        />
      </Box>

      {/* Gradient Overlay - Only at bottom for text readability */}
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
      />

      {/* Status Badge */}
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
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
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

      {/* Top Right: Return Button (if rented) or Book ID */}
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
        {/* Book ID Badge */}
        <Box
          sx={{
            px: 0.8,
            py: 0.3,
            borderRadius: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.6rem",
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.95)",
            }}
          >
            #{book.id}
          </Typography>
        </Box>

        {/* Return Button - separated from other actions */}
        {isRented && showDetailsControl && (
          <Tooltip title="Buch abgeben" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                returnBook(e);
              }}
              sx={{
                backgroundColor: "rgba(200, 5, 56, 0.85)",
                color: "#fff",
                backdropFilter: "blur(4px)",
                width: 26,
                height: 26,
                "&:hover": {
                  backgroundColor: palette.error.main,
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(200, 5, 56, 0.4)",
              }}
            >
              <KeyboardReturnIcon sx={{ fontSize: 14 }} />
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
        <Link href={`/book/${book.id}`} style={{ textDecoration: "none" }}>
          <Typography
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

        {/* Topics/Keywords */}
        {visibleTopics.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              mt: 0.3,
            }}
          >
            {visibleTopics.map((topic) => (
              <Chip
                key={topic}
                label={topic}
                size="small"
                sx={{
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
                }}
              />
            ))}
            {extraCount > 0 && (
              <Tooltip title={hiddenTopics.join(", ")} arrow placement="top">
                <Chip
                  label={`+${extraCount}`}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.55rem",
                    fontWeight: 500,
                    backgroundColor: "rgba(215, 153, 0, 0.5)",
                    color: "#fff",
                    cursor: "pointer",
                    "& .MuiChip-label": {
                      px: 0.6,
                    },
                    "&:hover": {
                      backgroundColor: "rgba(215, 153, 0, 0.7)",
                    },
                  }}
                />
              </Tooltip>
            )}
          </Box>
        )}

        {/* Action Buttons - Always visible, enhanced on hover */}
        {showDetailsControl && (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              mt: 0.5,
              // Always visible but subtle, more prominent on hover
              opacity: { xs: 1, sm: isHovered ? 1 : 0.7 },
              transition: "all 0.25s ease",
            }}
          >
            <Link href={`/book/${book.id}`} passHref>
              <Tooltip title="Details" arrow>
                <IconButton
                  size="small"
                  data-cy="book_card_editbutton"
                  sx={{
                    backgroundColor: isHovered
                      ? "rgba(255, 255, 255, 0.25)"
                      : "rgba(255, 255, 255, 0.15)",
                    color: "#fff",
                    backdropFilter: "blur(4px)",
                    width: 28,
                    height: 28,
                    "&:hover": {
                      backgroundColor: palette.primary.main,
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Link>

            <Link href={`/reports/print?id=${book.id}`} passHref>
              <Tooltip title="Label drucken" arrow>
                <IconButton
                  size="small"
                  data-cy="book_card_printbutton"
                  sx={{
                    backgroundColor: isHovered
                      ? "rgba(255, 255, 255, 0.25)"
                      : "rgba(255, 255, 255, 0.15)",
                    color: "#fff",
                    backdropFilter: "blur(4px)",
                    width: 28,
                    height: 28,
                    "&:hover": {
                      backgroundColor: palette.secondary.main,
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <LocalPrintshopIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Link>
          </Box>
        )}
      </Box>

      {/* Glow Effect Layer */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          borderRadius: "16px",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          background: `radial-gradient(
            ellipse at 50% 0%,
            rgba(161, 220, 248, 0.15) 0%,
            transparent 60%
          )`,
          pointerEvents: "none",
        }}
      />

      {/* Full-size Cover Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
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
      >
        <Fade in={modalOpen}>
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
            {/* Close Button */}
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                top: -48,
                right: 0,
                color: "#fff",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
                zIndex: 10,
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Cover Image */}
            <Box
              sx={{
                position: "relative",
                width: { xs: "85vw", sm: "70vw", md: "50vw", lg: "400px" },
                height: { xs: "70vh", sm: "75vh", md: "80vh", lg: "600px" },
                maxWidth: "500px",
                maxHeight: "750px",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 25px 80px rgba(0, 0, 0, 0.5)",
              }}
            >
              <Image
                src={src}
                alt={book.title ?? "Book cover"}
                fill
                sizes="(max-width: 600px) 85vw, (max-width: 900px) 70vw, 500px"
                style={{
                  objectFit: "contain",
                  backgroundColor: "#1a1a1a",
                }}
                onError={() => setSrc("/coverimages/default.jpg")}
              />
            </Box>

            {/* Book Info Below Image */}
            <Box
              sx={{
                mt: 2,
                textAlign: "center",
                color: "#fff",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {book.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  mt: 0.5,
                }}
              >
                {book.author}
              </Typography>
            </Box>

            {/* Click anywhere hint */}
            <Typography
              sx={{
                position: "absolute",
                bottom: -36,
                left: "50%",
                transform: "translateX(-50%)",
                color: "rgba(255, 255, 255, 0.4)",
                fontSize: "0.75rem",
              }}
            >
              Klicken zum Schließen oder ESC drücken
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
