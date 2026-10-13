
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('scarves','table-linen','home-accents')),
  status text not null default 'concept' check (status in ('pilot','concept','coming_later')),
  published boolean not null default true,
  requestable boolean not null default true,
  short_description text not null default '',
  story text not null default '',
  specs jsonb not null default '[]'::jsonb,
  wholesale_notes text not null default '',
  moq_note text not null default 'Indicative: 18–60 pieces per design; to be confirmed by product',
  designs text[] not null default '{}',
  images text[] not null default '{}',
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Public reads published products" on public.products for select to anon, authenticated using (published = true);
create policy "Admins read all products" on public.products for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins insert products" on public.products for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Admins update products" on public.products for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins delete products" on public.products for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

create table public.preorder_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  buyer_type text not null check (buyer_type in ('consumer','retailer','corporate','hospitality','distributor')),
  full_name text not null,
  company text,
  email text not null,
  country text not null,
  phone text,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  preferred_design text,
  quantity int not null check (quantity >= 1 and quantity <= 100000),
  target_date date,
  message text,
  consent_privacy boolean not null,
  marketing_opt_in boolean not null default false,
  status text not null default 'new' check (status in ('new','contacted','quoted','confirmed','closed')),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.preorder_requests to anon, authenticated;
grant select, update, delete on public.preorder_requests to authenticated;
grant all on public.preorder_requests to service_role;
alter table public.preorder_requests enable row level security;
create policy "Anyone can submit an enquiry" on public.preorder_requests for insert to anon, authenticated
  with check (consent_privacy = true and status = 'new' and internal_notes is null);
create policy "Admins read enquiries" on public.preorder_requests for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins update enquiries" on public.preorder_requests for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins delete enquiries" on public.preorder_requests for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger preorders_touch before update on public.preorder_requests for each row execute function public.touch_updated_at();

create or replace function public.validate_preorder() returns trigger language plpgsql security definer set search_path = public as $$
declare recent int; total int;
begin
  if length(new.full_name) < 2 or length(new.full_name) > 120 then raise exception 'Invalid name'; end if;
  if new.email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(new.email) > 254 then raise exception 'Invalid email'; end if;
  if length(new.country) > 80 or length(coalesce(new.company,'')) > 160 or length(coalesce(new.phone,'')) > 40
     or length(coalesce(new.message,'')) > 3000 or length(coalesce(new.preferred_design,'')) > 160
     or length(coalesce(new.product_name,'')) > 160 or length(new.reference) > 32 then
    raise exception 'Field too long'; end if;
  select count(*) into recent from public.preorder_requests where lower(email) = lower(new.email) and created_at > now() - interval '1 hour';
  if recent >= 5 then raise exception 'Too many requests, please try again later'; end if;
  select count(*) into total from public.preorder_requests where created_at > now() - interval '10 minutes';
  if total >= 100 then raise exception 'Too many requests, please try again later'; end if;
  new.status := 'new'; new.internal_notes := null; new.created_at := now();
  return new;
end $$;
create trigger preorders_validate before insert on public.preorder_requests for each row execute function public.validate_preorder();

insert into public.products (slug,name,category,status,requestable,short_description,story,specs,wholesale_notes,designs,images,sort_order) values
('heritage-weave-scarf','Heritage Weave Scarf','scarves','pilot',true,
 'A concept scarf inspired by Cambodian weaving traditions — designed for boutiques and thoughtful gifting.',
 'Concept description (illustrative): The Heritage Weave Scarf is envisaged as a tribute to the patterns and colour stories of Cambodian weaving, reinterpreted for a contemporary European wardrobe. Final materials, dimensions and motifs will be confirmed with our maker partners before any quotation.',
 '[{"label":"Material","value":"To confirm"},{"label":"Dimensions","value":"To confirm"},{"label":"Weight","value":"To confirm"},{"label":"Weaving technique","value":"To confirm"},{"label":"Care","value":"To confirm"},{"label":"Packaging","value":"To confirm"},{"label":"Lead time","value":"Variable — supplier may quote up to ~8 weeks"}]'::jsonb,
 'Suited to concept stores, museum shops, gift retailers and corporate gifting programmes. Custom colourways may be discussed on request.',
 '{"Indigo & terracotta (concept)","Indigo & gold (concept)","To be proposed"}','{"/images/scarf.jpg","/images/hero.jpg"}',10),
('khmer-table-linen-napkins','Khmer Table Linen Napkins','table-linen','pilot',true,
 'Concept woven napkins with a discreet border motif, imagined for hospitality and fine home tables.',
 'Concept description (illustrative): A set of woven table napkins drawing on Khmer border motifs, intended for restaurants, hotels and design-led homes. Fabric, size, set quantity and finishing are to be confirmed with makers.',
 '[{"label":"Material","value":"To confirm"},{"label":"Dimensions","value":"To confirm"},{"label":"Set size","value":"To confirm"},{"label":"Colourways","value":"To confirm"},{"label":"Care","value":"To confirm"},{"label":"Packaging","value":"To confirm"},{"label":"Lead time","value":"Variable — supplier may quote up to ~8 weeks"}]'::jsonb,
 'Suited to hospitality groups, restaurants, homeware boutiques and gift retailers. Volume and set configuration to be quoted per request.',
 '{"Terracotta border (concept)","Ivory border (concept)","To be proposed"}','{"/images/napkins.jpg"}',20),
('contemporary-krama-scarf','Contemporary Krama Scarf','scarves','concept',true,
 'A modern interpretation of the iconic checked krama — a concept under exploration.',
 'Concept description (illustrative): The krama is an everyday checked cloth deeply rooted in Cambodian life. This concept explores a refined, contemporary version for European buyers. Feasibility, materials and pricing are still to be explored.',
 '[{"label":"Material","value":"To confirm"},{"label":"Dimensions","value":"To confirm"},{"label":"Check pattern","value":"To confirm"},{"label":"Care","value":"To confirm"},{"label":"Lead time","value":"To confirm"}]'::jsonb,
 'Expressions of interest welcome; helps us gauge demand before development.',
 '{"Navy & ivory check (concept)","To be proposed"}','{"/images/krama.jpg"}',30),
('woven-cushion-covers','Woven Cushion Covers','home-accents','coming_later',false,
 'Future home décor line — not yet available for enquiry.','Planned for a later phase of the collection.','[]'::jsonb,'','{}','{}',40),
('heritage-throws','Heritage Throws','home-accents','coming_later',false,
 'Future home décor line — not yet available for enquiry.','Planned for a later phase of the collection.','[]'::jsonb,'','{}','{}',50),
('lanterns','Lanterns','home-accents','coming_later',false,
 'Future home décor line — not yet available for enquiry.','Planned for a later phase of the collection.','[]'::jsonb,'','{}','{}',60);
