import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { Product } from "./catalog";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const COLS =
  "id, slug, name, category, status, published, requestable, short_description, story, specs, wholesale_notes, moq_note, designs, images, sort_order";

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("products").select(COLS).order("sort_order");
  if (error) {
    console.error(error);
    return [] as Product[];
  }
  return (data ?? []) as unknown as Product[];
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row } = await publicClient().from("products").select(COLS).eq("slug", data.slug).maybeSingle();
    return (row ?? null) as unknown as Product | null;
  });

const preorderSchema = z.object({
  buyer_type: z.enum(["consumer", "retailer", "corporate", "hospitality", "distributor"]),
  full_name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().email().max(254),
  country: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(40).optional().default(""),
  product_slug: z.string().max(120).optional().default(""),
  preferred_design: z.string().trim().max(160).optional().default(""),
  quantity: z.number().int().min(1).max(100000),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")).default(""),
  message: z.string().trim().max(3000).optional().default(""),
  consent_privacy: z.literal(true),
  marketing_opt_in: z.boolean().default(false),
  website: z.string().max(200).optional().default(""), // honeypot
  elapsed_ms: z.number().optional().default(0),
});

export type PreorderInput = z.input<typeof preorderSchema>;

function makeRef() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let s = "";
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `CE-${s}`;
}

export const submitPreorder = createServerFn({ method: "POST" })
  .inputValidator((d: PreorderInput) => preorderSchema.parse(d))
  .handler(async ({ data }) => {
    // Honeypot / too-fast bot submissions: pretend success, store nothing.
    if (data.website || (data.elapsed_ms > 0 && data.elapsed_ms < 2500)) {
      return { ok: true as const, reference: makeRef() };
    }
    const sb = publicClient();
    let product_id: string | null = null;
    let product_name: string | null = null;
    if (data.product_slug) {
      const { data: p } = await sb.from("products").select("id, name, requestable").eq("slug", data.product_slug).maybeSingle();
      if (p && p.requestable) {
        product_id = p.id;
        product_name = p.name;
      }
    }
    const reference = makeRef();
    const { error } = await sb.from("preorder_requests").insert({
      reference,
      buyer_type: data.buyer_type,
      full_name: data.full_name,
      company: data.company || null,
      email: data.email,
      country: data.country,
      phone: data.phone || null,
      product_id,
      product_name: product_name ?? (data.product_slug ? null : "General enquiry"),
      preferred_design: data.preferred_design || null,
      quantity: data.quantity,
      target_date: data.target_date || null,
      message: data.message || null,
      consent_privacy: true,
      marketing_opt_in: data.marketing_opt_in,
    });
    if (error) {
      console.error("preorder insert failed", error.message);
      if (error.message.includes("Too many")) {
        return { ok: false as const, error: "Too many requests from this address. Please try again in an hour." };
      }
      return { ok: false as const, error: "We couldn't save your enquiry. Please check your details and try again." };
    }
    return { ok: true as const, reference, product_name };
  });
