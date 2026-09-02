import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserPickerOption } from "@/entities/UserType";
import { t } from "@/lib/i18n";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

type BookUserAssignProps = {
  users: UserPickerOption[];
  currentUserId?: number | null;
  onAssign: (userid: number) => void;
};

const BookUserAssign = ({
  users,
  currentUserId,
  onAssign,
}: BookUserAssignProps) => {
  const [open, setOpen] = useState(false);

  if (currentUserId) {
    const current = users.find((u) => u.id === currentUserId);
    const name = current
      ? `${current.firstName} ${current.lastName}`
      : `#${currentUserId}`;
    return (
      <p className="text-sm text-muted-foreground">
        {t("bookUserAssign.currentlyWith", { name })}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">
        {t("bookUserAssign.label")}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            data-cy="book-assign-user-trigger"
          >
            {t("bookUserAssign.placeholder")}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command
            filter={(value, search) =>
              value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput placeholder={t("bookUserAssign.searchPlaceholder")} />
            <CommandList>
              <CommandEmpty>{t("bookUserAssign.notFound")}</CommandEmpty>
              <CommandGroup>
                {users.map((u) => (
                  <CommandItem
                    key={u.id}
                    value={`${u.firstName} ${u.lastName} ${u.id}`}
                    onSelect={() => {
                      if (u.id) onAssign(u.id);
                      setOpen(false);
                    }}
                    data-cy={`book-assign-user-option-${u.id}`}
                  >
                    <Check className="mr-2 size-4 opacity-0" />
                    {u.firstName} {u.lastName}
                    <span className="ml-auto text-muted-foreground">
                      #{u.id}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BookUserAssign;
