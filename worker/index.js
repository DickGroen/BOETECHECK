import TRIAGE_PROMPT from '../prompts/triage.js';
import HAIKU_PROMPT from '../prompts/haiku.js';
import SONNET_PROMPT from '../prompts/sonnet.js';

const GRATIS_PROMPT = `Je bent een analyse-systeem voor verkeers- en parkeerboetes.

Jouw taak:
Lees het document en geef een korte, kostenloze eerste inschatting.

Focus: Zijn er mogelijk gronden om bezwaar te maken tegen deze boete?

Geef je antwoord ALTIJD exact in deze structuur:

[BOETE_TYPE]
Type boete (bijv. Verkeersboete, Parkeerboete, Flitsboete, Naheffing)
[/BOETE_TYPE]

[INSTANTIE]
Uitgevende instantie (bijv. CJIB, Gemeente Amsterdam, Politie)
[/INSTANTIE]

[BOETEBEDRAG]
Boetebedrag als getal (alleen het getal, geen €-teken)
[/BOETEBEDRAG]

[RISK]
low of medium of high
[/RISK]

[TEASER]
Schrijf precies 1 zin: vermeld ALLEEN dat er mogelijk bezwaargronden zijn.
Noem GEEN redenen, GEEN artikelen, GEEN details.
[/TEASER]`;

// ── Claude API ────────────────────────────────────────────────────────────────

async function callClaudeDocument(env, { model, maxTokens, prompt, fileBase64, mediaType }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{
        role: "user",
        content: [
          mediaType === "application/pdf"
            ? { type: "document", source: { type: "base64", media_type: mediaType, data: fileBase64 } }
            : { type: "image", source: { type: "base64", media_type: mediaType, data: fileBase64 } },
          { type: "text", text: prompt }
        ]
      }]
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Claude API fout: ${JSON.stringify(data)}`);
  return data?.content?.[0]?.text || "";
}

// ── Utils ─────────────────────────────────────────────────────────────────────

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return { base64: btoa(binary), mediaType: file.type || "application/pdf" };
}

function safeJsonParse(str) {
  try { return JSON.parse(String(str).trim()); }
  catch {
    try {
      const match = String(str).match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : null;
    } catch { return null; }
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 8 * 1024 * 1024;

function validateUploadInput({ file, name, email }) {
  if (!file) return "Geen bestand ontvangen";
  if (file.size > MAX_FILE_SIZE) return `Bestand te groot (max. 8 MB)`;
  if (!ALLOWED_TYPES.includes(file.type)) return `Bestandstype niet toegestaan. Gebruik PDF, JPG of PNG.`;
  if (!name || !String(name).trim()) return "Naam ontbreekt";
  if (!email || !String(email).includes("@") || !String(email).includes(".")) return "Ongeldig e-mailadres";
  return null;
}

function extractTaggedSection(text, tag) {
  const start = `[${tag}]`;
  const end = `[/${tag}]`;
  const si = text.indexOf(start);
  const ei = text.indexOf(end);
  if (si === -1 || ei === -1) return "";
  return text.substring(si + start.length, ei).trim();
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

// ── RTF ───────────────────────────────────────────────────────────────────────

function rtfEscape(str) {
  return String(str || "")
    .replace(/\\/g, "\\\\").replace(/\{/g, "\\{").replace(/\}/g, "\\}")
    .replace(/\n/g, "\\par\n")
    .replace(/[^\x00-\x7F]/g, c => `\\u${c.charCodeAt(0)}?`);
}

function rtfToBase64(rtfString) {
  const bytes = new TextEncoder().encode(rtfString);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function bulletLines(text) {
  return String(text || "").split("\n").map(l => l.trim()).filter(Boolean)
    .map(l => `{\\pard\\sb0\\sa200\\fi-300\\li300\\f1\\fs22 \\bullet  ${rtfEscape(l.replace(/^- /, ""))}\\par}`)
    .join("\n");
}

function maakAnalyseRtf(analysis, customerName, customerEmail, triage) {
  const title = extractTaggedSection(analysis, "TITLE") || "Boete Analyse";
  const boeteBedrag = triage?.boetebedrag ? `\\u8364?${triage.boetebedrag}` : "onbekend";

  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\froman\\fcharset0 Times New Roman;}{\\f1\\fswiss\\fcharset0 Arial;}}
{\\colortbl;\\red27\\green58\\blue140;\\red153\\green26\\blue26;}
\\paperw11906\\paperh16838\\margl1800\\margr1800\\margt1440\\margb1440\\f1\\fs22
{\\pard\\sb400\\sa200\\f1\\fs32\\b\\cf1 ${rtfEscape(title)}\\par}
{\\pard\\sb0\\sa100\\f1\\fs20\\cf0 Naam: ${rtfEscape(customerName || "")} (${rtfEscape(customerEmail || "")})\\par}
{\\pard\\sb0\\sa200\\f1\\fs20\\cf0 Type: ${rtfEscape(triage?.boete_type || "onbekend")} | Instantie: ${rtfEscape(triage?.uitgevende_instantie || "onbekend")} | Bedrag: ${boeteBedrag} | Risico: ${rtfEscape(triage?.risk || "")}\\par}
{\\pard\\sb300\\sa120\\f1\\fs24\\b Samenvatting\\par}
{\\pard\\sa200\\f1\\fs22 ${rtfEscape(extractTaggedSection(analysis, "SUMMARY"))}\\par}
{\\pard\\sb300\\sa120\\f1\\fs24\\b Bevindingen\\par}
${bulletLines(extractTaggedSection(analysis, "ISSUES"))}
{\\pard\\sb300\\sa120\\f1\\fs24\\b Inschatting\\par}
{\\pard\\sa200\\f1\\fs22 ${rtfEscape(extractTaggedSection(analysis, "ASSESSMENT"))}\\par}
{\\pard\\sb300\\sa120\\f1\\fs24\\b Vervolgstappen\\par}
${bulletLines(extractTaggedSection(analysis, "NEXT_STEPS"))}
{\\pard\\sb400\\sa100\\f1\\fs18\\cf0\\i Opmerking: Dit is een informatieve analyse en geen juridisch advies. Bij twijfel of hoge bedragen raden wij een jurist of het Juridisch Loket aan.\\par}
}`;
}

