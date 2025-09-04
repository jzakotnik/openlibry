
import { Button, Typography } from "@mui/material";
import { useState } from "react";
import Barcode from "react-barcode";

import styles from "@/styles/grid.module.css";

import { BookType } from "@/entities/BookType";


type Rectangle = {
    book: BookType | null;
    status: 'off' | 'empty' | 'full'; // 'off' for red, 'empty' for available space
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
}: PrintLabelSelectProps) {
    const [idButtons, setIdButtons] = useState(initialIds);
    const itemsPerPage = rows * columns;
    const [grid, setGrid] = useState<Rectangle[]>(Array(itemsPerPage).fill({ book: null, status: 'empty' }));

    // Fetch grid dimensions from environment variables
    const rectangleWidth = process.env.NEXT_PUBLIC_RECTANGLE_WIDTH || '7cm'; // Default to 7cm
    const rectangleHeight = process.env.NEXT_PUBLIC_RECTANGLE_HEIGHT || '3cm'; // Default to 3cm



    // Handle click on rectangle
    const handleLeftClick = (index: number) => {
        const newGrid = [...grid];
        if (newGrid[index].status === 'off') return; // Can't interact with red boxes

        // If a rectangle already has an ID, remove it and move back to the ID box
        if (newGrid[index].book != null) {
            setIdButtons([...idButtons, newGrid[index].book as BookType]);
            newGrid[index] = { book: null, status: 'empty' };
        } else {
            if (idButtons.length === 0) return; // No IDs to move
            const newId = idButtons[0];
            newGrid[index] = { book: newId, status: 'full' }; // Assign the first ID from the list to the rectangle
            setIdButtons(idButtons.slice(1)); // Remove the assigned ID from the list
        }

        setGrid(newGrid);
    };

    // Handle right-click on rectangle to mark it as 'off' (red)
    const handleRightClick = (index: number, event: React.MouseEvent) => {
        //TODO: element löschen wenn eines da ist
        event.preventDefault();
        const newGrid = [...grid];
        if (newGrid[index].book != null) {
            setIdButtons([...idButtons, newGrid[index].book as BookType]);
            newGrid[index] = { book: null, status: 'empty' };
        }

        newGrid[index] = { ...newGrid[index], status: grid[index].status == 'off' ? 'empty' : 'off' }; // Mark as 'off' (red)
        setGrid(newGrid);
    };



    // Auto arrange IDs in the grid, skipping 'off' rectangles
    const handleAutoArrange = () => {
        const newGrid = [...grid];
        let idIndex = 0;

        for (let i = 0; i < newGrid.length && idIndex < idButtons.length; i++) {
            if (newGrid[i].status !== 'off' && newGrid[i].book === null) {
                newGrid[i] = { book: idButtons[idIndex], status: 'empty' };
                idIndex++;
            }
        }

        setGrid(newGrid);
        setIdButtons(idButtons.slice(idIndex)); // Remove distributed IDs from the top box
    };

    const handleCreatePdf = () => {
        // const booksOnLabel = grid.filter((e) => e.book != null).map((rect, index) => "label_" + index + "=" + rect.book?.id);
        const skipLabels = grid.map((e, index) => e.status == "off" ? "block=" + index : '').filter((e) => e !== "");
        // const idList = idButtons.map((book) => "id=" + book.id);




        window.open(link +
            "/?" + (startLabel > 0 ? ("start=0" +
                "&end=" +
                Math.floor(startLabel!)) : '') +
            (startId > 0 || endId > 0 ? "&startId=" + startId + "&endId=" + endId : '')
            +
            (start > 0 || end > 0 ? "&start=" + start + "&end=" + end : '')
            +
            (idFilter ? "&id=" + idFilter : "") +
            (topicsFilter ? "&topic=" + topicsFilter : "") + "&" + skipLabels.join("&"), "_blank");
        // window.open("/api/report/booklabels?", "_blank");
    }


    return (<div className={styles.container}>
        <div className={styles.box}>
            <div>
                <h2>Label anklicken, die beim Druck übersprungen werden sollen</h2>
            </div>
            {/* <h2>Bücherlabel</h2>
            <div className={styles.idButtons}>
                {idButtons.map((b, index) => (
                    <button
                        key={index}
                        className={styles.idButton}
                        //     onClick={() => handleLeftClick(index)} // Placeholder for left-click
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        <Typography> {b.title.substring(0, 30) + "..."}</Typography>
                        <Barcode
                            value={b.id!.toString()}
                            height={40}
                            width={2.0}
                            fontOptions="400"
                            textMargin={4}
                            margin={2}
                        />
                    </button>
                ))}
            </div> */}
            <div>
                {/* <button className={styles.autoArrangeButton} onClick={handleAutoArrange}>
                            Auto-Arrange
                        </button> */}

                <Button className={styles.autoArrangeButton}
                    size="small"
                    onClick={handleCreatePdf}
                >
                    Erzeuge PDF
                </Button>
            </div>
        </div>

        <div className={styles.grid} style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, ${rectangleWidth})`,
            gridTemplateRows: `repeat(${rows}, ${rectangleHeight})`,
        }}>
            {grid.map((rect, index) => (
                <div
                    key={index}
                    className={`${styles.rect} ${rect.status === 'off' ? styles.off : ''}`}
                    // onClick={() => handleLeftClick(index)}
                    onClick={(e) => handleRightClick(index, e)}
                    onContextMenu={(e) => handleRightClick(index, e)}
                    style={{
                        width: rectangleWidth,
                        height: rectangleHeight
                    }}
                >
                    {rect.book && <span>
                        <Typography> {rect.book.title.substring(0, 30) + "..."}</Typography>
                        <Barcode
                            value={rect.book.id!.toString()}
                            height={40}
                            width={2.0}
                            fontOptions="400"
                            textMargin={4}
                            margin={2}
                        />
                    </span>}
                </div>
            ))}
        </div>
        {/* Grid Info Section */}
        {/* <div className={styles.gridInfo}>
            <h3>Grid Info:</h3>
            <pre>{JSON.stringify(grid, null, 2)}</pre>
        </div> */}

    </div>
    );
}