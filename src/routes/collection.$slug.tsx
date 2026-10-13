import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatusBadge } from "@/components/site/ProductCard";
import { getProduct } from "@/lib/catalog.functions";
import { CATEGORY_LABELS } from "@/lib/catalog";

export const Route = createFileRoute("/collection/$slug")({
  loader: async ({ params }) => {
    const p = await getProduct({ data: { slug: params.slug } });
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Cambodia Everywhere` },
          { name: "description", content: loaderData.short_description },
          { property: "og:title", content: `${loaderData.name} — Cambodia Everywhere` },
          { property: "og:description", content: loaderData.short_description },
        ]
      : [{ title: "Unavailable — Cambodia Everywhere" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductPage,
});

const FAQ = [
  { q: "Is this a confirmed product?", a: "Not yet. This is a concept piece in our pilot catalogue. Final materials, dimensions and designs are confirmed with makers before any quotation." },
  { q: "What is the minimum order?", a: "Indicatively 18–60 pieces per design, depending on the product and maker. Smaller enquiries are still welcome — we'll tell you what's possible." },
  { q: "How long does production take?", a: "Lead times vary. A supplier may quote up to around 8 weeks; your quote will state the expected timeline." },
  { q: "Do I pay anything now?", a: "No. Your request is non-binding. If you proceed after receiving a written quote, a production deposit (e.g. 50%) may be requested under the agreed terms." },
  { q: "Can I get samples?", a: "Sample requests can be discussed as part of the quotation process. Mention it in your enquiry message." },
];

function ProductPage() {
  const p = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const imgs = p.images;
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-10">
      <nav className="text-xs uppercase tracking-[0.14em] text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/collection" className="hover:text-accent">Collection</Link> / {CATEGORY_LABELS[p.category]}
      </nav>
      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] bg-secondary">
            {imgs[active] ? (
              <img src={imgs[active]} alt={`${p.name} — illustrative image ${active + 1}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Imagery to come</div>
            )}
            <span className="absolute bottom-3 left-3 bg-background/85 px-2 py-0.5 text-[0.6rem] uppercase tracking-widest text-muted-foreground">Illustrative — not final product</span>
          </div>
          {imgs.length > 1 && (
            <div className="mt-3 flex gap-3">
              {imgs.map((src, i) => (
                <button key={src} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`}
                  className={`h-20 w-16 overflow-hidden border-2 ${i === active ? "border-accent" : "border-transparent"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2"><StatusBadge status={p.status} />
            <span className="border border-gold px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-foreground">Specifications to be confirmed</span>
          </div>
          <h1 className="mt-5 text-5xl text-primary">{p.name}</h1>
          <p className="mt-3 font-serif text-xl italic text-muted-foreground">{p.short_description}</p>
          <p className="mt-6 text-sm uppercase tracking-[0.16em]">Price: Request quotation</p>
          <p className="mt-1 text-sm text-muted-foreground">MOQ — {p.moq_note}</p>

          {p.requestable ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl"><Link to="/preorder" search={{ product: p.slug }}>Request pre-order quote</Link></Button>
              <Button asChild variant="heroOutline" size="xl"><Link to="/preorder" search={{ product: p.slug, sample: true }}>Request sample</Link></Button>
            </div>
          ) : (
            <p className="mt-8 border border-border bg-secondary p-4 text-sm">Coming later — this line is not yet open for enquiries.</p>
          )}

          <section className="mt-12">
            <h2 className="text-2xl text-primary">The story <span className="text-sm font-sans uppercase tracking-widest text-accent">· concept</span></h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{p.story}</p>
          </section>

          {p.specs.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl text-primary">Specifications</h2>
              <dl className="mt-4 divide-y divide-border border-y border-border text-sm">
                {p.specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-4 py-3">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className={s.value && s.value !== "To confirm" ? "text-right" : "text-right italic text-accent"}>{s.value || "To confirm"}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {p.designs.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl text-primary">Design options</h2>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">{p.designs.map((d) => <li key={d} className="border border-border px-3 py-1">{d}</li>)}</ul>
            </section>
          )}

          {p.wholesale_notes && (
            <section className="mt-10 bg-secondary p-6">
              <h2 className="text-2xl text-primary">Wholesale suitability</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.wholesale_notes}</p>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-2xl text-primary">FAQ</h2>
            <Accordion type="single" collapsible className="mt-2">
              {FAQ.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>
    </div>
  );
}