function maakBezwaarRtf(analysis, customerName, triage) {
  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\froman\\fcharset0 Times New Roman;}{\\f1\\fswiss\\fcharset0 Arial;}}
{\\colortbl;\\red27\\green58\\blue140;\\red153\\green26\\blue26;}
\\paperw11906\\paperh16838\\margl1800\\margr1800\\margt1440\\margb1440\\f1\\fs22
{\\pard\\sb400\\sa200\\f1\\fs28\\b\\cf2 Bezwaarschrift\\par}
{\\pard\\sb0\\sa200\\f1\\fs20\\cf0 Opgesteld voor: ${rtfEscape(customerName || "")} | Instantie: ${rtfEscape(triage?.uitgevende_instantie || "onbekend")}\\par}
{\\pard\\sb300\\sa200\\f1\\fs22\\cf0 ${rtfEscape(extractTaggedSection(analysis, "OBJECTION"))}\\par}
{\\pard\\sb400\\sa100\\f1\\fs18\\cf0\\i Opmerking: Dit is een conceptbezwaarschrift en geen juridisch advies. Stuur aangetekend indien van toepassing. BoeteCheck is niet aansprakelijk voor de uitkomst van uw bezwaar.\\par}
}`;
}

function maakAdminRtf(analysis, customerName, customerEmail, triage) {
  const boeteBedrag = triage?.boetebedrag ? `\\u8364?${triage.boetebedrag}` : "onbekend";

  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\froman\\fcharset0 Times New Roman;}{\\f1\\fswiss\\fcharset0 Arial;}}
{\\colortbl;\\red27\\green58\\blue140;\\red153\\green26\\blue26;}
\\paperw11906\\paperh16838\\margl1800\\margr1800\\margt1440\\margb1440\\f1\\fs22
{\\pard\\sb400\\sa200\\f1\\fs32\\b\\cf1 ${rtfEscape(extractTaggedSection(analysis, "TITLE") || "Boete Analyse")}\\par}
{\\pard\\sb0\\sa100\\f1\\fs20\\cf0 Naam: ${rtfEscape(customerName || "")} (${rtfEscape(customerEmail || "")})\\par}
{\\pard\\sb0\\sa200\\f1\\fs20\\cf0 Type: ${rtfEscape(triage?.boete_type || "onbekend")} | Instantie: ${rtfEscape(triage?.uitgevende_instantie || "onbekend")} | Bedrag: ${boeteBedrag} | Datum: ${rtfEscape(triage?.datum_overtreding || "onbekend")} | Risico: ${rtfEscape(triage?.risk || "")}\\par}
{\\pard\\sb300\\sa120\\f1\\fs24\\b Samenvatting\\par}
{\\pard\\sa200\\f1\\fs22 ${rtfEscape(extractTaggedSection(analysis, "SUMMARY"))}\\par}
{\\pard\\sb300\\sa120\\f1\\fs24\\b Bevindingen\\par}
${bulletLines(extractTaggedSection(analysis, "ISSUES"))}
{\\pard\\sb300\\sa120\\f1\\fs24\\b Inschatting\\par}
{\\pard\\sa200\\f1\\fs22 ${rtfEscape(extractTaggedSection(analysis, "ASSESSMENT"))}\\par}
{\\pard\\sb300\\sa120\\f1\\fs24\\b Vervolgstappen\\par}
${bulletLines(extractTaggedSection(analysis, "NEXT_STEPS"))}
{\\pard\\sa200\\par}
{\\pard\\sb300\\sa120\\f1\\fs24\\b\\cf2 Bezwaarschrift\\par}
{\\pard\\sa200\\f1\\fs22\\cf0 ${rtfEscape(extractTaggedSection(analysis, "OBJECTION"))}\\par}
{\\pard\\sb400\\sa100\\f1\\fs18\\cf0\\i Opmerking: Informatieve analyse, geen juridisch advies.\\par}
}`;
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleTriage(env, fileBase64, mediaType) {
  const raw = await callClaudeDocument(env, {
    model: "claude-haiku-4-5-20251001", maxTokens: 800,
    prompt: TRIAGE_PROMPT, fileBase64, mediaType
  });
  console.log("TRIAGE RAW:", raw.substring(0, 300));
  const p = safeJsonParse(raw);
  console.log("TRIAGE RESULT:", JSON.stringify(p));
  if (!p) return { boete_type: null, uitgevende_instantie: null, boetebedrag: null, overtreding: null, datum_overtreding: null, bezwaar_termijn_verstreken: null, risk: "medium", route: "SONNET" };
  return {
    boete_type: p.boete_type || null,
    uitgevende_instantie: p.uitgevende_instantie || null,
    boetebedrag: typeof p.boetebedrag === "number" ? p.boetebedrag : null,
    overtreding: p.overtreding || null,
    datum_overtreding: p.datum_overtreding || null,
    bezwaar_termijn_verstreken: p.bezwaar_termijn_verstreken ?? null,
    risk: p.risk || "medium",
    route: p.route || "SONNET"
  };
}

