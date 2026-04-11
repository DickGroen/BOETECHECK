'use client'
import { useState, useRef, useCallback } from 'react'
import type { AnalyzeResult, Finding } from '@/lib/types'
import styles from './UploadFlow.module.css'

type Step = 'upload' | 'analyzing' | 'result'

const ANALYZE_MESSAGES = [
  'Beschikking ophalen en inlezen…',
  'Datum en kenteken verifiëren…',
  'IJkgegevens controleren…',
  'Meetmethode analyseren…',
  'Foto-kwaliteit beoordelen…',
  'Bevoegdheid opsporingsambtenaar checken…',
  'Rapport genereren…',
]

export default function UploadFlow() {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analyzeMsg, setAnalyzeMsg] = useState(ANALYZE_MESSAGES[0])
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<null | 39 | 49>(null)
  const [machtiging, setMachtiging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const msgIndexRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleFile = (f: File) => { setFile(f); setError(null) }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const handleCheck = async () => {
    if (!file) { setError('Selecteer eerst een bestand.'); return }
    setStep('analyzing')
    setError(null)
    msgIndexRef.current = 0
    intervalRef.current = setInterval(() => {
      msgIndexRef.current = Math.min(msgIndexRef.current + 1, ANALYZE_MESSAGES.length - 1)
      setAnalyzeMsg(ANALYZE_MESSAGES[msgIndexRef.current])
    }, 1800)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Onbekende fout')
      if (intervalRef.current) clearInterval(intervalRef.current)
      setResult(data as AnalyzeResult)
      setStep('result')
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setError(err instanceof Error ? err.message : 'Analyse mislukt. Probeer opnieuw.')
      setStep('upload')
    }
  }

  const handleSendEmail = async () => {
    if (!email.includes('@') || !result) return
    setEmailLoading(true)
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, result }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email versturen mislukt')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleCheckout = async (price: 39 | 49) => {
    if (!result) return
    setCheckoutLoading(price)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailSent ? email : undefined, result: { ...result, bedrag: `€${price}` } }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Betaling starten mislukt')
      setCheckoutLoading(null)
    }
  }

  const reset = () => {
    setStep('upload'); setFile(null); setResult(null)
    setError(null); setEmailSent(false); setEmail('')
    setCheckoutLoading(null); setMachtiging(false)
  }

  const verdictConfig = {
    waarschijnlijk: { label: '✅ Waarschijnlijk bezwaarwaardig', className: styles.badgeGreen },
    mogelijk: { label: '⚖️ Mogelijk bezwaarwaardig', className: styles.badgeAmber },
    lage_kans: { label: '📋 Lage kans op bezwaar', className: styles.badgeGray },
    onvoldoende_leesbaar: { label: '📷 Upload niet goed leesbaar', className: styles.badgeGray },
  }

  const severityDot = (severity?: string) => {
    if (severity === 'hoog') return <span className={`${styles.dot} ${styles.dotRed}`} />
    if (severity === 'midden') return <span className={`${styles.dot} ${styles.dotAmber}`} />
    return <span className={`${styles.dot} ${styles.dotGreen}`} />
  }

  const showCtas = result && result.verdict !== 'lage_kans' && result.verdict !== 'onvoldoende_leesbaar'

  return (
    <section className={styles.section} id="upload">
      <div className="container">
        <div className={styles.label}>Gratis check</div>
        <h2 className={styles.title}>Upload je beschikking</h2>
        <p className={styles.sub}>Stap 1 van 2 — alleen upload, geen account nodig</p>

        <div className={styles.progressRow}>
          <div className={`${styles.progStep} ${step !== 'upload' ? styles.progDone : styles.progActive}`} />
          <div className={`${styles.progStep} ${step === 'result' ? styles.progActive : ''}`} />
        </div>
        <div className={styles.progLabels}><span>Upload</span><span>Resultaat</span></div>

        {/* UPLOAD */}
        {step === 'upload' && (
          <div className={styles.card}>
            {!file ? (
              <div
                className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf,.heic" className={styles.hiddenInput} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div className={styles.dropIcon}>📄</div>
                <h3 className={styles.dropTitle}>Sleep je beschikking hier</h3>
                <p className={styles.dropSub}>of klik om te bladeren · .jpg .png .pdf .heic · max 10MB</p>
              </div>
            ) : (
              <div className={styles.filePreview}>
                <div className={styles.fileIcon}>📄</div>
                <span className={styles.fileName}>{file.name}</span>
                <button className={styles.fileRemove} onClick={() => setFile(null)}>×</button>
              </div>
            )}
            <p className={styles.metaLine}>🔒 Versleuteld geüpload · NL datacenter · Automatisch gewist na 30 dagen</p>
            {error && <p className={styles.errorMsg}>{error}</p>}
            <button className={`btn-primary ${styles.checkBtn}`} onClick={handleCheck} disabled={!file}>
              Check mijn boete →
            </button>
            <p className={styles.microCopy}>Gratis check. Je zit nergens aan vast.</p>
          </div>
        )}

        {/* ANALYZING */}
        {step === 'analyzing' && (
          <div className={styles.card}>
            <div className={styles.analyzing}>
              <div className={styles.spinner} />
              <p className={styles.analyzeMsg}>{analyzeMsg}</p>
              <p className={styles.analyzeNote}>Gemiddeld klaar in 1:47</p>
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === 'result' && result && (
          <div className={styles.card}>
            <div className={`${styles.verdictBadge} ${verdictConfig[result.verdict]?.className || styles.badgeGray}`}>
              {verdictConfig[result.verdict]?.label || result.verdict}
            </div>

            <h3 className={styles.resultTitle}>
              {result.verdict === 'waarschijnlijk' && 'Er zijn sterke aanknopingspunten gevonden'}
              {result.verdict === 'mogelijk' && 'Er zijn mogelijke aanknopingspunten gevonden'}
              {result.verdict === 'lage_kans' && 'Weinig formele fouten gevonden'}
              {result.verdict === 'onvoldoende_leesbaar' && 'Upload niet goed leesbaar'}
            </h3>

            <p className={styles.resultSummary}>{result.summary}</p>

            {/* Meta */}
            {(result.kenteken || result.bedrag || result.deadline) && (
              <div className={styles.metaGrid}>
                {result.kenteken && <div className={styles.metaItem}><span className={styles.metaKey}>Kenteken</span><span className={styles.metaVal}>{result.kenteken}</span></div>}
                {result.bedrag && <div className={styles.metaItem}><span className={styles.metaKey}>Bedrag</span><span className={styles.metaVal}>{result.bedrag}</span></div>}
                {result.deadline && <div className={styles.metaItem}><span className={styles.metaKey}>Bezwaar voor</span><span className={`${styles.metaVal} ${styles.metaDeadline}`}>{result.deadline}</span></div>}
              </div>
            )}

            {/* Findings */}
            {result.findings.length > 0 && (
              <div className={styles.findings}>
                {result.findings.map((f, i) => (
                  <div key={i} className={styles.finding}>
                    {severityDot(f.severity)}
                    <div>
                      {f.title && <span className={styles.findingTitle}>{f.title}</span>}
                      <span className={styles.findingText}>{f.description || f.tekst}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* What this means */}
            {result.what_this_means && (
              <div className={styles.whatItMeans}>
                <p className={styles.whatItMeansLabel}>Wat betekent dit?</p>
                <p className={styles.whatItMeansText}>{result.what_this_means}</p>
              </div>
            )}

            {/* Email capture */}
            {!emailSent ? (
              <div className={styles.emailRow}>
                <input type="email" placeholder="Email voor rapport + deadline-herinnering" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()} className={styles.emailInput} disabled={emailLoading} />
                <button className={styles.emailBtn} onClick={handleSendEmail} disabled={emailLoading || !email.includes('@')}>
                  {emailLoading ? '…' : 'Sturen'}
                </button>
              </div>
            ) : (
              <p className={styles.emailConfirm}>✓ Rapport gemaild naar {email}</p>
            )}

            {error && <p className={styles.errorMsg}>{error}</p>}

            {/* CTAs */}
            {showCtas && (
              <div className={styles.resultActions}>
                <div className={styles.ctaBlock}>
                  <div className={styles.ctaLabel}>Volledig ontzorgd</div>
                  <label className={styles.machtLabel}>
                    <input type="checkbox" checked={machtiging} onChange={(e) => setMachtiging(e.target.checked)} className={styles.machtCheck} />
                    <span>Ik machtig BoeteCheck om namens mij bezwaar in te dienen bij het CJIB</span>
                  </label>
                  <button
                    className="btn-navy"
                    style={{ width: '100%', fontSize: '15px', padding: '14px', opacity: machtiging ? 1 : 0.5, cursor: machtiging ? 'pointer' : 'not-allowed' }}
                    onClick={() => machtiging && handleCheckout(49)}
                    disabled={checkoutLoading !== null || !machtiging}
                  >
                    {checkoutLoading === 49 ? 'Doorsturen…' : 'Wij regelen alles — €49 →'}
                  </button>
                </div>
                <button
                  className="btn-ghost"
                  style={{ width: '100%' }}
                  onClick={() => handleCheckout(39)}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === 39 ? 'Doorsturen…' : 'Brief op maat, ik verstuur zelf — €39'}
                </button>
              </div>
            )}

            {/* Deadline warning */}
            {result.deadline_warning && (
              <div className={styles.deadlineWarning}>
                ⏰ {result.deadline_warning}
              </div>
            )}

            <div className={styles.disclaimer}>
              {result.disclaimer || 'Deze beoordeling is indicatief en gebaseerd op geautomatiseerde analyse. Dit is geen juridisch advies. BoeteCheck is geen advocatenkantoor. De officier van justitie beslist.'}
            </div>

            <button className={styles.resetBtn} onClick={reset}>← Nieuwe check</button>
          </div>
        )}
      </div>
    </section>
  )
}
