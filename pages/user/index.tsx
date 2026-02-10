import Layout from "@/components/layout/Layout";
import NewUserDialog from "@/components/user/NewUserDialog";
import UserAdminList from "@/components/user/UserAdminList";
import UserSearchBar from "@/components/user/UserSearchBar";
import UserSearchFilters from "@/components/user/UserSearchFilters";
import { BookType } from "@/entities/BookType";
import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { prisma } from "@/entities/db";
import { getAllUsers } from "@/entities/user";
import { convertDateToDayString } from "@/lib/utils/dateutils";
import getMaxId from "@/lib/utils/id";
import { increaseNumberInString } from "@/lib/utils/increaseNumberInString";
import palette from "@/styles/palette";
import { alpha, Box, Container, Stack } from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

interface UsersPageProps {
  users: UserType[];
  books: BookType[];
  rentals: RentalsUserType[];
}

export default function UsersPage({ users, books, rentals }: UsersPageProps) {
  const [searchText, setSearchText] = useState("");
  const [filterString, setFilterString] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showDetailSearch, setShowDetailSearch] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const theme = useTheme();

  // Combine search text and filter string for the list
  const combinedSearchString = useMemo(() => {
    return [searchText, filterString].filter(Boolean).join(" ");
  }, [searchText, filterString]);

  // Auto-reset confirm state after 5s
  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => setConfirmDelete(false), 5000);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

  // Reset confirm when selection changes
  useEffect(() => {
    setConfirmDelete(false);
  }, [checked]);

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setSearchText(e.target.value);
    },
    [],
  );

  const handleFilterChange = useCallback((filter: string) => {
    setFilterString(filter);
  }, []);

  const handleCreateUser = useCallback(
    (autoID: boolean, proposedID: number) => {
      setIsCreatingUser(true);

      const user: UserType = {
        firstName: "",
        lastName: "",
        active: true,
      };
      if (!autoID) user.id = proposedID;

      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Server error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setIsCreatingUser(false);
          router.push(`user/${data.id}`);
        })
        .catch((error) => {
          console.error("Error creating user:", error);
          setIsCreatingUser(false);
          enqueueSnackbar(
            "Neuer User konnte nicht erzeugt werden. Ist die Nutzer ID schon vorhanden?",
            { variant: "error" },
          );
        });
    },
    [router, enqueueSnackbar],
  );

  const handleSelectAll = useCallback(() => {
    const hasSelection = Object.values(checked).some(Boolean);
    const newChecked = users.reduce<Record<string, boolean>>((acc, user) => {
      if (user.id !== undefined) {
        acc[user.id.toString()] = !hasSelection;
      }
      return acc;
    }, {});
    setChecked(newChecked);
  }, [users, checked]);

  const handleIncreaseGrade = useCallback(() => {
    const updatedUserIDs = users
      .filter((u) => checked[u.id!])
      .map((u) => ({
        id: u.id,
        grade: increaseNumberInString(u.schoolGrade),
      }));

    fetch("/api/batch/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUserIDs),
    })
      .then((res) => res.json())
      .then(() => {
        enqueueSnackbar("Klassenstufe für Schüler erhöht");
        router.push("user");
      });
  }, [users, checked, router, enqueueSnackbar]);

  const handleDeleteUsers = useCallback(() => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    const userIdsToDelete = users
      .filter((u) => checked[u.id!])
      .map((u) => u.id);

    fetch("/api/batch/user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userIdsToDelete),
    })
      .then((res) => res.json())
      .then(() => {
        enqueueSnackbar("Schüler erfolgreich gelöscht");
        setConfirmDelete(false);
        router.push("user");
      })
      .catch(() => setConfirmDelete(false));
  }, [users, checked, confirmDelete, router, enqueueSnackbar]);

  const uniqueGrades = useMemo(() => {
    return users.reduce<string[]>((unique, user) => {
      if (user.schoolGrade && !unique.includes(user.schoolGrade)) {
        unique.push(user.schoolGrade);
      }
      return unique;
    }, []);
  }, [users]);

  const selectedCount = Object.values(checked).filter(Boolean).length;

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <NewUserDialog
          open={showNewUserDialog}
          setOpen={setShowNewUserDialog}
          maxUserID={getMaxId(users) + 1}
          onCreate={(idAuto, idValue) => {
            handleCreateUser(idValue, idAuto);
            setShowNewUserDialog(false);
          }}
        />

        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Stack spacing={3}>
            {/* Header Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
              }}
            ></Box>

            {/* Search Bar */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <UserSearchBar
                searchValue={searchText}
                onSearchChange={handleSearchChange}
                onToggleSettings={() => setShowDetailSearch(!showDetailSearch)}
                showSettings={showDetailSearch}
                onSelectAll={handleSelectAll}
                onCreateUser={() => setShowNewUserDialog(true)}
                checked={checked}
                onIncreaseGrade={handleIncreaseGrade}
                onDeleteUsers={handleDeleteUsers}
                confirmDelete={confirmDelete}
                settingsContent={
                  <UserSearchFilters
                    grades={uniqueGrades}
                    onFilterChange={handleFilterChange}
                  />
                }
              />
            </Box>

            {/* User List */}
            <Box
              sx={{
                p: { xs: 1, sm: 2 },
                borderRadius: 3,
                bgcolor: alpha(palette.background.paper, 0.5),
                backdropFilter: "blur(8px)",
                border: `1px solid ${alpha(palette.primary.main, 0.08)}`,
              }}
            >
              <UserAdminList
                users={users}
                rentals={rentals}
                searchString={combinedSearchString}
                checked={checked}
                setChecked={setChecked}
              />
            </Box>
          </Stack>
        </Container>
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps() {
  const allUsers = await getAllUsers(prisma);

  const users = allUsers.map((u) => {
    const newUser = { ...u } as any;
    newUser.createdAt = convertDateToDayString(u.createdAt);
    newUser.updatedAt = convertDateToDayString(u.updatedAt);
    return newUser;
  });

  const allBooks = await getAllBooks(prisma);
  const books = allBooks.map((b) => {
    const newBook = { ...b } as any;
    newBook.createdAt = convertDateToDayString(b.createdAt);
    newBook.updatedAt = convertDateToDayString(b.updatedAt);
    newBook.rentedDate = b.rentedDate
      ? convertDateToDayString(b.rentedDate)
      : "";
    newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
    return newBook;
  });

  const allRentals = await getRentedBooksWithUsers(prisma);
  const rentals = allRentals.map((r) => {
    const due = dayjs(r.dueDate);
    const today = dayjs();
    const diff = today.diff(due, "days");

    return {
      id: r.id,
      title: r.title,
      lastName: r.user?.lastName ?? null,
      firstName: r.user?.firstName ?? null,
      remainingDays: diff,
      dueDate: convertDateToDayString(due.toDate()),
      renewalCount: r.renewalCount,
      userid: r.user?.id ?? null,
    };
  });

  return { props: { users, books, rentals } };
}
