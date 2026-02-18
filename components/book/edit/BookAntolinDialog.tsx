import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BookAntolinDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  antolinBooks: any;
}

export default function BookAntolinDialog({
  open,
  setOpen,
  antolinBooks,
}: BookAntolinDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bücher aus der Antolin Datenbank</DialogTitle>
        </DialogHeader>

        <ul className="space-y-1.5">
          {antolinBooks?.items?.slice(0, 10).map((b: any) => (
            <li
              key={b.book_id}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              <span className="text-muted-foreground/50 mr-1.5">–</span>
              {b.Titel}
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} autoFocus>
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
