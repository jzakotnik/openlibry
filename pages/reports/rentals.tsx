import Layout from "@/components/layout/Layout";
import { getRentedBooksWithUsers } from "@/entities/book";
import { prisma } from "@/entities/db";
import { translations } from "@/entities/fieldTranslations";
import { convertDateToDayString } from "@/utils/dateutils";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { deDE as coreDeDE } from "@mui/material/locale";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { deDE } from "@mui/x-data-grid/locales";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  deDE,
  coreDeDE
);

interface RentalData {
  id: number | string;
  title: string;
  lastName?: string;
  firstName?: string;
  remainingDays: number;
  dueDate: string;
  renewalCount: number;
  userid?: number | string;
  schoolGrade?: string;
  rentalStatus?: string;
}

interface RentalsPropsType {
  rentals: RentalData[];
  error?: string;
}

const COLUMN_WIDTHS: Record<string, number> = {
  ID: 20,
  title: 250,
  lastName: 180,
};

const DEFAULT_COLUMN_WIDTH = 100;

function getWidth(columnName: string = ""): number {
  return COLUMN_WIDTHS[columnName] ?? DEFAULT_COLUMN_WIDTH;
}

export default function Rentals({ rentals, error }: RentalsPropsType) {
  const [reportData, setReportData] = useState<{
    columns: any[];
    rows: RentalData[];
  }>({ columns: [], rows: [] });
  const [reportDataAvailable, setReportDataAvailable] = useState(false);

  useEffect(() => {
    // Handle error state
    if (error || !rentals) {
      setReportDataAvailable(false);
      return;
    }

    setReportDataAvailable(rentals.length > 0);

    if (rentals.length > 0) {
      try {
        const colTitles = rentals[0];
        const fields = Object.keys(colTitles);

        const columns = fields.map((f: string) => {
          // Safe translation lookup with fallback
          const rentalTranslations = translations?.rentals;
          const fieldTranslation =
            rentalTranslations && typeof rentalTranslations === "object"
              ? (rentalTranslations as Record<string, string>)[f] || f
              : f;

          return {
            field: f,
            headerName: fieldTranslation,
            width: getWidth(f),
          };
        });

        const rows = rentals.map((r: RentalData) => {
          // Safe rental status translation
          const statusTranslations = translations?.rentalStatus;
          const translatedStatus =
            statusTranslations &&
            typeof statusTranslations === "object" &&
            r.rentalStatus
              ? (statusTranslations as Record<string, string>)[
                  r.rentalStatus
                ] || r.rentalStatus
              : r.rentalStatus;

          return {
            ...r,
            id: r.id,
            rentalStatus: translatedStatus,
          };
        });

        setReportData({ columns, rows });
      } catch (err) {
        console.error("Error processing rental data:", err);
        setReportDataAvailable(false);
      }
    }
  }, [rentals, error]);

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            backgroundColor: "#CFCFCF",
            width: "100%",
            mt: 5,
            p: 2,
          }}
          data-cy="rentals-datagrid"
        >
          {error ? (
            <Typography color="error" data-cy="rentals-error">
              Fehler beim Laden der Daten: {error}
            </Typography>
          ) : reportDataAvailable ? (
            <DataGrid
              autoHeight
              columns={reportData.columns}
              rows={reportData.rows}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
              }}
              pageSizeOptions={[25, 50, 80]}
              //autoPageSize // Adjust page size based on container height
            />
          ) : (
            <Typography data-cy="rentals-no-data">
              Keine Daten verfügbar
            </Typography>
          )}
        </Box>
      </ThemeProvider>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const allRentals = await getRentedBooksWithUsers(prisma);

    if (!allRentals || !Array.isArray(allRentals)) {
      return {
        props: {
          rentals: [],
          error: "Ungültige Daten vom Server erhalten",
        },
      };
    }

    const rentals = allRentals.map((r) => {
      // Safe date handling
      const due = r.dueDate ? dayjs(r.dueDate) : dayjs();
      const today = dayjs();
      const diff = due.diff(today, "days"); // Fixed: was today.diff(due)

      return {
        id: r.id,
        title: r.title || "Unbekannter Titel",
        lastName: r.user?.lastName || "Unbekannt",
        firstName: r.user?.firstName || "Unbekannt",
        remainingDays: diff,
        dueDate: convertDateToDayString(due.toDate()),
        renewalCount: r.renewalCount ?? 0,
        userid: r.user?.id,
        schoolGrade: r.user?.schoolGrade || "0",
      };
    });

    return {
      props: {
        rentals: JSON.parse(JSON.stringify(rentals)), // Ensure serialization
      },
    };
  } catch (error) {
    console.error("Error fetching rentals:", error);

    return {
      props: {
        rentals: [],
        error: "Fehler beim Laden der Ausleihdaten",
      },
    };
  }
}
