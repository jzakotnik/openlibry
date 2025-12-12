import { Box, Button, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { UserType } from "@/entities/UserType";
import palette from "@/styles/palette";

interface SelectedUserBannerProps {
  user: UserType;
  rentedBooksCount: number;
  onDeselect: () => void;
}

export default function SelectedUserBanner({
  user,
  rentedBooksCount,
  onDeselect,
}: SelectedUserBannerProps) {
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${palette.primary.main} 0%, #1a6b8a 100%)`,
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "16px",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: `0 8px 24px ${palette.primary.main}50`,
        animation: "slideIn 0.3s ease-out",
        "@keyframes slideIn": {
          from: {
            opacity: 0,
            transform: "translateY(-10px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      }}
      data-cy="selected_user_banner"
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Avatar with initials */}
        <Box
          sx={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          {initials}
        </Box>
        
        {/* User info */}
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "16px" }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography sx={{ opacity: 0.85, fontSize: "13px" }}>
            Klasse {user.schoolGrade} • {rentedBooksCount} {rentedBooksCount === 1 ? "Buch" : "Bücher"} ausgeliehen
          </Typography>
        </Box>
      </Box>

      {/* Deselect button */}
      <Button
        onClick={onDeselect}
        startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
        sx={{
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: "10px",
          padding: "8px 16px",
          color: "white",
          fontSize: "13px",
          fontWeight: 600,
          textTransform: "none",
          "&:hover": {
            background: "rgba(255, 255, 255, 0.3)",
          },
        }}
        data-cy="deselect_user_button"
      >
        Abwählen
      </Button>
    </Box>
  );
}
