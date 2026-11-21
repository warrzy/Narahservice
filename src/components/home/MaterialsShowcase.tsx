"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { materials } from "@/config/company";
import { Reveal } from "@/components/ui/Reveal";

export function MaterialsShowcase() {
  return (
    <section className="bg-narah-deep text-white section-pad !pt-16 sm:!pt-20" aria-labelledby="materials-heading">
      <div className="container-narah mb-10 sm:mb-12 lg:mb-16">
        <Reveal>
          <p className="eyebrow !text-narah-gold">Nos matériaux</p>
          <h2
            id="materials-heading"
            className="mt-4 font-display text-[1.75rem] sm:text-4xl lg:text-5xl max-w-3xl text-balance"
          >
            Sable, granite et latérite pour vos chantiers
          </h2>
        </Reveal>
      </div>

      <div className="container-narah grid gap-5 lg:gap-6">
        {materials.map((material, index) => {
          return (
            <Reveal key={material.id} delay={index * 0.08}>
              <article className="group relative grid lg:grid-cols-2 min-h-[20rem] sm:min-h-[22rem] overflow-hidden bg-narah-ink">
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
                  <h3 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl">
                    {material.name}
                  </h3>
                  <p className="mt-4 text-white/75 leading-relaxed max-w-md text-sm sm:text-base">
                    {material.description}
                  </p>
                  <div className="mt-7 sm:mt-8 flex flex-col xs:flex-row flex-wrap gap-3">
                    <Link
                      href={`/contact?materiau=${material.id}`}
                      className="inline-flex min-h-12 items-center justify-center gap-2 bg-narah-gold text-narah-deep px-5 py-3 text-[0.7rem] font-bold tracking-[0.16em] uppercase hover:bg-[#ffd24a] transition-colors focus-ring touch-manipulation"
                    >
                      Demander un devis
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                    <Link
                      href="/materiaux"
                      className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-white/60 px-5 py-3 text-[0.7rem] font-bold tracking-[0.16em] uppercase text-white hover:bg-white/10 transition-colors focus-ring touch-manipulation"
                    >
                      Voir les détails
                    </Link>
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
