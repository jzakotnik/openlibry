import { AlertCircle } from "lucide-react";

import { RentalsUserType } from "@/entities/RentalsUserType";

interface OverdueIconPropsType {
  rentalsUser: Array<RentalsUserType>;
}

export default function OverdueIcon({ rentalsUser }: OverdueIconPropsType) {
  let overdue = false;
  let alertOverdue = false;

  if (rentalsUser.length > 0) {
    rentalsUser.forEach((b: RentalsUserType) => {
      if (b.remainingDays > 0) overdue = true;
      if (b.renewalCount > 2) alertOverdue = true;
    });
  }

  if (!overdue) return null;

  return (
    <AlertCircle
      className={`h-4 w-4 ${alertOverdue ? "text-secondary" : "text-primary"}`}
    />
  );
}
