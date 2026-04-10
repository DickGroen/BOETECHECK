# BoeteCheck

AI-gedreven boete-analysetool. Upload een beschikking, ontvang binnen 2 minuten een rapport over bezwaarwaardigheid.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Anthropic Claude** — beschikking-analyse op 40+ WAHV-punten
- **Stripe** — €39 checkout met iDEAL + card, webhook voor orderverwerking
- **Resend** — rapport email + geplande deadline-herinnering (5 dagen voor deadline)
- **pdf-parse** — tekstextractie uit PDF beschikkingen
- **CSS Modules** — geen UI library, volledig custom

---

## Lokaal opstarten

### 1. Clone + installeer

```bash
git clone https://github.com/jouw-naam/boetecheck.git
cd boetecheck
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Vul alle keys in `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...          # test key lokaal
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@boetecheck.nl
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Stripe webhook lokaal (vereist voor bevestigingsmails)

```bash
# Installeer Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward events naar je lokale server
stripe listen --forward-to localhost:3000/api/webhook

# Kopieer de webhook signing secret die verschijnt → plak in .env.local als STRIPE_WEBHOOK_SECRET
```

### 4. Dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployen op Vercel

### 1. Push naar GitHub, importeer op vercel.com/new

### 2. Environment variables in Vercel dashboard

Voeg alle keys toe uit `.env.local.example`. Gebruik **live** Stripe keys op productie.

### 3. Stripe webhook op productie instellen

```bash
stripe listen --forward-to https://boetecheck.nl/api/webhook
# Of: maak webhook aan via dashboard.stripe.com → Developers → Webhooks
# Endpoint: https://boetecheck.nl/api/webhook
# Events: checkout.session.completed
```

---

## Projectstructuur

```
boetecheck/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing page
│   │   ├── page.module.css
│   │   ├── globals.css                 # Design tokens
│   │   ├── succes/
│   │   │   ├── page.tsx               # Na succesvolle betaling
│   │   │   └── succes.module.css
│   │   ├── geannuleerd/
│   │   │   ├── page.tsx               # Na geannuleerde betaling
│   │   │   └── geannuleerd.module.css
│   │   └── api/
│   │       ├── analyze/route.ts        # POST — AI analyse
│   │       ├── checkout/route.ts       # POST — Stripe checkout sessie
│   │       ├── webhook/route.ts        # POST — Stripe webhook
│   │       └── email/route.ts          # POST — rapport + deadline reminder
│   ├── components/
│   │   ├── Nav.tsx + .module.css
│   │   ├── UploadFlow.tsx + .module.css  # Core feature
│   │   └── FaqAccordion.tsx + .module.css
│   └── lib/
│       ├── analyze.ts                  # Anthropic API + 40-punten prompt
│       ├── stripe.ts                   # Stripe client
│       ├── resend.ts                   # Resend client
│       ├── types.ts                    # Gedeelde types
│       └── email-templates/
│           ├── rapport.ts              # Analyse rapport email
│           └── deadline.ts             # Deadline herinnering + bevestiging
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## API routes

### `POST /api/analyze`
Multipart form-data met `file`. Retourneert `AnalyzeResult` JSON.

### `POST /api/checkout`
Body: `{ email?, result: AnalyzeResult }`.  
Retourneert `{ url, sessionId }` — redirect naar Stripe hosted checkout.  
iDEAL + card ondersteund. Locale ingesteld op `nl`.

### `POST /api/webhook`
Stripe webhook endpoint.  
Verwerkt `checkout.session.completed`:
- Stuurt bevestigingsmail naar klant
- Stuurt interne notificatie naar support@boetecheck.nl

### `POST /api/email`
Body: `{ email, result: AnalyzeResult }`.  
Stuurt rapport direct + plant deadline-herinnering via Resend scheduled send (5 dagen voor deadline).

---

## Emails

| Trigger | Onderwerp | Template |
|---|---|---|
| Na analyse (email capture) | Jouw BoeteCheck rapport | `rapport.ts` |
| 5 dagen voor deadline | ⏰ Nog 5 dagen — deadline nadert | `deadline.ts` |
| Na betaling (webhook) | Betaling ontvangen — we gaan aan de slag | `deadline.ts` → `bezwaarBevestigingHtml` |
| Intern (webhook) | [NIEUW BEZWAAR] sessie-id | Plaintext |

---

## Volgende stappen

### Database (analyses + orders bewaren)
```bash
npm install @supabase/supabase-js
```
- Sla `AnalyzeResult` op gekoppeld aan sessie-ID
- Koppel Stripe `session.id` aan analyse voor order-fulfillment
- Verwijder uploads na 30 dagen via cron job

### Bezwaarschrift genereren (AI)
Na betaling: maak een nieuwe Anthropic-call met de analyse + een prompt die een formeel bezwaarschrift genereert in Word/PDF formaat. Stuur als bijlage via Resend.

### Analytics
```bash
npm install @vercel/analytics
```

---

## Compliance checklist

- [ ] Privacybeleid gepubliceerd
- [ ] Verwerkersovereenkomst Anthropic (console.anthropic.com → Privacy)
- [ ] Verwerkersovereenkomst Stripe
- [ ] Verwerkersovereenkomst Resend
- [ ] Disclaimer op elke resultatenpagina ✓ (al aanwezig)
- [ ] Uploads verwijderen na 30 dagen (cron / Supabase TTL)
- [ ] Uitschrijflink in herinnerings-emails ✓ (al aanwezig)
- [ ] CJIB 6-weken termijn vermeld ✓ (al aanwezig)
