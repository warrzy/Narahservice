/**
 * Configuration centralisée NARAH SERVICE
 * Modifier ce fichier pour mettre à jour les coordonnées et contenus métier.
 */

export const company = {
  name: "NARAH SERVICE",
  legalName: "NARAH SERVICE",
  slogan: "CONSTRUISONS ENSEMBLE UN AVENIR SOLIDE",
  tagline:
    "Fourniture et livraison de sable, granite et latérite à Ouagadougou et ses environs.",
  city: "Ouagadougou",
  country: "Burkina Faso",
  serviceArea: "Ouagadougou et ses environs",
  /** Adresse exacte à confirmer — laisser vide jusqu'à validation client */
  address: "",
  /** Coordonnées Google Maps à confirmer */
  mapsEmbedUrl: "",
  mapsLink: "",
  phones: [
    { id: "phone-1", label: "Téléphone 1", display: "78 02 46 90", e164: "+22678024690" },
    { id: "phone-2", label: "Téléphone 2", display: "76 34 05 41", e164: "+22676340541" },
    { id: "phone-3", label: "Téléphone 3", display: "70 64 16 58", e164: "+22670641658" },
  ],
  /**
   * Numéro WhatsApp principal (format international sans + ni espaces).
   * À renseigner après confirmation client, ou via NEXT_PUBLIC_WHATSAPP_NUMBER.
   * Exemple : "22678024690"
   */
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "",
  whatsappDefaultMessage:
    "Bonjour NARAH SERVICE, je souhaite obtenir un devis pour une livraison de matériaux de construction.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  social: {
    facebook: "",
    linkedin: "",
  },
  seo: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://narahservice.bf",
    locale: "fr_BF",
    defaultTitle: "NARAH SERVICE | Matériaux de construction à Ouagadougou",
    defaultDescription:
      "NARAH SERVICE — fourniture et livraison de sable, granite et latérite à Ouagadougou et ses environs. Demandez votre devis.",
  },
} as const;

export type MaterialId = "sable" | "granite" | "laterite";

export const materials: {
  id: MaterialId;
  name: string;
  shortName: string;
  slug: string;
  description: string;
  longDescription: string;
  usages: string[];
  image: string;
  imageAlt: string;
}[] = [
  {
    id: "sable",
    name: "Sable",
    shortName: "Sable",
    slug: "sable",
    description:
      "Fourniture de sable pour vos travaux de construction, avec livraison sur chantier selon les modalités convenues.",
    longDescription:
      "NARAH SERVICE fournit du sable destiné aux travaux de construction à Ouagadougou et ses environs. Que ce soit pour le béton, les enduits ou d'autres usages de chantier, nous échangeons avec vous sur vos besoins afin d'organiser la fourniture et la livraison.",
    usages: [
      "Travaux de béton et maçonnerie",
      "Enduits et finitions",
      "Aménagements de chantier",
    ],
    image: "/images/materials/sable.jpg",
    imageAlt: "Tas de sable destiné aux travaux de construction — illustration",
  },
  {
    id: "granite",
    name: "Granite",
    shortName: "Granite",
    slug: "granite",
    description:
      "Fourniture de granite et granulats pour vos projets de construction, avec livraison organisée selon votre demande.",
    longDescription:
      "Nous proposons du granite et des granulats pour les travaux de construction. La quantité, le type de besoin et le lieu de livraison sont définis avec vous lors de la demande de devis.",
    usages: [
      "Béton et fondations",
      "Travaux de voirie et aménagement",
      "Remblais et couches de forme",
    ],
    image: "/images/materials/granite.jpg",
    imageAlt: "Granulats et granite pour chantier — illustration",
  },
  {
    id: "laterite",
    name: "Latérite",
    shortName: "Latérite",
    slug: "laterite",
    description:
      "Fourniture de latérite pour aménagements et terrassements, avec livraison sur site selon accord.",
    longDescription:
      "La latérite est proposée pour les travaux d'aménagement et de terrassement. NARAH SERVICE organise la fourniture et la livraison en fonction de votre besoin et du lieu convenu.",
    usages: [
      "Terrassement et remblai",
      "Aménagements extérieurs",
      "Préparation de plateformes",
    ],
    image: "/images/materials/laterite.jpg",
    imageAlt: "Latérite pour aménagement et terrassement — illustration",
  },
];

