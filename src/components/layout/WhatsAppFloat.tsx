"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, isWhatsAppConfigured } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  if (!isWhatsAppConfigured()) return null;

  const href = buildWhatsAppUrl();
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter NARAH SERVICE sur WhatsApp"
      className="fixed z-40 bottom-24 right-4 sm:bottom-6 sm:right-6 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_rgba(37,211,102,0.45)] hover:scale-105 active:scale-95 transition-transform focus-ring"
    >
      <MessageCircle className="size-7" aria-hidden fill="currentColor" />
    </a>
  );
}
