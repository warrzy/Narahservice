import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center bg-narah-mist">
      <div className="container-narah py-24 text-center">
        <p className="font-display text-narah-gold text-6xl">404</p>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl text-narah-deep">
          Page introuvable
        </h1>
        <p className="mt-3 text-narah-muted max-w-md mx-auto">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/" variant="primary">
            Retour à l&apos;accueil
          </Button>
          <Button href="/contact" variant="ghost">
            Contact
          </Button>
        </div>
      </div>
    </section>
  );
}
