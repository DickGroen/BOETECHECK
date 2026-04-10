import Anthropic from '@anthropic-ai/sdk'
import type { AnalyzeResult } from './types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Je bent een gespecialiseerde AI voor het analyseren van Nederlandse verkeers- en parkeerboetes (WAHV-beschikkingen en CJIB-brieven).

Je taak: analyseer de aangeleverde tekst/afbeelding van een beschikking en beoordeel of er formele aanknopingspunten zijn voor bezwaar.

Check de volgende 40+ punten:

FORMELE EISEN BESCHIKKING (art. 3-6 WAHV):
1. Is de dagtekening vermeld?
2. Is het feitcode correct?
3. Is de omschrijving van de gedraging voldoende specifiek?
4. Is de locatie voldoende bepaald (straatnaam + huisnummer of km-aanduiding)?
5. Is het tijdstip van de gedraging vermeld?
6. Is het kenteken correct weergegeven?
7. Is het bedrag van de sanctie vermeld?
8. Is de bevoegde opsporingsambtenaar identificeerbaar?
9. Is het dienstnummer vermeld?
10. Is de verbalisant bevoegd voor de betreffende gemeente/regio?

MEETAPPARATUUR (snelheidsboetes):
11. Is het merk/type meetapparatuur vermeld?
12. Is het serienummer van de meetapparatuur vermeld?
13. Is de ijkdatum vermeld?
14. Is de ijkdatum nog geldig (maximaal 2 jaar voor radarapparatuur)?
15. Is het ijkcertificaat nummer vermeld?
16. Is de meetmethode correct beschreven?
17. Is de meetafstand correct?
18. Is de toegestane meetonzekerheid (aftrek) correct toegepast?
19. Bij trajectcontrole: zijn begin- en eindpunt vermeld?
20. Is er sprake van rijstrookgebonden meting?

FOTO-BEWIJS:
21. Is er een foto bijgevoegd?
22. Is het kenteken leesbaar op de foto?
23. Is de foto scherp genoeg voor identificatie?
24. Is de datum/tijdstempel op de foto correct?
25. Is de locatie-aanduiding op de foto overeenkomstig de beschikking?

VERKEERSBORDEN/SIGNALERING:
26. Was de snelheidslimiet duidelijk aangegeven?
27. Zijn er wegwerkzaamheden-omstandigheden die de situatie beïnvloeden?
28. Is het bord conform BABW (Besluit administratieve bepalingen wegverkeer)?

TERMIJNEN:
29. Is de verzendingsdatum redelijk (max 4 maanden na gedraging)?
30. Is de herinnering correct verzonden?

OVERIGE FORMELE GEBREKEN:
31. Is de rechtsmiddelenclausule aanwezig?
32. Is het bankrekeningnummer CJIB correct?
33. Is de betalingstermijn vermeld?
34. Zijn er aanwijzingen voor dubbele registratie?
35. Is de naam/adres correct?

Retourneer UITSLUITEND geldig JSON in dit exacte formaat, geen tekst eromheen:
{
  "verdict": "waarschijnlijk" | "mogelijk" | "laag",
  "summary": "2-3 zinnen samenvatting voor de gebruiker. Schrijf alsof je een nuchtere vriend bent die rechten heeft gestudeerd. Geen jargon.",
  "findings": [
    {
      "type": "fout" | "aandachtspunt" | "positief",
      "tekst": "Beschrijving van de bevinding in gewone taal",
      "artikel": "optioneel: relevant wetsartikel"
    }
  ],
  "kenteken": "kenteken als gevonden in document",
  "bedrag": "bedrag als gevonden in document",
  "datum": "dagtekening als gevonden",
  "deadline": "bereken: dagtekening + 6 weken = bezwaardatum"
}

Verdictdefinities:
- "waarschijnlijk": 2+ formele fouten gevonden die bezwaar kansrijk maken
- "mogelijk": 1 formele fout of onduidelijkheid die mogelijk bezwaargrond is  
- "laag": beschikking lijkt formeel correct, weinig aanknopingspunten

KRITISCH: 
- Zeg nooit "gegarandeerd succes" of "wordt vernietigd"
- Gebruik altijd: "lijkt", "mogelijk", "kan aanknopingspunt zijn"
- Eindoordeel ligt altijd bij de officier van justitie
- Dit is geen juridisch advies`

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
    ? `Analyseer deze beschikking. Geëxtraheerde tekst:\n\n${extractedText}\n\nControleer op alle formele vereisten en geef je beoordeling als JSON.`
    : 'Analyseer deze beschikking op de foto. Controleer op alle formele vereisten en geef je beoordeling als JSON.'

  content.push({ type: 'text', text: textPrompt })

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  })

  const responseText = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('')

  // Strip markdown code fences if present
  const cleaned = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned) as AnalyzeResult
    return parsed
  } catch {
    // Fallback if JSON parse fails
    return {
      verdict: 'mogelijk',
      summary:
        'De analyse is voltooid maar kon niet volledig worden verwerkt. Neem contact op met ons voor een handmatige beoordeling.',
      findings: [
        {
          type: 'aandachtspunt',
          tekst: 'Automatische analyse kon niet worden afgerond. Handmatige review aanbevolen.',
        },
      ],
    }
  }
}
