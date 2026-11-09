import Link from "next/link";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>₦</span>
          <span>pocketwise</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/auth/login">Log in</Link>
          <Link className={styles.navCta} href="/auth/signup">
            Get started
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>A calmer way to manage student life</p>
          <h1>Make every naira feel more intentional.</h1>
          <p className={styles.description}>
            Pocketwise helps you understand your spending, plan monthly budgets,
            and stay in control without the spreadsheet stress.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/auth/signup">
              Start budgeting <span>→</span>
            </Link>
            <Link className={styles.secondaryButton} href="/auth/login">
              I already have an account
            </Link>
          </div>
        </div>
        <div className={styles.visual} aria-label="Pocketwise budget preview">
          <div className={styles.glow} />
          <div className={styles.previewCard}>
            <div className={styles.previewTop}>
              <span>Monthly overview</span>
              <span className={styles.previewDot}>●</span>
            </div>
            <p className={styles.previewBalance}>₦84,500.00</p>
            <span className={styles.previewLabel}>Available balance</span>
            <div className={styles.chart}>
              <i /><i /><i /><i /><i /><i /><i />
            </div>
            <div className={styles.previewRows}>
              <span><b className={styles.mint} /> Food <strong>₦12,400</strong></span>
              <span><b className={styles.coral} /> Transport <strong>₦8,200</strong></span>
            </div>
          </div>
          <span className={styles.floatingBadge}>Small steps add up ✦</span>
        </div>
      </section>

      <section className={styles.features} aria-label="Pocketwise benefits">
        <article><span>01</span><h2>See clearly</h2><p>Know where your money goes each month.</p></article>
        <article><span>02</span><h2>Plan ahead</h2><p>Set category budgets that fit your real life.</p></article>
        <article><span>03</span><h2>Feel confident</h2><p>Make better decisions with less guesswork.</p></article>
      </section>
    </main>
  );
}
