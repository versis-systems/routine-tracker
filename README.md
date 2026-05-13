# Routine Tracker

Een persoonlijke PWA routine tracker gebouwd met Next.js 14, TypeScript, Tailwind CSS en Supabase.

## Functionaliteiten

- **Dagelijkse checklist** — markeer stappen als gedaan met animaties
- **Routines beheren** — maak, bewerk en verwijder routines + stappen
- **Drag-to-reorder** — versleep stappen om de volgorde te wijzigen
- **Retinol opbouwschema** — fase-gebaseerde stap activering
- **Statistieken** — streak tracker, 30-daags gemiddelde, weekoverzicht
- **PWA** — installeerbaar op iOS/Android, offline-capable
- **Dark/Light theme** — standaard dark, toggle beschikbaar

## Setup

### 1. Supabase configureren

1. Ga naar [supabase.com](https://supabase.com) en maak een project aan (of gebruik het bestaande project `sqmzfipmcrrvnoqkamyb`)
2. Ga naar **SQL Editor** en voer het bestand `supabase/schema.sql` uit
3. Kopieer je **Project URL** en **API Keys** (Settings → API)

### 2. Environment variables

Maak een `.env.local` bestand (of kopieer van `.env.example`):

```bash
cp .env.example .env.local
```

Vul in:
```
NEXT_PUBLIC_SUPABASE_URL=https://sqmzfipmcrrvnoqkamyb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<jouw-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<jouw-service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

De keys vind je in je Supabase dashboard: **Project Settings → API**.

### 3. Development starten

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Account aanmaken

Maak een account via `/signup`. Bij registratie worden automatisch de standaard skincare routines aangemaakt:

- **Ochtend Routine** — 5 stappen (reinigen, vitamine C, moisturizer, SPF, lip SPF)
- **Avond Routine** — 5 stappen (reinigen, retinol met opbouwschema, oogcrème, moisturizer, castor oil)
- **Extra Dagelijks** — jawline exerciser
- **Extra Wekelijks** — lippen exfoliëren & gezichtsmasker (zaterdag)

### 5. PWA installeren

Op iOS Safari: tik op **Deel → Zet op beginscherm**

Op Android Chrome: tik op **⋮ → App installeren**

Voor de PWA icons, zet PNG bestanden in `public/icons/`:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

SVG varianten staan al klaar in `public/icons/`.

## Productie deployment

```bash
npm run build
npm start
```

Voor Vercel: verbind je GitHub repo met Vercel en voeg de environment variables toe via het Vercel dashboard.

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** met CSS variabelen voor theming
- **Supabase** (PostgreSQL + Auth + RLS)
- **@supabase/ssr** voor server-side auth
- **@tanstack/react-query** voor data fetching met optimistische updates
- **@dnd-kit** voor drag-to-reorder
- **Framer Motion** voor animaties
- **next-pwa** voor service worker
- **date-fns** voor datumberekeningen

## Database schema

Zie `supabase/schema.sql` voor het volledige schema met:
- `routines` — gebruikersroutines
- `steps` — stappen per routine met herhaalregels en fase-configuratie
- `completions` — dagelijkse voltooiingen (unique per user/step/date)
- `notifications` — pushmelding instellingen
- `routine_info` — extra info (verwachte resultaten, regels, producten)

Row Level Security is ingeschakeld op alle tabellen.
