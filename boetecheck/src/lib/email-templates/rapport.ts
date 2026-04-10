import type { AnalyzeResult } from '../types'

const verdictLabel: Record<AnalyzeResult['verdict'], string> = {
  waarschijnlijk: '✅ Waarschijnlijk bezwaarwaardig',
  mogelijk: '⚖️ Mogelijk bezwaarwaardig',
  laag: '📋 Lage kans op bezwaar',
}

const verdictColor: Record<AnalyzeResult['verdict'], string> = {
  waarschijnlijk: '#0E9456',
  mogelijk: '#B45309',
  laag: '#64748B',
}

export function rapportEmailHtml(result: AnalyzeResult, appUrl: string): string {
  const findingsHtml = result.findings
    .map((f) => {
      const dotColor =
        f.type === 'fout' ? '#EF4444' : f.type === 'aandachtspunt' ? '#F59E0B' : '#12B76A'
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E3E8EF;vertical-align:top">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dotColor};margin-right:10px;margin-top:5px;vertical-align:top"></span>
            <span style="font-size:14px;color:#0A2540;line-height:1.5">${f.tekst}${
              f.artikel
                ? ` <span style="font-size:11px;color:#64748B;background:#F2F4F7;border:1px solid #E3E8EF;border-radius:4px;padding:1px 6px;margin-left:6px">${f.artikel}</span>`
                : ''
            }</span>
          </td>
        </tr>`
    })
    .join('')

  const deadlineHtml = result.deadline
    ? `<tr>
        <td style="padding:16px;background:#FEF9EE;border-radius:8px;margin-top:16px">
          <p style="margin:0;font-size:13px;color:#92570A">
            <strong>⏰ Deadline: ${result.deadline}</strong><br>
            Bezwaar moet binnen 6 weken na dagtekening worden ingediend bij het CJIB.
            Je ontvangt een herinnering 5 dagen voor de deadline.
          </p>
        </td>
      </tr>`
    : ''

  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2F4F7;font-family:'Segoe UI',system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F7;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="padding:0 0 24px">
            <h1 style="margin:0;font-size:1.4rem;color:#0A2540;font-family:Georgia,serif">
              Boete<span style="color:#12B76A">Check</span>
            </h1>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:white;border-radius:16px;border:1px solid #E3E8EF;padding:32px">

            <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#12B76A">
              Jouw rapport
            </p>
            <h2 style="margin:0 0 20px;font-size:1.5rem;color:#0A2540;font-family:Georgia,serif;line-height:1.2">
              Analyse van je beschikking
            </h2>

            <!-- Verdict badge -->
            <p style="margin:0 0 20px">
              <span style="display:inline-block;background:#E8FBF2;color:${verdictColor[result.verdict]};border:1px solid #86EFBE;border-radius:20px;padding:7px 16px;font-size:13px;font-weight:500">
                ${verdictLabel[result.verdict]}
              </span>
            </p>

            <!-- Summary -->
            <p style="margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.7;font-weight:300">
              ${result.summary}
            </p>

            <!-- Meta -->
            ${
              result.kenteken || result.bedrag
                ? `<table cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                <tr>
                  ${result.kenteken ? `<td style="background:#F2F4F7;border-radius:8px;padding:10px 14px;margin-right:8px">
                    <span style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748B">Kenteken</span>
                    <span style="font-size:14px;font-weight:500;color:#0A2540">${result.kenteken}</span>
                  </td>` : ''}
                  ${result.bedrag ? `<td style="width:12px"></td><td style="background:#F2F4F7;border-radius:8px;padding:10px 14px">
                    <span style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748B">Bedrag</span>
                    <span style="font-size:14px;font-weight:500;color:#0A2540">${result.bedrag}</span>
                  </td>` : ''}
                </tr>
              </table>`
                : ''
            }

            <!-- Findings -->
            <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#0A2540">Bevindingen</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F7;border-radius:10px;padding:8px 16px;margin-bottom:24px">
              ${findingsHtml}
            </table>

            <!-- Deadline -->
            ${deadlineHtml}

            <!-- CTA -->
            ${
              result.verdict !== 'laag'
                ? `<table cellpadding="0" cellspacing="0" style="margin-top:24px;width:100%">
                <tr>
                  <td style="background:#0A2540;border-radius:10px;text-align:center;padding:16px">
                    <a href="${appUrl}/#upload" style="color:white;font-size:15px;font-weight:500;text-decoration:none">
                      Bezwaarschrift bestellen — €39 →
                    </a>
                  </td>
                </tr>
                <tr><td style="height:10px"></td></tr>
                <tr>
                  <td style="border:1px solid #E3E8EF;border-radius:10px;text-align:center;padding:14px">
                    <a href="${appUrl}/stappenplan" style="color:#0A2540;font-size:14px;text-decoration:none">
                      Gratis stappenplan downloaden
                    </a>
                  </td>
                </tr>
              </table>`
                : `<table cellpadding="0" cellspacing="0" style="margin-top:24px;width:100%">
                <tr>
                  <td style="border:1px solid #E3E8EF;border-radius:10px;text-align:center;padding:14px">
                    <a href="${appUrl}/stappenplan" style="color:#0A2540;font-size:14px;text-decoration:none">
                      Download gratis stappenplan
                    </a>
                  </td>
                </tr>
              </table>`
            }

            <!-- Disclaimer -->
            <p style="margin:24px 0 0;font-size:11px;color:#94A3B8;line-height:1.6;border-top:1px solid #E3E8EF;padding-top:16px">
              Deze beoordeling is indicatief en gebaseerd op geautomatiseerde analyse. Dit is geen juridisch advies.
              BoeteCheck is geen advocatenkantoor. De officier van justitie beslist.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 0 0;text-align:center">
            <p style="margin:0;font-size:12px;color:#94A3B8">
              BoeteCheck · <a href="${appUrl}/privacybeleid" style="color:#94A3B8">Privacybeleid</a> ·
              <a href="${appUrl}/voorwaarden" style="color:#94A3B8">Voorwaarden</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function rapportEmailText(result: AnalyzeResult): string {
  const verdict = verdictLabel[result.verdict]
  const findings = result.findings.map((f) => `- ${f.tekst}`).join('\n')
  return `
BoeteCheck — Jouw rapport
=========================

Uitkomst: ${verdict}

${result.summary}

${result.kenteken ? `Kenteken: ${result.kenteken}` : ''}
${result.bedrag ? `Bedrag: ${result.bedrag}` : ''}
${result.deadline ? `Bezwaar indienen voor: ${result.deadline}` : ''}

Bevindingen:
${findings}

---
Deze beoordeling is indicatief en geen juridisch advies.
  `.trim()
}
