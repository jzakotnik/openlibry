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
import { extendDays } from "@/utils/dateutils";

import dayjs from "dayjs";
import "dayjs/locale/de";
import { booksForUser, filterUsers } from "../../utils/searchUtils";
import RentSearchParams from "./RentSearchParams";



type UserPropsType = {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: Array<RentalsUserType>;
  handleExtendBookButton: (id: number, b: BookType) => void;
  handleReturnBookButton: (bookid: number, userid: number) => void;
  setUserExpanded: Dispatch<number | false>;
  userExpanded: number | false;
  searchFieldRef: any;
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
  searchFieldRef,
  handleBookSearchSetFocus,
}: UserPropsType) {
  const [userSearchInput, setUserSearchInput] = useState("");

  const [returnedBooks, setReturnedBooks] = useState({});
  const [showDetailSearch, setShowDetailSearch] = useState(false);
  const [searchParams, setSearchParams] = useState(defaultSearchParams);

  const filterUserSub = (users: Array<UserType>, searchString: string, rentals: Array<RentalsUserType>, exactMatch: boolean = false) => {
    let [filteredUsers, exactMatchRes] =
      filterUsers(users, searchString, rentals, exactMatch);
    exactMatchUserId = exactMatchRes;
    return filteredUsers;
  }



  const handleClear = (e: any) => {
    e.preventDefault();
    setUserExpanded(false);
    setUserSearchInput("");
  };

  let exactMatchUserId: number = -1;
  const handleInputChange = (e: React.ChangeEvent<any>): void => {
    setUserSearchInput(e.target.value);
  };

  const handleKeyUp = (e: React.KeyboardEvent): void => {
    if (e.key == 'Enter') {
      if (exactMatchUserId > -1) {
        setUserExpanded(exactMatchUserId);
      }
      handleBookSearchSetFocus();
    } else if (e.key == 'Escape') {
      setUserExpanded(false);
      setUserSearchInput("");
    }
  }

  const handleExpandedUser =
    (userID: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setUserExpanded(isExpanded ? userID : false);
      console.log("Expanded user", userID);
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




  const extensionDays = extendDays(new Date(), process.env.EXTENSION_DURATION_DAYS ? parseInt(process.env.EXTENSION_DURATION_DAYS) : 14);

  return (
    <div>
      {" "}
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        direction="row"
      >
        <Grid>
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
              autoFocus={true}
              inputRef={searchFieldRef}
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
        <Grid>
          <Typography variant="caption" color="primary">
            {userExpanded
              ? " Ausgewählt: " + getUserFromID(userExpanded).firstName
              : ""}
          </Typography>
        </Grid>
        <Grid>
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
      {filterUserSub(users, userSearchInput, rentals).map((u: UserType) => {
        const rentalsUser = booksForUser(u.id!, rentals);
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
                <Grid>
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
                <Grid>
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
                {rentalsUser.map((r: RentalsUserType) => {
                  let allowExtendBookRent = extensionDays.isAfter(r.dueDate, "day");
                  let tooltip = allowExtendBookRent ? "Verlängern" : "Maximale Ausleihzeit erreicht";
                  return (
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
                          <Grid size={{ xs: 2 }} >
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
                          <Grid size={{ xs: 8 }} >
                            <Typography sx={{ m: 1 }}>{r.title},</Typography>
                            <Typography variant="caption">
                              bis {dayjs(r.dueDate).format("DD.MM.YYYY")},{" "}
                              {r.renewalCount}x verlängert
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 2 }} >
                            {userExpanded && (
                              <Tooltip title={tooltip} >
                                <span>
                                  <IconButton
                                    aria-label="extend"
                                    disabled={!allowExtendBookRent}
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
                                </span>
                              </Tooltip>
                            )}
                          </Grid>
                          <Divider />
                        </Grid>
                      </Paper>
                      <Divider variant="fullWidth" />
                    </span>
                  )
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
}
