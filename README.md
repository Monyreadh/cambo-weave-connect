# Cambo Weave Connect

Build a production-minded full-stack responsive website MVP, for my project "Cambodia Everywhere | Heritage Textiles" (commercial export channel: CamTrade). I am the business founder and need working live buyer preorder-request functionality, product catalogue, and admin order-management backend. Create the actual app/code, not a proposal or just static mockup.

BUSINESS CONTEXT:
- Cambodia Everywhere is a planned global platform for authentic Cambodian products; CamTrade is the proposed B2B market-access, wholesale and export commercialization operation.
- Pilot focuses on scarves and table napkins, with future home décor (cushions, throws, lanterns) and eventually nontextiles. Exploring supply partnership with Cambodian company Norea, contact Ms Thany. This is NOT a confirmed signed partnership. Do not represent Norea as formally partnered or use its logo. Say "Curated with Cambodian makers — supplier partnerships being finalised" and note indicative catalogue.
- Pilot target Switzerland, expanding to France, Germany and broader EU. Audience: boutique owners, gift retailers, corporate buyers, hospitality and conscious shoppers. Sales flow is buyer-funded quotation / pre-order REQUEST, not a charged sale; terms subject to confirmation.
- Supplier production conditions reported but not confirmed for all products: typical min order varies between 18 and 60 units per design; 50% production deposit may be required after quote/contract; lead-time is variable and supplier may quote up to 8 weeks. Do not present these as guaranteed fixed terms across all products.
- No exact product specifications, inventory quantities, prices or photos are confirmed. NEVER invent actual Norea product pricing, silk content, origin claims or compliance certifications. Use attractive carefully labeled *illustrative collection* mockup images and honest "Concept catalogue / specifications to be confirmed" product badges. Prices "Request quotation", never fake amounts. For 2 initial illustrative pilot SKUs: "Heritage Weave Scarf" (scarves), "Khmer Table Linen Napkins" (table linens), plus maybe third "Contemporary Krama Scarf" as concept. Default MOQ "indicative: 18-60 pieces; confirm by product" rather than enforce a universally inaccurate 18 or 60. Additional décor marked "Coming later" not requestable.
- Brand: editorial premium Cambodian craftsmanship meets modern Swiss/European taste; tasteful warm ivory, deep indigo/navy, muted terracotta, antique gold; refined serif headings + modern sans typography; discreet Khmer weave motif; luxury lifestyle photo direction; high-end editorial layout (real typographic hierarchy, plenty whitespace, mobile responsive, subtle interactions).
- Tagline: "Crafted in Cambodia. Curated for the World."
- About: mission to connect Cambodian makers to global buyers with transparent storytelling, modern design and responsible market access. No unverifiable impact metrics or certification claims.

CRITICAL FUNCTIONAL FEATURES:
1) Home: refined hero CTAs "Explore collection" and "Request a pre-order"; clear customer paths "For retailers" vs "For individuals" and an explanation of pilot.
2) Products listing searchable/filterable (scarves, table linen, home accents) with pilot/coming soon tags; product detail pages with photo gallery, product story (clearly concept illustrative), specs field list (unknown fields show "To confirm"), wholesale suitability, FAQ and Request sample/Pre-order CTA.
3) Preorder request form, reachable from products AND general CTA; collect buyer type (consumer, boutique/retailer, corporate gifting, hospitality, distributor), full name, business/company optional, email, country (list incl Switzerland France Germany Netherlands other), phone optional, selected product and preferred design (if relevant), quantity (integer >=1; MOQ guidance but accept enquiries), target delivery date optional, message, consent to privacy/contact plus separate optional marketing opt-in. Explain "This is a non-binding pre-order enquiry. No payment is taken, no order accepted until a written quote and confirmation." Distinguish request submission from confirmed order. Avoid promises. Form robust validation, loading/errors, accessible success state with reference code and summary. Store submissions SERVER-SIDE persistently, not only localStorage or email client.
4) Secure admin dashboard /admin: require login, restrict access via RLS/role checks, show preorder leads with search filters status New / Contacted / Quoted / Confirmed / Closed, ability to update status and internal notes, export lead CSV securely, at-a-glance KPIs by country/product, edit product availability/descriptions/specifications/images through authenticated admin (if feasible). No unauthenticated GET of contact data or orders.
5) Database schema: products, preorder_requests, admin roles where needed. Supabase/Lovable Cloud with policies: public SELECT only published products, anonymous INSERT validated for inquiries; only authenticated admin can SELECT/UPDATE preorders; admin role server-side not user-editable. Add spam protection honeypot and at least basic request limit where feasible. Ensure admin can't be self-elevated by public signup. If backend permission/setup is blocked, clearly explain steps and do not fake working submissions.
6) Privacy, terms, contact pages with professional placeholders, visibly flagged editable contact email, no invented company registration, no unsupported legal compliance claims. GDPR-conscious consent; avoid unneeded collection. No payments or Stripe for this MVP. Basic metadata/SEO/OpenGraph, accessible and responsive.
7) Navigation with clear "Pre-order enquiry" CTA; footer "Pilot collection — quotations and availability subject to confirmation." Include a buyer-facing wholesale landing section and process: select → submit request → tailored quote → approve samples → confirm order.
8) Provide sensible product CMS defaults as concept descriptions rather than fictitious seller data, and easy edit/replace content through admin.

Please fully implement the site including routing, functional forms, DB and secure admin authorization, then run build and address errors. If approval or account setup needed for database, surface it. The site must be presentable to Chanrany and overseas buyer prospects without misrepresenting facts.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cambo-weave-connect.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/70062d54-9c90-4f0b-b948-dce56432dc21).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Form email notifications (Resend)

Contact form messages and saved pre-order enquiries are emailed to `bd@kramivelle.com`.
Set these **server-side secrets** in the hosting environment (Lovable), or in `.env.local` for local development:

- `RESEND_API_KEY`: a Resend API key with email sending permission.
- `RESEND_FROM_EMAIL`: a sender on a domain verified in Resend, for example `KramiVelle <notifications@kramivelle.com>` after verifying that domain.

Never prefix these secrets with `VITE_` or commit their values. Redeploy after configuring them.
The visitor's email is set as Reply-To. All submitted business fields and consent choices are included as plain text.
Contact messages show success only after Resend accepts them. Pre-orders remain saved in the admin database if email fails; the confirmation warns the visitor and provides a direct email fallback. There is no automatic retry for failed pre-order notifications; check the admin inbox for saved enquiries.

Verify both forms in the deployed environment with a real submission, confirm delivery to `bd@kramivelle.com`, and test Reply-To before launch. Contact anti-spam uses a honeypot, minimum completion time, and a best-effort per-server-instance email rate limit; use a shared rate limiter or CAPTCHA if abuse increases.
