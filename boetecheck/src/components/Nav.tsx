'use client'
import Link from 'next/link'
import styles from './Nav.module.css'

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Boete<span>Check</span>
        </Link>
        <a href="#upload" className={styles.cta}>
          Check gratis →
        </a>
      </div>
    </nav>
  )
}
