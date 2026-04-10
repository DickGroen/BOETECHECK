import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { resend, FROM_EMAIL, APP_URL } from '@/lib/resend'
import { bezwaarBevestigingHtml } from '@/lib/email-templates/deadline'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

// Stripe vereist de raw body voor signature verificatie
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Geen Stripe signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is niet ingesteld')
    return NextResponse.json({ error: 'Webhook niet geconfigureerd' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verificatie mislukt:', err)
    return NextResponse.json({ error: 'Ongeldige signature' }, { status: 400 })
  }

  // Verwerk alleen succesvolle betalingen
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      await handleSuccessfulPayment(session)
    } catch (err) {
      console.error('Betaling verwerking mislukt:', err)
      // Return 200 zodat Stripe niet opnieuw probeert — log voor handmatige afhandeling
      return NextResponse.json({ received: true, error: 'Verwerking mislukt — handmatige actie vereist' })
    }
  }

  return NextResponse.json({ received: true })
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata as Record<string, string>
  const email = session.customer_email || metadata?.email

  if (!email) {
    console.warn('Geen email gevonden voor sessie:', session.id)
    return
  }

  const kenteken = metadata?.kenteken || undefined

  // Stuur bevestigingsmail naar klant
  const bevestigingRes = await resend.emails.send({
    from: `BoeteCheck <${FROM_EMAIL}>`,
    to: email,
    subject: `Betaling ontvangen — we gaan aan de slag${kenteken ? ` (${kenteken})` : ''}`,
    html: bezwaarBevestigingHtml(kenteken, APP_URL),
    text: `
BoeteCheck — Betaling ontvangen
================================

Bedankt voor je betaling van €39.

Je bezwaarschrift${kenteken ? ` voor kenteken ${kenteken}` : ''} wordt binnen 24 uur opgesteld.
Je ontvangt het per email — klaar om te versturen.

Vragen? support@boetecheck.nl

---
BoeteCheck · Dit is geen juridisch advies.
    `.trim(),
  })

  if (bevestigingRes.error) {
    console.error('Bevestigingsmail mislukt voor:', email, bevestigingRes.error)
    throw new Error('Bevestigingsmail kon niet worden verstuurd')
  }

  // Stuur interne notificatie naar support team
  await resend.emails.send({
    from: `BoeteCheck Intern <${FROM_EMAIL}>`,
    to: 'support@boetecheck.nl', // Vervang met jouw email
    subject: `[NIEUW BEZWAAR] ${session.id}${kenteken ? ` — ${kenteken}` : ''}`,
    text: `
Nieuwe bezwaaropdracht ontvangen
=================================

Stripe sessie: ${session.id}
Bedrag: €${((session.amount_total || 0) / 100).toFixed(2)}
Email klant: ${email}
Kenteken: ${kenteken || 'onbekend'}
Boetebedrag: ${metadata?.bedrag || 'onbekend'}
Deadline: ${metadata?.deadline || 'onbekend'}

Verdict analyse: ${metadata?.verdict || 'onbekend'}
Samenvatting: ${metadata?.summary || ''}

Bevindingen:
${formatFindings(metadata?.findings)}

---
Actie vereist: stel bezwaarschrift op en verstuur naar ${email}
    `.trim(),
  })

  console.log(`✓ Bezwaaropdracht verwerkt voor ${email} (sessie: ${session.id})`)
}

function formatFindings(findingsJson?: string): string {
  if (!findingsJson) return 'Geen bevindingen beschikbaar'
  try {
    const findings = JSON.parse(findingsJson) as Array<{ type: string; tekst: string; artikel?: string }>
    return findings.map((f) => `- [${f.type}] ${f.tekst}${f.artikel ? ` (${f.artikel})` : ''}`).join('\n')
  } catch {
    return findingsJson
  }
}
