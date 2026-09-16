-- ═══════════════════════════════════════════════════════════════════
-- AROMANTLY — Esquema de Supabase (Postgres)
-- Ejecutar completo en el SQL Editor de Supabase (proyecto nuevo).
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ───────────────────────────────────────────────────────────────────
-- PRODUCTOS
-- ───────────────────────────────────────────────────────────────────
create table if not exists products (
  id text primary key,
  name text not null,
  price numeric not null,
  compare_at_price numeric,
  on_sale boolean not null default false,
  levels text[],
  category text not null,
  brand text not null,
  stock integer not null default 0,
  vendor text,
  sizes text[],
  description text,
  images text[],
  home_image_fit text default 'cover',
  created_at timestamptz not null default now()
);

alter table products enable row level security;

drop policy if exists "products_select_public" on products;
create policy "products_select_public" on products
  for select
  to anon, authenticated
  using (true);

drop policy if exists "products_write_authenticated" on products;
create policy "products_write_authenticated" on products
  for all
  to authenticated
  using (true)
  with check (true);

-- ───────────────────────────────────────────────────────────────────
-- PEDIDOS
-- ───────────────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pendiente',
  customer jsonb not null,
  address jsonb not null,
  payment_method text not null,
  notes text,
  items jsonb not null,
  total numeric not null,
  archived_at timestamptz
);

alter table orders enable row level security;

drop policy if exists "orders_insert_public" on orders;
create policy "orders_insert_public" on orders
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "orders_select_authenticated" on orders;
create policy "orders_select_authenticated" on orders
  for select
  to authenticated
  using (true);

drop policy if exists "orders_update_authenticated" on orders;
create policy "orders_update_authenticated" on orders
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "orders_delete_authenticated" on orders;
create policy "orders_delete_authenticated" on orders
  for delete
  to authenticated
  using (true);

-- ───────────────────────────────────────────────────────────────────
-- RESEÑAS
-- ───────────────────────────────────────────────────────────────────
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text,
  rating integer not null,
  quote text not null,
  image text,
  status text not null default 'pendiente',
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;

drop policy if exists "reviews_insert_public" on reviews;
create policy "reviews_insert_public" on reviews
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "reviews_select_approved_public" on reviews;
create policy "reviews_select_approved_public" on reviews
  for select
  to anon
  using (status = 'aprobada');

drop policy if exists "reviews_select_authenticated" on reviews;
create policy "reviews_select_authenticated" on reviews
  for select
  to authenticated
  using (true);

drop policy if exists "reviews_update_authenticated" on reviews;
create policy "reviews_update_authenticated" on reviews
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "reviews_delete_authenticated" on reviews;
create policy "reviews_delete_authenticated" on reviews
  for delete
  to authenticated
  using (true);

-- ───────────────────────────────────────────────────────────────────
-- ESTADÍSTICAS DE PRODUCTO
-- ───────────────────────────────────────────────────────────────────
create table if not exists product_stats (
  product_id text primary key references products(id) on delete cascade,
  views integer not null default 0,
  cart_adds integer not null default 0,
  purchases integer not null default 0
);

alter table product_stats enable row level security;

drop policy if exists "product_stats_select_public" on product_stats;
create policy "product_stats_select_public" on product_stats
  for select
  to anon, authenticated
  using (true);

drop policy if exists "product_stats_write_authenticated" on product_stats;
create policy "product_stats_write_authenticated" on product_stats
  for all
  to authenticated
  using (true)
  with check (true);

