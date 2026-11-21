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
 * Logo officiel NARAH SERVICE — PNG à fond réellement transparent (canal alpha).
 * Aucun background CSS (ni noir ni blanc) : le logo se fond dans le header.
 */
export function Logo({
  href = "/",
  className = "",
  compact = false,
  full = false,
  onNavigate,
}: LogoProps) {
  // Noms de fichiers dédiés pour forcer le rechargement après correction transparence
  const src = full
    ? "/images/brand/logo-official.png"
    : "/images/brand/logo-header.png";
  const width = full ? 320 : compact ? 148 : 176;
  const height = full ? 232 : compact ? 108 : 128;

  const mark = (
    <span
      className={[
        "inline-flex items-center focus-ring bg-transparent",
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
          "h-auto w-auto object-contain bg-transparent",
          full ? "max-h-40 sm:max-h-48" : compact ? "max-h-12" : "max-h-[3.25rem] sm:max-h-16",
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
