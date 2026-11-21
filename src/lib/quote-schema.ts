import { z } from "zod";

export const materialOptions = ["sable", "granite", "laterite", "plusieurs", "autre"] as const;

export const quoteSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Veuillez indiquer votre nom complet.")
    .max(120, "Nom trop long."),
  phone: z
    .string()
    .trim()
    .min(8, "Numéro de téléphone invalide.")
    .max(30, "Numéro trop long.")
    .regex(/^[\d\s+().-]{8,30}$/, "Format de téléphone invalide."),
  email: z
    .string()
    .trim()
    .email("Adresse e-mail invalide.")
    .optional()
    .or(z.literal("")),
  material: z.enum(materialOptions, {
    message: "Sélectionnez un type de matériau.",
  }),
  quantity: z
    .string()
    .trim()
    .min(1, "Indiquez la quantité souhaitée.")
    .max(80, "Quantité trop longue."),
  unit: z.string().trim().max(40).optional().or(z.literal("")),
  deliveryLocation: z
    .string()
    .trim()
    .min(2, "Indiquez le lieu de livraison.")
    .max(200, "Lieu trop long."),
  preferredDate: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000, "Message trop long.").optional().or(z.literal("")),
  consent: z.literal(true, {
    message: "Vous devez accepter l'utilisation de vos données.",
  }),
  /** Honeypot antispam — doit rester vide */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;
