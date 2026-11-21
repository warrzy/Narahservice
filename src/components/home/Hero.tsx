"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDown, MessageCircle } from "lucide-react";
import { company } from "@/config/company";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl, isWhatsAppConfigured } from "@/lib/whatsapp";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.35]);
  const wa = buildWhatsAppUrl();

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] flex items-end overflow-hidden bg-narah-deep"
      aria-labelledby="hero-heading"
    >
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src="/images/hero/hero-camion.jpg"
          alt="Camion et engins sur un chantier de construction — illustration"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 hero-gradient grain" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 w-full container-narah pb-24 pt-36 sm:pb-28 lg:pb-32 lg:pt-40"
      >
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-narah-gold text-sm sm:text-base tracking-[0.28em] uppercase mb-5"
        >
          {company.name}
        </motion.p>

        <motion.h1
          id="hero-heading"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-white text-[clamp(2.4rem,8vw,6.2rem)] leading-[0.95] max-w-5xl text-balance"
        >
          VOS MATÉRIAUX.
          <br />
          NOTRE ENGAGEMENT.
          <br />
          <span className="text-narah-lime">VOTRE RÉUSSITE.</span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.35 }}
          className="mt-6 max-w-xl text-white/80 text-base sm:text-lg leading-relaxed"
        >
          {company.tagline}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.45 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <Button href="/contact" variant="gold">
            Demander un devis
          </Button>
          {isWhatsAppConfigured() && wa ? (
            <Button
              href={wa}
              variant="outline-light"
              target="_blank"
              rel="noopener noreferrer"
              icon={<MessageCircle className="size-4" aria-hidden />}
            >
              Nous contacter sur WhatsApp
            </Button>
          ) : (
            <Button href="/contact#contact-direct" variant="outline-light">
              Nous contacter
            </Button>
          )}
        </motion.div>

        <motion.a
          href="#presentation"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 inline-flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors focus-ring"
          aria-label="Défiler vers la présentation"
        >
          <span className="text-[0.65rem] tracking-[0.25em] uppercase">Découvrir</span>
          <ArrowDown className="size-4 animate-bounce" aria-hidden />
        </motion.a>
      </motion.div>
    </section>
  );
}
