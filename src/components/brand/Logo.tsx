import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  /** Variante compacte (header mobile) */
  compact?: boolean;
  /** Affiche le logo complet avec bandeau matériaux */
  full?: boolean;
  onNavigate?: () => void;
};

/**
 * Logo officiel NARAH SERVICE (fichiers client).
 * Sur fond sombre (header / menu), pastille blanche pour lisibilité.
 */
export function Logo({
  href = "/",
  className = "",
  compact = false,
  full = false,
  onNavigate,
}: LogoProps) {
  const src = full
    ? "/images/brand/logo-full.png"
    : "/images/brand/logo-header.png";
  const width = full ? 220 : compact ? 120 : 148;
  const height = full ? 146 : compact ? 80 : 98;

  const mark = (
    <span
      className={[
        "inline-flex items-center focus-ring rounded-sm bg-white",
        compact ? "p-1" : "p-1.5 sm:p-2",
        className,
      ].join(" ")}
      aria-label="NARAH SERVICE"
    >
      <Image
        src={src}
        alt="NARAH SERVICE — logo officiel"
        width={width}
        height={height}
        className="h-auto w-auto max-h-10 sm:max-h-12 object-contain"
        priority
      />
    </span>
  );

  if (!href) return mark;
  return (
    <Link href={href} className="relative z-[60] shrink-0" onClick={onNavigate}>
      {mark}
    </Link>
  );
}
