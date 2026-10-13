import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { WeaveBand } from "@/components/site/SiteChrome";
import { listProducts } from "@/lib/catalog.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cambodia Everywhere | Heritage Textiles — Crafted in Cambodia" },
      { name: "description", content: "A pilot collection of Cambodian heritage scarves and table linen for boutiques, gifting, hospitality and conscious shoppers in Switzerland and Europe." },
      { property: "og:title", content: "Cambodia Everywhere | Heritage Textiles" },
      { property: "og:description", content: "Crafted in Cambodia. Curated for the World. Request a non-binding pre-order quotation." },
    ],
  }),
  loader: () => listProducts(),
  component: Home,
});

const PROCESS = ["Select", "Submit request", "Tailored quote", "Approve samples", "Confirm order"];

function Home() {
  const products = Route.useLoaderData().filter((p) => p.status !== "coming_later").slice(0, 3);
  return (
    <>
      <section className="relative">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 md:grid-cols-12 md:px-10 md:pt-20">
          <div className="fade-up md:col-span-5">
            <p className="eyebrow">Pilot collection · Switzerland & Europe</p>
            <h1 className="mt-5 text-5xl leading-[1.02] text-primary md:text-7xl">
              Crafted in Cambodia.<br /><em className="text-accent">Curated for the World.</em>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Heritage-inspired scarves and table linen, curated with Cambodian makers for European boutiques,
              gifting and hospitality — offered by quotation and pre-order request.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl"><Link to="/collection">Explore collection</Link></Button>
              <Button asChild variant="heroOutline" size="xl"><Link to="/preorder">Request a pre-order</Link></Button>
            </div>
          </div>
          <figure className="relative md:col-span-7">
            <img src="/images/hero.jpg" alt="Illustrative image of a woven scarf in indigo and terracotta" width={1600} height={1008} className="aspect-[4/3] w-full object-cover md:aspect-[16/11]" />
            <figcaption className="mt-2 text-right text-[0.65rem] uppercase tracking-widest text-muted-foreground">Illustrative collection imagery</figcaption>
          </figure>
        </div>
        <WeaveBand />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10">
        <div className="grid gap-px bg-border md:grid-cols-2">
          <div className="bg-background p-10 md:p-14">
            <p className="eyebrow">For retailers & businesses</p>
            <h2 className="mt-4 text-4xl text-primary">Boutiques, gifting, hospitality</h2>
            <p className="mt-4 text-muted-foreground">Request wholesale quotations, samples and custom colourways. Minimum quantities and lead times vary by product and are confirmed in your quote.</p>
            <Button asChild variant="link" className="mt-6 px-0 uppercase tracking-[0.14em] text-xs text-accent"><Link to="/wholesale">Wholesale process →</Link></Button>
          </div>
          <div className="bg-background p-10 md:p-14">
            <p className="eyebrow">For individuals</p>
            <h2 className="mt-4 text-4xl text-primary">Conscious shoppers</h2>
            <p className="mt-4 text-muted-foreground">Register your interest in a piece. We'll let you know when pilot pieces are available and how to reserve — no payment is taken online.</p>
            <Button asChild variant="link" className="mt-6 px-0 uppercase tracking-[0.14em] text-xs text-accent"><Link to="/preorder">Register interest →</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Concept catalogue</p>
            <h2 className="mt-3 text-5xl text-primary">The pilot pieces</h2>
          </div>
          <Link to="/collection" className="text-xs uppercase tracking-[0.16em] text-accent hover:underline">View all</Link>
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">Specifications to be confirmed. Images are illustrative and do not depict final products.</p>
      </section>

      <section className="mt-28 bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:px-10">
          <div>
            <p className="eyebrow">About the pilot</p>
            <h2 className="mt-4 text-5xl text-primary">Starting small, done carefully.</h2>
          </div>
          <div className="space-y-5 text-muted-foreground">
            <p>Cambodia Everywhere begins with a focused pilot in Switzerland, testing demand for scarves and table linen before expanding to France, Germany and the wider EU — and later to home décor such as cushions, throws and lanterns.</p>
            <p>We are curating with Cambodian makers; supplier partnerships are being finalised. That's why our catalogue is indicative, prices are by quotation, and every request is a non-binding enquiry until a written quote is agreed.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10">
        <p className="eyebrow text-center">How pre-orders work</p>
        <ol className="mt-10 grid gap-6 md:grid-cols-5">
          {PROCESS.map((s, i) => (
            <li key={s} className="border-t border-primary pt-5">
              <span className="font-serif text-3xl text-gold">0{i + 1}</span>
              <p className="mt-2 font-serif text-xl text-primary">{s}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14 text-center">
          <Button asChild variant="terracotta" size="xl"><Link to="/preorder">Start a pre-order enquiry</Link></Button>
        </div>
      </section>
    </>
  );
}
