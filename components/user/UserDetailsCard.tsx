import { UserType } from "@/entities/UserType";
import palette from "@/styles/palette";
import {
  EditOutlined,
  LibraryBooks,
  LocalPrintshopOutlined,
  Person,
  School,
  Warning,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import Link from "next/link";

type OverdueStatus = "overdue" | "warning" | "ok";

interface RentalItem {
  id: number;
  title: string;
  dueDate: string | Date;
}

interface UserDetailsCardProps {
  user: UserType;
  rentals: RentalItem[];
}

function getOverdueStatus(dueDate: string | Date): OverdueStatus {
  const daysOverdue = dayjs().diff(dueDate, "days");
  if (daysOverdue > 13) return "overdue";
  if (daysOverdue > 0) return "warning";
  return "ok";
}

function getStatusColor(status: OverdueStatus): string {
  switch (status) {
    case "overdue":
      return palette.error.main;
    case "warning":
      return palette.warning.main;
    default:
      return palette.text.secondary;
  }
}

export default function UserDetailsCard({
  user,
  rentals,
}: UserDetailsCardProps) {
  const hasOverdue = rentals.some((r) => getOverdueStatus(r.dueDate) !== "ok");

  return (
    <Box
      sx={{
        minWidth: 300,
        maxWidth: 420,
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: alpha(palette.background.paper, 0.9),
        backdropFilter: "blur(8px)",
        border: `1px solid ${alpha(palette.primary.main, 0.1)}`,
        transition: "all 0.2s ease",
        "&:hover": {
          border: `1px solid ${alpha(palette.primary.main, 0.25)}`,
          boxShadow: `0 4px 20px ${alpha(palette.primary.main, 0.08)}`,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
          px: 2.5,
          py: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha("#ffffff", 0.2),
              border: `2px solid ${alpha("#ffffff", 0.3)}`,
            }}
          >
            <Person sx={{ color: "#ffffff", fontSize: 28 }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="h6"
                sx={{
                  color: "#ffffff",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.lastName}, {user.firstName}
              </Typography>
              {hasOverdue && (
                <Tooltip title="Hat überfällige Bücher">
                  <Warning
                    sx={{
                      fontSize: 20,
                      color: palette.warning.main,
                      filter: "drop-shadow(0 0 4px rgba(255,200,0,0.5))",
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
            <Typography
              variant="body2"
              sx={{ color: alpha("#ffffff", 0.8), mt: 0.25 }}
            >
              Nr. {user.id}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Info Row */}
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <School sx={{ fontSize: 18, color: palette.text.secondary }} />
          <Typography variant="body2" color="text.secondary">
            Klasse {user.schoolGrade}
          </Typography>
          {user.schoolTeacherName && (
            <>
              <Box
                component="span"
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  bgcolor: palette.text.disabled,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {user.schoolTeacherName}
              </Typography>
            </>
          )}
        </Stack>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Rentals Section */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <LibraryBooks sx={{ fontSize: 18, color: palette.primary.main }} />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: palette.primary.main }}
          >
            Ausgeliehene Bücher
          </Typography>
          <Chip
            label={rentals.length}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.75rem",
              fontWeight: 600,
              bgcolor:
                rentals.length === 0
                  ? alpha(palette.success.main, 0.12)
                  : alpha(palette.primary.main, 0.12),
              color:
                rentals.length === 0
                  ? palette.success.main
                  : palette.primary.main,
            }}
          />
        </Stack>

        {rentals.length === 0 ? (
          <Box
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: 1.5,
              bgcolor: alpha(palette.success.main, 0.1),
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: palette.success.main, fontWeight: 500 }}
            >
              Keine ausgeliehenen Bücher
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
            {rentals.map((rental) => {
              const status = getOverdueStatus(rental.dueDate);
              const statusColor = getStatusColor(status);

              return (
                <Box
                  key={rental.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1,
                    px: 1.5,
                    borderRadius: 1.5,
                    bgcolor: alpha(statusColor, 0.08),
                    borderLeft: `3px solid ${statusColor}`,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    title={rental.title}
                    sx={{
                      fontWeight: 500,
                      color: palette.text.secondary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {rental.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: statusColor,
                      fontWeight: status !== "ok" ? 600 : 400,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {dayjs(rental.dueDate).format("DD.MM.YYYY")}
                    {status === "overdue" && " ⚠"}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Actions */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: alpha(palette.primary.light, 0.08),
        }}
      >
        <Stack direction="row" spacing={1}>
          <Link href={`/user/${user.id}`} passHref style={{ flex: 1 }}>
            <Button
              fullWidth
              variant="contained"
              size="small"
              startIcon={<EditOutlined />}
              data-cy="user_card_editbutton"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 1.5,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: `0 4px 12px ${alpha(palette.primary.main, 0.3)}`,
                },
              }}
            >
              Editieren
            </Button>
          </Link>
          <Tooltip title="Benutzerlabel drucken">
            <Button
              variant="outlined"
              size="small"
              data-cy="user_card_printbutton"
              onClick={() =>
                window.open(`api/report/userlabels?id=${user.id}`, "_blank")
              }
              sx={{
                minWidth: 44,
                borderRadius: 1.5,
                borderColor: alpha(palette.primary.main, 0.3),
                "&:hover": {
                  borderColor: palette.primary.main,
                  bgcolor: alpha(palette.primary.main, 0.08),
                },
              }}
            >
              <LocalPrintshopOutlined />
            </Button>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
}
