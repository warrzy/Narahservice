import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { materials } from "@/config/company";
import { buildWhatsAppUrl, isWhatsAppConfigured, materialWhatsAppMessage } from "@/lib/whatsapp";
import { CtaBand } from "@/components/home/CtaBand";

export const metadata: Metadata = {
  title: "Nos matériaux — Sable, granite, latérite",
  description:
    "Sable, granite et latérite : découvrez les matériaux fournis et livrés par NARAH SERVICE à Ouagadougou et ses environs.",
  alternates: { canonical: "/materiaux" },
};

export default function MaterialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Nos matériaux"
        title="Sable, granite et latérite"
        description="Des matériaux de construction fournis et livrés selon vos besoins, à Ouagadougou et ses environs."
      />

      <div className="bg-narah-mist">
        {materials.map((material, index) => {
          const wa = buildWhatsAppUrl(materialWhatsAppMessage(material.id));
          return (
            <section
              key={material.id}
              id={material.slug}
              className={[
                "section-pad scroll-mt-28",
                index % 2 === 0 ? "bg-narah-mist" : "bg-white",
              ].join(" ")}
              aria-labelledby={`${material.slug}-title`}
            >
              <div className="container-narah grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
                <Reveal className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <Image
                      src={material.image}
                      alt={material.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>

                <Reveal delay={0.1} className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <p className="eyebrow">Matériau 0{index + 1}</p>
                  <h2
                    id={`${material.slug}-title`}
                    className="mt-4 font-display text-4xl sm:text-5xl text-narah-deep"
                  >
                    {material.name}
                  </h2>
                  <p className="mt-5 text-narah-muted text-lg leading-relaxed">
                    {material.longDescription}
                  </p>

                  <h3 className="mt-8 font-display text-xl text-narah-deep">Usages généraux</h3>
                  <ul className="mt-3 space-y-2">
                    {material.usages.map((usage) => (
                      <li
                        key={usage}
                        className="flex items-start gap-3 text-narah-muted"
                      >
                        <span className="mt-2 size-1.5 shrink-0 bg-narah-gold" aria-hidden />
                        {usage}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/contact?materiau=${material.id}`}
                      className="inline-flex items-center gap-2 bg-narah-emerald text-white px-6 py-3.5 text-[0.7rem] font-bold tracking-[0.16em] uppercase hover:bg-[#0a9653] transition-colors focus-ring"
                    >
                      Demander un devis
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                    {isWhatsAppConfigured() && wa ? (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border border-narah-deep/20 px-6 py-3.5 text-[0.7rem] font-bold tracking-[0.16em] uppercase hover:bg-narah-deep/5 transition-colors focus-ring"
                      >
                        WhatsApp {material.name}
                      </a>
                    ) : null}
                  </div>
                </Reveal>
              </div>
            </section>
          );
        })}
      </div>

      <CtaBand />
    </>
  );
}
