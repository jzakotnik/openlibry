import Layout from "@/components/layout/Layout";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { getAllUsers } from "@/entities/user";
import dayjs from "dayjs";

import BookLabelsCard from "@/components/reports/cards/BookLabelsCard";
import LinkCard from "@/components/reports/cards/LinkCard";
import ReminderCard from "@/components/reports/cards/ReminderCard";
import ReportCard from "@/components/reports/cards/ReportCard";
import UserLabelsCard from "@/components/reports/cards/UserLabelsCard";
import { useBookLabelFilters } from "@/components/reports/hooks/useBookLabelFilters";
import { useUserLabelFilters } from "@/components/reports/hooks/useUserLabelFilters";
import TagCloudDashboard from "@/components/reports/TagCloud";
import { countAudit } from "@/entities/audit";
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

interface ReportPropsType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: any;
  overdueCount: number;
  nonExtendableCount: number;
  tagSet: Array<{ topic: string; count: number }>;
  schoolGradeSet: Array<{ topic: string; count: number }>;
  auditCount: number;
}

export default function Reports({
  users,
  books,
  rentals,
  overdueCount,
  nonExtendableCount,
  tagSet,
  schoolGradeSet,
  auditCount = 0,
}: ReportPropsType) {
  const bookLabelFilters = useBookLabelFilters();
  const userLabelFilters = useUserLabelFilters();

  return (
    <Layout>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-start"
        data-cy="reports-grid"
      >
        <ReportCard
          title="Nutzerinnen"
          subtitle="Liste aller Nutzerinnen"
          unit="users"
          totalNumber={users.length}
          link="reports/users"
        />
        <ReportCard
          title="Bücher"
          subtitle="Liste aller Bücher"
          unit="books"
          totalNumber={books.length}
          link="reports/books"
        />
        <ReportCard
          title="Leihen"
          subtitle="Liste aller Leihen"
          unit="rentals"
          totalNumber={rentals.length}
          link="reports/rentals"
        />
        <LinkCard
          title="Excel Export"
          subtitle="Excel Export der Daten"
          buttonTitle="Download Excel"
          link="api/excel"
          dataCy="excel-export-card"
        />
        <LinkCard
          title="Excel Import"
          subtitle="Excel Import der Daten"
          buttonTitle="Upload Excel"
          link="reports/xlsimport"
          dataCy="excel-import-card"
        />
        <ReportCard
          title="Historie"
          subtitle="Aktivitäten Bücher/User"
          unit="Einträge"
          totalNumber={auditCount}
          link="reports/audit"
        />
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
        <ReminderCard
          title="Mahnungen"
          subtitle="Ausdruck der Mahnungen als Word-Dokument"
          link="/api/report/reminder"
          overdueCount={overdueCount}
          nonExtendableCount={nonExtendableCount}
        />{" "}
      </div>{" "}
      <TagCloudDashboard tagsSet={tagSet} />
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
  const auditCount = (await countAudit(prisma)) ?? 0;

  return {
    props: {
      users,
      books,
      rentals,
      overdueCount,
      nonExtendableCount,
      tagSet,
      schoolGradeSet,
      auditCount,
    },
  };
}
