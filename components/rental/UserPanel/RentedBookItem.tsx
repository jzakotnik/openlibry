import { Box, Typography } from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import UpdateIcon from "@mui/icons-material/Update";
import { RentalsUserType } from "@/entities/RentalsUserType";
import { ActionButton } from "../shared";
import palette from "@/styles/palette";
import dayjs from "dayjs";

interface RentedBookItemProps {
  rental: RentalsUserType;
  allowExtend: boolean;
  onReturn: () => void;
  onExtend: () => void;
}

export default function RentedBookItem({
  rental,
  allowExtend,
  onReturn,
  onExtend,
}: RentedBookItemProps) {
  const isOverdue = rental.remainingDays > 0;
  const isAlmostDue = rental.remainingDays <= 0 && rental.remainingDays >= -3;

  return (
    <Box
      sx={{
        padding: "12px 14px",
        borderRadius: "12px",
        background: isOverdue
          ? `${palette.error.main}08`
          : isAlmostDue
          ? `${palette.warning.main}08`
          : "rgba(255, 255, 255, 0.6)",
        border: `1px solid ${
          isOverdue
            ? palette.error.main + "30"
            : isAlmostDue
            ? palette.warning.main + "30"
            : "transparent"
        }`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      data-cy={`rented_book_${rental.id}`}
    >
      {/* Book info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "14px",
            color: "#333",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {rental.title}
        </Typography>
        <Typography
          sx={{
            fontSize: "12px",
            color: isOverdue
              ? palette.error.main
              : isAlmostDue
              ? palette.warning.main
              : "#5A6166",
            fontWeight: isOverdue || isAlmostDue ? 600 : 400,
          }}
        >
          {isOverdue
            ? `${rental.remainingDays} Tage überfällig!`
            : `Fällig: ${dayjs(rental.dueDate).format("DD.MM.YYYY")}`}
          {rental.renewalCount > 0 && ` • ${rental.renewalCount}× verlängert`}
        </Typography>
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: "6px", flexShrink: 0 }}>
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
      </Box>
    </Box>
  );
}
