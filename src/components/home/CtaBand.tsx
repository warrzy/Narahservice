import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { buildWhatsAppUrl, isWhatsAppConfigured } from "@/lib/whatsapp";

export function CtaBand() {
  const wa = buildWhatsAppUrl();

  return (
    <section className="relative overflow-hidden" aria-labelledby="cta-heading">
      <div className="absolute inset-0">
        <Image
          src="/images/hero/cta-chantier.jpg"
          alt="Chantier de construction — illustration"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-narah-deep/88 grain" />
      </div>

      <div className="relative container-narah section-pad text-center">
        <Reveal>
          <h2
            id="cta-heading"
            className="font-display text-3xl sm:text-4xl lg:text-6xl text-white max-w-4xl mx-auto text-balance leading-[1.05]"
          >
            Votre chantier mérite un partenaire sérieux.
          </h2>
          <p className="mt-5 text-white/70 text-lg max-w-xl mx-auto">
            Contactez NARAH SERVICE pour une demande de devis adaptée à votre besoin.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/contact" variant="gold">
              Demander un devis
            </Button>
            {isWhatsAppConfigured() && wa ? (
              <Button
                href={wa}
                variant="outline-light"
                target="_blank"
                rel="noopener noreferrer"
                icon={<MessageCircle className="size-4" aria-hidden />}
              >
                WhatsApp
              </Button>
            ) : (
              <Button href={`tel:+22678024690`} variant="outline-light">
                Appeler le 78 02 46 90
              </Button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
