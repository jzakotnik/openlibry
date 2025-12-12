import { Box, Chip, Typography } from "@mui/material";
import { UserType } from "@/entities/UserType";
import palette from "@/styles/palette";

interface UserListItemProps {
  user: UserType;
  isSelected: boolean;
  rentedCount: number;
  overdueCount: number;
  onClick: () => void;
}

export default function UserListItem({
  user,
  isSelected,
  rentedCount,
  overdueCount,
  onClick,
}: UserListItemProps) {
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;

  return (
    <Box
      onClick={onClick}
      sx={{
        padding: "14px 16px",
        borderRadius: "14px",
        background: isSelected
          ? `linear-gradient(135deg, ${palette.primary.main}15 0%, ${palette.primary.light}20 100%)`
          : "rgba(255, 255, 255, 0.6)",
        border: isSelected
          ? `2px solid ${palette.primary.main}40`
          : "2px solid transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.2s",
        boxShadow: isSelected
          ? `0 4px 12px ${palette.primary.main}20`
          : "0 2px 4px rgba(0,0,0,0.02)",
        "&:hover": {
          background: isSelected
            ? `linear-gradient(135deg, ${palette.primary.main}20 0%, ${palette.primary.light}25 100%)`
            : "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 4px 12px rgba(18, 85, 111, 0.1)",
        },
      }}
      data-cy={`user_item_${user.id}`}
    >
      {/* Left side: Avatar + Info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Box
          sx={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: isSelected
              ? `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.light} 100%)`
              : "#e8f4f8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isSelected ? "white" : palette.primary.main,
            fontWeight: 600,
            fontSize: "14px",
            flexShrink: 0,
          }}
        >
          {initials}
        </Box>
        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              color: "#333",
              fontSize: "15px",
            }}
          >
            {user.lastName}, {user.firstName}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#5A6166" }}>
            Klasse {user.schoolGrade} • Nr. {user.id}
          </Typography>
        </Box>
      </Box>

      {/* Right side: Status badges */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {overdueCount > 0 && (
          <Chip
            label={`${overdueCount} überfällig`}
            size="small"
            sx={{
              background: `${palette.error.main}15`,
              color: palette.error.main,
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "20px",
            }}
          />
        )}
        {rentedCount > 0 && (
          <Chip
            label={`${rentedCount} 📚`}
            size="small"
            sx={{
              background: `${palette.primary.main}15`,
              color: palette.primary.main,
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "20px",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
