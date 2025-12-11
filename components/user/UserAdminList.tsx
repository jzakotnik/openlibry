import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import palette from "@/styles/palette";
import {
  EditOutlined,
  ExpandMore,
  LibraryBooks,
  LocalPrintshopOutlined,
  School,
  Warning,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import Link from "next/link";
import { useEffect } from "react";
import { filterUsers } from "../../utils/searchUtils";

type OverdueStatus = "overdue" | "warning" | "ok";

interface UserAdminListProps {
  users: UserType[];
  rentals: RentalsUserType[];
  searchString: string;
  checked: Record<string, boolean>;
  setChecked: (checked: Record<string, boolean>) => void;
}

interface UserRental {
  id: number;
  title: string;
  dueDate: string | Date;
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

function hasOverdueRentals(rentals: UserRental[]): boolean {
  return rentals.some((r) => getOverdueStatus(r.dueDate) !== "ok");
}

export default function UserAdminList({
  users,
  rentals,
  searchString,
  checked,
  setChecked,
}: UserAdminListProps) {
  // Build rental count map
  const rentalCountByUser = rentals.reduce<Record<number, number>>(
    (acc, rental) => {
      const userId = rental.userid;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    },
    {}
  );

  // Initialize checkboxes
  useEffect(() => {
    const initialChecked = users.reduce<Record<string, boolean>>(
      (acc, user) => {
        acc[user.id!.toString()] = false;
        return acc;
      },
      {}
    );
    setChecked(initialChecked);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- useState setter is stable
  }, [users]);

  const filteredUsers = filterUsers(users, searchString, rentals, false)[0];

  const getUserRentals = (userId: number): UserRental[] =>
    rentals.filter(
      (r) => parseInt(r.userid as unknown as string) === userId
    ) as UserRental[];

  const handleCheckboxChange = (userId: string) => {
    setChecked({ ...checked, [userId]: !checked[userId] });
  };

  if (filteredUsers.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          px: 3,
          textAlign: "center",
          borderRadius: 2,
          bgcolor: alpha(palette.primary.light, 0.06),
        }}
      >
        <Typography
          variant="body1"
          sx={{ color: palette.text.secondary, mb: 1 }}
        >
          {searchString
            ? "Keine Benutzer gefunden"
            : "Noch keine Benutzer vorhanden"}
        </Typography>
        <Typography variant="body2" sx={{ color: palette.text.disabled }}>
          {searchString
            ? "Versuche einen anderen Suchbegriff"
            : "Erstelle einen neuen Benutzer um zu beginnen"}
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1}>
      {filteredUsers.map((user: UserType) => {
        const userId = user.id!.toString();
        const isChecked = checked[userId] ?? false;
        const userRentals = getUserRentals(user.id!);
        const rentalCount = rentalCountByUser[user.id!] ?? 0;
        const hasOverdue = hasOverdueRentals(userRentals);

        return (
          <Box
            key={user.id}
            sx={{
              display: "flex",
              alignItems: "stretch",
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
            {/* Checkbox Column */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1,
                borderRight: `1px solid ${alpha(palette.primary.main, 0.08)}`,
              }}
            >
              <Checkbox
                checked={isChecked}
                onChange={() => handleCheckboxChange(userId)}
                sx={{
                  color: alpha(palette.primary.main, 0.4),
                  "&.Mui-checked": {
                    color: palette.primary.main,
                  },
                }}
              />
            </Box>

            {/* Main Content */}
            <Accordion
              elevation={0}
              disableGutters
              sx={{
                flex: 1,
                minWidth: 0,
                bgcolor: "transparent",
                "&::before": { display: "none" },
                "& .MuiAccordionSummary-root": {
                  minHeight: 64,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: palette.primary.main }} />}
                sx={{
                  px: 2,
                  "& .MuiAccordionSummary-content": {
                    my: 1,
                    minWidth: 0,
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ width: "100%", minWidth: 0 }}
                >
                  {/* Avatar with rental count */}
                  <Tooltip
                    title={`${rentalCount} ${
                      rentalCount === 1 ? "Buch" : "Bücher"
                    } ausgeliehen`}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor:
                          rentalCount > 0
                            ? hasOverdue
                              ? alpha(palette.error.main, 0.15)
                              : alpha(palette.primary.main, 0.15)
                            : alpha(palette.success.main, 0.15),
                        color:
                          rentalCount > 0
                            ? hasOverdue
                              ? palette.error.main
                              : palette.primary.main
                            : palette.success.main,
                        fontWeight: 600,
                        fontSize: "0.95rem",
                      }}
                    >
                      {rentalCount}
                    </Avatar>
                  </Tooltip>

                  {/* User Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: palette.primary.dark,
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
                              fontSize: 18,
                              color: palette.warning.main,
                            }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      alignItems="center"
                      sx={{ mt: 0.25 }}
                    >
                      <School
                        sx={{ fontSize: 14, color: palette.text.disabled }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: palette.text.secondary }}
                      >
                        Klasse {user.schoolGrade}
                        {user.schoolTeacherName &&
                          ` · ${user.schoolTeacherName}`}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Quick Info Chip */}
                  <Chip
                    size="small"
                    label={`Nr. ${user.id}`}
                    sx={{
                      height: 22,
                      fontSize: "0.7rem",
                      bgcolor: alpha(palette.primary.main, 0.08),
                      color: palette.text.secondary,
                      display: { xs: "none", sm: "flex" },
                    }}
                  />
                </Stack>
              </AccordionSummary>

              <AccordionDetails
                sx={{ px: 2, pb: 2, pt: 0, overflow: "hidden" }}
              >
                <Box
                  sx={{
                    borderRadius: 2,
                    bgcolor: alpha(palette.primary.light, 0.06),
                    p: 2,
                    overflow: "hidden",
                  }}
                >
                  {/* Rental Section */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1.5 }}
                  >
                    <LibraryBooks
                      sx={{ fontSize: 18, color: palette.primary.main }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: palette.primary.main }}
                    >
                      Ausgeliehene Bücher
                    </Typography>
                  </Stack>

                  {userRentals.length === 0 ? (
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
                      {userRentals.map((rental) => {
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

                  <Divider sx={{ my: 2 }} />

                  {/* Actions */}
                  <Stack direction="row" spacing={1}>
                    <Link
                      href={`/user/${user.id}`}
                      passHref
                      style={{ flex: 1 }}
                    >
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
                            boxShadow: `0 4px 12px ${alpha(
                              palette.primary.main,
                              0.3
                            )}`,
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
                          window.open(
                            `api/report/userlabels?id=${user.id}`,
                            "_blank"
                          )
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
              </AccordionDetails>
            </Accordion>
          </Box>
        );
      })}
    </Stack>
  );
}
