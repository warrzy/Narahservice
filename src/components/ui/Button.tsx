import Link from "next/link";
import { type ComponentProps, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "gold" | "ghost" | "outline-light";

const variants: Record<Variant, string> = {
  primary:
    "bg-narah-emerald text-white hover:bg-[#0a9653] active:bg-[#087a42] shadow-[0_8px_24px_rgba(8,127,70,0.28)]",
  secondary: "bg-narah-deep text-white hover:bg-[#0a4d39] active:bg-[#083d2e]",
  gold: "bg-narah-gold text-narah-deep hover:bg-[#ffd24a] active:bg-[#e6b520]",
  ghost:
    "bg-transparent text-narah-deep hover:bg-narah-deep/5 border border-narah-deep/25 active:bg-narah-deep/10",
  "outline-light":
    "bg-transparent text-white border-2 border-white/70 hover:bg-white/12 hover:border-white active:bg-white/18",
};

type Common = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: ReactNode;
};

type ButtonAsButton = Common &
  Omit<ComponentProps<"button">, "children" | "className"> & { href?: undefined };

type ButtonAsLink = Common &
  Omit<ComponentProps<typeof Link>, "children" | "className"> & { href: string };

export function Button({
  children,
  variant = "primary",
  className = "",
  icon,
  ...props
}: ButtonAsButton | ButtonAsLink) {
  const classes = [
    "group inline-flex items-center justify-center gap-2",
    "min-h-12 px-6 py-3.5",
    "text-[0.72rem] sm:text-xs font-bold tracking-[0.16em] uppercase",
    "transition-[background-color,border-color,color,transform,box-shadow] duration-300 ease-out",
    "active:scale-[0.98] focus-ring",
    "disabled:opacity-60 disabled:pointer-events-none",
    "touch-manipulation",
    variants[variant],
    className,
  ].join(" ");

  if ("href" in props && props.href) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        <span>{children}</span>
        {icon}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      <span>{children}</span>
      {icon}
    </button>
  );
}
