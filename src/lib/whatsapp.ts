import { company, type MaterialId, materials } from "@/config/company";
import type { QuoteFormData } from "@/lib/quote-schema";

const materialLabels: Record<string, string> = {
  sable: "Sable",
  granite: "Granite",
  laterite: "Latérite",
  plusieurs: "Plusieurs matériaux",
  autre: "Autre",
};

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

/** Message prérempli à partir du formulaire de devis (ouverture navigateur → WhatsApp). */
export function buildQuoteWhatsAppMessage(
  data: Pick<
    QuoteFormData,
    | "fullName"
    | "phone"
    | "email"
    | "material"
    | "quantity"
    | "unit"
    | "deliveryLocation"
    | "preferredDate"
    | "message"
  >,
): string {
  const lines = [
    "Bonjour NARAH SERVICE,",
    "Je souhaite obtenir un devis pour des matériaux de construction.",
    "",
    `Nom : ${data.fullName}`,
    `Téléphone : ${data.phone}`,
  ];
  if (data.email) lines.push(`E-mail : ${data.email}`);
  lines.push(
    `Matériau : ${materialLabels[data.material] || data.material}`,
    `Quantité : ${data.quantity}${data.unit ? ` ${data.unit}` : ""}`,
    `Lieu de livraison : ${data.deliveryLocation}`,
  );
  if (data.preferredDate) lines.push(`Date souhaitée : ${data.preferredDate}`);
  if (data.message) {
    lines.push("", "Message :", data.message);
  }
  return lines.join("\n");
}

/** Ouvre WhatsApp dans le geste utilisateur (évite le blocage popup). */
export function openWhatsAppFromUserGesture(url: string): Window | null {
  return window.open(url, "_blank", "noopener,noreferrer");
}
