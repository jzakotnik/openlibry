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

interface DashboardType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: any;
}

export default function Dashboard({ users, books, rentals }: DashboardType) {
  console.log("Dashboard", users);
  return (
    <Box sx={{ minWidth: 120 }}>
      <MinAgeChart books={books} />
    </Box>
  );
}
