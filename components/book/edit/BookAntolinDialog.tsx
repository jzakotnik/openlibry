import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function BookAntolinDialog({
  open,
  setOpen,
  antolinBooks,
}: any) {
  const handleClose = () => {
    setOpen(false);
  };
  console.log("Antolin Books for the dialog", antolinBooks);
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
        <DialogContentText id="antolin-info-dialog-description">
          {antolinBooks?.items.slice(0, 10).map((b: any) => {
            console.log("Dialog book", b.Titel);
            return <Typography key={b.book_id}>- {b.Titel}</Typography>;
          })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Schliessen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
