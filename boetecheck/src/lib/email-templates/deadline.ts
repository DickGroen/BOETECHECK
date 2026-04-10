export function deadlineReminderHtml(
  deadline: string,
  kenteken: string | undefined,
  appUrl: string
): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2F4F7;font-family:'Segoe UI',system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F7;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <tr>
          <td style="padding:0 0 24px">
            <h1 style="margin:0;font-size:1.4rem;color:#0A2540;font-family:Georgia,serif">
              Boete<span style="color:#12B76A">Check</span>
            </h1>
          </td>
        </tr>

        <tr>
          <td style="background:white;border-radius:16px;border:1px solid #E3E8EF;padding:32px">

            <!-- Urgency banner -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FEF9EE;border-radius:10px;padding:16px;margin-bottom:24px">
              <tr>
                <td>
                  <p style="margin:0;font-size:15px;font-weight:600;color:#92570A">
                    ⏰ Nog 5 dagen — deadline nadert
                  </p>
                  <p style="margin:4px 0 0;font-size:13px;color:#92570A;font-weight:300">
                    Je bezwaar moet uiterlijk <strong>${deadline}</strong> zijn ingediend bij het CJIB.
                  </p>
                </td>
              </tr>
            </table>

            <h2 style="margin:0 0 12px;font-size:1.3rem;color:#0A2540;font-family:Georgia,serif">
              Heb je al actie ondernomen?
            </h2>
            <p style="margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.7;font-weight:300">
              ${kenteken ? `Voor kenteken <strong style="color:#0A2540">${kenteken}</strong> — je` : 'Je'} hebt nog tot <strong style="color:#0A2540">${deadline}</strong> om bezwaar in te dienen.
              Daarna vervalt het recht op bezwaar definitief.
            </p>

            <p style="margin:0 0 20px;font-size:14px;color:#64748B;font-weight:300;line-height:1.6">
              Je hebt twee opties:
            </p>

            <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:12px">
              <tr>
                <td style="background:#0A2540;border-radius:10px;text-align:center;padding:16px">
                  <a href="${appUrl}/#upload" style="color:white;font-size:15px;font-weight:500;text-decoration:none">
                    Bezwaarschrift bestellen — €39 →
                  </a>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px">
              <tr>
                <td style="border:1px solid #E3E8EF;border-radius:10px;text-align:center;padding:14px">
                  <a href="${appUrl}/stappenplan" style="color:#0A2540;font-size:14px;text-decoration:none">
                    Zelf doen met gratis stappenplan
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6;border-top:1px solid #E3E8EF;padding-top:16px">
              Je ontvangt deze herinnering omdat je je email hebt achtergelaten bij BoeteCheck.
              Dit is geen juridisch advies. De officier van justitie beslist.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 0 0;text-align:center">
            <p style="margin:0;font-size:12px;color:#94A3B8">
              BoeteCheck · <a href="${appUrl}/privacybeleid" style="color:#94A3B8">Privacybeleid</a> ·
              <a href="${appUrl}/uitschrijven" style="color:#94A3B8">Uitschrijven</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function deadlineReminderText(deadline: string, kenteken?: string): string {
  return `
BoeteCheck — Deadline herinnering
===================================

Nog 5 dagen: je bezwaar moet uiterlijk ${deadline} zijn ingediend.
${kenteken ? `Kenteken: ${kenteken}` : ''}

Daarna vervalt het recht op bezwaar definitief.

Opties:
1. Bezwaarschrift bestellen (€39) — wij schrijven het voor je
2. Gratis stappenplan — zelf doen

Na de deadline is bezwaar niet meer mogelijk.

---
BoeteCheck · Dit is geen juridisch advies.
  `.trim()
}

export function bezwaarBevestigingHtml(
  kenteken: string | undefined,
  appUrl: string
): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F2F4F7;font-family:'Segoe UI',system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F7;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <tr>
          <td style="padding:0 0 24px">
            <h1 style="margin:0;font-size:1.4rem;color:#0A2540;font-family:Georgia,serif">
              Boete<span style="color:#12B76A">Check</span>
            </h1>
          </td>
        </tr>

        <tr>
          <td style="background:white;border-radius:16px;border:1px solid #E3E8EF;padding:32px">

            <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#12B76A">
              Betaling ontvangen
            </p>
            <h2 style="margin:0 0 16px;font-size:1.5rem;color:#0A2540;font-family:Georgia,serif">
              We gaan aan de slag ✓
            </h2>

            <p style="margin:0 0 20px;font-size:15px;color:#64748B;line-height:1.7;font-weight:300">
              Je bezwaarschrift${kenteken ? ` voor kenteken <strong style="color:#0A2540">${kenteken}</strong>` : ''} wordt binnen <strong style="color:#0A2540">24 uur</strong> opgesteld.
              Je ontvangt het per email — klaar om te versturen naar het CJIB.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F7;border-radius:10px;padding:16px 20px;margin-bottom:24px">
              <tr>
                <td style="font-size:14px;color:#64748B;line-height:1.8">
                  <strong style="color:#0A2540;display:block;margin-bottom:8px">Wat er nu gebeurt:</strong>
                  1. We verwerken je beschikking en analyse<br>
                  2. We stellen een bezwaarschrift op maat op<br>
                  3. Je ontvangt de brief + instructie per email<br>
                  4. Jij verstuurt — dat houdt jou in controle
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#64748B;line-height:1.6">
              Vragen? Stuur een email naar <a href="mailto:support@boetecheck.nl" style="color:#0A2540">support@boetecheck.nl</a>
            </p>

            <p style="margin:20px 0 0;font-size:11px;color:#94A3B8;line-height:1.6;border-top:1px solid #E3E8EF;padding-top:16px">
              Dit is geen juridisch advies. BoeteCheck is geen advocatenkantoor. De officier van justitie beslist.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 0 0;text-align:center">
            <p style="margin:0;font-size:12px;color:#94A3B8">
              BoeteCheck · <a href="${appUrl}/privacybeleid" style="color:#94A3B8">Privacybeleid</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
