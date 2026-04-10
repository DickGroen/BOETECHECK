import Link from 'next/link'
import Nav from '@/components/Nav'
import styles from './succes.module.css'

export default function SuccesPage() {
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
            Je bezwaarschrift wordt binnen <strong>24 uur</strong> opgesteld op basis van jouw
            beschikking. Je ontvangt het per email — kant-en-klaar om te versturen naar het CJIB.
          </p>

          <div className={styles.steps}>
            {[
              { num: '1', label: 'Beschikking analyseren', done: true },
              { num: '2', label: 'Bezwaarschrift opstellen', done: false },
              { num: '3', label: 'Brief per email versturen', done: false },
              { num: '4', label: 'Jij verstuurt naar CJIB', done: false },
            ].map((step) => (
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
