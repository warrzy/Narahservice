import Image from "next/image";
import Link from "next/link";
import { company, materials, navLinks } from "@/config/company";
import { buildWhatsAppUrl, isWhatsAppConfigured } from "@/lib/whatsapp";

export function Footer() {
  const year = new Date().getFullYear();
  const wa = buildWhatsAppUrl();

  return (
    <footer className="bg-narah-deep text-white">
      <div className="container-narah section-pad !pb-12 !pt-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-6">
            <Image
              src="/images/brand/logo-placeholder.svg"
              alt="NARAH SERVICE — logo provisoire"
              width={180}
              height={46}
              className="h-11 w-auto"
            />
            <p className="font-display text-2xl sm:text-3xl text-balance max-w-md leading-tight">
              {company.slogan}
            </p>
            <p className="text-white/65 max-w-md leading-relaxed">
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
                  <Link href={link.href} className="text-white/75 hover:text-white transition-colors focus-ring">
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
                    className="text-white/75 hover:text-white transition-colors focus-ring"
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
                    className="text-white/75 hover:text-white transition-colors focus-ring"
                  >
                    {phone.display}
                  </a>
                </li>
              ))}
              {isWhatsAppConfigured() && wa ? (
                <li>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-narah-lime hover:text-white transition-colors focus-ring"
                  >
                    WhatsApp
                  </a>
                </li>
              ) : (
                <li className="text-white/45 text-sm">
                  WhatsApp : numéro à confirmer
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-white/45">
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
