import { UserType } from "@/entities/UserType";
import palette from "@/styles/palette";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
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
import dayjs from "dayjs";
import Link from "next/link";

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
  //console.log("Details for user ", user);
  //console.log("User has these books ", rentals);
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
        <Typography variant="h5" color="primary" component="div">
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
                  <ListItemText>
                    {dayjs().diff(r.dueDate, "days") > 13 && (
                      <Typography color="red">
                        {r.title + ", bis " + dayjs(r.dueDate).format("DD.MM.YYYY")}
                      </Typography >
                    )}
                    {dayjs().diff(r.dueDate, "days") > 0 && dayjs().diff(r.dueDate, "days") <= 13 && (
                      <Typography color="darkorange">
                        {r.title + ", bis " + dayjs(r.dueDate).format("DD.MM.YYYY")}
                      </Typography >
                    )}
                    {dayjs().diff(r.dueDate, "days") <= 0 && (
                      r.title + ", bis " + dayjs(r.dueDate).format("DD.MM.YYYY")
                    )}

                  </ListItemText>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
      <CardActions>
        <Link href={"/user/" + user.id} passHref>
          <Button size="small" data-cy="user_card_editbutton">
            Editieren
          </Button>
        </Link>
        <Button size="small"
          data-cy="user_card_printbutton"
          onClick={() =>
            window.open("api/report/userlabels?id=" + user.id, "_blank")
          }>
          Drucken
        </Button>
      </CardActions>
    </Card>
  );
}
