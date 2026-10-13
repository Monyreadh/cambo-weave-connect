import { createFileRoute } from "@tanstack/react-router";
import { TextPage, meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/about")({
  head: () => meta("About — Cambodia Everywhere", "Our mission: connect Cambodian makers to global buyers with transparent storytelling and responsible market access."),
  component: () => (
    <TextPage eyebrow="About" title="Cambodia, everywhere.">
      <p>Cambodia Everywhere is a planned global platform for authentic Cambodian products. Our mission is to connect Cambodian makers with buyers around the world through transparent storytelling, modern design and responsible market access.</p>
      <p>We are starting with a pilot in Switzerland focused on scarves and table linen, with France, Germany and the broader EU to follow — and, later, home décor and other Cambodian products.</p>
      <h2>How we work</h2>
      <p>We are curating with Cambodian makers — supplier partnerships are being finalised. Until they are, our catalogue is presented as concepts, with specifications to be confirmed and imagery that is illustrative only. We prefer to say "to confirm" rather than promise something we can't yet verify.</p>
    </TextPage>
  ),
});
