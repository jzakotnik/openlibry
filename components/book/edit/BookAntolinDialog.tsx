import { useEffect, useRef } from "react";

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
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  const handleClose = () => setOpen(false);

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="rounded-xl shadow-2xl border border-gray-200 p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm max-w-md w-full"
      aria-labelledby="antolin-info-dialog-title"
    >
      <div className="px-6 pt-5 pb-4">
        {/* Title */}
        <h2
          id="antolin-info-dialog-title"
          className="text-base font-semibold text-gray-900 mb-4"
        >
          Bücher aus der Antolin Datenbank
        </h2>

        {/* Content */}
        <ul className="space-y-1.5">
          {antolinBooks?.items?.slice(0, 10).map((b: any) => (
            <li
              key={b.book_id}
              className="text-sm text-gray-700 leading-relaxed"
            >
              <span className="text-gray-400 mr-1.5">–</span>
              {b.Titel}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-end px-6 py-3 border-t border-gray-100">
        <button
          onClick={handleClose}
          autoFocus
          className="px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Schließen
        </button>
      </div>
    </dialog>
  );
}
