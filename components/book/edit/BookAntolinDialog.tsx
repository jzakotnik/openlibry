import { List, ListItem, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export default function BookAntolinDialog({
  open,
  setOpen,
  antolinBooks,
}: any) {
  const handleClose = () => {
    setOpen(false);
  };
  //console.log("Antolin Books for the dialog", antolinBooks);
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="antolin-info-dialog-title"
      aria-describedby="antolin-info-dialog-description"
    >
      <DialogTitle id="antolin-info-dialog-title">
        {"Bücher aus der Antolin Datenbank"}
      </DialogTitle>
      <DialogContent>
        <List>
          {antolinBooks?.items.slice(0, 10).map((b: any) => {
            return (
              <ListItem key={b.book_id}>
                <Typography component={"span"} key={b.book_id}>
                  - {b.Titel}
                </Typography>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Schliessen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
