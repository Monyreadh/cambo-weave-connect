import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
const schema = z.object({
  full_name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(3000), consent_privacy: z.literal(true),
  website: z.string().max(200).default(""), elapsed_ms: z.number().min(0),
});
// Best-effort per-instance rate limit, in addition to the honeypot.
const recent = new Map<string, number>();
export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((data: z.input<typeof schema>) => schema.parse(data))
  .handler(async ({ data }) => {
    if (data.website || data.elapsed_ms < 2500) return { ok: true as const };
    const now = Date.now();
    for (const [email, time] of recent) if (now - time >= 60000) recent.delete(email);
    const email = data.email.toLowerCase();
    if (recent.has(email)) return { ok: false as const, error: "Please wait a minute before sending another message." };
    recent.set(email, now);
    try {
      const { sendEnquiryEmail } = await import("./enquiry-email.server");
      await sendEnquiryEmail({ subject: "KramiVelle website contact enquiry", replyTo: data.email,
        fields: { Name: data.full_name, Email: data.email, Message: data.message, "Privacy consent": data.consent_privacy } });
      return { ok: true as const };
    } catch {
      recent.delete(email);
      console.error("Contact notification could not be sent");
      return { ok: false as const, error: "We couldn't send your message. Please try again later or email bd@kramivelle.com directly." };
    }
  });
