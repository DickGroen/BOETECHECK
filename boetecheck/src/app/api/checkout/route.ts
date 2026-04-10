import { NextRequest, NextResponse } from 'next/server'
import {
  stripe,
  BEZWAAR_PRICE_CENTS,
  BEZWAAR_PRODUCT_NAME,
  BEZWAAR_PRODUCT_DESCRIPTION,
} from '@/lib/stripe'
import type { OrderMetadata } from '@/lib/types'

export const runtime = 'nodejs'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, result } = body as {
      email?: string
      result: {
        verdict: string
        summary: string
        findings: unknown[]
        kenteken?: string
        bedrag?: string
        deadline?: string
      }
    }

    if (!result) {
      return NextResponse.json({ error: 'Geen analyseresultaat meegestuurd' }, { status: 400 })
    }

    const metadata: OrderMetadata = {
      email: email || '',
      kenteken: result.kenteken || '',
      bedrag: result.bedrag || '',
      deadline: result.deadline || '',
      verdict: result.verdict,
      summary: result.summary,
      findings: JSON.stringify(result.findings),
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'ideal'], // iDEAL voor NL markt
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: BEZWAAR_PRICE_CENTS,
            product_data: {
              name: BEZWAAR_PRODUCT_NAME,
              description: BEZWAAR_PRODUCT_DESCRIPTION,
              images: [`${APP_URL}/og-image.png`],
            },
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: `${APP_URL}/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/geannuleerd`,
      locale: 'nl',
      payment_intent_data: {
        description: `BoeteCheck bezwaarschrift${result.kenteken ? ` — ${result.kenteken}` : ''}`,
        metadata,
      },
      custom_text: {
        submit: {
          message:
            'Na betaling stellen we binnen 24 uur je bezwaarschrift op. Je ontvangt het per email.',
        },
        after_submit: {
          message:
            'Betaling versleuteld verwerkt. BoeteCheck is geen advocatenkantoor. Dit is geen juridisch advies.',
        },
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Checkout aanmaken mislukt' }, { status: 500 })
  }
}
