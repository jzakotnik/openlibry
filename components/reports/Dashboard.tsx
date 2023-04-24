import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Typography, Grid } from "@mui/material";
import { UserType } from "@/entities/UserType";
import { BookType } from "@/entities/BookType";
import MinAgeChart from "./MinAgeChart";
import InfoTile from "./InfoTile";

interface DashboardType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: any;
}

export default function Dashboard({ users, books, rentals }: DashboardType) {
  console.log("Dashboard", users, books, rentals);
  return (
    <div>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Grid item xs={12} md={3}>
          {" "}
          <InfoTile
            title="Leihe"
            subtitle="Ausgeliehene Bücher"
            value={rentals.length}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          {" "}
          <InfoTile
            title="Nutzerinnen"
            subtitle="Anzahl aller Ausweise"
            value={users.length}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          {" "}
          <InfoTile
            title="Bücher"
            subtitle="Gesamtzahl der Bücher"
            value={books.length}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          {" "}
          <InfoTile
            title="Verspätet"
            subtitle="Bücher über Rückgabedatum"
            value={
              rentals.filter((r: any) => {
                return r.remainingDays > 0;
              }).length
            }
          />
        </Grid>
      </Grid>
      <Box sx={{ minWidth: 120 }}>
        <MinAgeChart books={books} />
      </Box>
    </div>
  );
}
