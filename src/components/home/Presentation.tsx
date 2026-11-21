import { company } from "@/config/company";
import { Reveal } from "@/components/ui/Reveal";

export function Presentation() {
  return (
    <section id="presentation" className="section-pad bg-narah-mist relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-10 font-display text-[clamp(6rem,18vw,14rem)] leading-none text-narah-deep/[0.04] select-none"
      >
        NARAH
      </div>
      <div className="container-narah relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 items-end">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">Présentation</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl text-narah-deep leading-[1.05] text-balance">
              Un partenaire pour vos projets de construction
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={0.12}>
            <div className="space-y-5 text-narah-muted text-lg leading-relaxed max-w-2xl">
              <p>
                <strong className="text-narah-deep font-semibold">{company.name}</strong> est une
                entreprise basée à {company.city}, spécialisée dans la{" "}
                <strong className="text-narah-deep font-semibold">
                  fourniture et la livraison de matériaux de construction
                </strong>
                .
              </p>
              <p>
                Nous accompagnons les professionnels et les particuliers sur leurs chantiers à{" "}
                {company.serviceArea}, avec une offre claire autour du sable, du granite et de
                la latérite.
              </p>
              <p className="font-display text-narah-emerald text-xl sm:text-2xl tracking-tight">
                « {company.slogan} »
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
