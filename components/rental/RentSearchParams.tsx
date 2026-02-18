import React, { useEffect } from "react";

interface RentSearchParamsType {
  overdue: boolean;
  grade: string[];
  setUserSearchInput: (value: string) => void;
}

export default function RentSearchParams({
  overdue,
  grade,
  setUserSearchInput,
}: RentSearchParamsType) {
  const [isOverdue, setIsOverdue] = React.useState(overdue);
  const [selectedGrade, setSelectedGrade] = React.useState<string>(grade[0]);

  useEffect(() => {
    setUserSearchInput(
      (isOverdue ? "fällig? " : " ") +
        (selectedGrade !== "" ? "klasse?" + selectedGrade : " "),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setState is stable
  }, [isOverdue, selectedGrade]);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-row items-center gap-4">
        {/* Overdue checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
          <input
            type="checkbox"
            checked={isOverdue}
            onChange={(e) => setIsOverdue(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary
                       focus:ring-2 focus:ring-primary/20 focus:ring-offset-0"
          />
          Überfällig
        </label>

        {/* Grade select */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="grade-select"
            className="text-xs font-medium text-muted-foreground"
          >
            Klasse
          </label>
          <select
            id="grade-select"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="h-9 rounded-md border border-border bg-card px-3 text-sm
                       text-foreground
                       focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {grade.map((g, index) => (
              <option key={index} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
