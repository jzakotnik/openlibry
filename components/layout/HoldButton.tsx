import { Button, Tooltip } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

interface HoldButtonProps {
  onClick: any;
  duration: number;
  buttonLabel: string;
}

const HoldButton: React.FC<HoldButtonProps> = ({
  onClick,
  duration = 3,
  buttonLabel = "Löschen",
}) => {
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const holdDuration = duration; // some  seconds
  //console.log("Duration used", duration);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isHolding) {
      setProgress(0);
      const startTime = Date.now();

      timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const percentage = (elapsedTime / holdDuration) * 100;
        setProgress(percentage);

        if (elapsedTime >= holdDuration) {
          if (timer) clearInterval(timer);
          setProgress(100);
          onClick();
          setIsHolding(false);
        }
      }, 50);
    } else {
      if (timer) clearInterval(timer);
      setProgress(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isHolding, onClick, holdDuration]);

  // Handlers
  const startHold = useCallback(() => setIsHolding(true), []);
  const stopHold = useCallback(() => setIsHolding(false), []);

  return (
    <Tooltip
      arrow
      placement="top"
      enterDelay={400}
      enterNextDelay={200}
      title="Zum Ausführen gedrückt halten"
      describeChild
    >
      <Button
        color="error"
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        sx={{
          position: "relative",
          width: "200px",
          height: "50px",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.5)", // Semi-transparent white fill
            transition: isHolding ? "none" : "width 0.3s ease-out",
          },
        }}
      >
        {buttonLabel}
      </Button>
    </Tooltip>
  );
};

export default HoldButton;
