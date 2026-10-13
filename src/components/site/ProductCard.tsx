import { Link } from "@tanstack/react-router";
import { CATEGORY_LABELS, STATUS_LABELS, type Product } from "@/lib/catalog";

export function StatusBadge({ status }: { status: Product["status"] }) {
  const style =
    status === "pilot"
      ? "bg-primary text-primary-foreground"
      : status === "concept"
        ? "bg-accent text-accent-foreground"
        : "bg-muted text-muted-foreground border border-border";
  return <span className={`inline-block px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] ${style}`}>{STATUS_LABELS[status]}</span>;
}

export function ProductCard({ p }: { p: Product }) {
  const img = p.images[0];
  return (
    <Link to="/collection/$slug" params={{ slug: p.slug }} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {img ? (
          <img src={img} alt={`${p.name} — illustrative image`} loading="lazy" width={1024} height={1280}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="weave-band h-24 w-24 opacity-40" aria-hidden />
          </div>
        )}
        <div className="absolute left-3 top-3"><StatusBadge status={p.status} /></div>
        {img && <span className="absolute bottom-3 right-3 bg-background/85 px-2 py-0.5 text-[0.6rem] uppercase tracking-widest text-muted-foreground">Illustrative</span>}
      </div>
      <p className="eyebrow mt-5">{CATEGORY_LABELS[p.category]}</p>
      <h3 className="mt-1 text-2xl transition-colors group-hover:text-accent">{p.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.short_description}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-foreground/70">
        {p.requestable ? "Request quotation" : "Not yet requestable"}
      </p>
    </Link>
  );
}
