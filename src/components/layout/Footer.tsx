import Link from "next/link";
import { company, materials, navLinks } from "@/config/company";
import { Logo } from "@/components/brand/Logo";
import { buildWhatsAppUrl, isWhatsAppConfigured } from "@/lib/whatsapp";

export function Footer() {
  const year = new Date().getFullYear();
  const wa = buildWhatsAppUrl();

  return (
    <footer className="bg-narah-deep text-white">
      <div className="container-narah section-pad !pb-12 !pt-14 sm:!pt-16">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <Logo href="/" />
            <p className="font-display text-xl sm:text-2xl lg:text-3xl text-balance max-w-md leading-tight">
              {company.slogan}
            </p>
            <p className="text-white/70 max-w-md leading-relaxed text-sm sm:text-base">
              Fourniture et livraison de matériaux de construction à {company.serviceArea}.
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="text-narah-gold text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Navigation
            </p>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors focus-ring"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-narah-gold text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Matériaux
            </p>
            <ul className="space-y-3">
              {materials.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/materiaux#${m.slug}`}
                    className="text-white/80 hover:text-white transition-colors focus-ring"
                  >
                    {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-narah-gold text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Contact
            </p>
            <ul className="space-y-3">
              {company.phones.map((phone) => (
                <li key={phone.id}>
                  <a
                    href={`tel:${phone.e164}`}
                    className="text-white/80 hover:text-white transition-colors focus-ring text-sm sm:text-base"
                  >
                    {phone.display}
                  </a>
                </li>
              ))}
              {company.email ? (
                <li>
                  <a
                    href={`mailto:${company.email}`}
                    className="text-white/80 hover:text-white transition-colors focus-ring text-sm break-all"
                  >
                    {company.email}
                  </a>
                </li>
              ) : null}
              {isWhatsAppConfigured() && wa ? (
                <li>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-narah-lime hover:text-white transition-colors focus-ring text-sm"
                  >
                    WhatsApp
                  </a>
                  <span className="block text-white/40 text-xs mt-1">
                    Lien provisoire — activation à confirmer
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 sm:mt-14 pt-8 border-t border-white/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-white/50">
          <p>
            © {year} {company.name}. Tous droits réservés.
          </p>
          <p>
            {company.city}, {company.country}
          </p>
        </div>
      </div>
    </footer>
  );
}
