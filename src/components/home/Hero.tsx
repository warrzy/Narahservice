"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { company } from "@/config/company";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.35]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] flex items-end overflow-hidden bg-narah-deep"
      aria-labelledby="hero-heading"
    >
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src="/images/hero/hero-camion.jpg"
          alt="Illustration : camion-benne et chargeuse sur une carrière de latérite"
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
          className="font-display text-white text-[clamp(2.15rem,7.5vw,6.2rem)] leading-[0.98] max-w-5xl text-balance"
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
          className="mt-5 sm:mt-6 max-w-xl text-white/85 text-[0.95rem] sm:text-lg leading-relaxed"
        >
          {company.tagline}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.45 }}
          className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md sm:max-w-none"
        >
          <Button href="/contact" variant="gold" className="w-full sm:w-auto">
            Demander un devis
          </Button>
          <Button href="/materiaux" variant="outline-light" className="w-full sm:w-auto">
            Découvrir les matériaux
          </Button>
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