create or replace function increment_product_stat(p_product_id text, p_field text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_field not in ('views', 'cart_adds', 'purchases') then
    raise exception 'CAMPO_INVALIDO';
  end if;

  insert into product_stats (product_id, views, cart_adds, purchases)
  values (p_product_id, 0, 0, 0)
  on conflict (product_id) do nothing;

  if p_field = 'views' then
    update product_stats set views = views + 1 where product_id = p_product_id;
  elsif p_field = 'cart_adds' then
    update product_stats set cart_adds = cart_adds + 1 where product_id = p_product_id;
  else
    update product_stats set purchases = purchases + 1 where product_id = p_product_id;
  end if;
end;
$$;

grant execute on function increment_product_stat(text, text) to anon, authenticated;

-- ───────────────────────────────────────────────────────────────────
-- CUPONES
-- ───────────────────────────────────────────────────────────────────
create table if not exists coupons (
  code text primary key,
  discount_type text not null,
  discount_value numeric not null,
  scope text not null default 'cart' check (scope in ('single_product', 'cart')),
  usage_limit integer not null,
  times_used integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table coupons add column if not exists scope text not null default 'cart';
alter table coupons drop constraint if exists coupons_scope_check;
alter table coupons add constraint coupons_scope_check check (scope in ('single_product', 'cart'));

alter table coupons enable row level security;

drop policy if exists "coupons_all_authenticated" on coupons;
create policy "coupons_all_authenticated" on coupons
  for all
  to authenticated
  using (true)
  with check (true);

drop function if exists redeem_coupon(text);

create or replace function redeem_coupon(p_code text, p_item_count integer)
returns table(discount_type text, discount_value numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon coupons%rowtype;
begin
  select * into v_coupon from coupons where code = upper(p_code) for update;

  if v_coupon.code is null or not v_coupon.active then
    raise exception 'CUPON_INVALIDO';
  end if;

  if v_coupon.times_used >= v_coupon.usage_limit then
    raise exception 'CUPON_AGOTADO';
  end if;

  if v_coupon.scope = 'single_product' and p_item_count <> 1 then
    raise exception 'CUPON_NO_APLICA';
  end if;

  update coupons set times_used = times_used + 1 where code = v_coupon.code;

  return query select v_coupon.discount_type, v_coupon.discount_value;
end;
$$;

grant execute on function redeem_coupon(text, integer) to anon, authenticated;

-- ───────────────────────────────────────────────────────────────────
-- CLIENTES (fidelidad)
-- ───────────────────────────────────────────────────────────────────
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  purchases_count integer not null default 0 check (purchases_count >= 0),
  notes text,
  created_at timestamptz not null default now()
);

alter table customers enable row level security;

drop policy if exists "customers_all_authenticated" on customers;
create policy "customers_all_authenticated" on customers
  for all
  to authenticated
  using (true)
  with check (true);

-- Sin policy de select para anon: la tabla no se expone directamente.

create table if not exists loyalty_tiers (
  id uuid primary key default gen_random_uuid(),
  purchases_required integer not null,
  reward_description text not null,
  discount_percent integer,
  coupon_scope text not null default 'cart' check (coupon_scope in ('single_product', 'cart')),
  created_at timestamptz not null default now()
);

alter table loyalty_tiers add column if not exists coupon_scope text not null default 'cart';
alter table loyalty_tiers drop constraint if exists loyalty_tiers_coupon_scope_check;
alter table loyalty_tiers add constraint loyalty_tiers_coupon_scope_check check (coupon_scope in ('single_product', 'cart'));

alter table loyalty_tiers enable row level security;

drop policy if exists "loyalty_tiers_select_public" on loyalty_tiers;
create policy "loyalty_tiers_select_public" on loyalty_tiers
  for select
  to anon, authenticated
  using (true);

drop policy if exists "loyalty_tiers_write_authenticated" on loyalty_tiers;
create policy "loyalty_tiers_write_authenticated" on loyalty_tiers
  for all
  to authenticated
  using (true)
  with check (true);

create table if not exists loyalty_claims (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  tier_id uuid not null references loyalty_tiers(id) on delete cascade,
  requested_at timestamptz not null default now(),
  claimed boolean not null default false,
  claimed_at timestamptz,
  coupon_id text references coupons(code),
  unique (customer_id, tier_id)
);

alter table loyalty_claims enable row level security;

drop policy if exists "loyalty_claims_select_authenticated" on loyalty_claims;
create policy "loyalty_claims_select_authenticated" on loyalty_claims
  for select
  to authenticated
  using (true);

-- Sin policy de insert/update/delete: todo pasa por las funciones de abajo.

-- ───────────────────────────────────────────────────────────────────
-- FUNCIONES DE FIDELIDAD (security definer)
-- ───────────────────────────────────────────────────────────────────

create or replace function get_customer_by_token(p_token text)
returns table(id uuid, name text, purchases_count integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select c.id, c.name, c.purchases_count
    from customers c
    where c.token = p_token;
end;
$$;

grant execute on function get_customer_by_token(text) to anon, authenticated;

create or replace function get_or_create_customer_for_checkout(p_name text, p_phone text)
returns table(id uuid, token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_normalized text;
  v_existing customers%rowtype;
  v_new customers%rowtype;
begin
  v_normalized := right(regexp_replace(p_phone, '\D', '', 'g'), 10);

  select * into v_existing
  from customers c
  where right(regexp_replace(c.phone, '\D', '', 'g'), 10) = v_normalized
  limit 1;

  if v_existing.id is not null then
    return query select v_existing.id, v_existing.token;
    return;
  end if;

  insert into customers (name, phone, purchases_count)
  values (p_name, p_phone, 0)
  returning * into v_new;

  return query select v_new.id, v_new.token;
end;
$$;

grant execute on function get_or_create_customer_for_checkout(text, text) to anon, authenticated;

create or replace function request_loyalty_claim(p_token text, p_tier_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
begin
  select id into v_customer_id from customers where token = p_token;

  if v_customer_id is null then
    raise exception 'CLIENTE_NO_ENCONTRADO';
  end if;

  insert into loyalty_claims (customer_id, tier_id)
  values (v_customer_id, p_tier_id)
  on conflict (customer_id, tier_id) do nothing;
end;
$$;

grant execute on function request_loyalty_claim(text, uuid) to anon, authenticated;

create or replace function get_loyalty_claims_by_token(p_token text)
returns table(
  tier_id uuid,
  requested_at timestamptz,
  claimed boolean,
  claimed_at timestamptz,
  coupon_code text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select lc.tier_id, lc.requested_at, lc.claimed, lc.claimed_at, lc.coupon_id
    from loyalty_claims lc
    join customers c on c.id = lc.customer_id
    where c.token = p_token;
end;
$$;

grant execute on function get_loyalty_claims_by_token(text) to anon, authenticated;

create or replace function confirm_loyalty_claim(p_claim_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claim loyalty_claims%rowtype;
  v_tier loyalty_tiers%rowtype;
  v_code text;
  v_alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_attempt int := 0;
begin
  select * into v_claim from loyalty_claims where id = p_claim_id;

  if v_claim.id is null then
    raise exception 'RECLAMO_NO_ENCONTRADO';
  end if;

  select * into v_tier from loyalty_tiers where id = v_claim.tier_id;

  if v_tier.discount_percent is not null and v_claim.coupon_id is null then
    loop
      v_attempt := v_attempt + 1;
      v_code := 'PREMIO-';
      for i in 1..6 loop
        v_code := v_code || substr(v_alphabet, floor(random() * length(v_alphabet) + 1)::int, 1);
      end loop;

      begin
        insert into coupons (code, discount_type, discount_value, scope, usage_limit, active)
        values (v_code, 'percentage', v_tier.discount_percent, v_tier.coupon_scope, 1, true);
        exit;
      exception
        when unique_violation then
          if v_attempt > 20 then
            raise exception 'NO_SE_PUDO_GENERAR_CUPON';
          end if;
      end;
    end loop;

    update loyalty_claims
      set claimed = true, claimed_at = now(), coupon_id = v_code
      where id = p_claim_id;
  else
    update loyalty_claims
      set claimed = true, claimed_at = now()
      where id = p_claim_id;
  end if;
end;
$$;

grant execute on function confirm_loyalty_claim(uuid) to authenticated;

create or replace function revert_loyalty_claim(p_claim_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claim loyalty_claims%rowtype;
begin
  select * into v_claim from loyalty_claims where id = p_claim_id;

  if v_claim.id is null then
    raise exception 'RECLAMO_NO_ENCONTRADO';
  end if;

  if v_claim.coupon_id is not null then
    update coupons set active = false where code = v_claim.coupon_id;
  end if;

  update loyalty_claims
    set claimed = false, claimed_at = null
    where id = p_claim_id;
end;
$$;

grant execute on function revert_loyalty_claim(uuid) to authenticated;

-- ───────────────────────────────────────────────────────────────────
-- STORAGE: bucket público para imágenes de productos y reseñas
-- ───────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_select_public" on storage.objects;
create policy "product_images_select_public" on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product_images_write_authenticated" on storage.objects;
create policy "product_images_write_authenticated" on storage.objects
  for all
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "product_images_insert_public" on storage.objects;
create policy "product_images_insert_public" on storage.objects
  for insert
  to anon
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = 'reviews');

-- ───────────────────────────────────────────────────────────────────
-- DATOS INICIALES: niveles del programa de fidelidad
-- ───────────────────────────────────────────────────────────────────
insert into loyalty_tiers (purchases_required, reward_description, discount_percent)
select * from (
  values
    (1, 'Descuento de bienvenida', 5),
    (3, 'Muestra de regalo en tu próxima compra', null),
    (5, 'Descuento especial de cliente frecuente', 10),
    (10, 'Perfume de regalo + descuento VIP', 15)
) as t(purchases_required, reward_description, discount_percent)
where not exists (select 1 from loyalty_tiers);
