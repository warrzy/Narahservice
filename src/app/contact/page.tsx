import type { Metadata } from "next";
import { Suspense } from "react";
import { MapPin, Phone, MessageCircle, Mail } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { QuoteForm } from "@/components/contact/QuoteForm";
import { company } from "@/config/company";
import { buildWhatsAppUrl, isWhatsAppConfigured } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact & demande de devis",
  description:
    "Demandez un devis pour la livraison de sable, granite ou latérite à Ouagadougou. Contactez NARAH SERVICE par téléphone ou formulaire.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const wa = buildWhatsAppUrl();

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Demande de devis"
        description="Décrivez votre besoin : nous vous recontactons pour échanger sur la fourniture et la livraison."
      />

      <section className="section-pad bg-narah-mist">
        <div className="container-narah grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <div className="bg-white border border-narah-deep/8 p-6 sm:p-8 lg:p-10">
              <h2 className="font-display text-2xl sm:text-3xl text-narah-deep mb-2">
                Formulaire de devis
              </h2>
              <p className="text-narah-muted mb-8">
                Les champs marqués d&apos;un astérisque sont obligatoires.
              </p>
              <Suspense fallback={<p className="text-narah-muted">Chargement du formulaire…</p>}>
                <QuoteForm />
              </Suspense>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={0.1}>
            <div id="contact-direct" className="space-y-8 scroll-mt-28">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl text-narah-deep">
                  Nous joindre directement
                </h2>
                <p className="mt-3 text-narah-muted leading-relaxed">
                  Appelez-nous ou envoyez un message. Zone d&apos;intervention :{" "}
                  {company.serviceArea}.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-narah-emerald">
                  Téléphones
                </p>
                {company.phones.map((phone) => (
                  <a
                    key={phone.id}
                    href={`tel:${phone.e164}`}
                    className="flex items-center gap-4 bg-white border border-narah-deep/8 p-4 hover:border-narah-emerald/40 transition-colors focus-ring"
                  >
                    <span className="inline-flex size-11 items-center justify-center bg-narah-mist text-narah-emerald">
                      <Phone className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-xs text-narah-muted">{phone.label}</span>
                      <span className="font-semibold text-narah-deep text-lg">
                        {phone.display}
                      </span>
                    </span>
                  </a>
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-narah-emerald">
                  WhatsApp
                </p>
                {isWhatsAppConfigured() && wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-4 text-[0.7rem] font-bold tracking-[0.16em] uppercase hover:brightness-105 transition focus-ring"
                  >
                    <MessageCircle className="size-5" aria-hidden />
                    Ouvrir WhatsApp
                  </a>
                ) : (
                  <div className="bg-narah-gold/15 border border-narah-gold/40 p-4 text-sm text-narah-deep">
                    Le numéro WhatsApp principal reste à confirmer. Une fois renseigné dans la
                    configuration (<code className="text-xs">NEXT_PUBLIC_WHATSAPP_NUMBER</code>
                    ), le bouton s&apos;activera automatiquement.
                  </div>
                )}
              </div>

              {company.email ? (
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-3 text-narah-deep hover:text-narah-emerald focus-ring"
                >
                  <Mail className="size-5" aria-hidden />
                  {company.email}
                </a>
              ) : null}

              <div className="space-y-3">
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-narah-emerald">
                  Localisation
                </p>
                <div className="flex items-start gap-3 text-narah-muted">
                  <MapPin className="size-5 text-narah-emerald shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <p className="text-narah-deep font-semibold">
                      {company.city}, {company.country}
                    </p>
                    <p className="text-sm mt-1">
                      {company.address
                        ? company.address
                        : "Adresse exacte à confirmer — la carte Google Maps sera ajoutée dès validation."}
                    </p>
                  </div>
                </div>
                {company.mapsEmbedUrl ? (
                  <div className="aspect-[4/3] overflow-hidden border border-narah-deep/10">
                    <iframe
                      title="Localisation NARAH SERVICE"
                      src={company.mapsEmbedUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-narah-deep/5 border border-dashed border-narah-deep/20 flex items-center justify-center p-6 text-center text-sm text-narah-muted">
                    Emplacement carte Google Maps — en attente de l&apos;adresse confirmée
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
