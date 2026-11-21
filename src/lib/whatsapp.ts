import { company, type MaterialId, materials } from "@/config/company";

export function getWhatsAppNumber(): string {
  return company.whatsappNumber;
}

export function isWhatsAppConfigured(): boolean {
  return getWhatsAppNumber().length >= 8;
}

export function buildWhatsAppUrl(message?: string): string | null {
  const number = getWhatsAppNumber();
  if (!number) return null;
  const text = encodeURIComponent(message || company.whatsappDefaultMessage);
  return `https://wa.me/${number}?text=${text}`;
}

export function materialWhatsAppMessage(materialId: MaterialId): string {
  const material = materials.find((m) => m.id === materialId);
  const name = material?.name ?? "matériaux";
  return `Bonjour NARAH SERVICE, je souhaite obtenir un devis pour une livraison de ${name.toLowerCase()}.`;
}
