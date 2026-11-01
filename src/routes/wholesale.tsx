import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { TextPage, meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/wholesale")({
  head: () => meta("Wholesale with CamTrade — KramiVelle", "B2B quotations for boutiques, gifting, hospitality and distributors in Switzerland and Europe."),
  component: () => (
    <TextPage eyebrow="CamTrade · B2B" title="Wholesale & export">
      <p>CamTrade is the proposed wholesale and export channel of KramiVelle, connecting European buyers with Cambodian textile makers. We work by quotation — every order is tailored.</p>
      <h2>Who it's for</h2>
      <p>Boutiques and concept stores, gift retailers, corporate gifting programmes, hotels and restaurants, and distributors.</p>
      <h2>The process</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li><strong>Select</strong> pieces from the concept catalogue.</li>
        <li><strong>Submit a request</strong> — non-binding, no payment.</li>
        <li><strong>Tailored quote</strong> with confirmed specifications, quantities and lead time.</li>
        <li><strong>Approve samples</strong> where applicable.</li>
        <li><strong>Confirm order</strong> in writing; a production deposit (e.g. 50%) may be requested.</li>
      </ol>
      <h2>Indicative conditions</h2>
      <p>Reported by makers and not guaranteed for every product: minimum order typically 18–60 units per design; lead time variable, possibly up to ~8 weeks. Everything is confirmed in your quote.</p>
      <Button asChild variant="hero" size="xl" className="mt-6"><Link to="/preorder">Request a quotation</Link></Button>
    </TextPage>
  ),
});
