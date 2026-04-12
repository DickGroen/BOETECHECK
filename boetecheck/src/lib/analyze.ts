import Anthropic from '@anthropic-ai/sdk'
import type { AnalyzeResult } from './types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Je bent de analyse-engine van BoeteCheck. Je taak is om een geüploade Nederlandse boetebeschikking te beoordelen op mogelijke aanknopingspunten voor bezwaar.

BELANGRIJKE REGELS
- Schrijf in helder Nederlands (B1-niveau)
- Wees nuchter, rustig en feitelijk
- Geef nooit garanties of zekerheid
- Zeg nooit dat een boete ongeldig is of zeker gewonnen wordt
- Gebruik formuleringen zoals: "mogelijke aanknopingspunten", "lijkt onvolledig", "kan relevant zijn voor bezwaar"
- Als iets onduidelijk is: benoem dat expliciet
- Baseer je alleen op wat zichtbaar of logisch afleidbaar is

WAT JE DOET
Analyseer op:
- datum en termijn
- locatie-aanduiding
- meetmethode / onderbouwing
- ijkgegevens
- foto / bewijs
- inconsistenties
- ontbrekende informatie

Doel: signaleren, ordenen, samenvatten, voorzichtig beoordelen

VERDICT LOGICA (HEEL BELANGRIJK)
- "lage_kans" → Alleen als er GEEN duidelijke aanknopingspunten zijn EN alles consistent en compleet lijkt
- "mogelijk" → Als er MINSTENS 1 concreet twijfelachtig punt is OF iets onduidelijk / onvolledig is. Twijfel = mogelijk
- "waarschijnlijk" → Als er 2 of meer duidelijke aanknopingspunten zijn OF 1 sterk punt dat direct relevant is
- "onvoldoende_leesbaar" → Als de upload niet goed te beoordelen is

EXTRA REGELS
- Max 5 findings
- Sorteer op relevantie
- Verzin niets
- Geen moeilijke juridische taal
- Twijfel → mogelijk (niet te streng zijn)

VERPLICHT JSON FORMAT (GEEN EXTRA TEKST, GEEN CODE FENCES):
{
  "verdict": "lage_kans | mogelijk | waarschijnlijk | onvoldoende_leesbaar",
  "confidence": "laag | midden | hoog",
  "summary": "Korte samenvatting (2-4 zinnen)",
  "findings": [
    {
      "title": "Korte titel",
      "severity": "laag | midden | hoog",
      "description": "Waarom dit relevant kan zijn"
    }
  ],
  "what_this_means": "Wat betekent dit voor de gebruiker",
  "recommended_next_step": "Wat moet gebruiker doen",
  "deadline_warning": "Noem 6 weken termijn",
  "disclaimer": "Deze beoordeling is indicatief en geen juridisch advies. De officier beslist.",
  "kenteken": "kenteken als gevonden in document of null",
  "bedrag": "bedrag als gevonden in document of null",
  "datum": "dagtekening als gevonden of null",
  "deadline": "bereken: dagtekening + 6 weken = bezwaardatum of null"
}`

export async function analyzeBoete(
  imageBase64?: string,
  imageMediaType?: string,
  extractedText?: string
): Promise<AnalyzeResult> {
  const content: Anthropic.MessageParam['content'] = []

  if (imageBase64 && imageMediaType) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageMediaType as 'image/jpeg' | 'image/png' | 'image/webp',
        data: imageBase64,
      },
    })
  }

  const textPrompt = extractedText
    ? `Analyseer deze beschikking. Geëxtraheerde tekst:\n\n${extractedText}\n\nGeef alleen JSON output.`
    : 'Analyseer deze beschikking op de foto. Geef alleen JSON output.'

  content.push({ type: 'text', text: textPrompt })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6', // ← Bijgewerkt naar huidig model
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  })

  const responseText = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('')

  const cleaned = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned) as AnalyzeResult
    return parsed
  } catch {
    return {
      verdict: 'mogelijk',
      summary: 'De analyse is voltooid maar kon niet volledig worden verwerkt. Neem contact op voor een handmatige beoordeling.',
      findings: [
        {
          title: 'Handmatige review nodig',
          severity: 'midden',
          description: 'Automatische analyse kon niet worden afgerond.',
        },
      ],
      what_this_means: 'We konden je beschikking niet volledig analyseren.',
      recommended_next_step: 'Neem contact op via support@boetecheck.nl',
      deadline_warning: 'Let op: bezwaar moet binnen 6 weken na dagtekening worden ingediend.',
      disclaimer: 'Deze beoordeling is indicatief en geen juridisch advies. De officier beslist.',
    }
  }
}
