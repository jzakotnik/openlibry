import { Button, Typography } from "@mui/material";
import { useState } from "react";
import Barcode from "react-barcode";

import styles from "@/styles/grid.module.css";

import { BookType } from "@/entities/BookType";

type Rectangle = {
  book: BookType | null;
  status: "off" | "empty" | "full"; // 'off' for red, 'empty' for available space
};

type PrintLabelSelectProps = {
  initialIds: BookType[];
  rows: number;
  columns: number;
  link: string;
  startLabel: number;
  startId: number;
  endId: number;
  start: number;
  end: number;
  idFilter: number | number[];
  topicsFilter: any;
  rectangleWidth?: string;
  rectangleHeight?: string;
};

export default function PrintLabelSelect({
  initialIds,
  rows,
  columns,
  link,
  startLabel,
  idFilter,
  startId,
  endId,
  start,
  end,
  topicsFilter,
  rectangleWidth = "7cm",
  rectangleHeight = "3cm",
}: PrintLabelSelectProps) {
  const [idButtons, setIdButtons] = useState(initialIds);
  const itemsPerPage = rows * columns;
  const [grid, setGrid] = useState<Rectangle[]>(
    Array(itemsPerPage).fill({ book: null, status: "empty" })
  );

  // Handle click on rectangle
  const handleLeftClick = (index: number) => {
    const newGrid = [...grid];
    if (newGrid[index].status === "off") return; // Can't interact with red boxes

    // If a rectangle already has an ID, remove it and move back to the ID box
    if (newGrid[index].book != null) {
      setIdButtons([...idButtons, newGrid[index].book as BookType]);
      newGrid[index] = { book: null, status: "empty" };
    } else {
      if (idButtons.length === 0) return; // No IDs to move
      const newId = idButtons[0];
      newGrid[index] = { book: newId, status: "full" }; // Assign the first ID from the list to the rectangle
      setIdButtons(idButtons.slice(1)); // Remove the assigned ID from the list
    }

    setGrid(newGrid);
  };

  // Handle right-click on rectangle to mark it as 'off' (red)
  const handleRightClick = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    const newGrid = [...grid];

    if (newGrid[index].book != null) {
      setIdButtons([...idButtons, newGrid[index].book as BookType]);
      newGrid[index] = { book: null, status: "empty" };
    }

    newGrid[index] = {
      ...newGrid[index],
      status: grid[index].status === "off" ? "empty" : "off",
    }; // Mark as 'off' (red)
    setGrid(newGrid);
  };

  // Auto arrange IDs in the grid, skipping 'off' rectangles
  const handleAutoArrange = () => {
    const newGrid = [...grid];
    let idIndex = 0;

    for (let i = 0; i < newGrid.length && idIndex < idButtons.length; i++) {
      if (newGrid[i].status !== "off" && newGrid[i].book === null) {
        newGrid[i] = { book: idButtons[idIndex], status: "empty" };
        idIndex++;
      }
    }

    setGrid(newGrid);
    setIdButtons(idButtons.slice(idIndex)); // Remove distributed IDs from the top box
  };

  const handleCreatePdf = () => {
    const skipLabels = grid
      .map((e, index) => (e.status === "off" ? `block=${index}` : ""))
      .filter((e) => e !== "");

    const params = new URLSearchParams();

    if (startLabel > 0) {
      params.append("start", "0");
      params.append("end", Math.floor(startLabel).toString());
    }

    if (startId > 0 || endId > 0) {
      params.append("startId", startId.toString());
      params.append("endId", endId.toString());
    }

    if (start > 0 || end > 0) {
      params.append("start", start.toString());
      params.append("end", end.toString());
    }

    if (idFilter) {
      params.append("id", idFilter.toString());
    }

    if (topicsFilter) {
      params.append("topic", topicsFilter);
    }

    // Add skip labels
    skipLabels.forEach((label) => {
      const [key, value] = label.split("=");
      params.append(key, value);
    });

    window.open(`${link}/?${params.toString()}`, "_blank");
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div>
          <h2>Label anklicken, die beim Druck übersprungen werden sollen</h2>
        </div>
        <div>
          <Button
            className={styles.autoArrangeButton}
            size="small"
            onClick={handleCreatePdf}
          >
            Erzeuge PDF
          </Button>
        </div>
      </div>

      <div
        className={styles.grid}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, ${rectangleWidth})`,
          gridTemplateRows: `repeat(${rows}, ${rectangleHeight})`,
        }}
      >
        {grid.map((rect, index) => (
          <div
            key={index}
            className={`${styles.rect} ${
              rect.status === "off" ? styles.off : ""
            }`}
            onClick={(e) => handleRightClick(index, e)}
            onContextMenu={(e) => handleRightClick(index, e)}
            style={{
              width: rectangleWidth,
              height: rectangleHeight,
            }}
          >
            {rect.book && (
              <span>
                <Typography>
                  {rect.book.title.substring(0, 30) + "..."}
                </Typography>
                <Barcode
                  value={rect.book.id!.toString()}
                  height={40}
                  width={2.0}
                  fontOptions="400"
                  textMargin={4}
                  margin={2}
                />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
