import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM_EMAIL, APP_URL } from '@/lib/resend'
import { rapportEmailHtml, rapportEmailText } from '@/lib/email-templates/rapport'
import type { AnalyzeResult } from '@/lib/types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, result } = body as { email: string; result: AnalyzeResult }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ongeldig emailadres' }, { status: 400 })
    }

    if (!result) {
      return NextResponse.json({ error: 'Geen analyseresultaat meegestuurd' }, { status: 400 })
    }

    // 1. Stuur rapport direct
    const rapportRes = await resend.emails.send({
      from: `BoeteCheck <${FROM_EMAIL}>`,
      to: email,
      subject: `Jouw BoeteCheck rapport${result.kenteken ? ` — ${result.kenteken}` : ''}`,
      html: rapportEmailHtml(result, APP_URL),
      text: rapportEmailText(result),
    })

    if (rapportRes.error) {
      console.error('Resend rapport error:', rapportRes.error)
      return NextResponse.json({ error: 'Email kon niet worden verstuurd' }, { status: 500 })
    }

    // 2. Plan deadline herinnering (5 dagen voor deadline) via Resend scheduled send
    if (result.deadline) {
      try {
        const deadlineDate = parseDutchDate(result.deadline)
        if (deadlineDate) {
          const reminderDate = new Date(deadlineDate)
          reminderDate.setDate(reminderDate.getDate() - 5)

          // Alleen plannen als de herinneringsdatum in de toekomst ligt
          if (reminderDate > new Date()) {
            const { deadlineReminderHtml, deadlineReminderText } = await import(
              '@/lib/email-templates/deadline'
            )
            await resend.emails.send({
              from: `BoeteCheck <${FROM_EMAIL}>`,
              to: email,
              subject: `⏰ Nog 5 dagen — bezwaar deadline nadert${result.kenteken ? ` (${result.kenteken})` : ''}`,
              html: deadlineReminderHtml(result.deadline, result.kenteken, APP_URL),
              text: deadlineReminderText(result.deadline, result.kenteken),
              
            })
          }
        }
      } catch (scheduleErr) {
        // Niet fataal — rapport is al verstuurd
        console.warn('Deadline reminder niet gepland:', scheduleErr)
      }
    }

    return NextResponse.json({ success: true, emailId: rapportRes.data?.id })
  } catch (err) {
    console.error('Email route error:', err)
    return NextResponse.json({ error: 'Email versturen mislukt' }, { status: 500 })
  }
}

/**
 * Zet Nederlandse datum ("26 april 2025") om naar Date object.
 */
function parseDutchDate(dateStr: string): Date | null {
  const maanden: Record<string, number> = {
    januari: 0, februari: 1, maart: 2, april: 3, mei: 4, juni: 5,
    juli: 6, augustus: 7, september: 8, oktober: 9, november: 10, december: 11,
  }

  const match = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/)
  if (!match) return null

  const dag = parseInt(match[1])
  const maand = maanden[match[2].toLowerCase()]
  const jaar = parseInt(match[3])

  if (maand === undefined) return null
  return new Date(jaar, maand, dag)
}
