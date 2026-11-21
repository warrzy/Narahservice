"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { company, navLinks } from "@/config/company";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl, isWhatsAppConfigured } from "@/lib/whatsapp";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const primaryPhone = company.phones[0];
  const wa = buildWhatsAppUrl();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  const solid = scrolled || open || pathname !== "/";

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "bg-narah-deep/95 backdrop-blur-md shadow-[0_10px_40px_rgba(6,59,43,0.25)]"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="container-narah flex h-[4.5rem] items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="relative z-50 focus-ring shrink-0" aria-label="NARAH SERVICE — Accueil">
          <Image
            src="/images/brand/logo-placeholder.svg"
            alt="NARAH SERVICE — logo provisoire à remplacer"
            width={168}
            height={44}
            priority
            className="h-10 w-auto lg:h-11"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "px-3 py-2 text-[0.7rem] font-bold tracking-[0.14em] uppercase transition-colors focus-ring",
                  active ? "text-narah-gold" : "text-white/80 hover:text-white",
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
            className="inline-flex items-center gap-2 text-white/90 text-sm font-semibold hover:text-narah-gold transition-colors focus-ring"
          >
            <Phone className="size-4" aria-hidden />
            {primaryPhone.display}
          </a>
          <Button href="/contact" variant="gold" className="!py-2.5 !px-5">
            Devis
          </Button>
        </div>

        <button
          type="button"
          className="lg:hidden relative z-50 inline-flex size-11 items-center justify-center text-white focus-ring"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={[
          "lg:hidden fixed inset-0 z-40 bg-narah-deep transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-y-0" : "-translate-y-full pointer-events-none",
        ].join(" ")}
      >
        <div className="flex h-full flex-col px-[var(--gutter)] pt-28 pb-10">
          <nav className="flex flex-col gap-2" aria-label="Navigation mobile">
            {navLinks.map((link, i) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={[
                    "font-display text-3xl sm:text-4xl py-2 transition-colors focus-ring",
                    active ? "text-narah-gold" : "text-white",
                  ].join(" ")}
                  style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4 border-t border-white/10 pt-8">
            <p className="text-white/50 text-xs tracking-[0.2em] uppercase">Contact rapide</p>
            <div className="flex flex-col gap-3">
              {company.phones.map((phone) => (
                <a
                  key={phone.id}
                  href={`tel:${phone.e164}`}
                  className="inline-flex items-center gap-3 text-white text-lg font-semibold focus-ring"
                >
                  <Phone className="size-5 text-narah-gold" aria-hidden />
                  {phone.display}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button href="/contact" variant="gold" className="w-full" onClick={closeMenu}>
                Demander un devis
              </Button>
              {isWhatsAppConfigured() && wa ? (
                <Button href={wa} variant="outline-light" className="w-full" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
                  WhatsApp
                </Button>
              ) : null}
            </div>
            <p className="text-white/40 text-xs pt-2">{company.slogan}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
