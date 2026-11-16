import { CONTACT_EMAIL } from "./catalog";

export async function sendEnquiryEmail(input: { subject: string; replyTo: string; fields: Record<string, string | number | boolean> }) {
  const key = process.env["RESEND_API_KEY"];
  const from = process.env["RESEND_FROM_EMAIL"];
  if (!key || !from) throw new Error("Email service is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [CONTACT_EMAIL], reply_to: input.replyTo, subject: input.subject,
      text: Object.entries(input.fields).map(([label, value]) => `${label}: ${value}`).join("\n\n") }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}
