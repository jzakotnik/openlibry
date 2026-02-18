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
import { cn } from "@/lib/utils";
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
/*  Action-button (icon-only with tooltip)                            */
/* ------------------------------------------------------------------ */
interface ActionButtonProps {
  icon: ReactNode;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  badgeCount?: number;
  "data-cy"?: string;
}

function ActionButton({
  icon,
  tooltip,
  onClick,
  active = true,
  badgeCount,
  ...rest
}: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={cn(
            "relative h-9 w-9 transition-all duration-200 hover:scale-105",
            active ? "text-primary" : "text-muted-foreground",
          )}
          {...rest}
        >
          {icon}
          {badgeCount !== undefined && badgeCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold text-primary-foreground">
              {badgeCount}
            </span>
          )}
        </Button>
      </TooltipTrigger>
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
        <div className="flex items-center gap-1 rounded-2xl border border-primary/10 bg-card/90 px-3 py-1.5 shadow-[0_4px_20px_hsl(var(--primary)/0.08)] backdrop-blur-xl transition-all duration-300 focus-within:shadow-lg hover:shadow-md">
          <Search
            size={20}
            className="ml-1 shrink-0 text-muted-foreground/50"
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

          <ActionButton
            icon={<SlidersHorizontal size={18} />}
            tooltip="Sucheinstellungen"
            onClick={onToggleSettings}
            active={showSettings}
          />

          <Separator orientation="vertical" className="mx-0.5 h-6" />

          <ActionButton
            icon={<CheckCheck size={18} />}
            tooltip={hasSelection ? "Auswahl aufheben" : "Alle auswählen"}
            onClick={onSelectAll}
            badgeCount={hasSelection ? selectedCount : undefined}
          />

          <ActionButton
            icon={<UserPlus size={18} />}
            tooltip="Neue Nutzerin erzeugen"
            onClick={onCreateUser}
          />
        </div>

        {/* ── Selection action bar (slides in below) ── */}
        <Collapsible open={hasSelection}>
          <CollapsibleContent>
            <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 px-4 py-2">
              <div className="flex items-center gap-2">
                <Badge className="rounded-full">{selectedCount}</Badge>
                <span className="text-sm font-medium text-muted-foreground">
                  ausgewählt
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSelectAll}
                  className="ml-1 h-7 gap-1 px-2 text-xs text-muted-foreground"
                >
                  <X size={12} />
                  Aufheben
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                  >
                    <MoreVertical size={18} />
                    <span className="sr-only">Aktionen</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem
                    onClick={onIncreaseGrade}
                    className="gap-3 text-primary"
                  >
                    <GraduationCap size={16} />
                    Klasse erhöhen
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={onDeleteUsers}
                    className={cn(
                      "gap-3",
                      confirmDelete
                        ? "font-semibold text-destructive focus:text-destructive"
                        : "text-muted-foreground",
                    )}
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
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
              {settingsContent}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
}
