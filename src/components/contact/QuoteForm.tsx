"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { quoteSchema, type QuoteFormData, materialOptions } from "@/lib/quote-schema";
import { Button } from "@/components/ui/Button";

const materialLabels: Record<(typeof materialOptions)[number], string> = {
  sable: "Sable",
  granite: "Granite",
  laterite: "Latérite",
  plusieurs: "Plusieurs matériaux",
  autre: "Autre",
};

export function QuoteForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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

  const onSubmit = async (data: QuoteFormData) => {
    setStatus("idle");
    setErrorMessage("");
    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; configured?: boolean };

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          json.error ||
            "Une erreur est survenue. Veuillez réessayer ou nous appeler directement.",
        );
        return;
      }

      setStatus("success");
      reset();
    } catch {
      setStatus("error");
      setErrorMessage(
        "Impossible d'envoyer la demande. Vérifiez votre connexion ou contactez-nous par téléphone.",
      );
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
        {status === "success" && (
          <div className="flex gap-3 bg-narah-emerald/10 border border-narah-emerald/30 text-narah-deep p-4">
            <CheckCircle2 className="size-5 text-narah-emerald shrink-0 mt-0.5" aria-hidden />
            <p>
              Votre demande a bien été envoyée. Nous vous recontacterons dans les meilleurs
              délais.
            </p>
          </div>
        )}
        {status === "error" && (
          <div className="flex gap-3 bg-red-50 border border-red-200 text-red-900 p-4">
            <AlertCircle className="size-5 text-red-700 shrink-0 mt-0.5" aria-hidden />
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      <Button type="submit" variant="primary" className="w-full sm:w-auto min-w-[14rem]" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Envoi en cours…
          </>
        ) : (
          "Envoyer ma demande"
        )}
      </Button>
    </form>
  );
}
