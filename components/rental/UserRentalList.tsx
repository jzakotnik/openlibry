import Grid from "@mui/material/Grid";

import AccountCircle from "@mui/icons-material/AccountCircle";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import { useState } from "react";

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
  Tooltip,
} from "@mui/material";
import OverdueIcon from "./OverdueIcon";

import { hasOverdueBooks } from "@/utils/hasOverdueBooks";
import dayjs from "dayjs";
import "dayjs/locale/de";

interface UserPropsType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: any;
  handleExtendBookButton: any;
  handleReturnBookButton: any;
  setUserExpanded: any;
  userExpanded: number | false;
}

const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();

export default function UserRentalList({
  users,
  books,
  rentals,
  handleExtendBookButton,
  handleReturnBookButton,
  setUserExpanded,
  userExpanded,
}: UserPropsType) {
  const [userSearchInput, setUserSearchInput] = useState("");
  const [displayUserDetail, setDisplayUserDetail] = useState(false);
  const [returnedBooks, setReturnedBooks] = useState({});
  //console.log("Rendering updated users:", users);

  const handleClear = () => {
    setUserSearchInput("");
  };

  const handleInputChange = (e: any) => {
    setUserSearchInput(e.target.value);
  };

  const handleExpandedUser =
    (userID: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setUserExpanded(isExpanded ? userID : false);
      console.log("Expanded user", userID);
    };

  const booksForUser = (id: number) => {
    const userRentals = rentals.filter((r: any) => parseInt(r.userid) == id);
    //console.log("Filtered rentals", userRentals);
    return userRentals;
  };

  const getBookFromID = (id: number): BookType => {
    const book = books.filter((b: BookType) => b.id == id);
    return book[0];
  };

  const ReturnedIcon = ({ id }: any) => {
    //console.log("Rendering icon ", id, returnedBooks);
    return <ArrowCircleLeftIcon />; /*
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <ArrowCircleLeftIcon />;
    }*/
  };

  const ExtendedIcon = ({ id }: any) => {
    //console.log("Rendering icon ", id, returnedBooks);
    return <UpdateIcon />; /*
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <UpdateIcon />;
    }*/
  };

  function searchAndRemoveKlasse(inputString: string) {
    // Create a regex pattern to find "klasse:" followed by a number
    const regex = /klasse:\s?(\d+)/gi;

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
    if (searchString.length == 0) return users; //nothing to do
    const lowerCaseSearch = searchString.toLowerCase();
    const searchTokens = lowerCaseSearch.split(" ");
    //console.log("Search tokens", searchTokens);
    const searchPattern = { klasse: 0, overdue: false };
    // Create a regex pattern to find "klasse:" followed by a number
    const { foundKlasse, klasseNumber, updatedString } =
      searchAndRemoveKlasse(lowerCaseSearch);
    foundKlasse ? (searchPattern.klasse = klasseNumber) : 0;
    let finalString = updatedString;
    if (updatedString.indexOf("fällig:") > -1) {
      searchPattern.overdue = true;
      finalString = updatedString.replace("fällig:", "").trim();
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

    return filteredUsers;
  };

  return !displayUserDetail ? (
    <div>
      <FormControl variant="standard">
        <InputLabel htmlFor="user-search-input-label">
          Suche NutzerIn
        </InputLabel>
        <Input
          placeholder="Name, ID, klasse:, fällig:"
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
                  <IconButton edge="end" onClick={handleClear}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }
          value={userSearchInput}
          onChange={handleInputChange}
        />
      </FormControl>

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
                {rentalsUser.map((r: any) => (
                  <Paper key={r.id}>
                    <Grid
                      container
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-start"
                      sx={{ px: 1 }}
                    >
                      <Grid item>
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
                            <ExtendedIcon key={r.id} id={r.id} />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Zurückgeben">
                          <IconButton
                            onClick={() => {
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
                            <ReturnedIcon key={r.id} id={r.id} />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Typography sx={{ m: 1 }} variant="caption">
                          {r.title}, bis {dayjs(r.dueDate).format("DD.MM.YYYY")}
                          , {r.renewalCount}x verlängert
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  ) : (
    //user detail is activated
    <div></div>
  );
}
