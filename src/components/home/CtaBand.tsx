import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { company } from "@/config/company";

export function CtaBand() {
  const phone = company.phones[0];

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
        <div className="absolute inset-0 bg-narah-deep/90 grain" />
      </div>

      <div className="relative container-narah section-pad text-center">
        <Reveal>
          <h2
            id="cta-heading"
            className="font-display text-[1.85rem] sm:text-4xl lg:text-6xl text-white max-w-4xl mx-auto text-balance leading-[1.08]"
          >
            Votre chantier mérite un partenaire sérieux.
          </h2>
          <p className="mt-5 text-white/80 text-base sm:text-lg max-w-xl mx-auto">
            Contactez NARAH SERVICE pour une demande de devis adaptée à votre besoin.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-md sm:max-w-none mx-auto">
            <Button href="/contact" variant="gold" className="w-full sm:w-auto">
              Demander un devis
            </Button>
            <Button href={`tel:${phone.e164}`} variant="outline-light" className="w-full sm:w-auto">
              Appeler {phone.display}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
