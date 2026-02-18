import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import dayjs from "dayjs";
import "dayjs/locale/de";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit3,
  Printer,
  RotateCcw,
  Save,
  Undo2,
  User,
  X,
} from "lucide-react";
import { Dispatch, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import HoldButton from "../layout/HoldButton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type UserEditFormPropType = {
  user: UserType;
  books: Array<BookType>;
  setUserData: Dispatch<UserType>;
  deleteUser: () => void;
  deleteSafetySeconds: number;
  saveUser: () => void;
  returnBook: (bookid: number) => void;
  extendBook: (bookid: number, book: BookType) => void;
  initiallyEditable?: boolean;
};

type OverdueLevel = "overdue" | "warning" | "ok";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getOverdueLevel(dueDate: string | Date | undefined): OverdueLevel {
  if (!dueDate) return "ok";
  const days = dayjs().diff(dueDate, "days");
  if (days > 13) return "overdue";
  if (days > 0) return "warning";
  return "ok";
}

function overdueClasses(level: OverdueLevel) {
  switch (level) {
    case "overdue":
      return {
        text: "text-destructive",
        bg: "bg-destructive/5",
        border: "border-l-destructive",
      };
    case "warning":
      return {
        text: "text-amber-500",
        bg: "bg-amber-500/5",
        border: "border-l-amber-500",
      };
    default:
      return {
        text: "text-muted-foreground",
        bg: "bg-muted/30",
        border: "border-l-muted-foreground/30",
      };
  }
}

/* ------------------------------------------------------------------ */
/*  Editable field                                                     */
/* ------------------------------------------------------------------ */

