import { Box, Typography } from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import UpdateIcon from "@mui/icons-material/Update";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import dayjs from "dayjs";

import { BookType } from "@/entities/BookType";
import { ActionButton, StatusBadge } from "../shared";
import palette from "@/styles/palette";

interface BookListItemProps {
  book: BookType;
  userName?: string;
  userSelected: boolean;
  allowExtend: boolean;
  onRent: () => void;
  onReturn: () => void;
  onExtend: () => void;
}

export default function BookListItem({
  book,
  userName,
  userSelected,
  allowExtend,
  onRent,
  onReturn,
  onExtend,
}: BookListItemProps) {
  const isAvailable = book.rentalStatus === "available";
  const isLost = book.rentalStatus === "lost";

  // Determine status for badge
  const getStatus = () => {
    if (isLost) return "lost";
    if (isAvailable) return "available";
    // Check if overdue
    if (book.dueDate) {
      const daysOverdue = dayjs().diff(dayjs(book.dueDate), "day");
      if (daysOverdue > 0) return "overdue";
    }
    return "rented";
  };

  return (
    <Box
      sx={{
        padding: "14px 16px",
        borderRadius: "14px",
        background: isAvailable
          ? "rgba(255, 255, 255, 0.7)"
          : "rgba(255, 255, 255, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.2s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(18, 85, 111, 0.08)",
        },
      }}
      data-cy={`book_item_${book.id}`}
    >
      {/* Left side: Book cover placeholder + Info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Book cover placeholder */}
        <Box
          sx={{
            width: "44px",
            height: "58px",
            borderRadius: "6px",
            background: isAvailable
              ? `linear-gradient(135deg, ${palette.primary.light}50 0%, ${palette.primary.main}30 100%)`
              : "#e8e8e8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MenuBookIcon
            sx={{ fontSize: 24, color: isAvailable ? palette.primary.main : "#999", opacity: 0.5 }}
          />
        </Box>

        {/* Book info */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "15px",
              color: "#333",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {book.title}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#5A6166" }}>
            {book.author} • Nr. {book.id}
          </Typography>
          {!isAvailable && !isLost && (
            <Typography
              sx={{
                fontSize: "12px",
                color: palette.warning.main,
                mt: 0.25,
              }}
            >
              Ausgeliehen an {userName} bis{" "}
              {dayjs(book.dueDate).format("DD.MM.YYYY")}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right side: Status + Actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
        }}
      >
        {/* Status badge */}
        <StatusBadge status={getStatus()} />

        {/* Action buttons */}
        {isAvailable && userSelected && (
          <ActionButton
            icon={<PlaylistAddIcon sx={{ fontSize: 18 }} />}
            label="Ausleihen"
            onClick={onRent}
            color={palette.primary.main}
            primary
          />
        )}

        {!isAvailable && !isLost && (
          <>
            <ActionButton
              icon={<UpdateIcon sx={{ fontSize: 18 }} />}
              label={allowExtend ? "Verlängern" : "Max. Ausleihzeit erreicht"}
              onClick={onExtend}
              color={palette.primary.main}
              disabled={!allowExtend}
            />
            <ActionButton
              icon={<ArrowCircleLeftIcon sx={{ fontSize: 18 }} />}
              label="Zurückgeben"
              onClick={onReturn}
              color={palette.success.main}
              primary
            />
          </>
        )}
      </Box>
    </Box>
  );
}
