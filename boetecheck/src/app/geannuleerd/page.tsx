import Link from 'next/link'
import Nav from '@/components/Nav'
import styles from './geannuleerd.module.css'

export default function GeannuleerdPage() {
  return (
    <>
      <Nav />
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.icon}>←</div>
          <h1 className={styles.title}>Betaling geannuleerd.</h1>
          <p className={styles.sub}>
            Geen probleem — je zit nergens aan vast. Je analyse staat nog klaar als je
            toch wil doorgaan.
          </p>
          <div className={styles.actions}>
            <Link href="/#upload" className="btn-primary" style={{ display: 'block' }}>
              Terug naar mijn rapport
            </Link>
            <Link href="/" className="btn-ghost" style={{ display: 'block' }}>
              Nieuwe check starten
            </Link>
          </div>
          <p className={styles.diy}>
            Wil je het gratis zelf doen?{' '}
            <Link href="/stappenplan">Download ons stappenplan →</Link>
          </p>
        </div>
      </div>
    </>
  )
}
