import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import palette from "@/styles/palette";

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

function getStatusColor(status: OverdueStatus): string {
  switch (status) {
    case "overdue":
      return palette.error.main;
    case "warning":
      return palette.warning.main;
    default:
      return palette.text.secondary;
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
  // Build rental count map
  const rentalCountByUser = rentals.reduce<Record<number, number>>(
    (acc, rental) => {
      const userId = rental.userid;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    },
    {},
  );

  // Initialize checkboxes
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
      <div
        className="rounded-lg px-3 py-6 text-center"
        style={{ backgroundColor: `${palette.primary.light}0f` }}
      >
        <p className="mb-1 text-base" style={{ color: palette.text.secondary }}>
          {searchString
            ? "Keine Benutzer gefunden"
            : "Noch keine Benutzer vorhanden"}
        </p>
        <p className="text-sm" style={{ color: palette.text.disabled }}>
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
              className="flex items-stretch overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: `${palette.background.paper}e6`,
                borderColor: `${palette.primary.main}1a`,
              }}
            >
              {/* Checkbox Column */}
              <div
                className="flex items-center px-2"
                style={{
                  borderRight: `1px solid ${palette.primary.main}14`,
                }}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleCheckboxChange(userId)}
                  className="border-gray-300 data-[state=checked]:border-transparent"
                  style={
                    isChecked
                      ? {
                          backgroundColor: palette.primary.main,
                          borderColor: palette.primary.main,
                        }
                      : undefined
                  }
                />
              </div>

              {/* Main Content — AccordionItem */}
              <AccordionItem value={userId} className="flex-1 border-0">
                <AccordionTrigger className="group/trigger px-3 py-3 hover:no-underline [&>svg]:hidden">
                  <div className="flex w-full items-center gap-3">
                    {/* Avatar with rental count */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback
                            className="text-sm font-semibold"
                            style={{
                              backgroundColor:
                                rentalCount > 0
                                  ? hasOverdue
                                    ? `${palette.error.main}26`
                                    : `${palette.primary.main}26`
                                  : `${palette.success.main}26`,
                              color:
                                rentalCount > 0
                                  ? hasOverdue
                                    ? palette.error.main
                                    : palette.primary.main
                                  : palette.success.main,
                            }}
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
                        <span
                          className="truncate font-semibold"
                          style={{ color: palette.primary.dark }}
                        >
                          {user.lastName}, {user.firstName}
                        </span>
                        {hasOverdue && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle
                                size={16}
                                className="shrink-0"
                                style={{ color: palette.warning.main }}
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
                          style={{ color: palette.text.disabled }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: palette.text.secondary }}
                        >
                          Klasse {user.schoolGrade}
                          {user.schoolTeacherName &&
                            ` · ${user.schoolTeacherName}`}
                        </span>
                      </div>
                    </div>

                    {/* Quick Info Badge */}
                    <Badge
                      variant="secondary"
                      className="hidden shrink-0 text-[0.7rem] sm:inline-flex"
                      style={{
                        backgroundColor: `${palette.primary.main}14`,
                        color: palette.text.secondary,
                      }}
                    >
                      Nr. {user.id}
                    </Badge>

                    {/* Custom chevron so we can style it */}
                    <ChevronDown
                      size={18}
                      className="shrink-0 transition-transform duration-200 group-data-[state=open]/trigger:rotate-180"
                      style={{ color: palette.primary.main }}
                    />
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-3 pb-3 pt-0">
                  <div
                    className="overflow-hidden rounded-lg p-3"
                    style={{
                      backgroundColor: `${palette.primary.light}0f`,
                    }}
                  >
                    {/* Rental Section Header */}
                    <div className="mb-2.5 flex items-center gap-2">
                      <BookOpen
                        size={16}
                        style={{ color: palette.primary.main }}
                      />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: palette.primary.main }}
                      >
                        Ausgeliehene Bücher
                      </span>
                    </div>

                    {/* Rental List */}
                    {userRentals.length === 0 ? (
                      <div
                        className="rounded-md px-3 py-2.5 text-center"
                        style={{
                          backgroundColor: `${palette.success.main}1a`,
                        }}
                      >
                        <span
                          className="text-sm font-medium"
                          style={{ color: palette.success.main }}
                        >
                          Keine ausgeliehenen Bücher
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {userRentals.map((rental) => {
                          const status = getOverdueStatus(rental.dueDate);
                          const statusColor = getStatusColor(status);

                          return (
                            <div
                              key={rental.id}
                              className="flex min-w-0 items-center gap-2.5 rounded-md border-l-[3px] px-2.5 py-1.5"
                              style={{
                                backgroundColor: `${statusColor}14`,
                                borderLeftColor: statusColor,
                              }}
                            >
                              <span
                                className="min-w-0 flex-1 truncate text-sm font-medium"
                                title={rental.title}
                                style={{ color: palette.text.secondary }}
                              >
                                {rental.title}
                              </span>
                              <span
                                className="shrink-0 whitespace-nowrap text-xs"
                                style={{
                                  color: statusColor,
                                  fontWeight: status !== "ok" ? 600 : 400,
                                }}
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
                          style={{
                            backgroundColor: palette.primary.main,
                            color: palette.primary.contrastText,
                          }}
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
                            className="rounded-md px-3"
                            data-cy="user_card_printbutton"
                            onClick={() =>
                              window.open(
                                `api/report/userlabels?id=${user.id}`,
                                "_blank",
                              )
                            }
                            style={{
                              borderColor: `${palette.primary.main}4d`,
                              color: palette.primary.main,
                            }}
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
