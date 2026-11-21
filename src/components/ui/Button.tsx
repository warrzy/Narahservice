import Link from "next/link";
import { type ComponentProps, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "gold" | "ghost" | "outline-light";

const variants: Record<Variant, string> = {
  primary:
    "bg-narah-emerald text-white hover:bg-[#0a9653] shadow-[0_10px_30px_rgba(8,127,70,0.25)]",
  secondary:
    "bg-narah-deep text-white hover:bg-[#0a4d39]",
  gold:
    "bg-narah-gold text-narah-deep hover:bg-[#ffd24a]",
  ghost:
    "bg-transparent text-narah-deep hover:bg-narah-deep/5 border border-narah-deep/20",
  "outline-light":
    "bg-transparent text-white border border-white/40 hover:bg-white/10 hover:border-white",
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
    "group inline-flex items-center justify-center gap-2 px-6 py-3.5",
    "text-[0.72rem] sm:text-xs font-bold tracking-[0.16em] uppercase",
    "transition-all duration-300 ease-out",
    "active:scale-[0.98] focus-ring",
    "disabled:opacity-60 disabled:pointer-events-none",
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
