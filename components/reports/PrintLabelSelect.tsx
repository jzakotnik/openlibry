import { Button } from "@/components/ui/button";
import { BookType } from "@/entities/BookType";
import { useState } from "react";
import Barcode from "react-barcode";

type Rectangle = {
  book: BookType | null;
  status: "off" | "empty" | "full";
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
  const [idButtons, setIdButtons] = useState(initialIds ?? []);
  const itemsPerPage = rows * columns;
  const [grid, setGrid] = useState<Rectangle[]>(
    Array.from({ length: itemsPerPage }, () => ({
      book: null,
      status: "empty" as const,
    })),
  );

  const handleLeftClick = (index: number) => {
    const newGrid = [...grid];
    if (newGrid[index].book != null) {
      setIdButtons([...idButtons, newGrid[index].book as BookType]);
      newGrid[index] = { book: null, status: "empty" };
    }

    newGrid[index] = {
      ...newGrid[index],
      status: grid[index].status === "off" ? "empty" : "off",
    };

    setGrid(newGrid);
  };

  // toogle up to right click
  const handleRightClick = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    const newGrid = [...grid];

    const newStatus = grid[index].status === "off" ? "empty" : "off";

    for (let i = 0; i <= index; i++) {
      if (newGrid[i].book != null) {
        setIdButtons((prev) => [...prev, newGrid[i].book as BookType]);
      }
      newGrid[i] = {
        book: null,
        status: newStatus,
      };
    }

    setGrid(newGrid);
  };

  const handleAutoArrange = () => {
    const newGrid = [...grid];
    let idIndex = 0;

    for (let i = 0; i < newGrid.length && idIndex < idButtons.length; i++) {
      if (newGrid[i].status !== "off" && newGrid[i].book === null) {
        newGrid[i] = { book: idButtons[idIndex], status: "full" };
        idIndex++;
      }
    }

    setGrid(newGrid);
    setIdButtons(idButtons.slice(idIndex));
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

    skipLabels.forEach((label) => {
      const [key, value] = label.split("=");
      params.append(key, value);
    });

    window.open(`${link}/?${params.toString()}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">
          Label anklicken, die beim Druck übersprungen werden sollen
        </h2>
        <div>
          <Button
            variant="default"
            size="default"
            onClick={handleCreatePdf}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md shadow-sm"
          >
            Erzeuge PDF
          </Button>
        </div>
      </div>

      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${columns}, ${rectangleWidth})`,
          gridTemplateRows: `repeat(${rows}, ${rectangleHeight})`,
        }}
      >
        {grid.map((rect, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center border rounded cursor-pointer transition-colors overflow-hidden ${rect.status === "off"
              ? "bg-red-200 border-red-400"
              : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            onClick={(e) => handleLeftClick(index)}
            onContextMenu={(e) => handleRightClick(index, e)}
          >
            {rect.book && (
              <span className="flex flex-col items-center">
                <p className="text-sm">
                  {rect.book.title.substring(0, 30) + "..."}
                </p>
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