function FormField({
  id,
  label,
  value,
  disabled,
  required,
  onChange,
  tabIndex,
}: {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  required?: boolean;
  onChange?: (v: string) => void;
  tabIndex?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Input
        id={id}
        name={id}
        defaultValue={value}
        disabled={disabled}
        tabIndex={tabIndex}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={cn(
          "transition-colors disabled:opacity-60",
          !disabled && "border-primary/40 focus-visible:border-primary",
        )}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Book row                                                           */
/* ------------------------------------------------------------------ */

function BookRow({
  book,
  returned,
  onReturn,
  onExtend,
}: {
  book: BookType;
  returned: boolean;
  onReturn: () => void;
  onExtend: () => void;
}) {
  const level = getOverdueLevel(book.dueDate);
  const cls = overdueClasses(level);
  const dueDateStr = dayjs(book.dueDate).format("DD.MM.YYYY");

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg border-l-[3px] px-3 py-2 transition-all duration-200 hover:shadow-sm",
        returned ? "border-l-success bg-success/5" : cn(cls.border, cls.bg),
      )}
    >
      {/* Return button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onReturn}
            className={cn(
              "h-8 w-8 shrink-0",
              returned ? "text-success" : "text-primary",
            )}
          >
            {returned ? <CheckCircle2 size={18} /> : <Undo2 size={18} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{returned ? "Bereits zurückgegeben" : "Zurückgeben"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Extend button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onExtend}
            className="h-8 w-8 shrink-0 text-muted-foreground"
          >
            <Clock size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verlängern</p>
        </TooltipContent>
      </Tooltip>

      {/* Book info */}
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-sm font-medium",
            returned
              ? "text-muted-foreground/50 line-through"
              : "text-muted-foreground",
          )}
          title={book.title ?? ""}
        >
          {book.title}
        </span>
      </div>

      {/* Renewal count */}
      {(book.renewalCount ?? 0) > 0 && (
        <Badge
          variant="secondary"
          className="shrink-0 bg-primary/10 text-[0.6rem] text-muted-foreground"
        >
          <RotateCcw size={10} className="mr-0.5" />
          {book.renewalCount}×
        </Badge>
      )}

      {/* Due date */}
      <span
        className={cn(
          "shrink-0 whitespace-nowrap text-xs",
          returned
            ? "text-muted-foreground/50"
            : cn(cls.text, level !== "ok" && "font-semibold"),
        )}
      >
        {dueDateStr}
        {level === "overdue" && !returned && (
          <AlertTriangle size={12} className="ml-1 inline-block align-[-1px]" />
        )}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function UserEditForm({
  user,
  books,
  setUserData,
  deleteUser,
  deleteSafetySeconds = 3,
  saveUser,
  returnBook,
  extendBook,
  initiallyEditable = false,
}: UserEditFormPropType) {
  const [editable, setEditable] = useState(initiallyEditable);
  const [returnedBooks, setReturnedBooks] = useState<Record<number, number>>(
    {},
  );

  const toggleEdit = () => setEditable((e) => !e);

  const handleReturn = (b: BookType) => {
    if (!b.id) return;
    returnBook(b.id);
    setReturnedBooks((prev) => ({ ...prev, [b.id!]: Date.now() }));
  };

  const overdueCount = books.filter(
    (b) => getOverdueLevel(b.dueDate) !== "ok",
  ).length;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-sm">
        {/* ═══════════════════════════════════════════════ */}
        {/*  Header                                        */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 px-6 py-5">
          {/* Decorative shapes */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 right-16 h-20 w-20 rounded-full bg-white/[0.07]" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <User size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-white/60">
                  Nr. {user.id} · Klasse {user.schoolGrade}
                  {user.schoolTeacherName && ` · ${user.schoolTeacherName}`}
                </p>
              </div>
            </div>

            {/* Status badges */}
            <div className="hidden gap-2 sm:flex">
              {books.length > 0 && (
                <Badge className="rounded-full border-0 bg-white/20 text-xs text-white">
                  <BookOpen size={12} className="mr-1" />
                  {books.length} {books.length === 1 ? "Buch" : "Bücher"}
                </Badge>
              )}
              {overdueCount > 0 && (
                <Badge className="rounded-full border-0 bg-destructive/25 text-xs text-red-200">
                  <AlertTriangle size={12} className="mr-1" />
                  {overdueCount} überfällig
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/*  Section: Personal data                        */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="px-6 pt-6">
          <SectionHeading label="Daten" />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="firstName"
              label="Vorname"
              value={user.firstName ?? ""}
              disabled={!editable}
              required
              tabIndex={1}
              onChange={(v) => setUserData({ ...user, firstName: v })}
            />
            <FormField
              id="lastName"
              label="Nachname"
              value={user.lastName ?? ""}
              disabled={!editable}
              required
              tabIndex={2}
              onChange={(v) => setUserData({ ...user, lastName: v })}
            />
            <FormField
              id="schoolGrade"
              label="Klasse"
              value={user.schoolGrade ?? ""}
              disabled={!editable}
              required
              tabIndex={3}
              onChange={(v) => setUserData({ ...user, schoolGrade: v })}
            />
            <FormField
              id="schoolTeacherName"
              label="Lehrkraft"
              value={user.schoolTeacherName ?? ""}
              disabled={!editable}
              tabIndex={4}
              onChange={(v) => setUserData({ ...user, schoolTeacherName: v })}
            />
            <FormField
              id="createdAt"
              label="Erzeugt am"
              value={`User erstellt am ${user.createdAt} mit Ausweisnummer ${user.id}`}
              disabled
              tabIndex={-1}
            />
            <FormField
              id="lastUpdated"
              label="Letztes Update"
              value={user.updatedAt ?? ""}
              disabled
              tabIndex={-1}
            />
          </div>

          {/* Active checkbox */}
          <label
            htmlFor="user-active"
            className={cn(
              "mt-4 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30",
              user.active ? "border-primary" : "border-border",
              !editable && "pointer-events-none opacity-60",
            )}
            tabIndex={5}
          >
            <Checkbox
              id="user-active"
              checked={user.active}
              disabled={!editable}
              onCheckedChange={() =>
                setUserData({ ...user, active: !user.active })
              }
            />
            <div>
              <span
                className={cn(
                  "text-sm font-medium",
                  user.active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                Aktiv
              </span>
              <p className="text-xs text-muted-foreground/60">
                {user.active
                  ? "Benutzer kann Bücher ausleihen"
                  : "Benutzer ist deaktiviert"}
              </p>
            </div>
          </label>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/*  Section: Borrowed books                       */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="px-6 pt-6">
          <SectionHeading label="Geliehene Bücher" count={books.length} />

          <div className="mt-3 space-y-1.5">
            {books.length === 0 ? (
              <div className="rounded-lg bg-success/10 px-4 py-3 text-center text-sm font-medium text-success">
                Keine ausgeliehenen Bücher
              </div>
            ) : (
              books.map((b: BookType) =>
                b.id ? (
                  <BookRow
                    key={b.id}
                    book={b}
                    returned={b.id in returnedBooks}
                    onReturn={() => handleReturn(b)}
                    onExtend={() => b.id && extendBook(b.id, b)}
                  />
                ) : (
                  <div
                    key={Math.random()}
                    className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    ID nicht gefunden
                  </div>
                ),
              )
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/*  Action bar                                    */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="px-6 pb-6 pt-5">
          <Separator className="mb-5" />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={editable ? "outline" : "default"}
              size="sm"
              tabIndex={6}
              onClick={toggleEdit}
              className="gap-2 rounded-lg font-medium"
            >
              {editable ? <X size={15} /> : <Edit3 size={15} />}
              {editable ? "Abbrechen" : "Editieren"}
            </Button>

            {editable && (
              <>
                <Button
                  size="sm"
                  tabIndex={7}
                  onClick={() => {
                    saveUser();
                    toggleEdit();
                  }}
                  className="gap-2 rounded-lg font-medium shadow-sm"
                >
                  <Save size={15} />
                  Speichern
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  tabIndex={8}
                  onClick={() =>
                    window.open(
                      `/api/report/userlabels?id=${user.id}`,
                      "_blank",
                    )
                  }
                  className="gap-2 rounded-lg font-medium text-primary border-primary/30"
                >
                  <Printer size={15} />
                  Drucken
                </Button>

                <div className="flex-1" />

                <HoldButton
                  duration={deleteSafetySeconds * 1000}
                  onClick={deleteUser}
                  buttonLabel="Löschen"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Section heading with optional count                                */
/* ------------------------------------------------------------------ */

function SectionHeading({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-primary/10" />
      <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
        {label}
        {count !== undefined && (
          <Badge
            variant="secondary"
            className="ml-1 h-5 min-w-[20px] rounded-full bg-primary/10 px-1.5 text-[0.65rem] text-primary"
          >
            {count}
          </Badge>
        )}
      </span>
      <div className="h-px flex-1 bg-primary/10" />
    </div>
  );
}
