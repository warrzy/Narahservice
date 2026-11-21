import { Reveal } from "@/components/ui/Reveal";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative bg-narah-deep text-white pt-32 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(8,127,70,0.55), transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(244,196,48,0.18), transparent 40%)",
        }}
      />
      <div className="container-narah relative">
        <Reveal>
          <p className="eyebrow !text-narah-gold">{eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl max-w-4xl text-balance leading-[1.05]">
            {title}
          </h1>
          {description ? (
            <p className="mt-5 max-w-2xl text-white/70 text-lg leading-relaxed">{description}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
