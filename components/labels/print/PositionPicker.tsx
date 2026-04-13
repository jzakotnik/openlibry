/**
 * Visual grid to select which label positions on a sheet should be printed.
 *
 * Two modes:
 * - "start": Click a cell to set the start position (everything before is skipped)
 * - "pick":  Click individual cells to toggle them on/off
 *
 * The grid dimensions come from the selected SheetConfig.
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { LabelPosition } from "@/lib/labels/types";

type PickerMode = "start" | "pick";

interface PositionPickerProps {
  columns: number;
  rows: number;
  /** Currently selected positions (for "pick" mode) */
  positions: LabelPosition[];
  /** Currently selected start position (for "start" mode) */
  startPosition: LabelPosition | null;
  /** Current mode */
  mode: PickerMode;
  onModeChange: (mode: PickerMode) => void;
  onPositionsChange: (positions: LabelPosition[]) => void;
  onStartPositionChange: (pos: LabelPosition | null) => void;
}

export default function PositionPicker({
  columns,
  rows,
  positions,
  startPosition,
  mode,
  onModeChange,
  onPositionsChange,
  onStartPositionChange,
}: PositionPickerProps) {
  const handleCellClick = (row: number, col: number) => {
    if (mode === "start") {
      // Toggle: click same cell to clear, otherwise set
      if (startPosition?.row === row && startPosition?.col === col) {
        onStartPositionChange(null);
      } else {
        onStartPositionChange({ row, col });
      }
    } else {
      // Toggle individual cell
      const exists = positions.some((p) => p.row === row && p.col === col);
      if (exists) {
        onPositionsChange(
          positions.filter((p) => !(p.row === row && p.col === col)),
        );
      } else {
        onPositionsChange([...positions, { row, col }]);
      }
    }
  };

  const isCellActive = (row: number, col: number): boolean => {
    if (mode === "start") {
      if (!startPosition) return true; // All active if no start set
      const cellIndex = (row - 1) * columns + (col - 1);
      const startIndex =
        (startPosition.row - 1) * columns + (startPosition.col - 1);
      return cellIndex >= startIndex;
    } else {
      // In pick mode: active if in the positions list, or all active if list is empty
      if (positions.length === 0) return true;
      return positions.some((p) => p.row === row && p.col === col);
    }
  };

  const isCellStartMarker = (row: number, col: number): boolean => {
    if (mode !== "start" || !startPosition) return false;
    return startPosition.row === row && startPosition.col === col;
  };

  return (
    <div className="space-y-3">
      <Label>Startposition auf dem Bogen</Label>
      <RadioGroup
        value={mode}
        onValueChange={(v) => onModeChange(v as PickerMode)}
        className="flex gap-4"
      >
        <div className="flex items-center gap-1.5">
          <RadioGroupItem value="start" id="mode-start" />
          <Label htmlFor="mode-start" className="font-normal text-sm">
            Ab Position
          </Label>
        </div>
        <div className="flex items-center gap-1.5">
          <RadioGroupItem value="pick" id="mode-pick" />
          <Label htmlFor="mode-pick" className="font-normal text-sm">
            Einzelne Felder
          </Label>
        </div>
      </RadioGroup>

      {/* Grid */}
      <div
        className="inline-grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
        data-cy="position-picker-grid"
      >
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: columns }, (_, c) => {
            const row = r + 1;
            const col = c + 1;
            const active = isCellActive(row, col);
            const isStart = isCellStartMarker(row, col);

            return (
              <button
                key={`${row}-${col}`}
                type="button"
                onClick={() => handleCellClick(row, col)}
                className={`
                  w-10 h-7 rounded border text-xs font-mono transition-colors
                  ${
                    active
                      ? isStart
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                      : "bg-muted/50 border-border text-muted-foreground/40 hover:bg-muted"
                  }
                `}
                data-cy={`position-${row}-${col}`}
                title={`Zeile ${row}, Spalte ${col}`}
              >
                {row},{col}
              </button>
            );
          }),
        )}
      </div>

      {/* Status text */}
      <p className="text-xs text-muted-foreground">
        {mode === "start" && startPosition
          ? `Druck ab Zeile ${startPosition.row}, Spalte ${startPosition.col} (${
              (startPosition.row - 1) * columns + startPosition.col - 1
            } Felder übersprungen)`
          : mode === "pick" && positions.length > 0
            ? `${positions.length} Felder ausgewählt`
            : "Alle Felder werden bedruckt"}
      </p>
    </div>
  );
}
