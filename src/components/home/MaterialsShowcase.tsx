"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { materials } from "@/config/company";
import { Reveal } from "@/components/ui/Reveal";
import { buildWhatsAppUrl, materialWhatsAppMessage, isWhatsAppConfigured } from "@/lib/whatsapp";

export function MaterialsShowcase() {
  return (
    <section className="bg-narah-deep text-white section-pad !pt-20" aria-labelledby="materials-heading">
      <div className="container-narah mb-12 lg:mb-16">
        <Reveal>
          <p className="eyebrow !text-narah-gold">Nos matériaux</p>
          <h2
            id="materials-heading"
            className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl max-w-3xl text-balance"
          >
            Sable, granite et latérite pour vos chantiers
          </h2>
        </Reveal>
      </div>

      <div className="container-narah grid gap-5 lg:gap-6">
        {materials.map((material, index) => {
          const waMsg = materialWhatsAppMessage(material.id);
          const wa = buildWhatsAppUrl(waMsg);
          return (
            <Reveal key={material.id} delay={index * 0.08}>
              <article className="group relative grid lg:grid-cols-2 min-h-[22rem] overflow-hidden bg-narah-ink">
                <div
                  className={[
                    "relative min-h-[16rem] lg:min-h-full overflow-hidden",
                    index % 2 === 1 ? "lg:order-2" : "",
                  ].join(" ")}
                >
                  <Image
                    src={material.image}
                    alt={material.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-narah-deep/50 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-narah-deep/20" />
                  <span className="absolute left-4 top-4 z-10 bg-narah-deep/75 text-narah-gold text-[0.62rem] font-bold tracking-[0.16em] uppercase px-2.5 py-1">
                    Illustration
                  </span>
                </div>

                <div
                  className={[
                    "relative flex flex-col justify-center p-8 sm:p-10 lg:p-14",
                    index % 2 === 1 ? "lg:order-1" : "",
                  ].join(" ")}
                >
                  <span className="text-narah-gold/80 text-xs font-bold tracking-[0.25em] uppercase">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 font-display text-4xl sm:text-5xl">{material.name}</h3>
                  <p className="mt-4 text-white/70 leading-relaxed max-w-md">
                    {material.description}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/contact?materiau=${material.id}`}
                      className="inline-flex items-center gap-2 bg-narah-gold text-narah-deep px-5 py-3 text-[0.7rem] font-bold tracking-[0.16em] uppercase hover:bg-[#ffd24a] transition-colors focus-ring"
                    >
                      Demander un devis
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                    {isWhatsAppConfigured() && wa ? (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border border-white/30 px-5 py-3 text-[0.7rem] font-bold tracking-[0.16em] uppercase hover:bg-white/10 transition-colors focus-ring"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
