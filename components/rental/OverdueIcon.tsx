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
    rentalsUser.map((b: any) => {
      //console.log("Rental user", b);
      b.remainingDays > 0 ? (overdue = true) : (overdue = false);
      //if it is overdue and already renewed twice, take other color
      b.renewalCount > 2 ? (alertOverdue = true) : (alertOverdue = false);
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
