# Backaim Landing

Production-ready Next.js App Router landing page for Backaim, including an operator application form and API endpoint wiring.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Supabase (`@supabase/supabase-js`) for operator application persistence

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_BACKEND_URL=https://api.backaim.com
NEXT_PUBLIC_OPERATOR_FORM_TARGET=/api/operator-apply
```

3. (Server-side API only) add Supabase secrets:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_OPERATOR_APPLICATIONS_TABLE=operator_applications
```

4. Run locally:

```bash
npm run dev
```

5. Production build check:

```bash
npm run build
```

## Operator form behavior

- Client submit URL is controlled by:
  - `NEXT_PUBLIC_OPERATOR_FORM_TARGET`
  - `NEXT_PUBLIC_BACKEND_URL`
  - `NEXT_PUBLIC_APP_ENV`
- In production (`NEXT_PUBLIC_APP_ENV=production`) with a backend URL set, the form submits to `NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_OPERATOR_FORM_TARGET`.
- Otherwise, it uses `NEXT_PUBLIC_OPERATOR_FORM_TARGET` directly (useful for local API routes).

## Deploy to Vercel

1. Link project:

```bash
vercel link
```

2. Add required env vars in Vercel:

```bash
vercel env add NEXT_PUBLIC_APP_ENV production
vercel env add NEXT_PUBLIC_BACKEND_URL https://api.backaim.com
vercel env add NEXT_PUBLIC_OPERATOR_FORM_TARGET /api/operator-apply
```

3. If using in-project API route + Supabase, also add:

```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_OPERATOR_APPLICATIONS_TABLE
```

4. Deploy:

```bash
vercel --prod
```
