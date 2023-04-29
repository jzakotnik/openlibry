import Typography from "@mui/material/Typography";

import { Avatar, Grid } from "@mui/material";

import palette from "@/styles/palette";
import { UserType } from "@/entities/UserType";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import UserDetailsCard from "./UserDetailsCard";

export default function UserAdminList({ users, rentals, searchString }: any) {
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
        if (
          u.lastName.toLowerCase().includes(searchString.toLowerCase()) ||
          u.firstName.toLowerCase().includes(searchString.toLowerCase())
        )
          return (
            <Accordion key={u.id}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
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
                    <Typography>{u.lastName + ", " + u.firstName}</Typography>
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
          );
      })}
    </div>
  );
}
