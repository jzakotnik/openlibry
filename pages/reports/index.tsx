import Layout from "@/components/layout/Layout";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { getAllUsers } from "@/entities/user";
import { deDE as coreDeDE } from "@mui/material/locale";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { deDE } from "@mui/x-data-grid/locales";
import dayjs from "dayjs";

import BookLabelsCard from "@/components/reports/cards/BookLabelsCard";

import LinkCard from "@/components/reports/cards/LinkCard";
import ReminderCard from "@/components/reports/cards/ReminderCard";
import ReportCard from "@/components/reports/cards/ReportCard";
import UserLabelsCard from "@/components/reports/cards/UserLabelsCard";
import Dashboard from "@/components/reports/Dashboard";
import { useBookLabelFilters } from "@/components/reports/hooks/useBookLabelFilters";
import { useUserLabelFilters } from "@/components/reports/hooks/useUserLabelFilters";
import TagCloudDashboard from "@/components/reports/TagCloud";
import { BookType } from "@/entities/BookType";
import { prisma } from "@/entities/db";
import { UserType } from "@/entities/UserType";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger } from "@/lib/logger";
import { convertDateToDayString } from "@/lib/utils/dateutils";
import {
  getBookTopicCounts,
  getSchoolGradeCounts,
} from "@/lib/utils/topicUtils";
import { Grid } from "@mui/material";
import type {} from "@mui/x-data-grid/themeAugmentation";

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
    spacing: 4,
  },
  deDE,
  coreDeDE,
);

interface ReportPropsType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: any;
  overdueCount: number;
  nonExtendableCount: number;
  tagSet: Array<{ topic: string; count: number }>;
  schoolGradeSet: Array<{ topic: string; count: number }>;
}

export default function Reports({
  users,
  books,
  rentals,
  overdueCount,
  nonExtendableCount,
  tagSet,
  schoolGradeSet,
}: ReportPropsType) {
  const bookLabelFilters = useBookLabelFilters();
  const userLabelFilters = useUserLabelFilters();

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <TagCloudDashboard tagsSet={tagSet} />

        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={3}
          data-cy="reports-grid"
        >
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ReportCard
              title="Nutzerinnen"
              subtitle="Liste aller Nutzerinnen"
              unit="users"
              totalNumber={users.length}
              link="reports/users"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ReportCard
              title="Bücher"
              subtitle="Liste aller Bücher"
              unit="books"
              totalNumber={books.length}
              link="reports/books"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ReportCard
              title="Leihen"
              subtitle="Liste aller Leihen"
              unit="rentals"
              totalNumber={rentals.length}
              link="reports/rentals"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <LinkCard
              title="Excel Export"
              subtitle="Excel Export der Daten"
              buttonTitle="Download Excel"
              link="api/excel"
              dataCy="excel-export-card"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <LinkCard
              title="Excel Import"
              subtitle="Excel Import der Daten"
              buttonTitle="Upload Excel"
              link="reports/xlsimport"
              dataCy="excel-import-card"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ReportCard
              title="Historie"
              subtitle="Aktivitäten Bücher/User"
              unit="audits"
              totalNumber={1000}
              link="reports/audit"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <BookLabelsCard
              title="Buch Etiketten"
              subtitle=""
              unit="Etiketten"
              link="api/report/booklabels"
              totalNumber={books.length}
              startLabel={bookLabelFilters.startLabel}
              setStartLabel={bookLabelFilters.setStartLabel}
              startId={bookLabelFilters.startId}
              setStartId={bookLabelFilters.setStartId}
              endId={bookLabelFilters.endId}
              setEndId={bookLabelFilters.setEndId}
              idFilter={bookLabelFilters.idFilter}
              setIdFilter={bookLabelFilters.setIdFilter}
              topicsFilter={bookLabelFilters.topicsFilter}
              setTopicsFilter={bookLabelFilters.setTopicsFilter}
              allTopics={tagSet}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <UserLabelsCard
              title="Ausweise"
              subtitle="Liste aller Ausweise"
              link="api/report/userlabels"
              totalNumber={users.length}
              startLabel={userLabelFilters.startLabel}
              setStartLabel={userLabelFilters.setStartLabel}
              startUserId={userLabelFilters.startUserId}
              setStartUserId={userLabelFilters.setStartUserId}
              endUserId={userLabelFilters.endUserId}
              setEndUserId={userLabelFilters.setEndUserId}
              idUserFilter={userLabelFilters.idUserFilter}
              setIdUserFilter={userLabelFilters.setIdUserFilter}
              topicsFilter={userLabelFilters.schoolgradeFilter}
              setTopicsFilter={userLabelFilters.setSchoolgradeFilter}
              allTopics={schoolGradeSet}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ReminderCard
              title="Mahnungen"
              subtitle="Ausdruck der Mahnungen als Word-Dokument"
              link="/api/report/reminder"
              overdueCount={overdueCount}
              nonExtendableCount={nonExtendableCount}
            />
          </Grid>
        </Grid>
        <Dashboard users={users} rentals={rentals} books={books} />
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps() {
  const REMINDER_RENEWAL_COUNT = process.env.REMINDER_RENEWAL_COUNT
    ? parseInt(process.env.REMINDER_RENEWAL_COUNT)
    : 5;

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
      title: r.title || "",
      lastName: r.user?.lastName || "",
      firstName: r.user?.firstName || "",
      remainingDays: diff,
      dueDate: convertDateToDayString(due.toDate()),
      renewalCount: r.renewalCount ?? 0,
      userid: r.user?.id ?? null,
    };
  });

  // Pre-compute topic and school grade counts on the server
  const tagSet = getBookTopicCounts(allBooks);
  const schoolGradeSet = getSchoolGradeCounts(allUsers);

  // Pre-compute reminder counts for the ReminderCard
  const overdueRentals = rentals.filter((r) => r.remainingDays > 0);
  const overdueCount = new Set(
    overdueRentals.map((r) => r.userid).filter(Boolean),
  ).size;
  const nonExtendableCount = new Set(
    overdueRentals
      .filter((r) => r.renewalCount >= REMINDER_RENEWAL_COUNT)
      .map((r) => r.userid)
      .filter(Boolean),
  ).size;

  businessLogger.debug(
    {
      event: LogEvents.PAGE_LOAD,
      page: "/reports",
      userCount: users.length,
      bookCount: books.length,
      rentalCount: rentals.length,
    },
    "Reports page loaded",
  );

  return {
    props: {
      users,
      books,
      rentals,
      overdueCount,
      nonExtendableCount,
      tagSet,
      schoolGradeSet,
    },
  };
}
