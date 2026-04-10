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
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const msgIndexRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setError(null)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const handleCheck = async () => {
    if (!file) {
      setError('Selecteer eerst een bestand.')
      return
    }
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

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

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
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Email versturen mislukt')
      }
      setEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email versturen mislukt')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!result) return
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailSent ? email : undefined, result }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout mislukt')
      // Redirect to Stripe hosted checkout
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Betaling starten mislukt')
      setCheckoutLoading(false)
    }
  }

  const reset = () => {
    setStep('upload')
    setFile(null)
    setResult(null)
    setError(null)
    setEmailSent(false)
    setEmail('')
    setCheckoutLoading(false)
    setEmailLoading(false)
  }

  const verdictConfig = {
    waarschijnlijk: { label: '✅ Waarschijnlijk bezwaarwaardig', className: styles.badgeGreen },
    mogelijk: { label: '⚖️ Mogelijk bezwaarwaardig', className: styles.badgeAmber },
    laag: { label: '📋 Lage kans op bezwaar', className: styles.badgeGray },
  }

  const findingIcon = (type: Finding['type']) => {
    if (type === 'fout') return <span className={`${styles.dot} ${styles.dotRed}`} />
    if (type === 'aandachtspunt') return <span className={`${styles.dot} ${styles.dotAmber}`} />
    return <span className={`${styles.dot} ${styles.dotGreen}`} />
  }

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
        <div className={styles.progLabels}>
          <span>Upload</span>
          <span>Resultaat</span>
        </div>

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
                <input
                  ref={inputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.heic"
                  className={styles.hiddenInput}
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
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

            <p className={styles.metaLine}>
              🔒 Versleuteld geüpload · NL datacenter · Automatisch gewist na 30 dagen
            </p>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <button
              className={`btn-primary ${styles.checkBtn}`}
              onClick={handleCheck}
              disabled={!file}
            >
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
            <div className={`${styles.verdictBadge} ${verdictConfig[result.verdict].className}`}>
              {verdictConfig[result.verdict].label}
            </div>

            <h3 className={styles.resultTitle}>
              {result.verdict === 'waarschijnlijk' && 'Er zijn sterke aanknopingspunten gevonden'}
              {result.verdict === 'mogelijk' && 'Er zijn aanknopingspunten gevonden'}
              {result.verdict === 'laag' && 'Weinig formele fouten gevonden'}
            </h3>

            <p className={styles.resultSummary}>{result.summary}</p>

            {(result.kenteken || result.bedrag || result.deadline) && (
              <div className={styles.metaGrid}>
                {result.kenteken && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaKey}>Kenteken</span>
                    <span className={styles.metaVal}>{result.kenteken}</span>
                  </div>
                )}
                {result.bedrag && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaKey}>Bedrag</span>
                    <span className={styles.metaVal}>{result.bedrag}</span>
                  </div>
                )}
                {result.deadline && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaKey}>Bezwaar voor</span>
                    <span className={`${styles.metaVal} ${styles.metaDeadline}`}>{result.deadline}</span>
                  </div>
                )}
              </div>
            )}

            {result.findings.length > 0 && (
              <div className={styles.findings}>
                {result.findings.map((f, i) => (
                  <div key={i} className={styles.finding}>
                    {findingIcon(f.type)}
                    <div>
                      <span className={styles.findingText}>{f.tekst}</span>
                      {f.artikel && <span className={styles.findingArtikel}>{f.artikel}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Email capture */}
            {!emailSent ? (
              <div className={styles.emailRow}>
                <input
                  type="email"
                  placeholder="Email voor rapport + deadline-herinnering"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
                  className={styles.emailInput}
                  disabled={emailLoading}
                />
                <button
                  className={styles.emailBtn}
                  onClick={handleSendEmail}
                  disabled={emailLoading || !email.includes('@')}
                >
                  {emailLoading ? '…' : 'Sturen'}
                </button>
              </div>
            ) : (
              <p className={styles.emailConfirm}>✓ Rapport gemaild naar {email}</p>
            )}

            {error && <p className={styles.errorMsg}>{error}</p>}

            {/* CTAs */}
            <div className={styles.resultActions}>
              {result.verdict !== 'laag' && (
                <button
                  className="btn-navy"
                  style={{ width: '100%', fontSize: '15px', padding: '14px' }}
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Doorsturen naar betaling…' : 'Bezwaarschrift bestellen — €39 →'}
                </button>
              )}
              <button className="btn-ghost" style={{ width: '100%' }}>
                Gratis stappenplan downloaden
              </button>
            </div>

            <div className={styles.disclaimer}>
              <strong>Disclaimer:</strong> Deze beoordeling is indicatief en gebaseerd op geautomatiseerde
              analyse. Dit is geen juridisch advies. BoeteCheck is geen advocatenkantoor. De officier
              van justitie beslist.{' '}
              <strong>Let op: bezwaar moet binnen 6 weken na dagtekening worden ingediend bij het CJIB.</strong>
            </div>

            <button className={styles.resetBtn} onClick={reset}>
              ← Nieuwe check
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
