'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'
import UploadFlow from '@/components/UploadFlow'
import FaqAccordion from '@/components/FaqAccordion'
import styles from './page.module.css'

function CheckoutButton({ price, label, variant }: { price: number; label: string; variant: 'default' | 'featured' }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result: {
            verdict: 'mogelijk',
            summary: 'Directe bestelling via prijskaart.',
            findings: [],
            bedrag: price === 39 ? '€39' : '€49',
          },
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        width: '100%',
        marginTop: '20px',
        padding: '13px',
        borderRadius: '10px',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        fontSize: '14px',
        fontWeight: 500,
        background: variant === 'featured' ? '#12B76A' : '#0A2540',
        color: 'white',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? 'Doorsturen…' : label}
    </button>
  )
}

export default function Home() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            AI-analyse van je beschikking
          </div>
          <h1 className={styles.h1}>
            Heb je een boete?<br />
            Check eerst of bezwaar <em>zin heeft.</em>
          </h1>
          <p className={styles.heroSub}>
            Upload je boete. Zie direct of er fouten in staan die bezwaar zinvol maken.
            Gratis en vrijblijvend.
          </p>
          <div className={styles.counter}>
            <span className={styles.counterDot} />
            <span>17.342 boetes gecheckt deze maand</span>
          </div>
          <div className={styles.heroActions}>
            <a href="#upload" className="btn-primary">Check mijn boete gratis</a>
            <a href="#hoe-werkt-het" className="btn-ghost">Hoe werkt het?</a>
          </div>
          <p className={styles.heroMicro}>
            Je zit nergens aan vast. Wij dienen niets in zonder jouw akkoord.
          </p>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className={styles.trustStrip}>
        <div className={`container ${styles.trustInner}`}>
          {['Gratis eerste check', 'Geen verplichting', 'Nederlandse servers', 'AVG-conform'].map((item) => (
            <div key={item} className={styles.trustItem}>
              <div className={styles.trustCheck} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEM */}
      <section className={styles.section}>
        <div className="container">
          <div className="section-label">Het probleem</div>
          <h2 className={styles.h2}>Betalen of bezwaar?<br />Niemand weet het.</h2>
          <p className={styles.sectionSub}>
            De meeste mensen betalen direct of doen juist helemaal niets. Terwijl één fout in de beschikking
            al genoeg kan zijn.
          </p>
          <div className={styles.problemBlock}>
            <p>
              De meeste mensen betalen gewoon. Of ze doen niks. Terwijl <strong>één fout in je boete al genoeg kan zijn.</strong> Maar wie leest er nou 4 pagina&apos;s ambtenarentaal?
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.section} id="hoe-werkt-het" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-label">Werkwijze</div>
          <h2 className={styles.h2}>Klaar in 2 minuten.</h2>
          <p className={styles.sectionSub}>Drie stappen, geen gedoe, geen kleine lettertjes.</p>
          <div className={styles.steps}>
            {[
              {
                num: 1,
                title: 'Upload je beschikking',
                desc: 'Foto of PDF van je boete. Accepteert .jpg .png .pdf .heic. Versleuteld geüpload naar Nederlandse server.',
                tag: '±10 seconden',
              },
              {
                num: 2,
                title: 'AI checkt op 40+ punten',
                desc: 'Onze AI analyseert op formele eisen: datum, locatie, ijkgegevens, meetmethode, foto-kwaliteit, kenteken en meer.',
                tag: '±90 seconden',
              },
              {
                num: 3,
                title: 'Kies wat je doet',
                desc: 'Helder rapport: waarschijnlijk / misschien / lage kans. Bij aanknopingspunten regelen wij alles voor €49 — of doe het zelf voor €39.',
                tag: 'Jij beslist',
              },
            ].map((step) => (
              <div key={step.num} className={styles.step}>
                <div className={styles.stepNum}>{step.num}</div>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                  <span className={styles.stepTag}>{step.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPLOAD FLOW */}
      <UploadFlow />

      {/* PRICING */}
      <section className={styles.section} id="prijzen">
        <div className="container">
          <div className="section-label">Transparante kosten</div>
          <h2 className={styles.h2}>Geen addertje onder het gras.</h2>
          <p className={styles.sectionSub}>
            De check is altijd gratis. Kies daarna hoeveel ontzorging je wil.
          </p>
          <div className={styles.pricingGrid3}>
            <div className={styles.priceCard}>
              <div className={styles.priceLabel}>De check</div>
              <div className={styles.priceAmount}>€0</div>
              <div className={styles.priceSub}>Altijd gratis. Geen account.</div>
              <ul className={styles.priceList}>
                <li>Analyse op 40+ formele punten</li>
                <li>Helder rapport met uitkomst</li>
                <li>Deadline-herinnering per email</li>
                <li>Gratis stappenplan zelf doen</li>
              </ul>
              <a href="#upload" style={{ display: 'block', marginTop: '20px', padding: '13px', borderRadius: '10px', border: '1px solid #E3E8EF', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 500, color: '#0A2540', textDecoration: 'none' }}>
                Gratis starten
              </a>
            </div>
            <div className={styles.priceCard}>
              <div className={styles.priceLabel}>Brief op maat</div>
              <div className={styles.priceAmount}>€39</div>
              <div className={styles.priceSub}>Eenmalig. Jij verstuurt.</div>
              <ul className={styles.priceList}>
                <li>Compleet bezwaarschrift op maat</li>
                <li>Gebaseerd op jouw beschikking</li>
                <li>Instructie + juist adres CJIB</li>
                <li>Ondersteuning bij vragen</li>
              </ul>
              <CheckoutButton price={39} label="Bestellen voor €39" variant="default" />
            </div>
            <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
              <div className={styles.priceLabelLight}>Volledig ontzorgd</div>
              <div className={styles.priceAmountLight}>€49</div>
              <div className={styles.priceSubLight}>Eenmalig. Jij hoeft niets te doen.</div>
              <ul className={styles.priceListLight}>
                <li>Compleet bezwaarschrift op maat</li>
                <li>Wij dienen in via CJIB-portaal</li>
                <li>Jij hoeft niets te versturen</li>
                <li>Ondersteuning bij vragen</li>
              </ul>
              <CheckoutButton price={49} label="Bestellen voor €49 →" variant="featured" />
            </div>
          </div>
          <div className={styles.rekensom}>
            <div>
              <strong>Rekensom: boete €120</strong>
              <span> — bezwaar gegrond = €120 terug. Kosten BoeteCheck = €49. Je bespaart €71.</span>
              <span className={styles.rekensomFine}> Bezwaar afgewezen? Dan ben je €49 kwijt.</span>
            </div>
            <div className={styles.rekensomBadge}>Je bespaart €71</div>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-label">Veiligheid</div>
          <h2 className={styles.h2}>Je document blijft van jou.</h2>
          <p className={styles.sectionSub}>We bouwen BoeteCheck alsof we het zelf zouden gebruiken.</p>
          <div className={styles.securityGrid}>
            {[
              { icon: '🔐', title: 'Versleuteld uploaden', desc: 'Alle bestanden via SSL. Geen onversleutelde opslag, nooit.' },
              { icon: '🇳🇱', title: 'Nederlandse servers', desc: 'Je document staat in Nederland. Volledig binnen EU-wetgeving.' },
              { icon: '🗑️', title: 'Automatisch verwijderd', desc: 'Na 30 dagen definitief weg. Eerder verwijderen via link in je rapport.' },
              { icon: '🚫', title: 'Geen doorverkoop', desc: 'We verkopen geen data aan derden. We dienen alleen in met jouw expliciete opdracht.' },
            ].map((item) => (
              <div key={item.title} className={styles.securityCard}>
                <div className={styles.securityIcon}>{item.icon}</div>
                <h4 className={styles.securityTitle}>{item.title}</h4>
                <p className={styles.securityDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection} id="faq">
        <div className="container">
          <div className="section-label">Veelgestelde vragen</div>
          <h2 className={styles.h2}>Alle &quot;ja maar&quot; antwoorden.</h2>
          <FaqList />
        </div>
      </section>

      {/* FINAL CTA */}
      <div className={styles.finalCta}>
        <div className={styles.finalCtaInner}>
          <h2 className={styles.finalH2}>
            Twijfel je over je boete?<br />Check het voordat je betaalt.
          </h2>
          <p className={styles.finalSub}>Gratis. Klaar in 2 minuten. Je zit nergens aan vast.</p>
          <a href="#upload" className="btn-primary" style={{ fontSize: '16px', padding: '16px 32px' }}>
            Upload je beschikking →
          </a>
          <p className={styles.finalMicro}>
            BoeteCheck is geen advocatenkantoor. De check is indicatief, geen juridisch advies.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.footerLogo}>Boete<span>Check</span></div>
          <div className={styles.footerLinks}>
            <a href="#hoe-werkt-het">Hoe werkt het</a>
            <a href="#prijzen">Prijzen</a>
            <a href="#faq">FAQ</a>
            <a href="#">Privacybeleid</a>
            <a href="#">Voorwaarden</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className={`container ${styles.footerDisclaimer}`}>
          BoeteCheck is geen advocatenkantoor. Bij de €49 optie treedt BoeteCheck op als gemachtigde
          namens de klant voor het indienen van bezwaar bij het CJIB. Alle analyses zijn indicatief
          en op basis van geautomatiseerde verwerking. Dit is geen juridisch advies. De officier van
          justitie beslist. Let op: bezwaar moet binnen 6 weken na dagtekening van de beschikking
          zijn ingediend bij het CJIB.
        </div>
      </footer>
    </>
  )
}

function FaqList() {
  const faqs = [
    {
      q: 'Hoe weet ik of bezwaar zin heeft?',
      a: 'We checken je beschikking op 40+ formele eisen. Klopt er iets niet — een verkeerde datum, ontbrekend ijkrapport, onduidelijke meetfoto — dan krijg je dat te zien. Het eindoordeel ligt altijd bij de officier van justitie.',
    },
    {
      q: 'Wat kost het?',
      a: 'De check is altijd gratis. Wil je dat wij het bezwaarschrift schrijven en jij verstuurt, dan is dat €39. Wil je volledig ontzorgd worden — wij dienen ook in — dan is dat €49. Geen abonnementen, geen verrassingen.',
    },
    {
      q: 'Wat is het verschil tussen €39 en €49?',
      a: 'Bij €39 ontvang je een kant-en-klare brief met instructie — jij verstuurt hem zelf naar het CJIB. Bij €49 regelen wij alles: wij dienen het bezwaar digitaal in via het CJIB-portaal. Jij hoeft niets te doen.',
    },
    {
      q: 'Hoe snel moet ik zijn?',
      a: 'Binnen 6 weken na de datum op je beschikking. Daarna is bezwaar niet meer mogelijk. Wij sturen je een herinnering 5 dagen voor de deadline als je je email achterlaat.',
    },
    {
      q: 'Is mijn informatie veilig?',
      a: 'Ja. Upload via SSL naar een Nederlandse server. Automatisch gewist na 30 dagen. We verkopen niets. Je kunt je document altijd eerder verwijderen via de link in je rapport.',
    },
    {
      q: 'Dienen jullie het bezwaar in voor me?',
      a: 'Bij de €49 optie dienen wij het bezwaar digitaal in via het CJIB-portaal — jij hoeft niets te doen. Bij de €39 optie ontvang je een kant-en-klare brief met instructie en verstuur jij zelf.',
    },
    {
      q: 'Garanderen jullie succes?',
      a: 'Nee — en niemand die eerlijk is kan dat. We geven alleen aan of er juridische aanknopingspunten lijken te zijn. Bij afwijzing ben je de kosten kwijt, maar niet meer dan dat.',
    },
    {
      q: 'Waarom niet zelf AI vragen om een bezwaarschrift?',
      a: 'Dat kan. En een deel van de mensen doet dat ook. Maar de meeste mensen willen niet zelf uitzoeken wat ze moeten vragen, wat relevant is in hun situatie, en of het juridisch klopt. Zeker bij iets met een harde deadline en juridische gevolgen. Een losse AI prompt geeft een algemeen antwoord. BoeteCheck geeft een beoordeling van jouw specifieke beschikking — op concrete aanknopingspunten, gefilterd op wat in jouw zaak relevant is, vertaald naar een duidelijke uitkomst. Als iemand precies weet wat hij doet, kan hij het zelf. Maar de meeste mensen willen gewoon weten: moet ik hier iets mee, en zo ja wat? BoeteCheck geeft dat antwoord — snel, concreet, zonder dat je zelf het risico loopt iets te missen.',
    },
    {
      q: 'Voor welke boetes werkt dit?',
      a: 'Verkeersboetes, parkeerboetes en Mulder-feiten. Niet voor strafrecht, belastingdienst of andere sancties buiten het bestuursrecht.',
    },
  ]

  return <FaqAccordion faqs={faqs} />
}
