import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { listProducts, submitPreorder } from "@/lib/catalog.functions";
import { BUYER_TYPES, COUNTRIES } from "@/lib/catalog";

export const Route = createFileRoute("/preorder")({
  validateSearch: z.object({ product: z.string().optional(), sample: z.boolean().optional() }),
  head: () => ({
    meta: [
      { title: "Pre-order enquiry — KramiVelle" },
      { name: "description", content: "Submit a non-binding pre-order or quotation request for Cambodian heritage textiles." },
      { property: "og:title", content: "Pre-order enquiry — KramiVelle" },
      { property: "og:description", content: "Non-binding enquiry. No payment taken." },
    ],
  }),
  loader: () => listProducts(),
  component: PreorderPage,
});

const field = "mt-1.5 w-full border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-accent aria-[invalid=true]:border-destructive";

function PreorderPage() {
  const products = Route.useLoaderData().filter((p) => p.requestable);
  const search = Route.useSearch();
  const submit = useServerFn(submitPreorder);
  const started = useRef(Date.now());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState<null | { reference: string; summary: Record<string, string> }>(null);
  const [slug, setSlug] = useState(search.product ?? "");
  const selected = products.find((p) => p.slug === slug);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (!g("buyer_type")) errs.buyer_type = "Please choose a buyer type.";
    if (g("full_name").length < 2) errs.full_name = "Please enter your full name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g("email"))) errs.email = "Please enter a valid email.";
    if (!g("country")) errs.country = "Please choose a country.";
    const qty = Number(g("quantity"));
    if (!Number.isInteger(qty) || qty < 1) errs.quantity = "Quantity must be a whole number of at least 1.";
    if (!f.get("consent_privacy")) errs.consent_privacy = "Consent is required so we can reply.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setServerError("");
    try {
      const res = await submit({
        data: {
          buyer_type: g("buyer_type") as "consumer", full_name: g("full_name"), company: g("company"),
          email: g("email"), country: g("country"), phone: g("phone"), product_slug: slug,
          preferred_design: g("preferred_design"), quantity: qty, target_date: g("target_date"),
          message: g("message"), consent_privacy: true, marketing_opt_in: !!f.get("marketing_opt_in"),
          website: g("website"), elapsed_ms: Date.now() - started.current,
        },
      });
      if (!res.ok) { setServerError(res.error); return; }
      setDone({ reference: res.reference, summary: { Product: selected?.name ?? "General enquiry", Design: g("preferred_design") || "—", Quantity: String(qty), Country: g("country"), Email: g("email") } });
      window.scrollTo({ top: 0 });
    } catch {
      setServerError("Something went wrong while sending. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 md:px-10" role="status" aria-live="polite">
        <p className="eyebrow">Enquiry received</p>
        <h1 className="mt-3 text-5xl text-primary">Thank you.</h1>
        <p className="mt-4 text-muted-foreground">Your request has been submitted. <strong>This is not a confirmed order.</strong> We'll review it and reply by email with next steps or a written quotation.</p>
        <p className="mt-8 text-sm uppercase tracking-widest">Reference</p>
        <p className="font-serif text-4xl text-accent">{done.reference}</p>
        <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
          {Object.entries(done.summary).map(([k, v]) => <div key={k} className="flex justify-between py-3"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}
        </dl>
        <Button asChild variant="heroOutline" size="xl" className="mt-10"><Link to="/collection">Back to collection</Link></Button>
      </div>
    );
  }

  const err = (k: string) => errors[k] && <p id={`${k}-err`} className="mt-1 text-xs text-destructive">{errors[k]}</p>;
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:px-10">
      <p className="eyebrow">Pre-order enquiry</p>
      <h1 className="mt-3 text-5xl text-primary">Request a quotation</h1>
      <div className="mt-6 border-l-2 border-gold bg-secondary p-5 text-sm">
        This is a <strong>non-binding pre-order enquiry</strong>. No payment is taken, and no order is accepted until a written quote and confirmation. Minimum quantities (indicatively 18–60 pieces per design), lead times and any deposit are confirmed per product.
      </div>
      <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="hidden" aria-hidden><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="md:col-span-2 text-sm">I am enquiring as *
          <select name="buyer_type" defaultValue="" className={field} aria-invalid={!!errors.buyer_type}>
            <option value="" disabled>Select…</option>
            {BUYER_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>{err("buyer_type")}
        </label>
        <label className="text-sm">Full name *<input name="full_name" autoComplete="name" className={field} aria-invalid={!!errors.full_name} maxLength={120} />{err("full_name")}</label>
        <label className="text-sm">Business / company <span className="text-muted-foreground">(optional)</span><input name="company" autoComplete="organization" className={field} maxLength={160} /></label>
        <label className="text-sm">Email *<input name="email" type="email" autoComplete="email" className={field} aria-invalid={!!errors.email} maxLength={254} />{err("email")}</label>
        <label className="text-sm">Phone <span className="text-muted-foreground">(optional)</span><input name="phone" type="tel" autoComplete="tel" className={field} maxLength={40} /></label>
        <label className="text-sm">Country *
          <select name="country" defaultValue="" className={field} aria-invalid={!!errors.country}>
            <option value="" disabled>Select…</option>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>{err("country")}
        </label>
        <label className="text-sm">Product
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className={field}>
            <option value="">General enquiry</option>
            {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </label>
        {selected && selected.designs.length > 0 && (
          <label className="text-sm">Preferred design
            <select name="preferred_design" defaultValue="" className={field}>
              <option value="">No preference</option>
              {selected.designs.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
        )}
        <label className="text-sm">Quantity *<input name="quantity" type="number" min={1} step={1} defaultValue={search.sample ? 1 : undefined} className={field} aria-invalid={!!errors.quantity} />
          <span className="mt-1 block text-xs text-muted-foreground">MOQ guidance: indicatively 18–60 per design. Smaller enquiries welcome.</span>{err("quantity")}</label>
        <label className="text-sm">Target delivery date <span className="text-muted-foreground">(optional)</span><input name="target_date" type="date" className={field} /></label>
        <label className="md:col-span-2 text-sm">Message
          <textarea name="message" rows={5} maxLength={3000} className={field} defaultValue={search.sample ? "I would like to request a sample." : ""} />
        </label>
        <div className="md:col-span-2 space-y-3 text-sm">
          <label className="flex gap-3"><input type="checkbox" name="consent_privacy" aria-invalid={!!errors.consent_privacy} className="mt-1" />
            <span>I agree that my details are used to respond to this enquiry, as described in the <Link to="/privacy" className="underline">privacy notice</Link>. *</span></label>
          {err("consent_privacy")}
          <label className="flex gap-3"><input type="checkbox" name="marketing_opt_in" className="mt-1" /><span>Optional: send me occasional news about the collection. Unsubscribe anytime.</span></label>
        </div>
        {serverError && <p role="alert" className="md:col-span-2 border border-destructive p-3 text-sm text-destructive">{serverError}</p>}
        <div className="md:col-span-2">
          <Button type="submit" variant="hero" size="xl" disabled={busy}>{busy ? "Sending…" : "Submit enquiry"}</Button>
        </div>
      </form>
    </div>
  );
}
