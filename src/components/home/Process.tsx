import { processSteps } from "@/config/company";
import { Reveal } from "@/components/ui/Reveal";

export function Process() {
  return (
    <section className="section-pad bg-narah-mist" aria-labelledby="process-heading">
      <div className="container-narah">
        <Reveal className="max-w-2xl mb-12 lg:mb-16">
          <p className="eyebrow">Comment ça marche</p>
          <h2
            id="process-heading"
            className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl text-narah-deep text-balance"
          >
            Un processus simple, en trois étapes
          </h2>
        </Reveal>

        <ol className="grid gap-6 lg:grid-cols-3">
          {processSteps.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.1}>
              <li className="relative bg-white p-8 sm:p-10 h-full border border-narah-deep/8">
                <span className="font-display text-6xl sm:text-7xl text-narah-emerald/15 leading-none">
                  {step.step}
                </span>
                <h3 className="mt-4 font-display text-xl sm:text-2xl text-narah-deep">
                  {step.title}
                </h3>
                <p className="mt-3 text-narah-muted leading-relaxed">{step.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
