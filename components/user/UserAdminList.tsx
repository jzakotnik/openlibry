import Typography from "@mui/material/Typography";

import { Avatar, Checkbox, Grid, Paper } from "@mui/material";

import { UserType } from "@/entities/UserType";
import palette from "@/styles/palette";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { RentalsUserType } from "@/entities/RentalsUserType";
import UserDetailsCard from "./UserDetailsCard";

type UserAdminListPropsType = {
  users: Array<UserType>;
  rentals: Array<RentalsUserType>;
  searchString: string;
};

export default function UserAdminList({
  users,
  rentals,
  searchString,
}: UserAdminListPropsType) {
  //attach amount of rented books to the user
  const rentalAmount: { [key: number]: number } = {};

  rentals.map((r: any) => {
    if (r.userid in rentalAmount) {
      rentalAmount[r.userid] = rentalAmount[r.userid] + 1;
    } else rentalAmount[r.userid] = 1;
  });

  return (
    <div>
      {users.map((u: UserType) => {
        const lowerCaseSearch = searchString.toLowerCase();
        if (
          u.lastName.toLowerCase().includes(lowerCaseSearch) ||
          u.firstName.toLowerCase().includes(lowerCaseSearch) ||
          u.id!.toString().includes(lowerCaseSearch)
        )
          return (
            <Paper sx={{ mt: 0.5 }}>
              <Grid container direction="row">
                <Grid item xs={1} sx={{ width: "100%", height: "100%" }}>
                  <Checkbox
                    checked={true}
                    onChange={() => {
                      console.log("done");
                    }}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                </Grid>
                <Grid item xs={11} sx={{ width: "100%", height: "100%" }}>
                  <Accordion
                    elevation={0}
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    key={u.id}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      {" "}
                      <Grid
                        container
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-start  "
                        sx={{ px: 10 }}
                      >
                        <Grid item sx={{ px: 3 }}>
                          {rentalAmount[u.id!] != undefined ? (
                            <Avatar sx={{ bgcolor: palette.secondary.dark }}>
                              {rentalAmount[u.id!]}
                            </Avatar>
                          ) : (
                            <Avatar sx={{ bgcolor: palette.secondary.light }}>
                              0
                            </Avatar>
                          )}
                        </Grid>
                        <Grid>
                          <Typography>
                            {u.lastName + ", " + u.firstName}
                          </Typography>
                          <Typography variant="caption">
                            {"Klasse " +
                              u.schoolGrade +
                              " - " +
                              u.schoolTeacherName}
                          </Typography>
                        </Grid>
                      </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                      <UserDetailsCard
                        user={u}
                        rentals={rentals.filter(
                          (r: any) => parseInt(r.userid) == u.id
                        )}
                      />
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </Paper>
          );
      })}
    </div>
  );
}
