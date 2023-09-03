import Grid from "@mui/material/Grid";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import Input from "@mui/material/Input";
import Avatar from "@mui/material/Avatar";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import AccountCircle from "@mui/icons-material/AccountCircle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";

interface UserPropsType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: any;
}

export default function UserRentalList({
  users,
  books,
  rentals,
}: UserPropsType) {
  const [userSearchInput, setUserSearchInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(0);

  const handleInputChange = (e: any) => {
    setUserSearchInput(e.target.value);
  };

  const handleSelectedUser = (e: any, id: number) => {
    setSelectedUser(id);
    console.log("Selected user", id);
  };

  const booksForUser = (id: number) => {
    const userRentals = rentals.filter((r: any) => parseInt(r.userid) == id);
    //console.log("Filtered rentals", userRentals);
    return userRentals;
  };

  return (
    <div>
      <FormControl variant="standard">
        <InputLabel htmlFor="user-search-input-label">
          Suche NutzerIn
        </InputLabel>
        <Input
          id="user-search-input"
          startAdornment={
            <InputAdornment position="start">
              <AccountCircle />
            </InputAdornment>
          }
          value={userSearchInput}
          onChange={handleInputChange}
        />
      </FormControl>

      {users.map((u: UserType) => {
        const lowerCaseSearch = userSearchInput.toLowerCase();
        if (
          u.lastName.toLowerCase().includes(lowerCaseSearch) ||
          u.firstName.toLowerCase().includes(lowerCaseSearch) ||
          u.id!.toString().includes(lowerCaseSearch)
        )
          return (
            <Grid
              container
              direction="row"
              alignItems="center"
              justifyContent="flex-start  "
              sx={{ px: 10 }}
            >
              <Grid item>
                <IconButton
                  sx={{ p: "10px" }}
                  key={u.id}
                  aria-label="menu"
                  onClick={(e) => handleSelectedUser(e, u.id!)}
                >
                  <CheckCircleIcon />
                </IconButton>
              </Grid>
              <Grid item>
                <Typography>{u.lastName + ", " + u.firstName}</Typography>
              </Grid>
            </Grid>
          );
      })}
    </div>
  );
}
