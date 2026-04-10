import Nav from '@/components/Nav'
import UploadFlow from '@/components/UploadFlow'
import styles from './page.module.css'

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
                desc: 'Helder rapport: waarschijnlijk / misschien / lage kans. Bij aanknopingspunten helpen we voor €39 — of zelf doen is gratis.',
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
            De check is altijd gratis. Je betaalt alleen als je wil dat wij het bezwaar schrijven.
          </p>
          <div className={styles.pricingGrid}>
            <div className={styles.priceCard}>
              <div className={styles.priceLabel}>De check</div>
              <div className={styles.priceAmount}>€0</div>
              <div className={styles.priceSub}>Altijd gratis. Geen account.</div>
              <ul className={styles.priceList}>
                <li>Analyse op 40+ formele punten</li>
                <li>Helder rapport met uitkomst</li>
                <li>Deadline-herinnering per email</li>
                <li>Gratis stappenplan bij afwijzing</li>
              </ul>
            </div>
            <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
              <div className={styles.priceLabelLight}>Hulp bij bezwaar</div>
              <div className={styles.priceAmountLight}>€39</div>
              <div className={styles.priceSubLight}>Eenmalig. Geen abonnement.</div>
              <ul className={styles.priceListLight}>
                <li>Compleet bezwaarschrift op maat</li>
                <li>Gebaseerd op jouw beschikking</li>
                <li>Instructie hoe je het verstuurt</li>
                <li>Ondersteuning bij vragen</li>
              </ul>
            </div>
          </div>
          <div className={styles.rekensom}>
            <div>
              <strong>Rekensom: boete €120</strong>
              <span> — bezwaar gegrond = €120 terug. Kosten BoeteCheck = €39. Je bespaart €81.</span>
              <span className={styles.rekensomFine}> Bezwaar afgewezen? Dan ben je €39 kwijt.</span>
            </div>
            <div className={styles.rekensomBadge}>Je bespaart €81</div>
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
              { icon: '🚫', title: 'Geen doorverkoop', desc: 'We verkopen geen data. We dienen nooit bezwaar in zonder jouw opdracht.' },
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
          <h2 className={styles.h2}>Alle "ja maar" antwoorden.</h2>
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
          BoeteCheck is geen advocatenkantoor en treedt niet op als gemachtigde, tenzij je apart opdracht
          geeft voor het opstellen van een bezwaarschrift. Alle analyses zijn indicatief en op basis van
          geautomatiseerde verwerking. Dit is geen juridisch advies. De officier van justitie beslist.
          Let op: bezwaar moet binnen 6 weken na dagtekening van de beschikking zijn ingediend bij het CJIB.
        </div>
      </footer>
    </>
  )
}

// FAQ client component inline
function FaqList() {
  const faqs = [
    {
      q: 'Hoe weet ik of bezwaar zin heeft?',
      a: 'We checken je beschikking op 40+ formele eisen. Klopt er iets niet — een verkeerde datum, ontbrekend ijkrapport, onduidelijke meetfoto — dan krijg je dat te zien. Het eindoordeel ligt altijd bij de officier van justitie.',
    },
    {
      q: 'Wat kost het?',
      a: 'De check is altijd gratis. Wil je dat wij je bezwaarschrift schrijven, dan is dat €39 eenmalig. Zelf doen met ons stappenplan is ook gratis. Geen abonnementen, geen verrassingen.',
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
      a: 'Standaard niet. We leveren een kant-en-klare brief plus instructie. Jij verstuurt — dat houdt de kosten laag en jij de controle.',
    },
    {
      q: 'Garanderen jullie succes?',
      a: 'Nee — en niemand die eerlijk is kan dat. We geven alleen aan of er juridische aanknopingspunten lijken te zijn.',
    },
    {
      q: 'Voor welke boetes werkt dit?',
      a: 'Verkeersboetes, parkeerboetes en Mulder-feiten. Niet voor strafrecht, belastingdienst of andere sancties buiten het bestuursrecht.',
    },
  ]

  return <FaqAccordion faqs={faqs} />
}

// We need a client component for the accordion
import FaqAccordion from '@/components/FaqAccordion'