async function handleGratisAnalyse(env, fileBase64, mediaType) {
  const raw = await callClaudeDocument(env, {
    model: "claude-haiku-4-5-20251001", maxTokens: 600,
    prompt: GRATIS_PROMPT, fileBase64, mediaType
  });
  console.log("GRATIS RAW:", raw.substring(0, 300));
  return {
    boete_type: extractTaggedSection(raw, "BOETE_TYPE") || null,
    instantie: extractTaggedSection(raw, "INSTANTIE") || null,
    boetebedrag: parseFloat(extractTaggedSection(raw, "BOETEBEDRAG")) || null,
    risk: extractTaggedSection(raw, "RISK") || "medium",
    teaser: extractTaggedSection(raw, "TEASER") || null
  };
}

async function generateAnalysis(env, { fileBase64, mediaType, route }) {
  const useSonnet = route === "SONNET";
  const analysis = await callClaudeDocument(env, {
    model: useSonnet ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001",
    maxTokens: useSonnet ? 3500 : 1800,
    prompt: useSonnet ? SONNET_PROMPT : HAIKU_PROMPT,
    fileBase64, mediaType
  }) || "";
  console.log("ANALYSIS MODEL:", useSonnet ? "sonnet" : "haiku");
  console.log("ANALYSIS LENGTH:", analysis.length);
  console.log("ANALYSIS TAGS:", ["TITLE","SUMMARY","ISSUES","ASSESSMENT","NEXT_STEPS","OBJECTION"].map(t => `${t}:${extractTaggedSection(analysis,t).length > 0 ? "OK" : "MISSING"}`).join(" "));
  return analysis;
}

