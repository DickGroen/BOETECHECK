'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import styles from './succes.module.css'

function SuccesContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') || ''
  
  // Detecteer product op basis van session_id prefix of gebruik amount uit URL
  // We tonen beide varianten op basis van een query param die we meegeven
  const product = searchParams.get('product') || '49'
  const isVolledig = product === '49'

  const stepsVolledig = [
    { num: '1', label: 'Beschikking analyseren', done: true },
    { num: '2', label: 'Bezwaarschrift opstellen', done: false },
    { num: '3', label: 'Wij dienen in via CJIB-portaal', done: false },
    { num: '4', label: 'Klaar — jij hoeft niets te doen', done: false },
  ]

  const stepsBrief = [
    { num: '1', label: 'Beschikking analyseren', done: true },
    { num: '2', label: 'Bezwaarschrift opstellen', done: false },
    { num: '3', label: 'Brief per email naar jou', done: false },
    { num: '4', label: 'Jij verstuurt naar CJIB', done: false },
  ]

  const steps = isVolledig ? stepsVolledig : stepsBrief

  return (
    <>
      <Nav />
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.icon}>✓</div>
          <div className="section-label" style={{ textAlign: 'center', marginBottom: '10px' }}>
            Betaling ontvangen
          </div>
          <h1 className={styles.title}>We gaan aan de slag.</h1>
          <p className={styles.sub}>
            {isVolledig ? (
              <>
                Je bezwaarschrift wordt binnen <strong>24 uur</strong> opgesteld.
                Daarna dienen wij het digitaal in via het CJIB-portaal.{' '}
                <strong>Jij hoeft niets te doen.</strong>
              </>
            ) : (
              <>
                Je bezwaarschrift wordt binnen <strong>24 uur</strong> opgesteld en per email
                naar je gestuurd — kant-en-klaar om zelf te versturen naar het CJIB.
              </>
            )}
          </p>

          <div className={styles.steps}>
            {steps.map((step) => (
              <div key={step.num} className={`${styles.step} ${step.done ? styles.stepDone : ''}`}>
                <div className={`${styles.stepNum} ${step.done ? styles.stepNumDone : ''}`}>
                  {step.done ? '✓' : step.num}
                </div>
                <span>{step.label}</span>
              </div>
            ))}
          </div>

          <p className={styles.support}>
            Vragen? Mail naar{' '}
            <a href="mailto:support@boetecheck.nl">support@boetecheck.nl</a>
          </p>

          <Link href="/" className="btn-ghost" style={{ display: 'block', textAlign: 'center', marginTop: '24px' }}>
            Terug naar BoeteCheck
          </Link>

          <p className={styles.disclaimer}>
            BoeteCheck is geen advocatenkantoor. Dit is geen juridisch advies. De officier van
            justitie beslist.
          </p>
        </div>
      </div>
    </>
  )
}

export default function SuccesPage() {
  return (
    <Suspense fallback={<div />}>
      <SuccesContent />
    </Suspense>
  )
}
