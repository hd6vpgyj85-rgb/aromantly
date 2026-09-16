# Aromantly

Tienda en línea de perfumes para Cd. Juárez, México. React 19 + TypeScript + Vite, con Supabase como backend y checkout por WhatsApp (sin pasarela de pago).

## Stack

- React 19 + TypeScript + Vite 8
- React Router DOM v7
- Supabase (Postgres + Auth + Storage)
- CSS plano por componente, mobile-first
- Deploy como sitio estático en Cloudflare Workers

## Configuración

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ejecuta el contenido de `supabase/schema.sql` completo en el SQL Editor de tu proyecto.
3. En **Authentication → Users**, crea el usuario admin (email/password) que usarás para entrar a `/admin`.
4. Copia `.env.example` a `.env.local` y llena tus credenciales:

   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

5. Instala dependencias y corre el proyecto:

   ```
   npm install
   npm run dev
   ```

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción (`tsc -b && vite build`)
- `npm run preview` — sirve el build localmente
- `npm run deploy` — build + `wrangler deploy` (Cloudflare Workers)

## Panel de administración

`/admin` — requiere iniciar sesión con el usuario creado en Supabase Auth. Desde ahí se gestionan productos, categorías, pedidos, reseñas, cupones, clientes y el programa de fidelidad.

## Notas

- Las fotos de portada del home (`/images/hero-perfumes.jpg`, `/images/tienda-interior.jpg`) son referencias a imágenes reales de la tienda que aún no existen en este repo — agrégalas en `public/images/` con esos nombres, o cambia las rutas en los componentes correspondientes.
- El WhatsApp de la tienda y el builder de mensajes viven en `src/data/store.ts` (`storeInfo.whatsappNumber`, `getWhatsAppUrl`).
- No hay pasarela de pago: todo el checkout termina abriendo WhatsApp con el pedido prellenado.
