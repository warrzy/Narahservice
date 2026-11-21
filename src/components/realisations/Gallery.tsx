"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { galleryCategories, galleryItems, type GalleryCategory } from "@/config/company";
import { Reveal } from "@/components/ui/Reveal";

export function Gallery() {
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");

  const items = useMemo(() => {
    if (filter === "all") return galleryItems;
    return galleryItems.filter((item) => item.category === filter);
  }, [filter]);

  return (
    <div>
      <div
        className="flex flex-wrap gap-2 mb-10"
        role="tablist"
        aria-label="Filtrer la galerie"
      >
        {galleryCategories.map((cat) => {
          const active = filter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(cat.id)}
              className={[
                "px-4 py-2.5 text-[0.7rem] font-bold tracking-[0.14em] uppercase transition-colors focus-ring",
                active
                  ? "bg-narah-deep text-white"
                  : "bg-white text-narah-deep border border-narah-deep/15 hover:border-narah-deep/40",
              ].join(" ")}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <p className="mb-6 text-sm text-narah-muted bg-narah-gold/15 border border-narah-gold/40 px-4 py-3">
        Les visuels ci-dessous sont des <strong>images d&apos;illustration</strong>. Ils ne
        représentent pas des réalisations réelles de NARAH SERVICE. Remplacez-les par vos
        photographies authentiques lorsque disponibles.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={(i % 3) * 0.06}>
            <figure className="group relative aspect-[4/3] overflow-hidden bg-narah-deep/10">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-narah-deep/90 to-transparent">
                <span className="inline-block text-[0.65rem] tracking-[0.16em] uppercase text-narah-gold mb-1">
                  Illustration
                </span>
                <p className="text-white font-semibold">{item.title}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
