import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ORDER_STATUSES, type Product } from "@/lib/catalog";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — KramiVelle" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Lead = Tables<"preorder_requests">;
const input = "w-full border border-input bg-card px-3 py-2 text-sm";

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const check = async (s: Session | null) => {
      setSession(s);
      if (s) {
        const { data } = await supabase.rpc("has_role", { _user_id: s.user.id, _role: "admin" });
        setIsAdmin(!!data);
      } else setIsAdmin(false);
      setReady(true);
    };
    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setTimeout(() => check(s), 0); });
    return () => sub.subscription.unsubscribe();
  }, []);
  if (!ready) return <p className="p-10 text-center">Loading…</p>;
  if (!session) return <Login />;
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <h1 className="text-3xl">No admin access</h1>
        <p className="mt-3 text-sm text-muted-foreground">Signed in as {session.user.email}. This account has not been granted admin rights. Ask the site owner to grant access.</p>
        <Button variant="outline" className="mt-6" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>
    );
  return <Dashboard email={session.user.email ?? ""} />;
}

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")), password = String(f.get("password"));
    setBusy(true);
    const { error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (error) toast.error(error.message);
    else if (mode === "up") toast.success("Check your email to confirm your account.");
  }
  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-2 text-4xl text-primary">{mode === "in" ? "Sign in" : "Create account"}</h1>
      <form onSubmit={go} className="mt-8 space-y-4">
        <label className="block text-sm">Email<input name="email" type="email" required className={input} /></label>
        <label className="block text-sm">Password<input name="password" type="password" minLength={8} required className={input} /></label>
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>{busy ? "…" : mode === "in" ? "Sign in" : "Sign up"}</Button>
      </form>
      <button className="mt-4 text-xs underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "Need an account?" : "Have an account? Sign in"}</button>
      <p className="mt-4 text-xs text-muted-foreground">New accounts have no admin rights until granted by the owner.</p>
    </div>
  );
}

function Dashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<"leads" | "products">("leads");
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl text-primary">Admin</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{email}</span>
          <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        {(["leads", "products"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs uppercase tracking-widest ${tab === t ? "bg-primary text-primary-foreground" : "border border-border"}`}>{t === "leads" ? "Enquiries" : "Products"}</button>
        ))}
      </div>
      {tab === "leads" ? <Leads /> : <Products />}
    </div>
  );
}

function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const load = async () => {
    const { data, error } = await supabase.from("preorder_requests").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setLeads(data);
  };
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => leads.filter((l) => (status === "all" || l.status === status) &&
    (!q || `${l.reference} ${l.full_name} ${l.email} ${l.company ?? ""} ${l.country} ${l.product_name ?? ""}`.toLowerCase().includes(q.toLowerCase()))), [leads, q, status]);
  const count = (key: keyof Lead) => Object.entries(leads.reduce<Record<string, number>>((a, l) => { const k = String(l[key] ?? "—"); a[k] = (a[k] ?? 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]);

  async function update(id: string, patch: Partial<Lead>) {
    const { error } = await supabase.from("preorder_requests").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Saved"); setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l))); }
  }
  function exportCsv() {
    const cols: (keyof Lead)[] = ["reference", "created_at", "status", "buyer_type", "full_name", "company", "email", "phone", "country", "product_name", "preferred_design", "quantity", "target_date", "message", "marketing_opt_in", "internal_notes"];
    const esc = (v: unknown) => { let s = v == null ? "" : String(v); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
    const csv = [cols.join(","), ...filtered.map((l) => cols.map((c) => esc(l[c])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }
  return (
    <div className="mt-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi title="Total enquiries" rows={[["All", leads.length]]} />
        <Kpi title="By status" rows={count("status")} />
        <Kpi title="By country" rows={count("country")} />
        <Kpi title="By product" rows={count("product_name")} />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, reference…" className={`${input} max-w-xs`} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${input} w-40`}>
          <option value="all">All statuses</option>{ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
        <Button variant="ghost" onClick={load}>Refresh</Button>
      </div>
      <div className="mt-6 space-y-4">
        {filtered.length === 0 && <p className="py-10 text-center text-muted-foreground">No enquiries yet.</p>}
        {filtered.map((l) => <LeadRow key={l.id} l={l} onSave={(p) => update(l.id, p)} />)}
      </div>
    </div>
  );
}

function Kpi({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="eyebrow">{title}</p>
      <ul className="mt-2 space-y-1 text-sm">{rows.slice(0, 5).map(([k, v]) => <li key={k} className="flex justify-between"><span className="capitalize">{k}</span><span className="font-serif text-lg">{v}</span></li>)}</ul>
    </div>
  );
}

function LeadRow({ l, onSave }: { l: Lead; onSave: (p: Partial<Lead>) => void }) {
  const [notes, setNotes] = useState(l.internal_notes ?? "");
  return (
    <div className="grid gap-4 border border-border bg-card p-5 md:grid-cols-3">
      <div className="text-sm">
        <p className="font-serif text-xl text-accent">{l.reference}</p>
        <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</p>
        <p className="mt-2 font-medium">{l.full_name}{l.company ? ` · ${l.company}` : ""}</p>
        <p><a href={`mailto:${l.email}`} className="underline">{l.email}</a>{l.phone ? ` · ${l.phone}` : ""}</p>
        <p className="text-muted-foreground">{l.country} · {l.buyer_type}{l.marketing_opt_in ? " · marketing opt-in" : ""}</p>
      </div>
      <div className="text-sm">
        <p><strong>{l.product_name ?? "General"}</strong>{l.preferred_design ? ` — ${l.preferred_design}` : ""}</p>
        <p>Qty {l.quantity}{l.target_date ? ` · by ${l.target_date}` : ""}</p>
        {l.message && <p className="mt-2 whitespace-pre-line text-muted-foreground">{l.message}</p>}
      </div>
      <div className="space-y-2">
        <select value={l.status} onChange={(e) => onSave({ status: e.target.value })} className={input} aria-label="Status">
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Internal notes" className={input} />
        <Button size="sm" variant="outline" onClick={() => onSave({ internal_notes: notes })}>Save notes</Button>
      </div>
    </div>
  );
}

function Products() {
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => {
    supabase.from("products").select("*").order("sort_order").then(({ data, error }) => {
      if (error) toast.error(error.message); else setItems((data ?? []) as unknown as Product[]);
    });
  }, []);
  return <div className="mt-8 space-y-6">{items.map((p) => <ProductEditor key={p.id} p={p} />)}</div>;
}