export const engagements = [
  {
    id: "qualite",
    title: "Qualité des matériaux",
    description:
      "Nous sélectionnons et fournissons des matériaux adaptés aux besoins exprimés pour vos chantiers.",
  },
  {
    id: "service",
    title: "Service professionnel",
    description:
      "Un échange clair sur votre demande, pour une proposition adaptée à votre projet.",
  },
  {
    id: "livraison",
    title: "Livraison sur chantier",
    description:
      "Organisation de la livraison sur le lieu convenu, à Ouagadougou et ses environs.",
  },
] as const;

export const processSteps = [
  {
    step: "01",
    title: "Vous exprimez votre besoin",
    description:
      "Matériau, quantité estimée, lieu de livraison et délai souhaité : indiquez-nous les informations essentielles.",
  },
  {
    step: "02",
    title: "Nous échangeons sur votre demande",
    description:
      "Nous clarifions ensemble les détails pour vous proposer une solution adaptée.",
  },
  {
    step: "03",
    title: "Fourniture et livraison",
    description:
      "Nous organisons la fourniture et la livraison selon les modalités convenues.",
  },
] as const;

export type GalleryCategory = "livraisons" | "camions" | "materiaux" | "chantiers";

export const galleryItems: {
  id: string;
  title: string;
  category: GalleryCategory;
  image: string;
  alt: string;
  isIllustration: boolean;
}[] = [
  {
    id: "g1",
    title: "Camion de livraison",
    category: "camions",
    image: "/images/gallery/camion-01.jpg",
    alt: "Camion utilitaire — image d'illustration",
    isIllustration: true,
  },
  {
    id: "g2",
    title: "Engin de chantier",
    category: "camions",
    image: "/images/gallery/camion-02.jpg",
    alt: "Engin de chantier — image d'illustration",
    isIllustration: true,
  },
  {
    id: "g3",
    title: "Matériaux en vrac",
    category: "materiaux",
    image: "/images/gallery/materiaux-01.jpg",
    alt: "Matériaux de construction — image d'illustration",
    isIllustration: true,
  },
  {
    id: "g4",
    title: "Granulats",
    category: "materiaux",
    image: "/images/gallery/materiaux-02.jpg",
    alt: "Granulats sur chantier — image d'illustration",
    isIllustration: true,
  },
  {
    id: "g5",
    title: "Sable et agrégats",
    category: "materiaux",
    image: "/images/gallery/materiaux-03.jpg",
    alt: "Sable et agrégats — image d'illustration",
    isIllustration: true,
  },
  {
    id: "g6",
    title: "Chantier en cours",
    category: "chantiers",
    image: "/images/gallery/chantier-01.jpg",
    alt: "Chantier de construction — image d'illustration",
    isIllustration: true,
  },
  {
    id: "g7",
    title: "Travaux de structure",
    category: "chantiers",
    image: "/images/gallery/chantier-02.jpg",
    alt: "Structure de bâtiment — image d'illustration",
    isIllustration: true,
  },
  {
    id: "g8",
    title: "Engin sur chantier",
    category: "chantiers",
    image: "/images/gallery/chantier-03.jpg",
    alt: "Pelle mécanique — image d'illustration",
    isIllustration: true,
  },
  {
    id: "g9",
    title: "Approvisionnement",
    category: "livraisons",
    image: "/images/gallery/livraison-01.jpg",
    alt: "Approvisionnement chantier — image d'illustration",
    isIllustration: true,
  },
  {
    id: "g10",
    title: "Zone d'intervention",
    category: "livraisons",
    image: "/images/gallery/livraison-02.jpg",
    alt: "Paysage sahelien — image d'illustration",
    isIllustration: true,
  },
  {
    id: "g11",
    title: "Livraison matériaux",
    category: "livraisons",
    image: "/images/gallery/livraison-03.jpg",
    alt: "Camion sur route — image d'illustration",
    isIllustration: true,
  },
];

export const galleryCategories: { id: GalleryCategory | "all"; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "livraisons", label: "Livraisons" },
  { id: "camions", label: "Camions" },
  { id: "materiaux", label: "Matériaux" },
  { id: "chantiers", label: "Chantiers" },
];

export const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/materiaux", label: "Nos matériaux" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/contact", label: "Contact / Devis" },
] as const;
