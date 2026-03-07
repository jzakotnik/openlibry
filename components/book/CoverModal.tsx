import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { memo } from "react";

interface CoverModalProps {
  open: boolean;
  onClose: () => void;
  src: string;
  title: string;
  subtitle?: string;
  author: string;
}

const CoverModal = memo(function CoverModal({
  open,
  onClose,
  src,
  title,
  subtitle,
  author,
}: CoverModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-[90vw] max-h-[90vh] w-auto bg-transparent border-none
                   shadow-none p-0 flex flex-col items-center gap-4
                   [&>button]:text-white [&>button]:bg-white/10
                   [&>button]:hover:bg-white/20 [&>button]:top-2 [&>button]:right-2"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Cover image container */}
        <div
          className="relative w-[85vw] sm:w-[70vw] md:w-[50vw] lg:w-[400px]
                     h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[600px]
                     max-w-[500px] max-h-[750px]
                     rounded-xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.5)]"
        >
          <Image
            src={src}
            alt={title ?? "Book cover"}
            fill
            loading="lazy"
            placeholder="blur"
            blurDataURL="/coverimages/default.jpg"
            sizes="(max-width: 600px) 85vw, (max-width: 900px) 70vw, 500px"
            style={{
              objectFit: "contain",
              backgroundColor: "var(--foreground)",
            }}
          />
        </div>

        {/* Title + author below image */}
        <div className="text-center text-white">
          <h2 className="text-lg font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-white/60 mt-0.5">{subtitle}</p>
          )}
          <p className="text-sm text-white/70 mt-1">{author}</p>
        </div>

        <p className="text-xs text-white/40 whitespace-nowrap">
          Klicken zum Schließen oder ESC drücken
        </p>
      </DialogContent>
    </Dialog>
  );
});

export default CoverModal;
