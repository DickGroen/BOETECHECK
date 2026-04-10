'use client'
import { useState } from 'react'
import styles from './FaqAccordion.module.css'

type Faq = { q: string; a: string }

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className={styles.list}>
      {faqs.map((faq, i) => (
        <div key={i} className={`${styles.item} ${open === i ? styles.open : ''}`}>
          <button className={styles.question} onClick={() => setOpen(open === i ? null : i)}>
            {faq.q}
            <div className={styles.icon}>+</div>
          </button>
          <div className={styles.answer}>
            <div className={styles.answerInner}>{faq.a}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
