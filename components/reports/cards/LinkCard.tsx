import { useRouter } from "next/router";
import type { ReactNode } from "react";

type LinkCardProps = {
  title: string;
  subtitle: string;
  buttonTitle: string;
  link: string;
  dataCy?: string;
  icon?: ReactNode;
};

export default function LinkCard({
  title,
  subtitle,
  buttonTitle,
  link,
  dataCy,
  icon,
}: LinkCardProps) {
  const router = useRouter();

  return (
    <div
      className="
        min-w-[275px] min-h-[210px] rounded-2xl overflow-hidden bg-white
        shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)]
        transition-all duration-200 ease-out
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)]
        hover:-translate-y-0.5
      "
      data-cy={dataCy}
    >
      {/* Accent bar — primary */}
      <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/50" />

      {/* Content */}
      <div className="px-4 pt-3 pb-1">
        {icon && (
          <span
            className="
              inline-flex items-center justify-center
              size-10 rounded-[10px] mb-2
              bg-primary/5 text-primary
            "
          >
            {icon}
          </span>
        )}
        <h3
          className="text-lg font-semibold text-muted-foreground mb-1"
          data-cy={`${dataCy}-title`}
        >
          {title}
        </h3>
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
          {buttonTitle}
        </button>
      </div>
    </div>
  );
}
