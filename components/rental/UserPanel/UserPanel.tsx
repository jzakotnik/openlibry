import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { Dispatch, RefObject, useEffect, useState } from "react";

import { BookType } from "@/entities/BookType";
import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import palette from "@/styles/palette";
import { extendDays } from "@/utils/dateutils";
import { booksForUser, filterUsers } from "@/utils/searchUtils";

import RentSearchParams from "../RentSearchParams";
import { GlassCard, SearchInput } from "../shared";
import RentedBookItem from "./RentedBookItem";

interface UserPanelProps {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: Array<RentalsUserType>;
  handleExtendBookButton: (id: number, book: BookType) => void;
  handleReturnBookButton: (bookid: number, userid: number) => void;
  setUserExpanded: Dispatch<number | false>;
  userExpanded: number | false;
  searchFieldRef: RefObject<HTMLInputElement | null>;
  handleBookSearchSetFocus: () => void;
}

export default function UserPanel({
  users,
  books,
  rentals,
  handleExtendBookButton,
  handleReturnBookButton,
  setUserExpanded,
  userExpanded,
  searchFieldRef,
  handleBookSearchSetFocus,
}: UserPanelProps) {
  const [userSearchInput, setUserSearchInput] = useState("");
  const [showDetailSearch, setShowDetailSearch] = useState(false);

  // Use state for extension days to avoid hydration mismatch
  // Initialize with null, calculate on client only
  const [extensionDays, setExtensionDays] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    setExtensionDays(
      extendDays(
        new Date(),
        process.env.EXTENSION_DURATION_DAYS
          ? parseInt(process.env.EXTENSION_DURATION_DAYS)
          : 14
      )
    );
  }, []);

  // Filter users based on search input
  let exactMatchUserId: number = -1;
  const filterUserSub = (
    users: Array<UserType>,
    searchString: string,
    rentals: Array<RentalsUserType>
  ) => {
    const [filteredUsers, exactMatchRes] = filterUsers(
      users,
      searchString,
      rentals,
      false
    );
    exactMatchUserId = exactMatchRes;
    return filteredUsers;
  };

  const filteredUsers = filterUserSub(users, userSearchInput, rentals);

  // Get unique grades for filter
  const uniqueGrades = users.reduce((unique: Array<string>, user: UserType) => {
    if (user.schoolGrade && !unique.includes(user.schoolGrade)) {
      unique.push(user.schoolGrade);
    }
    return unique;
  }, []);

  // Get book from ID
  const getBookFromID = (id: number): BookType | undefined => {
    return books.find((b: BookType) => b.id === id);
  };

  // Calculate rental stats for a user
  const getRentalStats = (userId: number) => {
    const userRentals = booksForUser(userId, rentals);
    const overdueCount = userRentals.filter((r) => r.remainingDays > 0).length;
    return { rentedCount: userRentals.length, overdueCount };
  };

  // Handle keyboard events
  const handleKeyUp = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      if (exactMatchUserId > -1) {
        setUserExpanded(exactMatchUserId);
      }
      handleBookSearchSetFocus();
    } else if (e.key === "Escape") {
      setUserExpanded(false);
      setUserSearchInput("");
    }
  };

  // Handle search clear
  const handleClear = () => {
    setUserExpanded(false);
  };

  // Handle user click - toggle expansion
  const handleUserClick = (userId: number) => {
    setUserExpanded(userExpanded === userId ? false : userId);
  };

  return (
    <GlassCard sx={{ overflow: "visible" }}>
      <Box sx={{ p: 2.5 }}>
        {/* Search Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <SearchInput
            placeholder="NutzerIn suchen... (Name, ID, klasse?, fällig?)"
            value={userSearchInput}
            onChange={setUserSearchInput}
            onKeyUp={handleKeyUp}
            onClear={handleClear}
            icon={<AccountCircleIcon />}
            accentColor={palette.primary.main}
            inputRef={searchFieldRef}
            autoFocus={true}
            dataCy="rental_input_searchuser"
          />
          <Tooltip title="Sucheinstellungen">
            <IconButton
              onClick={() => setShowDetailSearch(!showDetailSearch)}
              sx={{
                background: showDetailSearch
                  ? `${palette.primary.main}15`
                  : "rgba(255, 255, 255, 0.8)",
                borderRadius: "14px",
                width: "48px",
                height: "48px",
              }}
            >
              <SettingsSuggestIcon sx={{ color: palette.primary.main }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Advanced search params */}
        {showDetailSearch && (
          <Box sx={{ mb: 2 }}>
            <RentSearchParams
              overdue={false}
              grade={uniqueGrades}
              setUserSearchInput={setUserSearchInput}
            />
          </Box>
        )}

        {/* Selected user indicator */}
        {userExpanded && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 1.5,
              color: palette.primary.main,
              fontWeight: 600,
            }}
          >
            Ausgewählt:{" "}
            {users.find((u) => u.id === userExpanded)?.firstName || ""}
          </Typography>
        )}

        {/* User List */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            maxHeight: "550px",
            overflowY: "auto",
            overflowX: "visible",
            pr: 1,
          }}
        >
          {filteredUsers.map((user) => {
            const { rentedCount, overdueCount } = getRentalStats(user.id!);
            const isExpanded = userExpanded === user.id;
            const userRentals = booksForUser(user.id!, rentals);
            const initials = `${user.firstName?.[0] || ""}${
              user.lastName?.[0] || ""
            }`;

            return (
              <Paper
                key={user.id}
                elevation={isExpanded ? 2 : 0}
                sx={{
                  borderRadius: "14px",
                  backgroundColor: isExpanded
                    ? `${palette.primary.light}20`
                    : "rgba(255, 255, 255, 0.8)",
                  border: isExpanded
                    ? `2px solid ${palette.primary.main}40`
                    : "2px solid transparent",
                  overflow: "hidden",
                }}
                data-cy={`user_item_${user.id}`}
              >
                {/* User header row - clickable */}
                <Box
                  onClick={() => handleUserClick(user.id!)}
                  sx={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    "&:hover": {
                      backgroundColor: "rgba(18, 85, 111, 0.05)",
                    },
                  }}
                >
                  {/* Left side: Avatar + Info */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        backgroundColor: isExpanded
                          ? palette.primary.main
                          : palette.primary.light,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isExpanded ? "white" : palette.primary.main,
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

                  {/* Right side: Badges + Expand icon */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {overdueCount > 0 && (
                      <Box
                        component="span"
                        sx={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          backgroundColor: `${palette.error.main}15`,
                          color: palette.error.main,
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {overdueCount} überfällig
                      </Box>
                    )}
                    {rentedCount > 0 && (
                      <Box
                        component="span"
                        sx={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          backgroundColor: `${palette.primary.main}15`,
                          color: palette.primary.main,
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {rentedCount} 📚
                      </Box>
                    )}
                    <ExpandMoreIcon
                      sx={{
                        color: palette.primary.main,
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </Box>
                </Box>

                {/* Expanded content - user's rented books */}
                <Collapse in={isExpanded}>
                  <Box
                    sx={{
                      px: 2,
                      pb: 2,
                      pt: 1,
                      borderTop: `1px solid ${palette.primary.main}20`,
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    {userRentals.length === 0 ? (
                      <Typography
                        sx={{
                          color: palette.success.main,
                          fontSize: "14px",
                          py: 1,
                        }}
                      >
                        Keine Bücher ausgeliehen
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {userRentals.map((rental) => {
                          const book = getBookFromID(rental.id);
                          // Default to false during SSR (when extensionDays is null)
                          const allowExtend = extensionDays
                            ? extensionDays.isAfter(
                                dayjs(rental.dueDate),
                                "day"
                              )
                            : false;
                          return (
                            <RentedBookItem
                              key={rental.id}
                              rental={rental}
                              allowExtend={allowExtend}
                              onReturn={() =>
                                handleReturnBookButton(rental.id, user.id!)
                              }
                              onExtend={() => {
                                if (book)
                                  handleExtendBookButton(rental.id, book);
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            );
          })}

          {filteredUsers.length === 0 && (
            <Typography
              sx={{
                textAlign: "center",
                py: 4,
                color: "#5A6166",
              }}
            >
              Keine NutzerInnen gefunden
            </Typography>
          )}
        </Box>
      </Box>
    </GlassCard>
  );
}
