import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { quoteSchema } from "@/lib/quote-schema";
import { rateLimit } from "@/lib/rate-limit";
import { company } from "@/config/company";

export const runtime = "nodejs";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_TO,
  );
}

/** Statut SMTP public — sans accepter de données formulaire. */
export async function GET() {
  return NextResponse.json({
    smtpConfigured: isSmtpConfigured(),
  });
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`devis:${ip}`, 5, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Trop de demandes. Réessayez dans ${limited.retryAfterSec} secondes.`,
        },
        { status: 429 },
      );
    }

    // Ne pas lire le corps si SMTP inactif : aucune donnée formulaire n'est alors reçue/traitée.
    if (!isSmtpConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          configured: false,
          error:
            "L'envoi d'e-mails n'est pas encore configuré sur le serveur. Utilisez WhatsApp ou téléphone.",
        },
        { status: 503 },
      );
    }

    const body: unknown = await request.json();
    const parsed = quoteSchema.safeParse(body);

    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message || "Données invalides.";
      return NextResponse.json({ ok: false, error: first }, { status: 400 });
    }

    const data = parsed.data;

    // Honeypot
    if (data.website && data.website.length > 0) {
      return NextResponse.json({ ok: true, emailSent: true });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const materialLabel: Record<string, string> = {
      sable: "Sable",
      granite: "Granite",
      laterite: "Latérite",
      plusieurs: "Plusieurs matériaux",
      autre: "Autre",
    };

    const subject = `[Devis] ${data.fullName} — ${materialLabel[data.material] || data.material}`;
    const text = [
      `Nouvelle demande de devis — ${company.name}`,
      "",
      `Nom : ${data.fullName}`,
      `Téléphone : ${data.phone}`,
      `E-mail : ${data.email || "Non renseigné"}`,
      `Matériau : ${materialLabel[data.material] || data.material}`,
      `Quantité : ${data.quantity}${data.unit ? ` ${data.unit}` : ""}`,
      `Lieu de livraison : ${data.deliveryLocation}`,
      `Date souhaitée : ${data.preferredDate || "Non renseignée"}`,
      "",
      "Message :",
      data.message || "(aucun)",
      "",
      `Consentement données : oui`,
      `IP : ${ip}`,
    ].join("\n");

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.MAIL_TO,
      replyTo: data.email || undefined,
      subject,
      text,
    });

    return NextResponse.json({ ok: true, emailSent: true });
  } catch (error) {
    console.error("[api/devis]", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Erreur lors de l'envoi e-mail. Votre demande WhatsApp n'est pas affectée.",
      },
      { status: 500 },
    );
  }
}
