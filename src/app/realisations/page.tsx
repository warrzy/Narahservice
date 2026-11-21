import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { Gallery } from "@/components/realisations/Gallery";
import { CtaBand } from "@/components/home/CtaBand";

export const metadata: Metadata = {
  title: "Nos réalisations",
  description:
    "Galerie NARAH SERVICE — espace dédié aux photographies de livraisons, camions, matériaux et chantiers. Visuels d'illustration en attendant vos photos réelles.",
  alternates: { canonical: "/realisations" },
};

export default function RealisationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Réalisations"
        title="Galerie de nos interventions"
        description="Cet espace accueillera vos photographies réelles de livraisons, camions, matériaux et chantiers. En attendant, des visuels d'illustration structurent la page."
      />

      <section className="section-pad bg-narah-mist">
        <div className="container-narah">
          <Suspense fallback={<p className="text-narah-muted">Chargement de la galerie…</p>}>
            <Gallery />
          </Suspense>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
