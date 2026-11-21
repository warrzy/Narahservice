import { CheckCircle2, Package, Truck } from "lucide-react";
import { engagements } from "@/config/company";
import { Reveal } from "@/components/ui/Reveal";

const icons = [Package, CheckCircle2, Truck];

export function Engagements() {
  return (
    <section className="section-pad bg-white" aria-labelledby="engagements-heading">
      <div className="container-narah">
        <Reveal className="max-w-2xl mb-12 lg:mb-16">
          <p className="eyebrow">Notre engagement</p>
          <h2
            id="engagements-heading"
            className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl text-narah-deep text-balance"
          >
            Une expérience de service claire et professionnelle
          </h2>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-3">
          {engagements.map((item, i) => {
            const Icon = icons[i] ?? CheckCircle2;
            return (
              <Reveal key={item.id} delay={i * 0.1}>
                <div className="relative h-full border-t-2 border-narah-gold pt-8">
                  <Icon className="size-8 text-narah-emerald mb-5" aria-hidden strokeWidth={1.5} />
                  <h3 className="font-display text-2xl text-narah-deep">{item.title}</h3>
                  <p className="mt-3 text-narah-muted leading-relaxed">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
