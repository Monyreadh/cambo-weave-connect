import { createFileRoute } from "@tanstack/react-router";
import { TextPage, EditFlag, meta } from "@/components/site/TextPage";
import { CONTACT_EMAIL, CONTACT_HREF } from "@/lib/catalog";

export const Route = createFileRoute("/privacy")({
  head: () => meta("Privacy notice — KramiVelle", "How we handle the personal data you share in pre-order enquiries."),
  component: () => (
    <TextPage eyebrow="Legal · draft" title="Privacy notice">
      <p className="text-xs">Draft placeholder — to be reviewed by a qualified advisor before launch.</p>
      <h2>What we collect</h2>
      <p>When you submit an enquiry: buyer type, name, optional company and phone, email, country, product interest, quantity, optional target date and your message. Nothing else is required.</p>
      <h2>Why</h2>
      <p>To respond to your enquiry and prepare a quotation. If you separately opt in, to send occasional collection news.</p>
      <h2>Storage & access</h2>
      <p>Enquiries are stored on our secured hosting provider and accessible only to authorised administrators. We do not sell your data.</p>
      <h2>Your rights</h2>
      <p>You may request access, correction or deletion, or withdraw marketing consent, by writing to <a href={CONTACT_HREF} className="underline">{CONTACT_EMAIL}</a>.</p>
      <h2>Controller</h2>
      <p>Operator details: <EditFlag>legal entity name and address to be added</EditFlag></p>
    </TextPage>
  ),
});
