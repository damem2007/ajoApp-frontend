"use client";
import { useState, useEffect } from "react";
import { amount, catalogue, Circle } from "@/lib/api";
import { frequencies } from "@/lib/frequencies";
export default function Home({ content: c }: { content: any }) {
  const [contribution, setContribution] = useState(200),
    [members, setMembers] = useState(6),
    [turn, setTurn] = useState(3),
    [currency, setCurrency] = useState("CAD"),
    [frequency, setFrequency] = useState("monthly"),
    [circles, setCircles] = useState<Circle[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    catalogue()
      .then(setCircles)
      .catch(() =>
        setError(
          "We couldn’t load circles. Please visit the marketplace to try again.",
        ),
      );
  }, []);
  const pot = contribution * members * 100,
    ordinal = (n: number) =>
      n +
      (n % 100 >= 11 && n % 100 <= 13
        ? "th"
        : { 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th");
  const label = (name: string) => c.calculator[name];
  return (
    <>
      <link rel="stylesheet" href="/assets/home.css" />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <div className="wrap nav-wrap">
          <a className="brand" href="/" aria-label="Ajo home">
            ajo<span>·</span>
          </a>
          <nav aria-label="Public navigation">
            <a href="#how">{c.nav.how}</a>
            <a href="#safeguards">{c.nav.safeguards}</a>
            <a href="/marketplace">{c.nav.circles}</a>
            <a className="button outline small" href="/app">
              {c.nav.signin}
            </a>
          </nav>
        </div>
      </header>
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <h1>
              <span>{c.hero.lines[0]}</span>
              <span>{c.hero.lines[1]}</span>
              <em>{c.hero.lines[2]}</em>
            </h1>
            <p>{c.hero.body}</p>
            <div className="actions">
              <a className="button" href="/marketplace">
                {c.hero.primary}
              </a>
              <a className="button outline" href="#how">
                {c.hero.secondary}
              </a>
            </div>
            <p className="notice">{c.hero.notice}</p>
          </div>
          <aside className="calculator" aria-labelledby="calculator-title">
            <h2 id="calculator-title">{label("title")}</h2>
            <p className="subtitle">{label("subtitle")}</p>
            <div className="circle-visual">
              <svg
                id="calculator-ring"
                viewBox="0 0 360 280"
                aria-hidden="true"
              >
                <circle
                  cx="180"
                  cy="140"
                  r="108"
                  fill="none"
                  stroke="var(--ajo-line)"
                  strokeWidth="1.8"
                />
                {Array.from({ length: members }, (_, i) => {
                  const a = (i / members) * 2 * Math.PI - Math.PI / 2,
                    x = 180 + 108 * Math.cos(a),
                    y = 140 + 108 * Math.sin(a);
                  return (
                    <g key={i}>
                      {i === turn - 1 && (
                        <circle
                          cx={x}
                          cy={y}
                          r="22"
                          fill="none"
                          stroke="var(--ajo-terracotta)"
                          opacity=".4"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={i === turn - 1 ? 16 : 11}
                        fill={
                          i < turn - 1
                            ? "var(--ajo-ink)"
                            : i === turn - 1
                              ? "var(--ajo-terracotta)"
                              : "white"
                        }
                        stroke={i < turn ? "none" : "var(--ajo-line)"}
                        strokeWidth="2"
                      />
                    </g>
                  );
                })}
              </svg>
              <div className="circle-center" aria-live="polite">
                <strong id="payout">{amount(pot, currency)}</strong>
                <span>{label("pot")}</span>
                <b id="turn-summary">
                  on your turn — round {turn} of {members}
                </b>
              </div>
            </div>
            <div className="sliders">
              <label htmlFor="amount">
                {label("contribution")}
                <output id="amount-label">
                  {amount(contribution * 100, currency)}
                </output>
              </label>
              <input
                id="amount"
                type="range"
                min="25"
                max="1000"
                step="25"
                value={contribution}
                onChange={(e) => setContribution(Number(e.target.value))}
              />
              <label htmlFor="members">
                {label("members")}
                <output id="members-label">{members}</output>
              </label>
              <input
                id="members"
                type="range"
                min="2"
                max="12"
                value={members}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setMembers(value);
                  setTurn(Math.min(turn, value));
                }}
              />
              <label htmlFor="turn">
                {label("turn")}
                <output id="turn-label">{ordinal(turn)}</output>
              </label>
              <input
                id="turn"
                type="range"
                min="1"
                max={members}
                value={turn}
                onChange={(e) => setTurn(Number(e.target.value))}
              />
            </div>
            <div className="calculator-total">
              <span>{label("total")}</span>
              <strong id="total">{amount(pot, currency)}</strong>
            </div>
            <details className="calculator-more">
              <summary>Frequency, currency &amp; remaining commitment</summary>
              <div className="pair">
                <div>
                  <label htmlFor="frequency">{label("frequency")}</label>
                  <select
                    id="frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    {frequencies.map((f) => (
                      <option value={f.value} key={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="currency">{label("currency")}</label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {["CAD", "USD", "NGN", "GBP"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p id="remaining-summary">
                Contributed by your turn:{" "}
                {amount(contribution * turn * 100, currency)} · Still to
                contribute after payout:{" "}
                {amount(contribution * (members - turn) * 100, currency)}
              </p>
              <p className="note">{label("note")}</p>
            </details>
          </aside>
        </section>
        <section className="how" id="how">
          <div className="wrap section-inner">
            <h2>{c.how.title}</h2>
            <p className="section-lead">{c.how.body}</p>
            <div className="steps">
              {c.how.steps.map((s: any, i: number) => (
                <article key={i}>
                  <span className="step-number">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="safeguards wrap" id="safeguards">
          <div>
            <h2>{c.safeguards.title}</h2>
            <p className="section-lead">{c.safeguards.body}</p>
          </div>
          <div className="guard-list">
            {c.safeguards.items.map((s: any, i: number) => (
              <article key={i}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    d={
                      [
                        "M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Z",
                        "M4 5h16v16H4zM4 9h16M8 2v6M16 2v6",
                        "M6 2h9l5 5v15H6zM14 2v6h6M9 12h7M9 16h5",
                        "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M12 7v6M12 16v1",
                      ][i % 4]
                    }
                  />
                </svg>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="circles">
          <div className="wrap section-inner">
            <div className="circles-heading">
              <div>
                <h2>{c.circles.title}</h2>
                <p>{c.circles.body}</p>
              </div>
              <a className="button" href="/marketplace">
                {c.circles.cta}
              </a>
            </div>
            <div
              id="featured-circles"
              className="featured-grid"
              aria-live="polite"
            >
              {circles.slice(0, 3).map((s) => (
                <a className="featured-card" href="/marketplace" key={s.id}>
                  <div className="featured-top">
                    <span className="featured-tag">{s.category}</span>
                    <span>
                      {s.members - s.slots} of {s.members} filled
                    </span>
                  </div>
                  <h3>{s.name}</h3>
                  <div className="featured-amount">
                    <strong>{amount(s.target_minor, s.currency)}</strong>
                    <small>per member</small>
                  </div>
                  <div
                    className="featured-dots"
                    aria-label={`${s.members - s.slots} of ${s.members} filled`}
                  >
                    {Array.from({ length: s.members }, (_, i) => (
                      <span
                        key={i}
                        className={
                          "featured-dot " +
                          (i < s.members - s.slots ? "filled" : "")
                        }
                      />
                    ))}
                  </div>
                  <div className="featured-bottom">
                    <span>
                      {frequencies.find((f) => f.value === s.frequency)?.label}
                    </span>
                    <span>
                      <b>{s.members}</b> rounds
                    </span>
                  </div>
                </a>
              ))}
            </div>
            {error ? (
              <p role="status">{error}</p>
            ) : !circles.length ? (
              <p>{c.circles.empty}</p>
            ) : null}
            <p id="circle-disclaimer" className="note">
              {circles.some((s) => s.illustrative) ? c.circles.examples : ""}
            </p>
          </div>
        </section>
        <section className="faq wrap">
          <h2>{c.faq.title}</h2>
          <div className="faq-list">
            {c.faq.items.map((f: any, i: number) => (
              <details key={i} open={i === 0}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing">
          <div className="wrap">
            <h2>{c.closing.title}</h2>
            <p>{c.closing.body}</p>
            <div className="actions">
              <a className="button terracotta" href="/app?view=register">
                {c.closing.primary}
              </a>
              <a className="button transparent" href="/marketplace">
                {c.closing.secondary}
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="wrap">
        <div>
          <a className="brand" href="/">
            ajo<span>·</span>
          </a>
          <span>{c.footer.tagline}</span>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#how">{c.footer.how}</a>
          <a href="/marketplace">{c.footer.circles}</a>
          <a href="/terms">{c.footer.terms}</a>
          <a href="/privacy">{c.footer.privacy}</a>
        </nav>
      </footer>
    </>
  );
}
