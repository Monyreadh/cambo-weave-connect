import { createFileRoute, Link } from "@tanstack/react-router";
import { TextPage, EditFlag, meta } from "@/components/site/TextPage";
import { PLACEHOLDER_EMAIL } from "@/lib/catalog";

export const Route = createFileRoute("/contact")({
  head: () => meta("Contact — KramiVelle", "Get in touch about the pilot collection, wholesale quotations or partnerships."),
  component: () => (
    <TextPage eyebrow="Contact" title="Get in touch">
      <p>For quotations and pre-orders, the fastest route is the <Link to="/preorder" className="underline">pre-order enquiry form</Link> — it gives you a reference number.</p>
      <p>General enquiries: <EditFlag>{PLACEHOLDER_EMAIL}</EditFlag> <span className="text-xs">(placeholder — to be replaced)</span></p>
      <p>Based in Switzerland. Postal address: <EditFlag>to be added</EditFlag></p>
    </TextPage>
  ),
});
