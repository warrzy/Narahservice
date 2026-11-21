import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  compact?: boolean;
};

export function Logo({ href = "/", className = "", compact = false }: LogoProps) {
  const mark = (
    <span
      className={[
        "inline-flex items-center gap-3 focus-ring",
        className,
      ].join(" ")}
      aria-label="NARAH SERVICE — logo provisoire à remplacer"
    >
      <span
        aria-hidden
        className="block w-1.5 self-stretch min-h-9 bg-narah-gold shrink-0"
      />
      <span className="flex flex-col leading-none">
        <span
          className={[
            "font-display font-extrabold tracking-[0.12em] text-white",
            compact ? "text-lg" : "text-xl sm:text-2xl",
          ].join(" ")}
        >
          NARAH
        </span>
        <span
          className={[
            "font-sans font-bold tracking-[0.32em] text-narah-lime uppercase",
            compact ? "text-[0.55rem]" : "text-[0.62rem] sm:text-[0.68rem]",
          ].join(" ")}
        >
          Service
        </span>
        <span className="sr-only"> — emplacement provisoire du logo officiel</span>
      </span>
    </span>
  );

  if (!href) return mark;
  return (
    <Link href={href} className="relative z-50 shrink-0">
      {mark}
    </Link>
  );
}
