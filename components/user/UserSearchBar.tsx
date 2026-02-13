import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import palette from "@/styles/palette";
import {
  CheckCheck,
  GraduationCap,
  MoreVertical,
  Search,
  SlidersHorizontal,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { ChangeEvent, ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Action‑button (icon‑only with tooltip)                            */
/* ------------------------------------------------------------------ */
interface ActionButtonProps {
  icon: ReactNode;
  tooltip: string;
  onClick: () => void;
  variant?: "default" | "primary" | "error" | "warning";
  badgeCount?: number;
  "data-cy"?: string;
}

function ActionButton({
  icon,
  tooltip,
  onClick,
  variant = "primary",
  badgeCount,
  ...rest
}: ActionButtonProps) {
  const colorMap: Record<string, string> = {
    default: palette.text.secondary,
    primary: palette.primary.main,
    error: palette.error.main,
    warning: palette.warning.main,
  };

  const color = colorMap[variant];

  const button = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="relative h-9 w-9 transition-all duration-200 hover:scale-105"
      style={{ color }}
      {...rest}
    >
      {icon}

      {/* Badge overlay */}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[0.6rem] font-semibold text-white"
          style={{ backgroundColor: palette.primary.main }}
        >
          {badgeCount}
        </span>
      )}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Main search bar                                                   */
/* ------------------------------------------------------------------ */
interface UserSearchBarProps {
  searchValue: string;
  onSearchChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onToggleSettings: () => void;
  showSettings: boolean;
  onSelectAll: () => void;
  onCreateUser: () => void;
  checked: Record<string, boolean>;
  onIncreaseGrade: () => void;
  onDeleteUsers: () => void;
  confirmDelete: boolean;
  settingsContent?: ReactNode;
}

export default function UserSearchBar({
  searchValue,
  onSearchChange,
  onToggleSettings,
  showSettings,
  onSelectAll,
  onCreateUser,
  checked,
  onIncreaseGrade,
  onDeleteUsers,
  confirmDelete,
  settingsContent,
}: UserSearchBarProps) {
  const selectedCount = Object.values(checked).filter(Boolean).length;
  const hasSelection = selectedCount > 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full max-w-[600px] space-y-2">
        {/* ── Main search row ── */}
        <div
          className="flex items-center gap-1 rounded-2xl border px-3 py-1.5 backdrop-blur-xl transition-all duration-300 focus-within:shadow-lg hover:shadow-md"
          style={{
            backgroundColor: `${palette.background.paper}e6`,
            borderColor: `${palette.primary.main}1f`,
            boxShadow: `0 4px 20px ${palette.primary.main}14`,
          }}
        >
          {/* Search icon + input */}
          <Search
            size={20}
            className="ml-1 shrink-0"
            style={{ color: palette.text.disabled }}
          />

          <Input
            type="text"
            value={searchValue}
            onChange={
              onSearchChange as unknown as React.ChangeEventHandler<HTMLInputElement>
            }
            placeholder="Suche nach Name oder ID..."
            aria-label="search users"
            data-cy="rental_input_searchuser"
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />

          {/* Settings toggle */}
          <ActionButton
            icon={<SlidersHorizontal size={18} />}
            tooltip="Sucheinstellungen"
            onClick={onToggleSettings}
            variant={showSettings ? "primary" : "default"}
          />

          <Separator orientation="vertical" className="mx-0.5 h-6" />

          {/* Select all / deselect */}
          <ActionButton
            icon={<CheckCheck size={18} />}
            tooltip={hasSelection ? "Auswahl aufheben" : "Alle auswählen"}
            onClick={onSelectAll}
            badgeCount={hasSelection ? selectedCount : undefined}
          />

          {/* Create user */}
          <ActionButton
            icon={<UserPlus size={18} />}
            tooltip="Neue Nutzerin erzeugen"
            onClick={onCreateUser}
          />
        </div>

        {/* ── Selection action bar (slides in below) ── */}
        <Collapsible open={hasSelection}>
          <CollapsibleContent>
            <div
              className="flex items-center justify-between rounded-xl px-4 py-2"
              style={{
                backgroundColor: `${palette.primary.main}0a`,
                border: `1px solid ${palette.primary.main}1a`,
              }}
            >
              {/* Left: selection info + deselect */}
              <div className="flex items-center gap-2">
                <Badge
                  className="rounded-full text-white"
                  style={{ backgroundColor: palette.primary.main }}
                >
                  {selectedCount}
                </Badge>
                <span
                  className="text-sm font-medium"
                  style={{ color: palette.text.secondary }}
                >
                  ausgewählt
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSelectAll}
                  className="ml-1 h-7 gap-1 px-2 text-xs"
                  style={{ color: palette.text.secondary }}
                >
                  <X size={12} />
                  Aufheben
                </Button>
              </div>

              {/* Right: bulk actions in a safe dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    style={{ color: palette.text.secondary }}
                  >
                    <MoreVertical size={18} />
                    <span className="sr-only">Aktionen</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem
                    onClick={onIncreaseGrade}
                    className="gap-3"
                    style={{ color: palette.primary.main }}
                  >
                    <GraduationCap size={16} />
                    Klasse erhöhen
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={onDeleteUsers}
                    className="gap-3"
                    style={{
                      color: confirmDelete
                        ? palette.error.main
                        : palette.text.secondary,
                      fontWeight: confirmDelete ? 600 : 400,
                    }}
                  >
                    <Trash2 size={16} />
                    {confirmDelete ? "Wirklich löschen?" : "Nutzer löschen"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* ── Settings panel ── */}
        <Collapsible open={showSettings}>
          <CollapsibleContent>
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: `${palette.primary.light}0f`,
                border: `1px solid ${palette.primary.main}1a`,
              }}
            >
              {settingsContent}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
}