// ── Mail helpers ──────────────────────────────────────────────────────────────

function buildGratisMailHtml({ name, boete_type, instantie, boetebedrag, risk, teaser, stripeLink }) {
  const riskLabel = { low: "Laag", medium: "Middel", high: "Hoog" }[risk] || risk;
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f2937;">
      <h2 style="color:#1d3a6e;">Jouw gratis eerste inschatting</h2>
      <p>Hoi ${escapeHtml(name)},</p>
      <p>We hebben jouw boetebeschikking geanalyseerd op bezwaarmogelijkheden.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <tr style="background:#f3f4f6;"><td style="padding:10px 14px;font-weight:bold;">Type boete</td><td style="padding:10px 14px;">${escapeHtml(boete_type || "onbekend")}</td></tr>
        <tr><td style="padding:10px 14px;font-weight:bold;">Uitgevende instantie</td><td style="padding:10px 14px;">${escapeHtml(instantie || "onbekend")}</td></tr>
        <tr style="background:#f3f4f6;"><td style="padding:10px 14px;font-weight:bold;">Boetebedrag</td><td style="padding:10px 14px;font-weight:bold;color:#1d3a6e;">${boetebedrag ? `€ ${boetebedrag}` : "onbekend"}</td></tr>
        <tr><td style="padding:10px 14px;font-weight:bold;">Bezwaarpotentieel</td><td style="padding:10px 14px;">${riskLabel}</td></tr>
      </table>
      <p style="background:#fef9c3;border-left:4px solid #eab308;padding:12px 16px;border-radius:4px;">${escapeHtml(teaser || "Op basis van jouw boetebeschikking lijken er mogelijk bezwaargronden te zijn.")}</p>
      <p>Voor een volledige analyse met kant-en-klaar bezwaarschrift:</p>
      <a href="${stripeLink}" style="display:inline-block;background:#1d3a6e;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:8px 0;">
        Volledige analyse voor €29 →
      </a>
      <p style="color:#6b7280;font-size:0.85rem;margin-top:32px;">Opmerking: Dit is een informatieve eerste inschatting en geen juridisch advies. Let op de bezwaartermijn — bij Wahv-boetes is dat 6 weken na de datum van de beschikking.</p>
    </div>
  `;
}

// ── Mailers ───────────────────────────────────────────────────────────────────

async function sendAdminGratisNotification(env, { name, email, gratis, stripeLink }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "BoeteCheck <noreply@boetecheck.nl>",
      to: [env.ADMIN_EMAIL],
      reply_to: [email],
      subject: `Nieuwe gratis aanvraag: ${name} (${email})`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <p style="background:#f3f4f6;padding:10px 14px;border-radius:6px;font-size:0.85rem;color:#6b7280;">📬 Klantmail wordt morgen om 15:00 verstuurd naar <strong>${escapeHtml(email)}</strong></p>
        ${buildGratisMailHtml({ name, ...gratis, stripeLink })}
      </div>`
    })
  });
  if (!res.ok) throw new Error(`Admin-notificatie mislukt: ${await res.text()}`);
}

