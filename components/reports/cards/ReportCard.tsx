import { useRouter } from "next/router";

type ReportCardProps = {
  title: string;
  subtitle: string;
  unit: string;
  link: string;
  totalNumber: number;
};

export default function ReportCard({
  title,
  subtitle,
  unit,
  link,
  totalNumber,
}: ReportCardProps) {
  const router = useRouter();
  const dataCy = `report-card-${unit}`;

  return (
    <div
      className="
        group min-w-[275px] min-h-[210px] rounded-2xl overflow-hidden
        shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)]
        transition-all duration-200 ease-out
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)]
        hover:-translate-y-0.5
        bg-white
      "
      data-cy={dataCy}
    >
      {/* Accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-secondary to-secondary/50" />

      {/* Content */}
      <div className="px-4 pt-3 pb-1">
        <h3
          className="text-lg font-semibold text-muted-foreground mb-3"
          data-cy={`${dataCy}-title`}
        >
          {title}
        </h3>

        <div className="flex items-baseline gap-2 mb-1">
          <span
            className="text-3xl font-bold text-primary leading-tight"
            data-cy={`${dataCy}-count`}
          >
            {totalNumber.toLocaleString("de-DE")}
          </span>
          <span className="text-sm font-medium text-disabled">{unit}</span>
        </div>

        <p
          className="text-sm text-disabled leading-relaxed"
          data-cy={`${dataCy}-subtitle`}
        >
          {subtitle}
        </p>
      </div>

      {/* Action */}
      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={() => router.push(link)}
          data-cy={`${dataCy}-button`}
          className="
            text-sm font-semibold text-primary
            px-3 py-1.5 rounded-lg
            hover:bg-primary/5
            transition-colors cursor-pointer
          "
        >
          Erzeuge Tabelle
        </button>
      </div>
    </div>
  );
}
