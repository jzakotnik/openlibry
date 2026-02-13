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
import palette from "@/styles/palette";
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

  // Sync when maxUserID changes externally
  React.useEffect(() => {
    setIdValue(maxUserID);
  }, [maxUserID]);

  const displayId = idAuto ? maxUserID : idValue;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        {/* ── Gradient header ── */}
        <div
          className="relative px-6 pb-8 pt-6"
          style={{
            background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-10"
            style={{ backgroundColor: palette.primary.light }}
          />
          <div
            className="absolute -bottom-4 right-12 h-16 w-16 rounded-full opacity-10"
            style={{ backgroundColor: palette.primary.light }}
          />

          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
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
            <div
              className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 shadow-lg"
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                boxShadow: `0 8px 32px rgba(0,0,0,0.15)`,
              }}
            >
              <Hash size={16} style={{ color: palette.primary.main }} />
              <span
                className="text-2xl font-bold tabular-nums tracking-tight"
                style={{ color: palette.primary.dark }}
              >
                {displayId}
              </span>
              {idAuto && (
                <span className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-amber-600">
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
            className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            style={{ borderColor: idAuto ? palette.primary.main : "#e5e7eb" }}
          >
            <Checkbox
              id="id-auto"
              checked={idAuto}
              onCheckedChange={(v) => setIdAuto(v === true)}
              className="border-gray-300 data-[state=checked]:border-transparent"
              style={
                idAuto
                  ? {
                      backgroundColor: palette.primary.main,
                      borderColor: palette.primary.main,
                    }
                  : undefined
              }
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <Wand2
                  size={14}
                  style={{
                    color: idAuto
                      ? palette.primary.main
                      : palette.text.disabled,
                  }}
                />
                <span
                  className="text-sm font-medium"
                  style={{
                    color: idAuto
                      ? palette.primary.dark
                      : palette.text.secondary,
                  }}
                >
                  Automatische ID
                </span>
              </div>
              <p
                className="mt-0.5 text-xs"
                style={{ color: palette.text.disabled }}
              >
                Nächste verfügbare Nummer wird automatisch vergeben
              </p>
            </div>
          </label>

          {/* Manual ID input — only meaningful when auto is off */}
          <div
            className="space-y-2 transition-opacity duration-200"
            style={{ opacity: idAuto ? 0.4 : 1 }}
          >
            <Label
              htmlFor="user-id-input"
              className="text-sm font-medium"
              style={{ color: palette.text.secondary }}
            >
              Nutzer-ID
            </Label>
            <div className="relative">
              <Hash
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: palette.text.disabled }}
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
                className="pl-9 tabular-nums"
                style={{
                  borderColor: !idAuto ? palette.primary.main : undefined,
                }}
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
            className="text-sm"
            style={{ color: palette.text.secondary }}
          >
            Abbrechen
          </Button>
          <Button
            onClick={() => onCreate(idValue, idAuto)}
            className="gap-2 rounded-lg px-5 text-sm font-semibold shadow-sm"
            style={{
              backgroundColor: palette.primary.main,
              color: palette.primary.contrastText,
            }}
          >
            <UserPlus size={16} />
            Erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
