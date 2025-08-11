# Foro Criollo — Next.js + Supabase (FIX)

## 1) Supabase
- Ejecuta `supabase/schema.sql` (incluye RPC `increment_views`).
- Auth → habilita Email (magic link).
- Pon tu usuario como `admin` en `profiles`.

## 2) Variables
Crea `.env.local` con:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
CRON_SECRET=supersecreto_para_vercel
```

## 3) Local
```
pnpm i
pnpm dev
```
Home: `/` · Login: `/login` · Admin: `/admin` · Hilo: `/thread/[id]`

## 4) Vercel
- Variables de entorno → mismas que local.
- `vercel.json` programa cron a 14:00 UTC (09:00 Bogotá).
- Probar cron manual:
```
curl -i -H "Authorization: Bearer SU_CRON_SECRET" https://SU-DOMINIO.vercel.app/api/cron/digest
```

## Notas de compatibilidad
- Alias TS `@/*` configurado en `tsconfig.json` (evita “Cannot find module '@/...'”).
- Incluido `next-env.d.ts` para TypeScript.
- Las tarjetas enlazan a `/thread/[id]`.
