import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Presentation } from "@/components/home/Presentation";
import { MaterialsShowcase } from "@/components/home/MaterialsShowcase";
import { Engagements } from "@/components/home/Engagements";
import { Process } from "@/components/home/Process";
import { CtaBand } from "@/components/home/CtaBand";

export const metadata: Metadata = {
  title: "NARAH SERVICE | Matériaux de construction à Ouagadougou",
  description:
    "Fourniture et livraison de sable, granite et latérite à Ouagadougou et ses environs. Demandez votre devis à NARAH SERVICE.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Presentation />
      <MaterialsShowcase />
      <Engagements />
      <Process />
      <CtaBand />
    </>
  );
}
