import { UserType } from "@/entities/UserType";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import palette from "@/styles/palette";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

interface UserDetailsCardPropType {
  user: UserType;
  rentals: Array<any>;
}

export default function UserDetailsCard({
  user,
  rentals,
}: UserDetailsCardPropType) {
  console.log("Details for user ", user);
  console.log("User has these books ", rentals);
  const selectedUser = user;
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {"Nr. " +
            selectedUser.id +
            ", " +
            "Klasse " +
            selectedUser.schoolGrade +
            ", " +
            selectedUser.schoolTeacherName}
        </Typography>
        <Typography variant="h5" component="div">
          {selectedUser.lastName + ", " + selectedUser.firstName}
        </Typography>

        <Typography>Ausgeliehene Bücher:</Typography>
        {rentals.length == 0 ? (
          <Typography color={palette.success.main}>Keine</Typography>
        ) : (
          <List>
            {rentals?.map((r: any) => {
              return (
                <ListItem key={r.id}>
                  <ListItemIcon>
                    <LibraryBooksIcon />
                  </ListItemIcon>
                  <ListItemText>{r.title}</ListItemText>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
      <CardActions>
        <Link href={"/user/" + user.id} passHref>
          <Button size="small">Editieren</Button>
        </Link>
      </CardActions>
    </Card>
  );
}
