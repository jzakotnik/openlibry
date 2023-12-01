import { RentalsUserType } from "@/entities/RentalsUserType";
import ErrorIcon from "@mui/icons-material/Error";

interface OverdueIconPropsType {
  rentalsUser: Array<RentalsUserType>;
}

export default function OverdueIcon({ rentalsUser }: OverdueIconPropsType) {
  //console.log("Rentals for user icon rendering", rentalsUser);
  let overdue = false;
  let alertOverdue = false;
  //check if books are overdue
  if (rentalsUser.length > 0) {
    rentalsUser.map((b: RentalsUserType) => {
      // if any book is overdue, display the overdue icon
      if (b.remainingDays > 0) overdue = true;
      //if it is overdue and already renewed twice, take other color
      if (b.renewalCount > 2) alertOverdue = true;
    });
  }
  return overdue && alertOverdue ? (
    <ErrorIcon fontSize="small" color="secondary" />
  ) : overdue ? (
    <ErrorIcon fontSize="small" color="primary" />
  ) : (
    <></>
  );
}
