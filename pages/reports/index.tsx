import Layout from "@/components/layout/Layout";
import { getAllBooks, getRentedBooksWithUsers } from "@/entities/book";
import { getAllUsers } from "@/entities/user";
import { deDE as coreDeDE } from "@mui/material/locale";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { deDE } from "@mui/x-data-grid/locales";
import dayjs from "dayjs";

import BookLabelsCard from "@/components/reports/BookLabelsCard";
import Dashboard from "@/components/reports/Dashboard";
import TagCloudDashboard from "@/components/reports/TagCloud";
import { BookType } from "@/entities/BookType";
import { prisma } from "@/entities/db";
import { UserType } from "@/entities/UserType";
import { convertDateToDayString } from "@/utils/dateutils";
import {
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import type {} from "@mui/x-data-grid/themeAugmentation";
import router from "next/router";
import { useState } from "react";

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
    spacing: 4,
  },
  deDE, // x-data-grid translations
  coreDeDE // core translations
);

const cardHeight = 210;

interface ReportPropsType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: any;
}

type ReportCardProps = {
  title: string;
  subtitle: string;
  unit: string;
  link: string;
  totalNumber: number;
};
type LabelCardProps = {
  title: string;
  subtitle: string;
  unit: string;
  link: string;
  startLabel: number;
  setStartLabel?: any;
  totalNumber: number;
  startUserId: number;
  setStartUserId: any;
  endUserId: number;
  setEndUserId?: any;
  idUserFilter: number;
  setIdUserFilter: any;
  topicsFilter: any;
  setTopicsFilter: any;
  allTopics: any;
};

type LinkCardProps = {
  title: string;
  subtitle: string;
  buttonTitle: string;
  link: string;
  dataCy?: string;
};

const LinkCard = ({
  title,
  subtitle,
  buttonTitle,
  link,
  dataCy,
}: LinkCardProps) => {
  return (
    <Card
      variant="outlined"
      sx={{ minWidth: 275, minHeight: cardHeight }}
      data-cy={dataCy}
    >
      <CardContent>
        <Typography variant="h5" component="div" data-cy={`${dataCy}-title`}>
          {title}
        </Typography>

        <Typography variant="body2" data-cy={`${dataCy}-subtitle`}>
          {subtitle}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => router.push(link)}
          data-cy={`${dataCy}-button`}
        >
          {buttonTitle}
        </Button>
      </CardActions>
    </Card>
  );
};

