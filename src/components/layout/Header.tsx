"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Phone } from "lucide-react";
import { company, navLinks } from "@/config/company";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { buildWhatsAppUrl, isWhatsAppConfigured } from "@/lib/whatsapp";

function subscribe() {
  return () => {};
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const primaryPhone = company.phones[0];
  const wa = buildWhatsAppUrl();
  const menuId = useId();
  const panelCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    queueMicrotask(() => panelCloseRef.current?.focus());
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const closeMenu = () => setOpen(false);
  const solid = scrolled || open || pathname !== "/";

  const mobilePanel =
    mounted &&
    createPortal(
      <div
        id={menuId}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        className={[
          "lg:hidden fixed top-0 left-0 right-0 bottom-0 z-[200] flex h-dvh w-screen flex-col bg-narah-deep",
          "transition-[opacity,visibility] duration-300 ease-out",
          open
            ? "visible opacity-100 pointer-events-auto"
            : "invisible opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div className="flex h-[4.25rem] sm:h-[4.5rem] items-center justify-between px-[var(--gutter)] border-b border-white/15 shrink-0 bg-narah-deep">
          <Logo onNavigate={closeMenu} />
          <button
            type="button"
            ref={panelCloseRef}
            className="inline-flex size-12 items-center justify-center text-white focus-ring rounded-sm border border-white/30 bg-white/10"
            aria-label="Fermer le menu"
            onClick={closeMenu}
          >
            <span className="relative block size-5" aria-hidden>
              <span className="absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 rotate-45 bg-white" />
              <span className="absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 -rotate-45 bg-white" />
            </span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-narah-deep px-[var(--gutter)] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
          <nav className="flex flex-col gap-1" aria-label="Navigation mobile">
            {navLinks.map((link, i) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={[
                    "font-display text-[1.75rem] leading-tight sm:text-4xl py-3.5 border-b border-white/15",
                    "transition-[color,transform,opacity] duration-300 ease-out focus-ring",
                    active ? "text-narah-gold" : "text-white",
                    open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                  ].join(" ")}
                  style={
                    {
                      transitionDelay: open ? `${80 + i * 45}ms` : "0ms",
                    } as CSSProperties
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 space-y-5">
            <p className="text-narah-gold text-[0.65rem] font-bold tracking-[0.22em] uppercase">
              Appeler
            </p>
            <div className="flex flex-col gap-2">
              {company.phones.map((phone) => (
                <a
                  key={phone.id}
                  href={`tel:${phone.e164}`}
                  className="inline-flex min-h-12 items-center gap-3 rounded-sm bg-white/10 px-4 py-3 text-white text-base font-semibold border border-white/15 hover:bg-white/15 focus-ring"
                >
                  <Phone className="size-5 shrink-0 text-narah-gold" aria-hidden />
                  <span className="tracking-wide">{phone.display}</span>
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button href="/contact" variant="gold" className="w-full !min-h-12" onClick={closeMenu}>
                Demander un devis
              </Button>
              {isWhatsAppConfigured() && wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-white/35 bg-transparent px-5 text-[0.72rem] font-bold tracking-[0.16em] uppercase text-white hover:bg-white/10 focus-ring"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp
                  <span className="sr-only"> (provisoire — activation à confirmer)</span>
                </a>
              ) : null}
            </div>

            {company.email ? (
              <a
                href={`mailto:${company.email}`}
                className="block text-sm text-white/75 hover:text-white focus-ring break-all"
                onClick={closeMenu}
              >
                {company.email}
              </a>
            ) : null}

            <p className="text-white/50 text-xs leading-relaxed pt-1">{company.slogan}</p>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-[100] transition-[background-color,box-shadow] duration-300",
        solid
          ? "bg-narah-deep shadow-[0_8px_32px_rgba(6,59,43,0.35)]"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="container-narah flex h-[4.25rem] items-center justify-between gap-3 sm:h-[4.5rem] lg:h-20">
        <Logo onNavigate={closeMenu} />

        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "px-3 py-2 text-[0.7rem] font-bold tracking-[0.14em] uppercase transition-colors focus-ring",
                  active ? "text-narah-gold" : "text-white/85 hover:text-white",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href={`tel:${primaryPhone.e164}`}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold hover:text-narah-gold transition-colors focus-ring"
          >
            <Phone className="size-4 text-narah-gold" aria-hidden />
            {primaryPhone.display}
          </a>
          <Button href="/contact" variant="gold" className="!min-h-11 !py-2.5 !px-5">
            Devis
          </Button>
        </div>

        <button
          type="button"
          className={[
            "lg:hidden relative z-[110] inline-flex size-12 shrink-0 items-center justify-center",
            "text-white focus-ring rounded-sm",
            "bg-white/10 border border-white/25",
          ].join(" ")}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Fermer" : "Menu"}</span>
          <span className="relative block size-5" aria-hidden>
            <span
              className={[
                "absolute left-0 block h-0.5 w-5 bg-white transition-all duration-300 ease-out",
                open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-1",
              ].join(" ")}
            />
            <span
              className={[
                "absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 bg-white transition-all duration-300 ease-out",
                open ? "opacity-0 scale-x-0" : "opacity-100",
              ].join(" ")}
            />
            <span
              className={[
                "absolute left-0 block h-0.5 w-5 bg-white transition-all duration-300 ease-out",
                open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-1",
              ].join(" ")}
            />
          </span>
        </button>
      </div>

      {mobilePanel}
    </header>
  );
}
