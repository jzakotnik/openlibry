import palette from "@/styles/palette";
import {
  DeleteForeverOutlined,
  DeleteForeverRounded,
  DoneAll,
  PersonAdd,
  PlusOne,
  Search,
  TuneRounded,
} from "@mui/icons-material";
import {
  alpha,
  Badge,
  Box,
  Collapse,
  Divider,
  IconButton,
  InputBase,
  Tooltip,
} from "@mui/material";
import { ChangeEvent, ReactNode } from "react";

interface ActionButtonProps {
  icon: ReactNode;
  tooltip: string;
  onClick: () => void;
  color?: "default" | "primary" | "error" | "warning";
  visible?: boolean;
  badge?: number;
}

function ActionButton({
  icon,
  tooltip,
  onClick,
  color = "primary",
  visible = true,
  badge,
}: ActionButtonProps) {
  if (!visible) return null;

  const colorMap = {
    default: palette.text.secondary,
    primary: palette.primary.main,
    error: palette.error.main,
    warning: palette.warning.main,
  };

  const button = (
    <IconButton
      onClick={onClick}
      sx={{
        color: colorMap[color],
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: alpha(colorMap[color], 0.1),
          transform: "scale(1.05)",
        },
      }}
    >
      {icon}
    </IconButton>
  );

  return (
    <Tooltip title={tooltip}>
      {badge !== undefined && badge > 0 ? (
        <Badge
          badgeContent={badge}
          color="primary"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.65rem",
              height: 16,
              minWidth: 16,
            },
          }}
        >
          {button}
        </Badge>
      ) : (
        button
      )}
    </Tooltip>
  );
}

interface UserSearchBarProps {
  searchValue: string;
  onSearchChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onToggleSettings: () => void;
  showSettings: boolean;
  onSelectAll: () => void;
  onCreateUser: () => void;
  checked: Record<string, boolean>;
  onIncreaseGrade: () => void;
  onDeleteUsers: () => void;
  confirmDelete: boolean;
  settingsContent?: ReactNode;
}

export default function UserSearchBar({
  searchValue,
  onSearchChange,
  onToggleSettings,
  showSettings,
  onSelectAll,
  onCreateUser,
  checked,
  onIncreaseGrade,
  onDeleteUsers,
  confirmDelete,
  settingsContent,
}: UserSearchBarProps) {
  const selectedCount = Object.values(checked).filter(Boolean).length;
  const hasSelection = selectedCount > 0;

  return (
    <Box sx={{ width: "100%", maxWidth: 600 }}>
      {/* Main Search Bar */}
      <Box
        component="form"
        onSubmit={(e) => e.preventDefault()}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 2,
          py: 1,
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
        {/* Search Icon & Input */}
        <Search sx={{ color: palette.text.disabled, ml: 0.5 }} />
        <InputBase
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Suche nach Name oder ID..."
          inputProps={{ "aria-label": "search users" }}
          data-cy="rental_input_searchuser"
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

        {/* Settings Toggle */}
        <ActionButton
          icon={<TuneRounded />}
          tooltip="Sucheinstellungen"
          onClick={onToggleSettings}
          color={showSettings ? "primary" : "default"}
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Select All */}
        <ActionButton
          icon={<DoneAll />}
          tooltip={hasSelection ? "Auswahl aufheben" : "Alle auswählen"}
          onClick={onSelectAll}
          badge={hasSelection ? selectedCount : undefined}
        />

        {/* Create User */}
        <ActionButton
          icon={<PersonAdd />}
          tooltip="Neue Nutzerin erzeugen"
          onClick={onCreateUser}
        />

        {/* Selection Actions - only visible when items selected */}
        {hasSelection && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <ActionButton
              icon={<PlusOne />}
              tooltip="Klasse erhöhen"
              onClick={onIncreaseGrade}
            />

            <ActionButton
              icon={
                confirmDelete ? (
                  <DeleteForeverOutlined />
                ) : (
                  <DeleteForeverRounded />
                )
              }
              tooltip={confirmDelete ? "Wirklich löschen?" : "User löschen"}
              onClick={onDeleteUsers}
              color={confirmDelete ? "error" : "primary"}
            />
          </>
        )}
      </Box>

      {/* Settings Panel */}
      <Collapse in={showSettings}>
        <Box
          sx={{
            mt: 1,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(palette.primary.light, 0.06),
            border: `1px solid ${alpha(palette.primary.main, 0.1)}`,
          }}
        >
          {settingsContent}
        </Box>
      </Collapse>
    </Box>
  );
}
