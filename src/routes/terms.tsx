import { createFileRoute } from "@tanstack/react-router";
import { TextPage, EditFlag, meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/terms")({
  head: () => meta("Terms — Cambodia Everywhere", "Terms for enquiries and quotations on the Cambodia Everywhere pilot collection."),
  component: () => (
    <TextPage eyebrow="Legal · draft" title="Terms of enquiry">
      <p className="text-xs">Draft placeholder — to be reviewed by a qualified advisor before launch.</p>
      <h2>Enquiries are non-binding</h2>
      <p>Submitting a pre-order request does not create a contract. No payment is taken on this website. An order exists only after a written quotation is accepted and confirmed by both parties.</p>
      <h2>Catalogue</h2>
      <p>Products shown are concepts. Images are illustrative; specifications, prices, minimum quantities and lead times are confirmed per quotation and may differ between products.</p>
      <h2>Deposits</h2>
      <p>A production deposit (e.g. 50%) may be requested after a quotation is agreed, under terms stated in that quotation.</p>
      <h2>Operator</h2>
      <p><EditFlag>Company details to be added</EditFlag></p>
    </TextPage>
  ),
});
