import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImageOff } from "lucide-react";

export function CoverThumbnail({
  coverUrl,
  hasCover,
  coverSource,
}: {
  coverUrl?: string;
  hasCover?: boolean;
  coverSource?: string;
}) {
  if (hasCover && coverUrl) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative group">
            <img
              src={coverUrl}
              alt="Cover"
              className="w-20 h-[120px] rounded-lg object-cover bg-muted border"
            />
            <span className="absolute bottom-1 right-1 bg-blue-500 text-white rounded px-1 py-0.5 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {coverSource}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>Cover von {coverSource || "unbekannt"}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="w-20 h-[120px] rounded-lg bg-muted border flex items-center justify-center">
      <ImageOff className="size-6 text-muted-foreground/40" />
    </div>
  );
}