const LabelCard = ({
  title,
  subtitle,
  link,
  startLabel,
  totalNumber,
  setStartLabel,
  idUserFilter,
  setIdUserFilter,
  startUserId,
  setStartUserId,
  endUserId,
  setEndUserId,
  topicsFilter,
  setTopicsFilter,
  allTopics,
}: LabelCardProps) => {
  const getUserUrl = () => {
    return (
      "/?" +
      (startLabel > 0 ? "start=0" + "&end=" + Math.floor(startLabel!) : "") +
      (startUserId > 0 || endUserId > 0
        ? "&startId=" + startUserId + "&endId=" + endUserId
        : "") +
      (idUserFilter > 0 ? "&id=" + idUserFilter : "") +
      (topicsFilter ? "&schoolGrade=" + topicsFilter.topic : "")
    );
  };

  return (
    <Card
      variant="outlined"
      sx={{ minWidth: 275, minHeight: cardHeight }}
      data-cy="user-labels-card"
    >
      <CardContent>
        <Typography variant="h5" component="div" data-cy="user-labels-title">
          {title}
        </Typography>

        <TextField
          id="outlined-number"
          label="Anzahl Etiketten"
          key="book_report_number_input"
          type="number"
          value={startLabel}
          error={startLabel! > totalNumber}
          helperText={
            startLabel! > totalNumber ? "So viele gibt es nicht?" : ""
          }
          onChange={(e: any) => {
            setStartLabel(parseInt(e.target.value));
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mt: 5 }}
          data-cy="user-labels-count-input"
        />
        <Grid
          container
          direction="row"
          alignItems="left"
          justifyContent="left"
          spacing={3}
        >
          <Grid size={{ xs: 6, md: 6, lg: 5 }} sx={{}}>
            <TextField
              id="idUserRangeFrom"
              label="Von ID"
              key="idUserRangeFrom"
              type="number"
              value={startUserId}
              onChange={(e: any) => {
                setStartUserId(parseInt(e.target.value));
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mt: 5 }}
              data-cy="user-labels-start-id"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 6, lg: 5 }} sx={{}}>
            <TextField
              id="idUserRangeTo"
              label="Bis ID"
              key="idUserRangeTo"
              type="number"
              value={endUserId}
              onChange={(e: any) => {
                setEndUserId(parseInt(e.target.value));
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mt: 5 }}
              data-cy="user-labels-end-id"
            />
          </Grid>
        </Grid>
        <TextField
          id="outlined-user-number"
          label="Etikett für UserID:"
          key="user_report_id_input"
          type="number"
          value={idUserFilter}
          onChange={(e: any) => {
            setIdUserFilter(parseInt(e.target.value));
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mt: 5 }}
          data-cy="user-labels-user-id-filter"
        />

        <Autocomplete
          freeSolo
          id="schoolgrades"
          getOptionLabel={(option: any) => `${option.topic} (${option.count})`}
          options={allTopics}
          onChange={(event: any, newValue: string | null) => {
            setTopicsFilter(newValue);
          }}
          value={topicsFilter}
          isOptionEqualToValue={(option, value) => option === value}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Schlagwort Filter"
              variant="standard"
              data-cy="user-labels-schoolgrade-filter"
            />
          )}
        />

        <Typography variant="body2" data-cy="user-labels-subtitle">
          {subtitle}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => window.open(link + getUserUrl(), "_blank")}
          data-cy="user-labels-generate-button"
        >
          Erzeuge PDF
        </Button>
      </CardActions>
    </Card>
  );
};

