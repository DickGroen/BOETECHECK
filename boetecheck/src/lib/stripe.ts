import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is niet ingesteld in .env.local')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const BEZWAAR_PRICE_CENTS = 3900 // €39,00
export const BEZWAAR_PRODUCT_NAME = 'Bezwaarschrift op maat'
export const BEZWAAR_PRODUCT_DESCRIPTION =
  'Volledig bezwaarschrift gebaseerd op jouw beschikking. Klaar om te versturen.'
