import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import palette from "@/styles/palette";
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

function overdueColor(level: OverdueLevel) {
  switch (level) {
    case "overdue":
      return palette.error.main;
    case "warning":
      return palette.warning.main;
    default:
      return palette.text.secondary;
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
      <Label
        htmlFor={id}
        className="text-xs font-medium"
        style={{ color: palette.text.secondary }}
      >
        {label}
        {required && <span style={{ color: palette.error.main }}> *</span>}
      </Label>
      <Input
        id={id}
        name={id}
        defaultValue={value}
        disabled={disabled}
        tabIndex={tabIndex}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="transition-colors disabled:opacity-60"
        style={
          !disabled ? { borderColor: `${palette.primary.main}66` } : undefined
        }
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
  const color = overdueColor(level);
  const dueDateStr = dayjs(book.dueDate).format("DD.MM.YYYY");

  return (
    <div
      className="group flex items-center gap-2 rounded-lg border-l-[3px] px-3 py-2 transition-all duration-200 hover:shadow-sm"
      style={{
        borderLeftColor: returned ? palette.success.main : color,
        backgroundColor: returned ? `${palette.success.main}0a` : `${color}0a`,
      }}
    >
      {/* Return button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onReturn}
            className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-black/5"
            style={{
              color: returned ? palette.success.main : palette.primary.main,
            }}
          >
            {returned ? <CheckCircle2 size={18} /> : <Undo2 size={18} />}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{returned ? "Bereits zurückgegeben" : "Zurückgeben"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Extend button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onExtend}
            className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-black/5"
            style={{ color: palette.text.secondary }}
          >
            <Clock size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verlängern</p>
        </TooltipContent>
      </Tooltip>

      {/* Book info */}
      <div className="min-w-0 flex-1">
        <span
          className="block truncate text-sm font-medium"
          title={book.title ?? ""}
          style={{
            color: returned ? palette.text.disabled : palette.text.secondary,
            textDecoration: returned ? "line-through" : "none",
          }}
        >
          {book.title}
        </span>
      </div>

      {/* Renewal count */}
      {(book.renewalCount ?? 0) > 0 && (
        <Badge
          variant="secondary"
          className="shrink-0 text-[0.6rem]"
          style={{
            backgroundColor: `${palette.primary.main}14`,
            color: palette.text.secondary,
          }}
        >
          <RotateCcw size={10} className="mr-0.5" />
          {book.renewalCount}×
        </Badge>
      )}

      {/* Due date */}
      <span
        className="shrink-0 whitespace-nowrap text-xs"
        style={{
          color: returned ? palette.text.disabled : color,
          fontWeight: level !== "ok" ? 600 : 400,
        }}
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
      <div
        className="overflow-hidden rounded-2xl border shadow-sm"
        style={{
          backgroundColor: palette.background.paper,
          borderColor: `${palette.primary.main}14`,
        }}
      >
        {/* ═══════════════════════════════════════════════ */}
        {/*  Header                                        */}
        {/* ═══════════════════════════════════════════════ */}
        <div
          className="relative overflow-hidden px-6 py-5"
          style={{
            background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
          }}
        >
          {/* Decorative shapes */}
          <div
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10"
            style={{ backgroundColor: palette.primary.light }}
          />
          <div
            className="absolute -bottom-4 right-16 h-20 w-20 rounded-full opacity-[0.07]"
            style={{ backgroundColor: palette.primary.light }}
          />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
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
                <Badge
                  className="rounded-full border-0 text-xs"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.18)",
                    color: "white",
                  }}
                >
                  <BookOpen size={12} className="mr-1" />
                  {books.length} {books.length === 1 ? "Buch" : "Bücher"}
                </Badge>
              )}
              {overdueCount > 0 && (
                <Badge
                  className="rounded-full border-0 text-xs"
                  style={{
                    backgroundColor: "rgba(255,80,80,0.25)",
                    color: "#fecaca",
                  }}
                >
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
            {/* Tab order: 1-6 for data fields */}
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
            className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            tabIndex={5}
            style={{
              borderColor: user.active ? palette.primary.main : "#e5e7eb",
              opacity: editable ? 1 : 0.6,
              pointerEvents: editable ? "auto" : "none",
            }}
          >
            <Checkbox
              id="user-active"
              checked={user.active}
              disabled={!editable}
              onCheckedChange={() =>
                setUserData({ ...user, active: !user.active })
              }
              className="border-gray-300 data-[state=checked]:border-transparent"
              style={
                user.active
                  ? {
                      backgroundColor: palette.primary.main,
                      borderColor: palette.primary.main,
                    }
                  : undefined
              }
            />
            <div>
              <span
                className="text-sm font-medium"
                style={{
                  color: user.active
                    ? palette.primary.dark
                    : palette.text.secondary,
                }}
              >
                Aktiv
              </span>
              <p className="text-xs" style={{ color: palette.text.disabled }}>
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
              <div
                className="rounded-lg px-4 py-3 text-center text-sm font-medium"
                style={{
                  backgroundColor: `${palette.success.main}0f`,
                  color: palette.success.main,
                }}
              >
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
                    className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-500"
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
            {/* Edit / Cancel toggle — always visible */}
            <Button
              variant={editable ? "outline" : "default"}
              size="sm"
              tabIndex={6}
              onClick={toggleEdit}
              className="gap-2 rounded-lg font-medium"
              style={
                editable
                  ? {
                      borderColor: `${palette.text.secondary}33`,
                      color: palette.text.secondary,
                    }
                  : {
                      backgroundColor: palette.primary.main,
                      color: palette.primary.contrastText,
                    }
              }
            >
              {editable ? <X size={15} /> : <Edit3 size={15} />}
              {editable ? "Abbrechen" : "Editieren"}
            </Button>

            {/* These only appear when editing */}
            {editable && (
              <>
                {/* Save */}
                <Button
                  size="sm"
                  tabIndex={7}
                  onClick={() => {
                    saveUser();
                    toggleEdit();
                  }}
                  className="gap-2 rounded-lg font-medium shadow-sm"
                  style={{
                    backgroundColor: palette.primary.main,
                    color: palette.primary.contrastText,
                  }}
                >
                  <Save size={15} />
                  Speichern
                </Button>

                {/* Print */}
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
                  className="gap-2 rounded-lg font-medium"
                  style={{
                    borderColor: `${palette.primary.main}33`,
                    color: palette.primary.main,
                  }}
                >
                  <Printer size={15} />
                  Drucken
                </Button>

                {/* Spacer pushes delete to the right */}
                <div className="flex-1" />

                {/* Delete — subtle by default, reveals danger on hold */}
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
      <div
        className="h-px flex-1"
        style={{ backgroundColor: `${palette.primary.main}1a` }}
      />
      <span
        className="flex items-center gap-1.5 text-sm font-semibold"
        style={{ color: palette.info.main }}
      >
        {label}
        {count !== undefined && (
          <Badge
            variant="secondary"
            className="ml-1 h-5 min-w-[20px] rounded-full px-1.5 text-[0.65rem]"
            style={{
              backgroundColor: `${palette.info.main}14`,
              color: palette.info.main,
            }}
          >
            {count}
          </Badge>
        )}
      </span>
      <div
        className="h-px flex-1"
        style={{ backgroundColor: `${palette.primary.main}1a` }}
      />
    </div>
  );
}
