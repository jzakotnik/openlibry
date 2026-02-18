import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Hash, Sparkles, UserPlus, Wand2 } from "lucide-react";
import * as React from "react";

export interface NewUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  maxUserID: number;
  onCreate: (idValue: number, idAuto: boolean) => void;
}

export default function NewUserDialog({
  onCreate,
  open,
  maxUserID,
  setOpen,
}: NewUserDialogProps) {
  const [idValue, setIdValue] = React.useState(maxUserID);
  const [idAuto, setIdAuto] = React.useState(true);

  React.useEffect(() => {
    setIdValue(maxUserID);
  }, [maxUserID]);

  const displayId = idAuto ? maxUserID : idValue;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        {/* ── Gradient header ── */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 px-6 pb-8 pt-6">
          {/* Decorative circles */}
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 right-12 h-16 w-16 rounded-full bg-white/10" />

          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <UserPlus size={20} className="text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Neue Nutzerin erstellen
                </DialogTitle>
                <p className="mt-0.5 text-sm text-white/70">
                  Benutzer zur Bibliothek hinzufügen
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* ID preview pill */}
          <div className="mt-5 flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-background/95 px-5 py-2.5 shadow-lg">
              <Hash size={16} className="text-primary" />
              <span className="text-2xl font-bold tabular-nums tracking-tight text-primary">
                {displayId}
              </span>
              {idAuto && (
                <span className="flex items-center gap-1 rounded-md bg-warning-light px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-warning">
                  <Sparkles size={10} />
                  Auto
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Form body ── */}
        <div className="space-y-5 px-6 py-5">
          {/* Auto-ID toggle */}
          <label
            htmlFor="id-auto"
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30",
              idAuto ? "border-primary" : "border-border",
            )}
          >
            <Checkbox
              id="id-auto"
              checked={idAuto}
              onCheckedChange={(v) => setIdAuto(v === true)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <Wand2
                  size={14}
                  className={
                    idAuto ? "text-primary" : "text-muted-foreground/50"
                  }
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    idAuto ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  Automatische ID
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground/60">
                Nächste verfügbare Nummer wird automatisch vergeben
              </p>
            </div>
          </label>

          {/* Manual ID input */}
          <div
            className={cn(
              "space-y-2 transition-opacity duration-200",
              idAuto ? "opacity-40" : "opacity-100",
            )}
          >
            <Label
              htmlFor="user-id-input"
              className="text-sm font-medium text-muted-foreground"
            >
              Nutzer-ID
            </Label>
            <div className="relative">
              <Hash
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
              />
              <Input
                id="user-id-input"
                type="number"
                disabled={idAuto}
                value={idValue}
                onChange={(e) => {
                  setIdValue(
                    parseInt(e.target.value) ? parseInt(e.target.value) : 0,
                  );
                }}
                className={cn(
                  "pl-9 tabular-nums",
                  !idAuto && "border-primary/60",
                )}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* ── Footer ── */}
        <DialogFooter className="px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-sm text-muted-foreground"
          >
            Abbrechen
          </Button>
          <Button
            onClick={() => onCreate(idValue, idAuto)}
            className="gap-2 rounded-lg px-5 text-sm font-semibold shadow-sm"
          >
            <UserPlus size={16} />
            Erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
