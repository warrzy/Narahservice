"use client";

import { Phone } from "lucide-react";
import Link from "next/link";
import { company } from "@/config/company";
import { buildWhatsAppUrl, isWhatsAppConfigured } from "@/lib/whatsapp";

export function MobileCallBar() {
  const phone = company.phones[0];
  const wa = buildWhatsAppUrl();

  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 mobile-cta-bar bg-narah-deep/95 backdrop-blur-md border-t border-white/10">
      <div className="grid grid-cols-2 gap-2 p-2">
        <a
          href={`tel:${phone.e164}`}
          className="inline-flex items-center justify-center gap-2 bg-narah-emerald text-white py-3.5 text-[0.68rem] font-bold tracking-[0.14em] uppercase focus-ring"
        >
          <Phone className="size-4" aria-hidden />
          Appeler
        </a>
        {isWhatsAppConfigured() && wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 text-[0.68rem] font-bold tracking-[0.14em] uppercase focus-ring"
          >
            WhatsApp
          </a>
        ) : (
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-narah-gold text-narah-deep py-3.5 text-[0.68rem] font-bold tracking-[0.14em] uppercase focus-ring"
          >
            Devis
          </Link>
        )}
      </div>
    </div>
  );
}
