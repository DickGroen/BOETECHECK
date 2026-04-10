import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is niet ingesteld in .env.local')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@boetecheck.nl'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