function ProductEditor({ p }: { p: Product }) {
  const [d, setD] = useState({ ...p, specsText: p.specs.map((s) => `${s.label}: ${s.value}`).join("\n"), designsText: p.designs.join("\n"), imagesText: p.images.join("\n") });
  const set = (k: string, v: unknown) => setD((x) => ({ ...x, [k]: v }));
  async function save() {
    const lines = (t: string) => t.split("\n").map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from("products").update({
      name: d.name, status: d.status, published: d.published, requestable: d.requestable,
      short_description: d.short_description, story: d.story, wholesale_notes: d.wholesale_notes, moq_note: d.moq_note,
      designs: lines(d.designsText), images: lines(d.imagesText),
      specs: lines(d.specsText).map((l) => { const i = l.indexOf(":"); return i < 0 ? { label: l, value: "To confirm" } : { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() || "To confirm" }; }),
    }).eq("id", p.id);
    if (error) toast.error(error.message); else toast.success(`${d.name} saved`);
  }
  return (
    <details className="border border-border bg-card p-5">
      <summary className="cursor-pointer font-serif text-xl">{d.name} <span className="text-xs text-muted-foreground">/{p.slug} · {d.status}{d.published ? "" : " · hidden"}</span></summary>
      <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
        <label>Name<input className={input} value={d.name} onChange={(e) => set("name", e.target.value)} /></label>
        <label>Status<select className={input} value={d.status} onChange={(e) => set("status", e.target.value)}><option value="pilot">Pilot</option><option value="concept">Concept</option><option value="coming_later">Coming later</option></select></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={d.published} onChange={(e) => set("published", e.target.checked)} /> Published</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={d.requestable} onChange={(e) => set("requestable", e.target.checked)} /> Open for enquiries</label>
        <label className="md:col-span-2">Short description<input className={input} value={d.short_description} onChange={(e) => set("short_description", e.target.value)} /></label>
        <label className="md:col-span-2">Story<textarea rows={4} className={input} value={d.story} onChange={(e) => set("story", e.target.value)} /></label>
        <label>Specifications (one per line, "Label: value")<textarea rows={6} className={input} value={d.specsText} onChange={(e) => set("specsText", e.target.value)} /></label>
        <label>Image URLs (one per line)<textarea rows={6} className={input} value={d.imagesText} onChange={(e) => set("imagesText", e.target.value)} /></label>
        <label>Designs (one per line)<textarea rows={3} className={input} value={d.designsText} onChange={(e) => set("designsText", e.target.value)} /></label>
        <label>Wholesale notes<textarea rows={3} className={input} value={d.wholesale_notes} onChange={(e) => set("wholesale_notes", e.target.value)} /></label>
        <label className="md:col-span-2">MOQ note<input className={input} value={d.moq_note} onChange={(e) => set("moq_note", e.target.value)} /></label>
      </div>
      <Button variant="hero" className="mt-4" onClick={save}>Save product</Button>
    </details>
  );
}
