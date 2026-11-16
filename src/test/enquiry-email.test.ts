import { afterEach, describe, expect, it, vi } from "vitest";
import { sendEnquiryEmail } from "@/lib/enquiry-email.server";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
const input = { subject: "Pre-order CE-TEST", replyTo: "buyer@example.com", fields: { Message: "<script>plain text</script>", Quantity: 12, Consent: true } };
describe("Enquiry email", () => {
  it("sends submitted fields to the business inbox and sets visitor Reply-To", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key"); vi.stubEnv("RESEND_FROM_EMAIL", "KramiVelle <forms@kramivelle.com>");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email-id" }), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);
    await sendEnquiryEmail(input);
    const [url, request] = fetcher.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    expect(JSON.parse(request.body)).toEqual({ from: "KramiVelle <forms@kramivelle.com>", to: ["bd@kramivelle.com"], reply_to: "buyer@example.com", subject: input.subject, text: "Message: <script>plain text</script>\n\nQuantity: 12\n\nConsent: true" });
  });
  it("fails explicitly when email secrets are absent", async () => {
    vi.stubEnv("RESEND_API_KEY", ""); vi.stubEnv("RESEND_FROM_EMAIL", "");
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    await expect(sendEnquiryEmail(input)).rejects.toThrow("not configured");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("does not report success when the provider rejects the email", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key"); vi.stubEnv("RESEND_FROM_EMAIL", "forms@kramivelle.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 403 })));
    await expect(sendEnquiryEmail(input)).rejects.toThrow("403");
  });
});
