import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { company, materials } from "@/config/company";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez NARAH SERVICE, entreprise de fourniture et livraison de matériaux de construction à Ouagadougou, Burkina Faso.",
  alternates: { canonical: "/a-propos" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="À propos"
        title="NARAH SERVICE, partenaire matériaux à Ouagadougou"
        description="Une entreprise dédiée à la fourniture et à la livraison de sable, granite et latérite."
      />

      <section className="section-pad bg-narah-mist">
        <div className="container-narah mb-10 sm:mb-14">
          <Reveal>
            <div className="mx-auto max-w-sm sm:max-w-md bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(6,59,43,0.08)]">
              <Image
                src="/images/brand/logo-full.png"
                alt="Logo officiel NARAH SERVICE"
                width={480}
                height={320}
                className="mx-auto h-auto w-full object-contain"
                priority
              />
            </div>
          </Reveal>
        </div>
        <div className="container-narah grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/about/engagement.jpg"
                alt="Travaux de construction — image d'illustration"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <p className="absolute bottom-0 inset-x-0 bg-narah-deep/80 text-white text-xs px-4 py-2 tracking-wide">
                Image d&apos;illustration — à remplacer par une photo réelle de l&apos;entreprise
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="eyebrow">L&apos;entreprise</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl text-narah-deep text-balance">
              Fourniture et livraison au service de vos chantiers
            </h2>
            <div className="mt-6 space-y-4 text-narah-muted text-lg leading-relaxed">
              <p>
                <strong className="text-narah-deep">{company.name}</strong> est une entreprise
                burkinabè basée à {company.city}. Notre activité : la fourniture et la livraison
                de matériaux de construction.
              </p>
              <p>
                Nous intervenons à <strong className="text-narah-deep">{company.serviceArea}</strong>{" "}
                pour répondre aux besoins des professionnels et des particuliers.
              </p>
              <p className="font-display text-narah-emerald text-xl">
                « {company.slogan} »
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-narah">
          <Reveal className="max-w-2xl mb-12">
            <p className="eyebrow">Engagement de service</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl text-narah-deep">
              Ce que nous mettons en avant
            </h2>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Clarté",
                text: "Échange sur votre besoin avant organisation de la fourniture et de la livraison.",
              },
              {
                title: "Proximité",
                text: `Intervention sur ${company.serviceArea}.`,
              },
              {
                title: "Matériaux ciblés",
                text: "Sable, granite et latérite pour vos projets de construction et d'aménagement.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="border-l-2 border-narah-gold pl-6">
                  <h3 className="font-display text-2xl text-narah-deep">{item.title}</h3>
                  <p className="mt-3 text-narah-muted leading-relaxed">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-narah-mist">
        <div className="container-narah">
          <Reveal className="mb-10">
            <p className="eyebrow">Nos matériaux</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl text-narah-deep">
              Trois matériaux pour vos projets
            </h2>
          </Reveal>
          <ul className="grid gap-4 sm:grid-cols-3">
            {materials.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.08}>
                <li className="bg-white p-6 border border-narah-deep/8">
                  <h3 className="font-display text-xl text-narah-deep">{m.name}</h3>
                  <p className="mt-2 text-narah-muted text-sm leading-relaxed">{m.description}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad bg-white border-t border-narah-deep/8">
        <div className="container-narah">
          <Reveal>
            <p className="eyebrow">À compléter</p>
            <h2 className="mt-4 font-display text-3xl text-narah-deep max-w-2xl">
              Espaces réservés pour votre histoire
            </h2>
            <p className="mt-4 text-narah-muted max-w-2xl leading-relaxed">
              Les sections suivantes pourront accueillir, dès validation : l&apos;histoire de
              l&apos;entreprise, les valeurs, l&apos;équipe et vos photographies réelles. Aucune
              information non confirmée n&apos;est inventée ici.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {["Histoire", "Valeurs", "Photos entreprise"].map((label) => (
                <div
                  key={label}
                  className="border border-dashed border-narah-deep/25 bg-narah-mist/60 p-8 min-h-[10rem] flex items-center justify-center text-center"
                >
                  <span className="text-narah-muted text-sm tracking-[0.12em] uppercase font-semibold">
                    {label} — à venir
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Button href="/contact" variant="primary">
                Nous contacter
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
