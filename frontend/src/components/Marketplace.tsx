"use client";
import { useEffect, useState, useRef } from "react";
import { amount, catalogue, Circle } from "@/lib/api";
import { frequencies } from "@/lib/frequencies";
const defaults = {
  currency: "",
  freq: "",
  min: "",
  max: "",
  rounds: "",
  slots: "",
};
export function SlotRing({ circle: c }: { circle: Circle }) {
  return (
    <div className="mp-ringWrap">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        role="img"
        aria-label={`${c.members - c.slots} of ${c.members} slots filled`}
      >
        {Array.from({ length: c.members }, (_, i) => {
          const angle = (i / c.members) * Math.PI * 2 - Math.PI / 2,
            filled = i < c.members - c.slots;
          return (
            <circle
              key={i}
              cx={32 + 26.24 * Math.cos(angle)}
              cy={32 + 26.24 * Math.sin(angle)}
              r={Math.min(4.4, ((Math.PI * 26.24) / c.members) * 0.68)}
              fill={filled ? "var(--ajo-terracotta)" : "var(--ajo-card)"}
              stroke={filled ? "var(--ajo-terracotta)" : "var(--ajo-line)"}
              strokeWidth="1.4"
            />
          );
        })}
      </svg>
      <div className="mp-ringCenter">
        <b>{c.slots}</b>
        <span>open</span>
      </div>
    </div>
  );
}
export default function Marketplace({
  join,
  query: initialQuery = "",
}: {
  join?: (circle: Circle) => Promise<void>;
  query?: string;
}) {
  const [circles, setCircles] = useState<Circle[]>([]),
    [loading, setLoading] = useState(true),
    [failed, setFailed] = useState(false),
    [query, setQuery] = useState(initialQuery),
    [category, setCategory] = useState("All"),
    [sort, setSort] = useState("recommended"),
    [drawer, setDrawer] = useState(false),
    [filters, setFilters] = useState(defaults),
    [draft, setDraft] = useState(defaults),
    [saved, setSaved] = useState<string[]>([]),
    [savedOnly, setSavedOnly] = useState(false),
    [notice, setNotice] = useState(""),
    [preview, setPreview] = useState(false),
    [busy, setBusy] = useState("");
  async function load() {
    setLoading(true);
    setFailed(false);
    try {
      setCircles(await catalogue());
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    try {
      setSaved(JSON.parse(localStorage.getItem("ajoSavedCircles") || "[]"));
    } catch {}
  }, []);
  function toggle(id: string) {
    const next = saved.includes(id)
      ? saved.filter((v) => v !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem("ajoSavedCircles", JSON.stringify(next));
    } catch {
      setNotice(
        "Saved for this visit. Your browser could not save this preference.",
      );
    }
  }
  const list = circles
    .filter(
      (c) =>
        c.slots > 0 &&
        (!savedOnly || saved.includes(c.id)) &&
        (category === "All" || category === c.category) &&
        (!query ||
          [c.name, c.description, c.category]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())) &&
        (!filters.currency || filters.currency === c.currency) &&
        (!filters.freq || filters.freq === c.frequency) &&
        c.target_minor >= Number(filters.min) * 100 &&
        (!filters.max || c.target_minor <= Number(filters.max) * 100) &&
        (!filters.rounds || c.members <= Number(filters.rounds)) &&
        (!filters.slots || c.slots >= Number(filters.slots)),
    )
    .sort((a, b) =>
      sort === "payout-high"
        ? a.currency.localeCompare(b.currency) ||
          b.target_minor - a.target_minor
        : sort === "slots"
          ? b.slots - a.slots
          : sort === "soonest"
            ? (a.next_days ?? Infinity) - (b.next_days ?? Infinity)
            : Number(!!b.featured) - Number(!!a.featured),
    );
  function clear() {
    setFilters(defaults);
    setDraft(defaults);
    setQuery("");
    setCategory("All");
    setSavedOnly(false);
    setDrawer(false);
  }
  const selects = [
    ["currency", "Currency", ["CAD", "NGN", "USD", "GBP"]],
    ["freq", "Contribution frequency", frequencies.map((v) => v.value)],
    ["min", "Minimum payout", ["500", "1000", "2000", "3000", "5000"]],
    ["max", "Maximum payout", ["1000", "2000", "3000", "5000", "10000"]],
    ["rounds", "Maximum rounds", ["4", "6", "8", "10", "12", "20", "50"]],
    ["slots", "Minimum slots open", ["1", "2", "3", "4", "5"]],
  ] as const;
  return (
    <section className="mp-marketplace" aria-label="Public marketplace">
      <div className="mp-head">
        <div className="mp-headText">
          <h1 className="mp-title">Find a circle that fits your plans</h1>
          <p className="mp-subtitle">
            Browse open circles from the Ajo community. Sign in and meet the
            eligibility requirements to join.
          </p>
        </div>
        <span className="mp-headMeta">
          {loading
            ? "Updating…"
            : failed
              ? "Unable to update"
              : "Updated just now"}
        </span>
      </div>
      <div className="mp-searchRow">
        <div className="mp-searchField">
          <span aria-hidden="true">⌕</span>
          <input
            className="mp-searchInput"
            aria-label="Search circles"
            placeholder="Search by goal — travel, tuition, home..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          className="mp-btn mp-btnGhost"
          aria-expanded={drawer}
          onClick={() => setDrawer(!drawer)}
        >
          ☷ Filters
        </button>
      </div>
      <div className="mp-chipRow">
        {["All", "Travel", "Education", "Family", "Community", "Business"].map(
          (v) => (
            <button
              key={v}
              className={"mp-chip " + (v === category ? "mp-chipActive" : "")}
              aria-pressed={v === category}
              onClick={() => setCategory(v)}
            >
              {v}
            </button>
          ),
        )}
      </div>
      {drawer && (
        <form
          className="mp-drawer mp-drawerOpen"
          onKeyDown={(e) => {
            if (e.key === "Escape") setDrawer(false);
          }}
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.max && Number(draft.min) > Number(draft.max)) {
              setNotice("Maximum payout must be at least the minimum payout.");
              return;
            }
            setFilters(draft);
            setDrawer(false);
            setNotice("");
          }}
        >
          <div className="mp-drawerInner">
            <div style={{ display: "contents" }}>
              {selects.map(([key, label, options]) => (
                <label key={key} className="mp-field">
                  {label}
                  <select
                    aria-label={label}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft({ ...draft, [key]: e.target.value })
                    }
                  >
                    <option value="">Any</option>
                    {options.map((v) => (
                      <option key={v} value={v}>
                        {key === "freq"
                          ? frequencies.find((f) => f.value === v)?.label
                          : v}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="mp-drawerActions">
              <button type="button" className="mp-linkBtn" onClick={clear}>
                Clear filters
              </button>
              <button className="mp-btn mp-btnPrimary">Apply filters</button>
            </div>
          </div>
        </form>
      )}
      <div className="mp-resultsMeta">
        <div className="mp-resultsCount">
          <b>{list.length}</b> circles open
        </div>
        {saved.length > 0 && (
          <button
            className="mp-savedToggle"
            aria-pressed={savedOnly}
            onClick={() => setSavedOnly(!savedOnly)}
          >
            Saved circles
          </button>
        )}
        <label className="mp-sortRow">
          Sort by
          <select
            aria-label="Sort circles"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {[
              ["recommended", "Recommended"],
              ["payout-high", "Highest payout"],
              ["slots", "Most slots open"],
              ["soonest", "Payout soonest"],
            ].map(([v, l]) => (
              <option value={v} key={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>
      {notice && (
        <div role="alert" className="toast error">
          <p>{notice}</p>
          <button onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}
      <div className="mp-grid" aria-busy={loading}>
        {loading ? (
          <p>Loading open circles…</p>
        ) : failed ? (
          <div className="mp-empty">
            <h3>We couldn’t load circles</h3>
            <button onClick={load}>Try again</button>
          </div>
        ) : !list.length ? (
          <div className="mp-empty">
            <h3>
              {circles.length
                ? "No circles match those filters"
                : "Your next circle starts here"}
            </h3>
            <button onClick={clear}>Clear all filters</button>
            <a href="/app?view=register">Create a circle</a>
          </div>
        ) : (
          list.map((c) => (
            <article className="mp-card" key={c.id}>
              <div className="mp-cardTop">
                <span className="mp-tag">{c.category}</span>
                <button
                  className={
                    "mp-favBtn " +
                    (saved.includes(c.id) ? "mp-favBtnSaved" : "")
                  }
                  aria-pressed={saved.includes(c.id)}
                  aria-label={
                    saved.includes(c.id)
                      ? "Remove " + c.name + " from saved circles"
                      : "Save " + c.name
                  }
                  onClick={() => toggle(c.id)}
                >
                  ♡
                </button>
              </div>
              <div className="mp-cardMid">
                <SlotRing circle={c} />
                <div>
                  <h3 className="mp-cardTitle">{c.name}</h3>
                  <p className="mp-cardSub">
                    {c.members - c.slots} of {c.members} slots filled
                  </p>
                </div>
              </div>
              <div className="mp-payoutRow">
                <span className="mp-payoutAmount">
                  {amount(c.target_minor, c.currency)}
                </span>
                <span className="mp-payoutLabel">payout per member</span>
              </div>
              <div className="mp-cardStats">
                {[
                  [
                    "Frequency",
                    frequencies.find((v) => v.value === c.frequency)?.label ||
                      c.frequency,
                  ],
                  ["Rounds", c.members],
                  [
                    "Next payout",
                    c.next_days === undefined ? "Pending" : c.next_days + "d",
                  ],
                  ["Slots left", c.slots],
                ].map(([l, v]) => (
                  <div key={l}>
                    <span className="mp-statLabel">{l}</span>
                    <span className="mp-statValue">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mp-cardFoot">
                <div className="mp-trust">
                  ♧ {c.trust_label || "Trust score: " + c.trust_threshold + "+"}
                </div>
                {c.illustrative ? (
                  <button
                    className="mp-btn mp-btnPrimary mp-cardCta"
                    onClick={() => setPreview(true)}
                  >
                    Check eligibility
                  </button>
                ) : join ? (
                  <button
                    className="mp-btn mp-btnPrimary mp-cardCta"
                    disabled={busy === c.id}
                    onClick={async () => {
                      setBusy(c.id);
                      try {
                        await join(c);
                      } catch (e) {
                        setNotice(
                          e instanceof Error ? e.message : "Please try again.",
                        );
                      } finally {
                        setBusy("");
                      }
                    }}
                  >
                    Check eligibility
                  </button>
                ) : (
                  <a
                    className="mp-btn mp-btnPrimary mp-cardCta"
                    href={
                      "/app?view=marketplace&q=" + encodeURIComponent(c.name)
                    }
                  >
                    Check eligibility
                  </a>
                )}
              </div>
              {c.slots <= 2 && (
                <p className="mp-urgency">
                  Only {c.slots} spot{c.slots === 1 ? "" : "s"} left
                  {c.illustrative
                    ? " — next round starts in " +
                      c.next_days +
                      " day" +
                      (c.next_days === 1 ? "" : "s")
                    : ""}
                </p>
              )}
            </article>
          ))
        )}
      </div>
      <p className="mp-disclaimer">
        {circles.some((c) => c.illustrative)
          ? "Illustrative circles · UI mockup (examples only)"
          : "Joining requires verified identity and the circle’s eligibility checks."}
      </p>
      {preview && <ExampleDialog close={() => setPreview(false)} />}
    </section>
  );
}

function ExampleDialog({ close }: { close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog ref={dialog} aria-labelledby="example-heading" onCancel={close}>
      <h2 id="example-heading">Explore this example</h2>
      <p>
        This illustrative circle shows how the marketplace works. It is not
        available to join.
      </p>
      <a href="/app?view=register">Create your own circle</a>
      <button autoFocus onClick={close}>
        Close
      </button>
    </dialog>
  );
}
