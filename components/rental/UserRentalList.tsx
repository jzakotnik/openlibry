import Grid from "@mui/material/Grid";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import Input from "@mui/material/Input";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import palette from "@/styles/palette";

import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UpdateIcon from "@mui/icons-material/Update";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";

interface UserPropsType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: any;
  handleExtendBookButton: any;
  handleReturnBookButton: any;
  setUserExpanded: any;
  userExpanded: number | false;
}

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
  console.log("Rendering updated users:", users);

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
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <ArrowCircleLeftIcon />;
    }
  };

  const ExtendedIcon = ({ id }: any) => {
    //console.log("Rendering icon ", id, returnedBooks);
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <UpdateIcon />;
    }
  };

  return !displayUserDetail ? (
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
        const rentalsUser = booksForUser(u.id!);
        const lowerCaseSearch = userSearchInput.toLowerCase();
        if (
          u.lastName.toLowerCase().includes(lowerCaseSearch) ||
          u.firstName.toLowerCase().includes(lowerCaseSearch) ||
          u.id!.toString().includes(lowerCaseSearch)
        )
          return (
            //display the whole list to select one
            <Accordion
              expanded={userExpanded == u.id!}
              onChange={handleExpandedUser(u.id!)}
              sx={{ minWidth: 275 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography
                  sx={{ fontSize: 14, mx: 4 }}
                  color="text.secondary"
                  gutterBottom
                >
                  {u.firstName +
                    " " +
                    u.lastName +
                    (rentalsUser.length > 0
                      ? ", " + rentalsUser.length + " Bücher"
                      : "")}
                </Typography>
                <Typography
                  sx={{ fontSize: 12 }}
                  color="text.primary"
                  gutterBottom
                >
                  {"Nr. " +
                    u.id +
                    ", " +
                    "Klasse " +
                    u.schoolGrade +
                    ", " +
                    u.schoolTeacherName}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid
                  container
                  direction="column"
                  alignItems="stretch"
                  justifyContent="flex-start"
                  sx={{ px: 2, my: 2 }}
                >
                  {rentalsUser.map((r: any) => (
                    <Paper key={r.id}>
                      <Grid
                        container
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        sx={{ px: 2 }}
                      >
                        <Grid item>
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
                        </Grid>
                        <Grid item>
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
                          </IconButton>{" "}
                        </Grid>
                        <Grid item>
                          <Typography sx={{ m: 2 }}>{r.title}</Typography>
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
