"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { quoteSchema, type QuoteFormData, materialOptions } from "@/lib/quote-schema";
import { Button } from "@/components/ui/Button";
import {
  buildQuoteWhatsAppMessage,
  buildWhatsAppUrl,
  isWhatsAppConfigured,
  openWhatsAppFromUserGesture,
} from "@/lib/whatsapp";

const materialLabels: Record<(typeof materialOptions)[number], string> = {
  sable: "Sable",
  granite: "Granite",
  laterite: "Latérite",
  plusieurs: "Plusieurs matériaux",
  autre: "Autre",
};

const WHATSAPP_READY_MESSAGE =
  "Votre message est prêt dans WhatsApp. Appuyez sur Envoyer pour transmettre votre demande.";

type WhatsAppStatus = "idle" | "ready" | "blocked";
type EmailStatus = "idle" | "sending" | "sent" | "unavailable" | "error";

export function QuoteForm() {
  const searchParams = useSearchParams();
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>("idle");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailError, setEmailError] = useState("");
  const [manualWhatsAppUrl, setManualWhatsAppUrl] = useState<string | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      material: undefined,
      quantity: "",
      unit: "",
      deliveryLocation: "",
      preferredDate: "",
      message: "",
      consent: undefined,
      website: "",
    },
  });

  useEffect(() => {
    const materiau = searchParams.get("materiau");
    if (materiau && materialOptions.includes(materiau as (typeof materialOptions)[number])) {
      setValue("material", materiau as QuoteFormData["material"]);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/devis", { method: "GET" });
        if (!res.ok) return;
        const json = (await res.json()) as { smtpConfigured?: boolean };
        if (!cancelled) setSmtpConfigured(Boolean(json.smtpConfigured));
      } catch {
        if (!cancelled) setSmtpConfigured(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sendEmailIndependently = async (data: QuoteFormData) => {
    setEmailStatus("sending");
    setEmailError("");
    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        configured?: boolean;
        emailSent?: boolean;
      };

      if (res.status === 503 || json.configured === false) {
        setEmailStatus("unavailable");
        return;
      }

      if (!res.ok) {
        setEmailStatus("error");
        setEmailError(
          json.error ||
            "L'e-mail n'a pas pu être envoyé. Votre demande WhatsApp n'est pas affectée.",
        );
        return;
      }

      setEmailStatus("sent");
    } catch {
      setEmailStatus("error");
      setEmailError(
        "L'e-mail n'a pas pu être envoyé. Votre demande WhatsApp n'est pas affectée.",
      );
    }
  };

  const onSubmit = (data: QuoteFormData) => {
    setWhatsappStatus("idle");
    setEmailStatus("idle");
    setEmailError("");
    setManualWhatsAppUrl(null);

    // Honeypot : ne rien ouvrir / ne rien envoyer
    if (data.website && data.website.length > 0) {
      setWhatsappStatus("ready");
      return;
    }

    if (!isWhatsAppConfigured()) {
      setWhatsappStatus("blocked");
      setManualWhatsAppUrl(null);
      // Si WhatsApp indisponible mais SMTP oui, tenter l'e-mail seul
      if (smtpConfigured) {
        void sendEmailIndependently(data);
      }
      return;
    }

    const message = buildQuoteWhatsAppMessage(data);
    const url = buildWhatsAppUrl(message);
    if (!url) {
      setWhatsappStatus("blocked");
      return;
    }

    // Ouverture synchrone dans le geste utilisateur (pas d'await avant)
    const popup = openWhatsAppFromUserGesture(url);
    if (!popup) {
      setWhatsappStatus("blocked");
      setManualWhatsAppUrl(url);
    } else {
      setWhatsappStatus("ready");
    }

    // E-mail = opération indépendante ; jamais de POST si SMTP désactivé
    // (évite de transmettre les données formulaire au serveur sans besoin)
    if (smtpConfigured) {
      void sendEmailIndependently(data);
    } else {
      setEmailStatus("unavailable");
    }

    // Ne pas reset immédiatement : l'utilisateur peut revenir du WA
    // Reset soft après succès WhatsApp pour éviter de perdre le contexte si popup bloqué
    if (popup) {
      reset();
    }
  };

  const fieldClass =
    "w-full bg-white border border-narah-deep/15 px-4 py-3.5 text-narah-ink placeholder:text-narah-muted/50 focus:border-narah-emerald focus:outline-none focus:ring-2 focus:ring-narah-emerald/20 transition-colors";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
      aria-describedby="form-status"
    >
      <p className="text-sm text-narah-muted leading-relaxed -mt-2 mb-2">
        Après validation, votre demande s&apos;ouvre dans WhatsApp. L&apos;envoi e-mail éventuel
        est indépendant et n&apos;est tenté que si le serveur SMTP est configuré.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="block text-sm font-semibold text-narah-deep mb-2">
            Nom complet <span className="text-narah-emerald">*</span>
          </label>
          <input
            id="fullName"
            autoComplete="name"
            className={fieldClass}
            {...register("fullName")}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && (
            <p className="mt-1.5 text-sm text-red-700">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-narah-deep mb-2">
            Téléphone <span className="text-narah-emerald">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="70 00 00 00"
            className={fieldClass}
            {...register("phone")}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p className="mt-1.5 text-sm text-red-700">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-narah-deep mb-2">
            E-mail <span className="text-narah-muted font-normal">(facultatif)</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={fieldClass}
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-700">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="material" className="block text-sm font-semibold text-narah-deep mb-2">
            Type de matériau <span className="text-narah-emerald">*</span>
          </label>
          <select
            id="material"
            className={fieldClass}
            {...register("material")}
            aria-invalid={!!errors.material}
            defaultValue=""
          >
            <option value="" disabled>
              Sélectionner…
            </option>
            {materialOptions.map((opt) => (
              <option key={opt} value={opt}>
                {materialLabels[opt]}
              </option>
            ))}
          </select>
          {errors.material && (
            <p className="mt-1.5 text-sm text-red-700">{errors.material.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-semibold text-narah-deep mb-2">
            Quantité souhaitée <span className="text-narah-emerald">*</span>
          </label>
          <input
            id="quantity"
            placeholder="Ex. 2, 10…"
            className={fieldClass}
            {...register("quantity")}
            aria-invalid={!!errors.quantity}
          />
          {errors.quantity && (
            <p className="mt-1.5 text-sm text-red-700">{errors.quantity.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-semibold text-narah-deep mb-2">
            Unité de mesure <span className="text-narah-muted font-normal">(si connue)</span>
          </label>
          <input
            id="unit"
            placeholder="Ex. m³, tonnes, voyages…"
            className={fieldClass}
            {...register("unit")}
          />
        </div>

        <div>
          <label
            htmlFor="deliveryLocation"
            className="block text-sm font-semibold text-narah-deep mb-2"
          >
            Lieu de livraison <span className="text-narah-emerald">*</span>
          </label>
          <input
            id="deliveryLocation"
            placeholder="Quartier, zone à Ouagadougou…"
            className={fieldClass}
            {...register("deliveryLocation")}
            aria-invalid={!!errors.deliveryLocation}
          />
          {errors.deliveryLocation && (
            <p className="mt-1.5 text-sm text-red-700">{errors.deliveryLocation.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="preferredDate"
            className="block text-sm font-semibold text-narah-deep mb-2"
          >
            Date souhaitée <span className="text-narah-muted font-normal">(facultatif)</span>
          </label>
          <input
            id="preferredDate"
            type="date"
            className={fieldClass}
            {...register("preferredDate")}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="block text-sm font-semibold text-narah-deep mb-2">
            Message complémentaire
          </label>
          <textarea
            id="message"
            rows={4}
            className={`${fieldClass} resize-y min-h-[7rem]`}
            {...register("message")}
          />
          {errors.message && (
            <p className="mt-1.5 text-sm text-red-700">{errors.message.message}</p>
          )}
        </div>
      </div>

      {/* Honeypot */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="consent"
          type="checkbox"
          className="mt-1 size-4 accent-narah-emerald"
          {...register("consent")}
          aria-invalid={!!errors.consent}
        />
        <label htmlFor="consent" className="text-sm text-narah-muted leading-relaxed">
          J&apos;accepte que NARAH SERVICE utilise les informations de ce formulaire pour me
          recontacter au sujet de ma demande de devis. <span className="text-narah-emerald">*</span>
        </label>
      </div>
      {errors.consent && (
        <p className="text-sm text-red-700">{errors.consent.message}</p>
      )}

      <div id="form-status" aria-live="polite" className="space-y-3">
        {(whatsappStatus === "ready" || (whatsappStatus === "blocked" && manualWhatsAppUrl)) && (
          <div className="flex gap-3 bg-narah-emerald/10 border border-narah-emerald/30 text-narah-deep p-4">
            <MessageCircle className="size-5 text-narah-emerald shrink-0 mt-0.5" aria-hidden />
            <p>{WHATSAPP_READY_MESSAGE}</p>
          </div>
        )}

        {whatsappStatus === "blocked" && (
          <div className="flex gap-3 bg-amber-50 border border-amber-200 text-amber-950 p-4">
            <AlertCircle className="size-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
            <div className="space-y-2">
              <p>
                L&apos;ouverture automatique de WhatsApp a été bloquée par le navigateur, ou
                WhatsApp n&apos;est pas disponible.
              </p>
              {manualWhatsAppUrl ? (
                <p>
                  <a
                    href={manualWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-narah-emerald underline underline-offset-2"
                  >
                    Ouvrir WhatsApp manuellement
                  </a>
                </p>
              ) : (
                <p>Utilisez le lien WhatsApp ou les numéros de téléphone indiqués à droite.</p>
              )}
            </div>
          </div>
        )}

        {emailStatus === "sending" && (
          <div className="flex gap-3 bg-narah-mist border border-narah-deep/10 text-narah-muted p-4">
            <Loader2 className="size-5 shrink-0 mt-0.5 animate-spin" aria-hidden />
            <p>Envoi e-mail en cours (indépendant de WhatsApp)…</p>
          </div>
        )}

        {emailStatus === "sent" && (
          <div className="flex gap-3 bg-narah-emerald/10 border border-narah-emerald/30 text-narah-deep p-4">
            <CheckCircle2 className="size-5 text-narah-emerald shrink-0 mt-0.5" aria-hidden />
            <p>
              Une copie e-mail a également été transmise à NARAH SERVICE. Cela ne remplace pas
              l&apos;envoi de votre message dans WhatsApp.
            </p>
          </div>
        )}

        {emailStatus === "error" && (
          <div className="flex gap-3 bg-red-50 border border-red-200 text-red-900 p-4">
            <AlertCircle className="size-5 text-red-700 shrink-0 mt-0.5" aria-hidden />
            <p>{emailError}</p>
          </div>
        )}

        {emailStatus === "unavailable" && whatsappStatus === "ready" && (
          <p className="text-sm text-narah-muted">
            L&apos;envoi par e-mail n&apos;est pas configuré pour le moment — votre demande passe
            par WhatsApp uniquement.
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full sm:w-auto min-w-[14rem]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Préparation…
          </>
        ) : (
          <>
            <MessageCircle className="size-4" aria-hidden />
            Continuer sur WhatsApp
          </>
        )}
      </Button>
    </form>
  );
}
