import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_EMAIL } from "@/lib/catalog";

const NAV = [
  { to: "/collection", label: "Collection" },
  { to: "/wholesale", label: "Wholesale" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function WeaveBand({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`weave-band h-3.5 w-full ${className}`} />;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-serif text-2xl tracking-tight text-primary">Cambodia Everywhere</span>
          <span className="mt-1 text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">Heritage Textiles · CamTrade</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-foreground/80 transition-colors hover:text-accent"
              activeProps={{ className: "text-accent" }}
            >
              {n.label}
            </Link>
          ))}
          <Button asChild variant="hero" size="lg">
            <Link to="/preorder">Pre-order enquiry</Link>
          </Button>
        </nav>
        <button className="md:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border bg-background px-5 pb-6 md:hidden" aria-label="Mobile">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block border-b border-border/60 py-3 font-serif text-xl">
              {n.label}
            </Link>
          ))}
          <Button asChild variant="hero" size="xl" className="mt-5 w-full">
            <Link to="/preorder" onClick={() => setOpen(false)}>Pre-order enquiry</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <WeaveBand />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4 md:px-10">
        <div className="md:col-span-2">
          <p className="font-serif text-3xl">Cambodia Everywhere</p>
          <p className="mt-2 font-serif text-lg italic text-gold">Crafted in Cambodia. Curated for the World.</p>
          <p className="mt-6 max-w-md text-sm text-primary-foreground/70">
            Curated with Cambodian makers — supplier partnerships being finalised. CamTrade is the proposed B2B
            wholesale and export channel of Cambodia Everywhere.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow text-gold">Explore</p>
          <Link to="/collection" className="block hover:text-gold">Collection</Link>
          <Link to="/wholesale" className="block hover:text-gold">Wholesale</Link>
          <Link to="/about" className="block hover:text-gold">About</Link>
          <Link to="/preorder" className="block hover:text-gold">Pre-order enquiry</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow text-gold">Information</p>
          <Link to="/contact" className="block hover:text-gold">Contact</Link>
          <Link to="/privacy" className="block hover:text-gold">Privacy</Link>
          <Link to="/terms" className="block hover:text-gold">Terms</Link>
          <p className="pt-2 text-primary-foreground/60">{PLACEHOLDER_EMAIL}</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs tracking-wide text-primary-foreground/70 md:px-10">
          Pilot collection — quotations and availability subject to confirmation. Images are illustrative.
        </p>
      </div>
    </footer>
  );
}
