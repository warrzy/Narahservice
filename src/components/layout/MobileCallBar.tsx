"use client";

import { Phone } from "lucide-react";
import Link from "next/link";
import { company } from "@/config/company";

/**
 * Barre mobile fixe : Appeler + Devis.
 * Pas de 2ᵉ bouton flottant WhatsApp (lien disponible dans Contact / menu).
 */
export function MobileCallBar() {
  const phone = company.phones[0];

  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 mobile-cta-bar bg-narah-deep border-t border-white/15">
      <div className="grid grid-cols-2 gap-2 p-2.5">
        <a
          href={`tel:${phone.e164}`}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-narah-emerald text-white py-3.5 text-[0.68rem] font-bold tracking-[0.14em] uppercase focus-ring touch-manipulation"
        >
          <Phone className="size-4" aria-hidden />
          Appeler
        </a>
        <Link
          href="/contact"
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-narah-gold text-narah-deep py-3.5 text-[0.68rem] font-bold tracking-[0.14em] uppercase focus-ring touch-manipulation"
        >
          Devis
        </Link>
      </div>
    </div>
  );
}
