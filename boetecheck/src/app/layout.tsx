import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BoeteCheck — Check eerst of bezwaar zin heeft',
  description: 'Upload je beschikking. Binnen 2 minuten zie je of er aanknopingspunten zijn voor bezwaar. Gratis en vrijblijvend.',
  keywords: 'boete bezwaar, verkeersboete bezwaar maken, CJIB bezwaar, parkeerboete reclameren',
  openGraph: {
    title: 'BoeteCheck — Check of bezwaar zin heeft',
    description: 'AI-analyse van je beschikking. Gratis. Klaar in 2 minuten.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
