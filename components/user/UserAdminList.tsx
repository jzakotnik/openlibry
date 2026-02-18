import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import dayjs from "dayjs";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Pencil,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { filterUsers } from "@/lib/utils/searchUtils";

type OverdueStatus = "overdue" | "warning" | "ok";

interface UserAdminListProps {
  users: UserType[];
  rentals: RentalsUserType[];
  searchString: string;
  checked: Record<string, boolean>;
  setChecked: (checked: Record<string, boolean>) => void;
}

interface UserRental {
  id: number;
  title: string;
  dueDate: string | Date;
}

function getOverdueStatus(dueDate: string | Date): OverdueStatus {
  const daysOverdue = dayjs().diff(dueDate, "days");
  if (daysOverdue > 13) return "overdue";
  if (daysOverdue > 0) return "warning";
  return "ok";
}

function rentalRowClasses(status: OverdueStatus) {
  switch (status) {
    case "overdue":
      return {
        bg: "bg-destructive/10",
        border: "border-l-destructive",
        text: "text-destructive font-semibold",
      };
    case "warning":
      return {
        bg: "bg-amber-500/10",
        border: "border-l-amber-500",
        text: "text-amber-500 font-semibold",
      };
    default:
      return {
        bg: "bg-muted/30",
        border: "border-l-border",
        text: "text-muted-foreground",
      };
  }
}

function hasOverdueRentals(rentals: UserRental[]): boolean {
  return rentals.some((r) => getOverdueStatus(r.dueDate) !== "ok");
}

export default function UserAdminList({
  users,
  rentals,
  searchString,
  checked,
  setChecked,
}: UserAdminListProps) {
  const rentalCountByUser = rentals.reduce<Record<number, number>>(
    (acc, rental) => {
      const userId = rental.userid;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    },
    {},
  );

  useEffect(() => {
    const initialChecked = users.reduce<Record<string, boolean>>(
      (acc, user) => {
        acc[user.id!.toString()] = false;
        return acc;
      },
      {},
    );
    setChecked(initialChecked);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- useState setter is stable
  }, [users]);

  const filteredUsers = filterUsers(users, searchString, rentals, false)[0];

  const getUserRentals = (userId: number): UserRental[] =>
    rentals.filter(
      (r) => parseInt(r.userid as unknown as string) === userId,
    ) as UserRental[];

  const handleCheckboxChange = (userId: string) => {
    setChecked({ ...checked, [userId]: !checked[userId] });
  };

  if (filteredUsers.length === 0) {
    return (
      <div className="rounded-lg bg-primary/5 px-3 py-6 text-center">
        <p className="mb-1 text-base text-muted-foreground">
          {searchString
            ? "Keine Benutzer gefunden"
            : "Noch keine Benutzer vorhanden"}
        </p>
        <p className="text-sm text-muted-foreground/60">
          {searchString
            ? "Versuche einen anderen Suchbegriff"
            : "Erstelle einen neuen Benutzer um zu beginnen"}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Accordion type="single" collapsible className="space-y-1.5">
        {filteredUsers.map((user: UserType) => {
          const userId = user.id!.toString();
          const isChecked = checked[userId] ?? false;
          const userRentals = getUserRentals(user.id!);
          const rentalCount = rentalCountByUser[user.id!] ?? 0;
          const hasOverdue = hasOverdueRentals(userRentals);

          return (
            <div
              key={user.id}
              className="flex items-stretch overflow-hidden rounded-xl border border-primary/10 bg-card/90 backdrop-blur-sm transition-all duration-200 hover:shadow-md"
            >
              {/* Checkbox Column */}
              <div className="flex items-center border-r border-primary/10 px-2">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleCheckboxChange(userId)}
                />
              </div>

              {/* Main Content – AccordionItem */}
              <AccordionItem value={userId} className="flex-1 border-0">
                <AccordionTrigger className="group/trigger px-3 py-3 hover:no-underline [&>svg]:hidden">
                  <div className="flex w-full items-center gap-3">
                    {/* Avatar with rental count */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback
                            className={cn(
                              "text-sm font-semibold",
                              rentalCount === 0
                                ? "bg-success/15 text-success"
                                : hasOverdue
                                  ? "bg-destructive/15 text-destructive"
                                  : "bg-primary/15 text-primary",
                            )}
                          >
                            {rentalCount}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {rentalCount} {rentalCount === 1 ? "Buch" : "Bücher"}{" "}
                          ausgeliehen
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    {/* User Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold text-foreground">
                          {user.lastName}, {user.firstName}
                        </span>
                        {hasOverdue && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle
                                size={16}
                                className="shrink-0 text-amber-500"
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Hat überfällige Bücher</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <GraduationCap
                          size={13}
                          className="text-muted-foreground/50"
                        />
                        <span className="text-xs text-muted-foreground">
                          Klasse {user.schoolGrade}
                          {user.schoolTeacherName &&
                            ` · ${user.schoolTeacherName}`}
                        </span>
                      </div>
                    </div>

                    {/* Quick Info Badge */}
                    <Badge
                      variant="secondary"
                      className="hidden shrink-0 bg-primary/10 text-[0.7rem] text-muted-foreground sm:inline-flex"
                    >
                      Nr. {user.id}
                    </Badge>

                    {/* Custom chevron */}
                    <ChevronDown
                      size={18}
                      className="shrink-0 text-primary transition-transform duration-200 group-data-[state=open]/trigger:rotate-180"
                    />
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-3 pb-3 pt-0">
                  <div className="overflow-hidden rounded-lg bg-primary/5 p-3">
                    {/* Rental Section Header */}
                    <div className="mb-2.5 flex items-center gap-2">
                      <BookOpen size={16} className="text-primary" />
                      <span className="text-sm font-semibold text-primary">
                        Ausgeliehene Bücher
                      </span>
                    </div>

                    {/* Rental List */}
                    {userRentals.length === 0 ? (
                      <div className="rounded-md bg-success/15 px-3 py-2.5 text-center">
                        <span className="text-sm font-medium text-success">
                          Keine ausgeliehenen Bücher
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {userRentals.map((rental) => {
                          const status = getOverdueStatus(rental.dueDate);
                          const cls = rentalRowClasses(status);

                          return (
                            <div
                              key={rental.id}
                              className={cn(
                                "flex min-w-0 items-center gap-2.5 rounded-md border-l-[3px] px-2.5 py-1.5",
                                cls.bg,
                                cls.border,
                              )}
                            >
                              <span
                                className="min-w-0 flex-1 truncate text-sm font-medium text-muted-foreground"
                                title={rental.title}
                              >
                                {rental.title}
                              </span>
                              <span
                                className={cn(
                                  "shrink-0 whitespace-nowrap text-xs",
                                  cls.text,
                                )}
                              >
                                {dayjs(rental.dueDate).format("DD.MM.YYYY")}
                                {status === "overdue" && " ⚠"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <Separator className="my-3" />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/user/${user.id}`}
                        passHref
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          className="w-full gap-2 rounded-md font-medium shadow-none"
                          data-cy="user_card_editbutton"
                        >
                          <Pencil size={14} />
                          Editieren
                        </Button>
                      </Link>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-md border-primary/30 px-3 text-primary"
                            data-cy="user_card_printbutton"
                            onClick={() =>
                              window.open(
                                `api/report/userlabels?id=${user.id}`,
                                "_blank",
                              )
                            }
                          >
                            <Printer size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Benutzerlabel drucken</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </div>
          );
        })}
      </Accordion>
    </TooltipProvider>
  );
}