async function sendAdminPaidNotification(env, { customerName, customerEmail, triage, analysis }) {
  const rtfContent = maakAdminRtf(analysis, customerName, customerEmail, triage);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "BoeteCheck <noreply@boetecheck.nl>",
      to: [env.ADMIN_EMAIL],
      reply_to: [customerEmail],
      subject: `Nieuwe betaalde analyse: ${customerName} (${customerEmail})`,
      html: `<div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;">
        <p style="background:#f3f4f6;padding:10px 14px;border-radius:6px;font-size:0.85rem;color:#6b7280;">📬 Klantmail (2 bijlagen) wordt morgen om 15:00 verstuurd naar <strong>${escapeHtml(customerEmail)}</strong></p>
        <h2>Nieuwe betaalde boete analyse</h2>
        <p><strong>Naam:</strong> ${escapeHtml(customerName || "")}</p>
        <p><strong>Type:</strong> ${escapeHtml(triage?.boete_type || "onbekend")}</p>
        <p><strong>Instantie:</strong> ${escapeHtml(triage?.uitgevende_instantie || "onbekend")}</p>
        <p><strong>Bedrag:</strong> ${triage?.boetebedrag ? `€ ${triage.boetebedrag}` : "onbekend"}</p>
        <p><strong>Overtreding:</strong> ${escapeHtml(triage?.overtreding || "onbekend")}</p>
        <p><strong>Risico:</strong> ${escapeHtml(triage?.risk || "")}</p>
        ${triage?.bezwaar_termijn_verstreken === true ? `<p style="color:red;font-weight:bold;">⚠️ BEZWAARTERMIJN MOGELIJK VERSTREKEN</p>` : ""}
      </div>`,
      attachments: [{ filename: "BoeteCheck-Analyse.rtf", content: rtfToBase64(rtfContent) }]
    })
  });
  if (!res.ok) throw new Error(`Admin-mail mislukt: ${await res.text()}`);
}

async function sendDelayedGratisEmail(env, entry) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "BoeteCheck <noreply@boetecheck.nl>",
      to: [entry.email],
      subject: "Jouw gratis boete inschatting — BoeteCheck",
      html: buildGratisMailHtml({
        name: entry.name,
        boete_type: entry.boete_type,
        instantie: entry.instantie,
        boetebedrag: entry.boetebedrag,
        risk: entry.risk,
        teaser: entry.teaser,
        stripeLink: entry.stripe_link || "https://boetecheck.nl"
      })
    })
  });
  if (!res.ok) throw new Error(`Gratis mail mislukt: ${await res.text()}`);
}

