import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  /** Variante compacte (header mobile) */
  compact?: boolean;
  /** Affiche le logo complet (camion + bandeau matériaux) */
  full?: boolean;
  onNavigate?: () => void;
};

/**
 * Logo officiel NARAH SERVICE (camion + sable/granite, fond noir).
 * Le fond noir fait partie de l’identité — pas de pastille blanche.
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
  const width = full ? 280 : compact ? 132 : 160;
  const height = full ? 187 : compact ? 88 : 107;

  const mark = (
    <span
      className={[
        "inline-flex items-center focus-ring overflow-hidden rounded-sm bg-black shadow-sm shadow-black/30",
        compact ? "p-0.5" : "p-0.5 sm:p-1",
        className,
      ].join(" ")}
      aria-label="NARAH SERVICE"
    >
      <Image
        src={src}
        alt="NARAH SERVICE — sable, granite, matériaux de construction"
        width={width}
        height={height}
        className={[
          "h-auto w-auto object-contain",
          full ? "max-h-36 sm:max-h-44" : "max-h-11 sm:max-h-14",
        ].join(" ")}
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
