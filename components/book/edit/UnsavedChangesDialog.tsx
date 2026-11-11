import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { t } from "@/lib/i18n";

interface UnsavedChangesDialogProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export default function UnsavedChangesDialog({
  open,
  onStay,
  onLeave,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onStay()}>
      <DialogContent className="max-w-md" data-cy="unsaved-changes-dialog">
        <DialogHeader>
          <DialogTitle>{t("bookEditForm.unsavedTitle")}</DialogTitle>
          <DialogDescription>
            {t("bookEditForm.unsavedMessage")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onStay}
            data-cy="unsaved-stay-button"
          >
            {t("bookEditForm.unsavedStay")}
          </Button>
          <Button
            variant="destructive"
            onClick={onLeave}
            data-cy="unsaved-leave-button"
          >
            {t("bookEditForm.unsavedLeave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
