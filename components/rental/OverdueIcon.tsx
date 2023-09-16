import ErrorIcon from "@mui/icons-material/Error";

interface OverdueIconPropsType {
  rentalsUser: any;
}

export default function OverdueIcon({ rentalsUser }: OverdueIconPropsType) {
  //console.log("Rentals for user icon rendering", rentalsUser);
  let overdue = false;
  //check if books are overdue
  if (rentalsUser.length > 0) {
    rentalsUser.map((b: any) => {
      b.remainingDays > 0 ? (overdue = true) : (overdue = false);
    });
  }
  return overdue ? <ErrorIcon fontSize="small" /> : <></>;
}
