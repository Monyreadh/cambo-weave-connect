import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { TextPage, EditFlag, meta } from "@/components/site/TextPage";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, CONTACT_HREF } from "@/lib/catalog";
import { submitContact } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => meta("Contact — KramiVelle", "Get in touch about the pilot collection, wholesale quotations or partnerships."),
  component: ContactPage,
});
const field = "mt-1.5 block w-full border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent";
function ContactPage() {
  const submit = useServerFn(submitContact);
  const started = useRef(Date.now());
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("consent_privacy") !== "on") { setError("Please agree to the privacy notice so we can reply."); return; }
    setBusy(true);
    setError("");
    try {
      const result = await submit({ data: {
        full_name: String(form.get("full_name") ?? "").trim(), email: String(form.get("email") ?? "").trim(),
        message: String(form.get("message") ?? "").trim(), consent_privacy: true,
        website: String(form.get("website") ?? ""), elapsed_ms: Date.now() - started.current,
      } });
      if (result.ok) setDone(true); else setError(result.error);
    } catch { setError("We couldn't send your message. Please check your details and try again, or email us directly."); }
    finally { setBusy(false); }
  }
  return <TextPage eyebrow="Contact" title="Get in touch">
    <p>Send a message about partnerships or general questions. For product quotations, use our <Link to="/preorder" className="underline">pre-order enquiry form</Link>.</p>
    <p>Email us directly: <a href={CONTACT_HREF} className="underline">{CONTACT_EMAIL}</a></p>
    {done ? <div role="status" aria-live="polite" className="border border-border bg-secondary p-6"><h2>Thank you for getting in touch.</h2><p>Your message has been sent. We'll reply by email.</p></div> :
      <form onSubmit={onSubmit} className="grid gap-6 pt-4">
        <div className="hidden" aria-hidden><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="text-sm">Full name *<input name="full_name" required minLength={2} maxLength={120} autoComplete="name" className={field} /></label>
        <label className="text-sm">Email *<input name="email" type="email" required maxLength={254} autoComplete="email" className={field} /></label>
        <label className="text-sm">Message *<textarea name="message" required minLength={10} maxLength={3000} rows={6} className={field} /></label>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="consent_privacy" required className="mt-1" /><span>I agree that my details are used to respond to this enquiry, as described in the <Link to="/privacy" className="underline">privacy notice</Link>. *</span></label>
        {error && <p role="alert" className="border border-destructive p-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="hero" size="xl" disabled={busy} className="justify-self-start">{busy ? "Sending…" : "Send message"}</Button>
      </form>}
    <p>Based in Switzerland. Postal address: <EditFlag>to be added</EditFlag></p>
  </TextPage>;
}
