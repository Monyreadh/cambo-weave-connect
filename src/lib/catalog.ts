export type Spec = { label: string; value: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "scarves" | "table-linen" | "home-accents";
  status: "pilot" | "concept" | "coming_later";
  published: boolean;
  requestable: boolean;
  short_description: string;
  story: string;
  specs: Spec[];
  wholesale_notes: string;
  moq_note: string;
  designs: string[];
  images: string[];
  sort_order: number;
};

export const CATEGORY_LABELS: Record<Product["category"], string> = {
  scarves: "Scarves",
  "table-linen": "Table linen",
  "home-accents": "Home accents",
};

export const STATUS_LABELS: Record<Product["status"], string> = {
  pilot: "Pilot collection",
  concept: "Concept",
  coming_later: "Coming later",
};

export const BUYER_TYPES = [
  { value: "consumer", label: "Individual / conscious shopper" },
  { value: "retailer", label: "Boutique / retailer" },
  { value: "corporate", label: "Corporate gifting" },
  { value: "hospitality", label: "Hospitality (hotel, restaurant)" },
  { value: "distributor", label: "Distributor / wholesaler" },
] as const;

export const COUNTRIES = [
  "Switzerland",
  "France",
  "Germany",
  "Netherlands",
  "Austria",
  "Belgium",
  "Italy",
  "Luxembourg",
  "United Kingdom",
  "Other",
] as const;

export const ORDER_STATUSES = ["new", "contacted", "quoted", "confirmed", "closed"] as const;

export const PLACEHOLDER_EMAIL = "hello@cambodia-everywhere.example";