export default function Reports({ users, books, rentals }: ReportPropsType) {
  const [startLabel, setStartLabel] = useState(0);
  const [startId, setStartId] = useState(0);
  const [endId, setEndId] = useState(0);
  const [startUserLabel, setStartUserLabel] = useState(0);
  const [startUserId, setStartUserId] = useState(0);
  const [endUserId, setEndUserId] = useState(0);
  const [topicsFilter, setTopicsFilter] = useState(null);
  const [idFilter, setIdFilter] = useState(0);
  const [idUserFilter, setIdUserFilter] = useState(0);
  const [schoolgradeFilter, setSchoolgradeFilter] = useState(null);

  const ReportCard = ({
    title,
    subtitle,
    unit,
    link,
    totalNumber,
  }: ReportCardProps) => {
    // Generate data-cy attribute based on unit
    const dataCy = `report-card-${unit}`;

    return (
      <Card
        variant="outlined"
        sx={{ minWidth: 275, minHeight: cardHeight }}
        data-cy={dataCy}
      >
        <CardContent>
          <Typography variant="h5" component="div" data-cy={`${dataCy}-title`}>
            {title}
          </Typography>
          <Typography
            sx={{ mb: 1.5 }}
            color="text.secondary"
            data-cy={`${dataCy}-count`}
          >
            {totalNumber}
          </Typography>
          <Typography variant="body2" data-cy={`${dataCy}-subtitle`}>
            {subtitle}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            onClick={() => router.push(link)}
            data-cy={`${dataCy}-button`}
          >
            Erzeuge Tabelle
          </Button>
        </CardActions>
      </Card>
    );
  };
  const allTags = [] as any;
  books.map((b: BookType) => {
    //console.log("Importing topics", b.topics);
    b.topics
      ? allTags.push(b.topics!.split(";").filter((t: string) => t.length > 0))
      : null;
  });
  //console.log("All Tags", allTags);

  const tagSet = convertToTopicCount(allTags);
  //console.log("Tag Set", tagSet);

  const allSchoolGrades = [] as any;
  users.map((u: UserType) => {
    u.schoolGrade ? allSchoolGrades.push(u.schoolGrade) : null;
  });
  const schoolGradeSet = convertToTopicCount(allSchoolGrades);

  function convertToTopicCount(
    arr: string[][]
  ): { topic: string; count: number }[] {
    // Flatten the array of arrays into a single array of strings
    const flattenedArray = arr.flat();

    // Use reduce to create the topicCountMap
    const topicCountMap = flattenedArray.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Convert the map to an array of objects with "topic" and "count"
    return Object.keys(topicCountMap).map((topic) => ({
      topic,
      count: topicCountMap[topic],
    }));
  }

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
          <Grid size={{ xs: 12, md: 6, lg: 4 }} sx={{}}>
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
              startLabel={startLabel}
              setStartLabel={setStartLabel}
              startId={startId}
              setStartId={setStartId}
              endId={endId}
              setEndId={setEndId}
              idFilter={idFilter}
              setIdFilter={setIdFilter}
              topicsFilter={topicsFilter}
              setTopicsFilter={setTopicsFilter}
              allTopics={tagSet}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <LabelCard
              title="Ausweise"
              subtitle="Liste aller Ausweise"
              unit="Etiketten"
              link="api/report/userlabels"
              totalNumber={users.length}
              startLabel={startUserLabel}
              setStartLabel={setStartUserLabel}
              startUserId={startUserId}
              setStartUserId={setStartUserId}
              endUserId={endUserId}
              setEndUserId={setEndUserId}
              idUserFilter={idUserFilter}
              setIdUserFilter={setIdUserFilter}
              topicsFilter={schoolgradeFilter}
              setTopicsFilter={setSchoolgradeFilter}
              allTopics={schoolGradeSet}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <LinkCard
              title="Mahnungen"
              subtitle="Ausdruck aller Mahnungen"
              buttonTitle="Erzeuge Word"
              link="/api/report/reminder"
              dataCy="reminder-card"
            />
          </Grid>
        </Grid>
        <Dashboard users={users} rentals={rentals} books={books} />
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps() {
  const allUsers = await getAllUsers(prisma);
  console.log("Reports page - loaded Users");
  const users = allUsers.map((u) => {
    const newUser = { ...u } as any; //define a better type there with conversion of Date to string
    newUser.createdAt = convertDateToDayString(u.createdAt);
    newUser.updatedAt = convertDateToDayString(u.updatedAt);
    return newUser;
  });
  console.log("Reports page - converted Users");

  const allBooks = await getAllBooks(prisma);
  console.log("Reports page - loaded Books");
  const books = allBooks.map((b) => {
    const newBook = { ...b } as any; //define a better type there with conversion of Date to string
    newBook.createdAt = convertDateToDayString(b.createdAt);
    newBook.updatedAt = convertDateToDayString(b.updatedAt);
    newBook.rentedDate = b.rentedDate
      ? convertDateToDayString(b.rentedDate)
      : "";
    newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
    //temp TODO
    return newBook;
  });
  console.log("Reports page - converted Books");
  const allRentals = await getRentedBooksWithUsers(prisma);
  console.log("Reports page - Rentals calculated");
  const rentals = allRentals.map((r) => {
    //calculate remaining days for the rental
    const due = dayjs(r.dueDate);
    const today = dayjs();
    const diff = today.diff(due, "days");

    return {
      id: r.id,
      title: r.title,
      lastName: r.user?.lastName,
      firstName: r.user?.firstName,
      remainingDays: diff,
      dueDate: convertDateToDayString(due.toDate()),
      renewalCount: r.renewalCount,
      userid: r.user?.id,
    };
  });

  //console.log(allRentals);

  // Pass data to the page via props
  return { props: { users, books, rentals } };
}
