import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { memo } from "react";

const MAX_VISIBLE_TOPICS = 2;

interface TopicChipsProps {
  topics: string[];
  onTopicClick?: (topic: string) => void;
}

const TopicChips = memo(function TopicChips({
  topics,
  onTopicClick,
}: TopicChipsProps) {
  const visibleTopics = topics.slice(0, MAX_VISIBLE_TOPICS);
  const hiddenTopics = topics.slice(MAX_VISIBLE_TOPICS);
  const extraCount = hiddenTopics.length;

  if (visibleTopics.length === 0) return null;

  return (
    <TooltipProvider>
      <div
        className="flex flex-wrap gap-1 mt-0.5"
        role="list"
        aria-label="Schlagwörter"
      >
        {visibleTopics.map((topic) => (
          <button
            key={topic}
            onClick={(e) => {
              e.stopPropagation(); // don't trigger the card's modal
              onTopicClick?.(topic);
            }}
            className="px-1.5 py-0.5 rounded text-[0.6rem] font-medium
                     bg-white/20 text-white/90 backdrop-blur-sm
                     hover:bg-primary hover:text-white
                     transition-colors duration-150 cursor-pointer"
          >
            {topic}
          </button>
        ))}
        {extraCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                role="listitem"
                aria-label={`${extraCount} weitere Schlagwörter: ${hiddenTopics.join(", ")}`}
                className="inline-flex items-center h-[18px] px-1.5
                           text-[0.55rem] font-medium text-white cursor-pointer
                           bg-secondary/50 hover:bg-secondary/70
                           backdrop-blur-sm border border-white/15 rounded-full
                           transition-colors"
              >
                +{extraCount}
              </span>
            </TooltipTrigger>
            <TooltipContent>{hiddenTopics.join(", ")}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
});

export default TopicChips;
