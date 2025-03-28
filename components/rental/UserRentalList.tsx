import Grid from "@mui/material/Grid";

import AccountCircle from "@mui/icons-material/AccountCircle";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import { Dispatch, useState } from "react";

import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UpdateIcon from "@mui/icons-material/Update";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Tooltip,
} from "@mui/material";
import OverdueIcon from "./OverdueIcon";

import { RentalsUserType } from "@/entities/RentalsUserType";
import { hasOverdueBooks } from "@/utils/hasOverdueBooks";
import dayjs from "dayjs";
import "dayjs/locale/de";
import RentSearchParams from "./RentSearchParams";

type UserPropsType = {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: Array<RentalsUserType>;
  handleExtendBookButton: (id: number, b: BookType) => void;
  handleReturnBookButton: (bookid: number, userid: number) => void;
  setUserExpanded: Dispatch<number | false>;
  userExpanded: number | false;
  handleBookSearchSetFocus: () => void;
};

const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();

const defaultSearchParams = { overdue: false, grade: "" };

export default function UserRentalList({
  users,
  books,
  rentals,
  handleExtendBookButton,
  handleReturnBookButton,
  setUserExpanded,
  userExpanded,
  handleBookSearchSetFocus,
}: UserPropsType) {
  const [userSearchInput, setUserSearchInput] = useState("");

  const [returnedBooks, setReturnedBooks] = useState({});
  const [showDetailSearch, setShowDetailSearch] = useState(false);
  const [searchParams, setSearchParams] = useState(defaultSearchParams);
  //console.log("Rendering updated users:", users);

  const handleClear = (e: any) => {
    e.preventDefault();
    setUserExpanded(false);
    setUserSearchInput("");
  };

  let selectedSingleUser: number = -1;
  const handleInputChange = (e: React.ChangeEvent<any>): void => {
    setUserSearchInput(e.target.value);
  };

  const handleKeyUp = (e: React.KeyboardEvent): void => {
    if (e.key == 'Enter') {
      if (selectedSingleUser > -1) {
        setUserExpanded(selectedSingleUser);
      }
      handleBookSearchSetFocus();
    }
  }

  const handleExpandedUser =
    (userID: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setUserExpanded(isExpanded ? userID : false);
      console.log("Expanded user", userID);
    };

  const booksForUser = (id: number): Array<RentalsUserType> => {
    const userRentals = rentals.filter((r: RentalsUserType) => r.userid == id);
    //console.log("Filtered rentals", userRentals);
    return userRentals;
  };

  const getBookFromID = (id: number): BookType => {
    const book = books.filter((b: BookType) => b.id == id);
    return book[0];
  };

  const getUserFromID = (id: number): UserType => {
    const user = users.filter((u: UserType) => u.id == id);
    return user[0];
  };

  const ReturnedIcon = () => {
    //console.log("Rendering icon ", id, returnedBooks);
    return <ArrowCircleLeftIcon />; /*
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <ArrowCircleLeftIcon />;
    }*/
  };

  const ExtendedIcon = () => {
    //console.log("Rendering icon ", id, returnedBooks);
    return <UpdateIcon />; /*
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <UpdateIcon />;
    }*/
  };

  const getUniqueGrades = () => {
    const uniqueGrades = users.reduce(
      (unique: Array<string>, user: UserType) => {
        if (user.schoolGrade && !unique.includes(user.schoolGrade)) {
          unique.push(user.schoolGrade);
        }
        return unique;
      },
      []
    );
    return uniqueGrades;
  };

  function searchAndRemoveKlasse(inputString: string) {
    // Create a regex pattern to find "klasse?" followed by a number
    const regex = /klasse\?\s?(\d+)/gi;

    // Initialize variables to store whether the string is found and the number
    let foundKlasse = false;
    let klasseNumber = 0;

    // Search for the string using the regex pattern and capture the number
    const match = regex.exec(inputString);
    if (match) {
      foundKlasse = true;
      klasseNumber = parseInt(match[1], 10); // Convert the captured string to an integer
    }

    // Remove the found string from the original string
    const updatedString = inputString.replace(regex, "").trim();

    return {
      foundKlasse,
      klasseNumber,
      updatedString,
    };
  }

  const filterUsers = (users: Array<UserType>, searchString: string) => {
    selectedSingleUser = -1;
    if (searchString.length == 0) return users; //nothing to do
    const lowerCaseSearch = searchString.toLowerCase();
    const searchTokens = lowerCaseSearch.split(" ");
    //console.log("Search tokens", searchTokens);
    const searchPattern = { klasse: 0, overdue: false };
    // Create a regex pattern to find "klasse?" followed by a number
    const { foundKlasse, klasseNumber, updatedString } =
      searchAndRemoveKlasse(lowerCaseSearch);
    foundKlasse ? (searchPattern.klasse = klasseNumber) : 0;
    let finalString = updatedString;
    if (updatedString.indexOf("fällig?") > -1) {
      searchPattern.overdue = true;
      finalString = updatedString.replace("fällig?", "").trim();
    }

    //console.log("Search check:", searchPattern, finalString);

    const filteredUsers = users.filter((u: UserType) => {
      //this can be done shorter, but like this is easier to understand, ah well, what a mess
      let foundString = false;
      let foundClass = true;
      let foundOverdue = true;
      const filterForClass = foundKlasse;
      const filterForOverdue = searchPattern.overdue;

      //check if the string is at all there
      if (
        u.lastName.toLowerCase().includes(finalString) ||
        u.firstName.toLowerCase().includes(finalString) ||
        u.id!.toString().includes(finalString)
      ) {
        foundString = true;
      }
      if (
        filterForClass &&
        !(searchPattern.klasse == parseInt(u.schoolGrade!))
      ) {
        foundClass = false;
      }
      if (
        filterForOverdue &&
        !(searchPattern.overdue == hasOverdueBooks(booksForUser(u.id!)))
      ) {
        foundOverdue = false;
      }

      //console.log("Found: ", foundString, foundClass, foundOverdue);
      if (foundString && foundClass && foundOverdue) return u;
    });
    if (filteredUsers.length == 1) {
      selectedSingleUser = filteredUsers[0].id!;
    }
    return filteredUsers;
  };

  return (
    <div>
      {" "}
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        direction="row"
      >
        <Grid item>
          <FormControl variant="standard">
            <InputLabel
              htmlFor="user-search-input-label"
              data-cy="rental_input_searchuser"
            >
              Suche NutzerIn{" "}
            </InputLabel>
            <Input
              placeholder="Name, ID, klasse?, fällig?"
              sx={{ my: 0.5 }}
              id="user-search-input"
              startAdornment={
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              }
              endAdornment={
                userSearchInput && (
                  <InputAdornment position="end">
                    <Tooltip title="Suche löschen">
                      <IconButton edge="end" onMouseDown={handleClear}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }
              value={userSearchInput}
              onChange={handleInputChange}
              onKeyUp={handleKeyUp}
            />{" "}
          </FormControl>
        </Grid>
        <Grid item>
          <Typography variant="caption" color="primary">
            {userExpanded
              ? " Ausgewählt: " + getUserFromID(userExpanded).firstName
              : ""}
          </Typography>
        </Grid>
        <Grid item>
          {" "}
          <IconButton
            aria-label="search-settings"
            color="primary"
            onClick={() => setShowDetailSearch(!showDetailSearch)}
          >
            {" "}
            <SettingsSuggestIcon />
          </IconButton>
        </Grid>
      </Grid>
      {showDetailSearch && (
        <RentSearchParams
          overdue={searchParams.overdue}
          grade={getUniqueGrades()}
          setUserSearchInput={setUserSearchInput}
        />
      )}
      {filterUsers(users, userSearchInput).map((u: UserType) => {
        const rentalsUser = booksForUser(u.id!);

        return (
          //display the whole list to select one
          <Accordion
            key={u.id}
            expanded={userExpanded == u.id!}
            onChange={handleExpandedUser(u.id!)}
            sx={{ minWidth: 275 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Grid
                container
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 0.5 }}
              >
                <Grid item>
                  <Typography
                    sx={{ mx: 4 }}
                    color="text.secondary"
                    gutterBottom
                  >
                    {u.firstName +
                      " " +
                      u.lastName +
                      (rentalsUser.length > 0
                        ? ", " +
                        rentalsUser.length +
                        (rentalsUser.length > 1 ? " Bücher" : " Buch")
                        : "")}
                  </Typography>
                </Grid>
                <Grid item>
                  <Grid container>
                    <Grid>
                      <Typography
                        sx={{ fontSize: 12 }}
                        color="text.primary"
                        gutterBottom
                      >
                        {"Nr. " + u.id + ", "} {"Klasse " + u.schoolGrade}{" "}
                      </Typography>
                    </Grid>
                    <Grid>
                      <OverdueIcon rentalsUser={rentalsUser} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid
                container
                direction="column"
                alignItems="stretch"
                justifyContent="flex-start"
                sx={{ px: 1, my: 1 }}
              >
                {rentalsUser.map((r: RentalsUserType) => (
                  <span key={"span" + r.id}>
                    {" "}
                    <Paper elevation={0} key={r.id} sx={{ my: 1 }}>
                      <Grid
                        container
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-start"
                        sx={{ px: 1 }}
                      >
                        {" "}
                        <Grid item xs={2}>
                          <Tooltip title="Zurückgeben">
                            <IconButton
                              onClick={() => {
                                if (!userExpanded) return; //something went wrong and no user is available to return the book
                                handleReturnBookButton(r.id, userExpanded);
                                const time = Date.now();
                                const newbook = {};
                                (newbook as any)[r.id!] = time;
                                setReturnedBooks({
                                  ...returnedBooks,
                                  ...newbook,
                                });
                              }}
                              aria-label="zurückgeben"
                            >
                              <ReturnedIcon key={r.id} />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography sx={{ m: 1 }}>{r.title},</Typography>
                          <Typography variant="caption">
                            bis {dayjs(r.dueDate).format("DD.MM.YYYY")},{" "}
                            {r.renewalCount}x verlängert
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Tooltip title="Verlängern">
                            <IconButton
                              aria-label="extend"
                              onClick={() => {
                                handleExtendBookButton(
                                  r.id,
                                  getBookFromID(r.id!)
                                );
                                const time = Date.now();
                                const newbook = {};
                                (newbook as any)[r.id!] = time;
                                setReturnedBooks({
                                  ...returnedBooks,
                                  ...newbook,
                                });
                              }}
                            >
                              <ExtendedIcon key={r.id} />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                        <Divider />
                      </Grid>
                    </Paper>
                    <Divider variant="fullWidth" />
                  </span>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
}
