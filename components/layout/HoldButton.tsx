import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface HoldButtonProps {
  onClick: () => void;
  duration?: number;
  buttonLabel?: string;
  "data-cy"?: string;
}

const HoldButton: React.FC<HoldButtonProps> = ({
  onClick,
  duration = 3000,
  buttonLabel = "Löschen",
  "data-cy": dataCy,
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const onClickRef = useRef(onClick);

  // Keep callback ref current without re-triggering the effect
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!isHolding) {
      setProgress(0);
      return;
    }

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = (elapsed / duration) * 100;
      setProgress(Math.min(percentage, 100));

      if (elapsed >= duration) {
        clearInterval(timer);
        onClickRef.current();
        setIsHolding(false);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [isHolding, duration]);

  const startHold = useCallback(() => setIsHolding(true), []);
  const stopHold = useCallback(() => setIsHolding(false), []);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            data-cy={dataCy}
            className="relative w-[200px] h-[50px] overflow-hidden"
          >
            <span
              className={`absolute left-0 top-0 h-full bg-white/50 ${
                isHolding ? "" : "transition-[width] duration-300 ease-out"
              }`}
              style={{ width: `${progress}%` }}
            />
            <span className="relative z-10">{buttonLabel}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          Zum Ausführen gedrückt halten
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HoldButton;