async function sendDelayedPaidEmail(env, entry) {
  const analyseRtf = maakAnalyseRtf(entry.analysis, entry.name, entry.email, entry.triage);
  const bezwaarRtf = maakBezwaarRtf(entry.analysis, entry.name, entry.triage);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "BoeteCheck <noreply@boetecheck.nl>",
      to: [entry.email],
      subject: "Jouw volledige boete analyse — BoeteCheck",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f2937;">
        <h2 style="color:#1d3a6e;">Jouw volledige analyse is klaar</h2>
        <p>Hoi ${escapeHtml(entry.name)},</p>
        <p>In de bijlage vind je twee bestanden:</p>
        <ul style="line-height:1.9;">
          <li><strong>BoeteCheck-Analyse.rtf</strong> — volledige analyse met alle bevindingen en vervolgstappen</li>
          <li><strong>Bezwaarschrift.rtf</strong> — kant-en-klaar bezwaarschrift, direct te gebruiken</li>
        </ul>
        ${entry.triage?.boetebedrag ? `<p>Boetebedrag: <strong>€ ${entry.triage.boetebedrag}</strong></p>` : ""}
        ${entry.triage?.uitgevende_instantie ? `<p>Instantie: <strong>${escapeHtml(entry.triage.uitgevende_instantie)}</strong></p>` : ""}
        <p style="background:#fff7ed;border-left:4px solid #f97316;padding:12px 16px;border-radius:4px;font-size:0.9rem;">
          ⏰ <strong>Let op de bezwaartermijn.</strong> Bij Wahv-boetes (CJIB) heb je 6 weken vanaf de datum van de beschikking om bezwaar te maken. Bij parkeerboetes ook 6 weken. Dien het bezwaarschrift zo snel mogelijk in.
        </p>
        <p style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:4px;font-size:0.9rem;margin-top:12px;">
          💡 Tip: Stuur het bezwaarschrift aangetekend of per e-mail met ontvangstbevestiging. Bewaar het bewijs van indiening.
        </p>
        <p style="color:#6b7280;font-size:0.85rem;margin-top:32px;">Opmerking: Dit is een informatieve analyse en geen juridisch advies.</p>
      </div>`,
      attachments: [
        { filename: "BoeteCheck-Analyse.rtf", content: rtfToBase64(analyseRtf) },
        { filename: "Bezwaarschrift.rtf", content: rtfToBase64(bezwaarRtf) }
      ]
    })
  });
  if (!res.ok) throw new Error(`Betaalde mail mislukt: ${await res.text()}`);
}

// ── Cron handler ──────────────────────────────────────────────────────────────

async function handleCron(env) {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const list = await env.BOETE_QUEUE.list();

  for (const key of list.keys) {
    try {
      const raw = await env.BOETE_QUEUE.get(key.name);
      if (!raw) continue;
      const entry = JSON.parse(raw);
      if (now - new Date(entry.created_at).getTime() < oneDayMs) continue;
      if (entry.type === "gratis") {
        await sendDelayedGratisEmail(env, entry);
      } else {
        await sendDelayedPaidEmail(env, entry);
      }
      await env.BOETE_QUEUE.delete(key.name);
    } catch (err) {
      console.error(`Cron fout voor ${key.name}:`, err.message);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/analyze") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) return jsonResponse({ ok: false, error: "Geen bestand ontvangen" }, 400);
        const { base64, mediaType } = await fileToBase64(file);
        const triage = await handleTriage(env, base64, mediaType);
        return jsonResponse({ ok: true, ...triage });
      } catch (err) {
        return jsonResponse({ ok: false, error: err.message }, 500);
      }
    }

    if (request.method === "POST" && url.pathname === "/analyze-free") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        const name = formData.get("name");
        const email = formData.get("email");
        const stripeLink = env.STRIPE_LINK || "https://boetecheck.nl";

        const err = validateUploadInput({ file, name, email });
        if (err) return jsonResponse({ ok: false, error: err }, 400);

        const { base64, mediaType } = await fileToBase64(file);
        const gratis = await handleGratisAnalyse(env, base64, mediaType);

        await env.BOETE_QUEUE.put(`gratis:${Date.now()}:${email}`, JSON.stringify({
          type: "gratis", name, email,
          boete_type: gratis.boete_type || "",
          instantie: gratis.instantie || "",
          boetebedrag: gratis.boetebedrag || null,
          risk: gratis.risk || "medium",
          teaser: gratis.teaser || "",
          stripe_link: stripeLink,
          created_at: new Date().toISOString()
        }));

        try { await sendAdminGratisNotification(env, { name, email, gratis, stripeLink }); } catch (_) {}

        return jsonResponse({ ok: true, message: "Je ontvangt jouw inschatting uiterlijk de volgende werkdag voor 16:00 per e-mail." });
      } catch (err) {
        return jsonResponse({ ok: false, error: err.message }, 500);
      }
    }

    if (request.method === "POST" && url.pathname === "/submit") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        const name = formData.get("name");
        const email = formData.get("email");

        const err = validateUploadInput({ file, name, email });
        if (err) return jsonResponse({ ok: false, error: err }, 400);

        const { base64, mediaType } = await fileToBase64(file);
        const triage = await handleTriage(env, base64, mediaType);
        const analysis = await generateAnalysis(env, { fileBase64: base64, mediaType, route: triage.route });

        await env.BOETE_QUEUE.put(`paid:${Date.now()}:${email}`, JSON.stringify({
          type: "paid", name, email, analysis, triage,
          created_at: new Date().toISOString()
        }));

        await sendAdminPaidNotification(env, { customerName: name, customerEmail: email, triage, analysis });

        return jsonResponse({ ok: true, message: "Upload gelukt. Je ontvangt jouw volledige analyse uiterlijk de volgende werkdag voor 16:00 per e-mail." });
      } catch (err) {
        return jsonResponse({ ok: false, error: err.message }, 500);
      }
    }

    return new Response("Not found", { status: 404 });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleCron(env));
  }
};
