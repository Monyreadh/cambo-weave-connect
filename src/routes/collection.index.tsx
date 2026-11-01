import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { listProducts } from "@/lib/catalog.functions";
import { CATEGORY_LABELS, type Product } from "@/lib/catalog";

export const Route = createFileRoute("/collection/")({
  head: () => ({
    meta: [
      { title: "Collection — KramiVelle Heritage Textiles" },
      { name: "description", content: "Concept catalogue of Cambodian heritage scarves, table linen and future home accents. Prices by quotation." },
      { property: "og:title", content: "The Collection — KramiVelle" },
      { property: "og:description", content: "Pilot scarves and table linen, curated with Cambodian makers." },
    ],
  }),
  loader: () => listProducts(),
  component: Collection,
});

type Cat = "all" | Product["category"];

function Collection() {
  const products = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Cat>("all");
  const [onlyReq, setOnlyReq] = useState(false);
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "all" || p.category === cat) &&
          (!onlyReq || p.requestable) &&
          (q === "" || `${p.name} ${p.short_description}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [products, q, cat, onlyReq],
  );
  const cats: Cat[] = ["all", "scarves", "table-linen", "home-accents"];
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10">
      <p className="eyebrow">Concept catalogue</p>
      <h1 className="mt-3 text-5xl text-primary md:text-6xl">The Collection</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">An indicative selection curated with Cambodian makers. Specifications, designs and availability are to be confirmed; all prices are by quotation.</p>

      <div className="mt-10 flex flex-col gap-4 border-y border-border py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={`px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors ${cat === c ? "bg-primary text-primary-foreground" : "border border-border hover:border-primary"}`}>
              {c === "all" ? "All" : CATEGORY_LABELS[c]}
            </button>
          ))}
          <label className="ml-2 flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={onlyReq} onChange={(e) => setOnlyReq(e.target.checked)} /> Requestable only
          </label>
        </div>
        <label className="relative block md:w-72">
          <span className="sr-only">Search products</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the collection"
            className="w-full border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-accent" />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-muted-foreground">No pieces match your search.</p>
      ) : (
        <div className="mt-12 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
