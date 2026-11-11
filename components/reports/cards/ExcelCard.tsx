import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMetas } from "@/lib/spreadsheet/formats";
import { t } from "@/lib/i18n";
import { Download, Upload } from "lucide-react";
import { useEffect, useState } from "react";

interface ExcelCardProps {
  dataCy?: string;
}

const STORAGE_KEY = "openlibry.exportFormat";

export default function ExcelCard({ dataCy = "excel-card" }: ExcelCardProps) {
  const [format, setFormat] = useState(formatMetas[0].id);

  // Remember the last used format (per browser); ignore storage failures.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && formatMetas.some((f) => f.id === saved)) setFormat(saved);
    } catch {}
  }, []);

  const onFormatChange = (value: string) => {
    setFormat(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
  };

  return (
    <div
      className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-4"
      data-cy={dataCy}
    >
      <div>
        <h3 className="text-base font-semibold leading-none tracking-tight">
          {t("excelCard.title")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5">
          {t("excelCard.subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <div className="flex gap-2">
          <a
            href={`api/export?format=${format}`}
            data-cy="excel-export-button"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download size={15} />
            {t("excelCard.exportButton")}
          </a>
          {formatMetas.length > 1 && (
            <Select value={format} onValueChange={onFormatChange}>
              <SelectTrigger
                aria-label={t("excelCard.formatLabel")}
                data-cy="export-format-select"
                className="w-auto"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatMetas.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <a
          href="reports/xlsimport"
          data-cy="excel-import-button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Upload size={15} />
          {t("excelCard.importButton")}
        </a>
      </div>
    </div>
  );
}
