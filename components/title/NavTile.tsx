import { ReactNode } from "react";

interface NavTileProps {
  title: string;
  subtitle: string;
  slug: string;
  icon?: ReactNode;
  onClick: () => void;
}

export default function NavTile({
  title,
  subtitle,
  slug,
  icon,
  onClick,
}: NavTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cy={`index_${slug.substring(1)}_button`}
      className="
        group relative w-[220px] h-[180px]
        flex flex-col items-center justify-center text-center
        p-6 rounded-2xl cursor-pointer overflow-hidden
        bg-white/85 backdrop-blur-xl
        border border-primary/15
        shadow-[0_8px_32px_rgba(18,85,111,0.15)]
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        hover:-translate-y-2
        hover:shadow-[0_16px_48px_rgba(18,85,111,0.25)]
        hover:border-primary/30
        active:-translate-y-1
      "
    >
      {/* Top accent bar — visible on hover */}
      <span
        className="
          absolute top-0 left-0 right-0 h-1
          bg-gradient-to-r from-primary to-primary-light
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        "
      />

      {/* Icon */}
      {icon && (
        <span
          className="
            flex items-center justify-center
            w-14 h-14 rounded-xl mb-3
            bg-primary/10 text-primary-dark
            transition-all duration-300
            group-hover:scale-110 group-hover:text-primary
          "
        >
          {icon}
        </span>
      )}

      {/* Title */}
      <span
        className="
          text-lg font-semibold text-primary-dark
          mb-1 transition-colors duration-300
          group-hover:text-primary
        "
      >
        {title}
      </span>

      {/* Subtitle */}
      <span className="text-sm text-muted-foreground leading-snug">
        {subtitle}
      </span>
    </button>
  );
}
