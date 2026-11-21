import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  compact?: boolean;
  onNavigate?: () => void;
};

/**
 * Wordmark + monogramme N — proposition provisoire.
 * À remplacer par le logo officiel client sans déformation.
 */
export function Logo({
  href = "/",
  className = "",
  compact = false,
  onNavigate,
}: LogoProps) {
  const mark = (
    <span
      className={["inline-flex items-center gap-2.5 sm:gap-3 focus-ring", className].join(" ")}
      aria-label="NARAH SERVICE — logo provisoire"
    >
      <span
        aria-hidden
        className={[
          "relative grid place-items-center shrink-0 rounded-sm",
          "bg-narah-gold text-narah-deep",
          compact ? "size-8" : "size-9 sm:size-10",
        ].join(" ")}
      >
        <svg viewBox="0 0 40 40" className="size-[70%]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 32V8h5.2l9.4 14.6V8H28v24h-5.2L13.4 17.4V32H8Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none min-w-0">
        <span
          className={[
            "font-display font-extrabold tracking-[0.1em] text-white",
            compact ? "text-base" : "text-lg sm:text-xl",
          ].join(" ")}
        >
          NARAH
        </span>
        <span
          className={[
            "font-sans font-bold tracking-[0.28em] text-[#b8e08a] uppercase",
            compact ? "text-[0.5rem]" : "text-[0.58rem] sm:text-[0.65rem]",
          ].join(" ")}
        >
          Service
        </span>
        <span className="sr-only"> — logo provisoire à valider par le client</span>
      </span>
    </span>
  );

  if (!href) return mark;
  return (
    <Link href={href} className="relative z-[60] shrink-0" onClick={onNavigate}>
      {mark}
    </Link>
  );
}
