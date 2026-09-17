"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
type Value = string | Value[] | { [key: string]: Value };
const friendly = (key: string) =>
  ({
    meta: "Page title & search description",
    nav: "Navigation",
    hero: "Hero & calls to action",
    calculator: "Calculator labels",
    how: "How it works",
    safeguards: "Safeguards",
    circles: "Circle previews",
    faq: "Questions & answers",
    closing: "Closing call to action",
    footer: "Footer",
    legal: "Terms & privacy drafts",
  })[key] || key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
function Field({
  value,
  path,
  change,
}: {
  value: Value;
  path: string;
  change: (v: Value) => void;
}) {
  if (Array.isArray(value))
    return (
      <>
        {value.map((item, i) => (
          <div className="cms-item" key={i}>
            <h3>
              {path === "hero.lines" ? "Line" : "Item"} {i + 1}
            </h3>
            <Field
              value={item}
              path={path + "." + i}
              change={(v) => change(value.map((s, j) => (j === i ? v : s)))}
            />
            {path !== "hero.lines" && value.length > 1 && (
              <button
                className="secondary"
                onClick={() => change(value.filter((_, j) => i !== j))}
              >
                Remove item
              </button>
            )}
          </div>
        ))}
        {path !== "hero.lines" && value.length < 20 && (
          <button
            className="secondary"
            onClick={() => change([...value, structuredClone(value[0])])}
          >
            Add item
          </button>
        )}
      </>
    );
  if (typeof value === "object")
    return (
      <>
        {Object.entries(value).map(([key, item]) => (
          <div className="cms-field" key={key}>
            {typeof item !== "string" && <h3>{friendly(key)}</h3>}
            <Field
              value={item}
              path={path + "." + key}
              change={(v) => change({ ...value, [key]: v })}
            />
          </div>
        ))}
      </>
    );
  const key = path.split(".").at(-1)!,
    id = "cms-" + path.replaceAll(".", "-"),
    props = {
      id,
      value,
      maxLength: 5000,
      required: true,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => change(e.target.value),
    };
  return (
    <>
      <label htmlFor={id}>{/^\d+$/.test(key) ? "Text" : friendly(key)}</label>
      {[
        "body",
        "answer",
        "description",
        "note",
        "notice",
        "terms_body",
        "privacy_body",
      ].includes(key) ? (
        <textarea {...props} />
      ) : (
        <input {...props} />
      )}
    </>
  );
}
export default function CmsEditor() {
  const [state, setState] = useState<any>(null),
    [working, setWorking] = useState<{ [key: string]: Value }>({}),
    [history, setHistory] = useState<any[]>([]),
    [role, setRole] = useState(""),
    [dirty, setDirty] = useState(false),
    [reason, setReason] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  async function adopt(next: any) {
    setState(next);
    setWorking(structuredClone(next.draft.content));
    setDirty(false);
    setHistory(await api("/admin/content/home/revisions"));
  }
  useEffect(() => {
    Promise.all([api("/me"), api("/admin/content/home")])
      .then(async ([me, next]) => {
        setRole(me.role);
        await adopt(next);
      })
      .catch((e) => setNotice(e.message));
  }, []);
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  function note() {
    if (reason.trim().length < 3)
      throw Error("Add a change note of at least three characters.");
  }
  async function preview() {
    const popup = window.open("about:blank", "ajo-content-preview");
    if (!popup) {
      setNotice("Allow this site to open a preview window.");
      return;
    }
    try {
      const session = JSON.parse(
          sessionStorage.getItem("ajoSession") || "null",
        ),
        response = await fetch("/api/v1/admin/content/home/preview", {
          headers: { Authorization: "Bearer " + session?.access_token },
        });
      if (!response.ok)
        throw Error("Please sign in again to preview the draft.");
      const url = URL.createObjectURL(await response.blob());
      popup.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      popup.close();
      setNotice(e instanceof Error ? e.message : "Please try again.");
    }
  }
  return (
    <section>
      <h2>Website content</h2>
      <p className="muted">
        Edit the landing page, preview a saved draft, and publish when it is
        ready. Changes do not affect circle agreements.
      </p>
      {notice && (
        <div role="alert" className="cms-status">
          {notice}
          <button className="secondary" onClick={() => setNotice("")}>
            Dismiss
          </button>
        </div>
      )}
      {state ? (
        <>
          <p className="cms-status">
            {dirty
              ? "You have unsaved changes. Save before previewing or publishing."
              : state.draft.id === state.published.id
                ? "The saved draft is published."
                : "Saved draft ready for preview. The public page still shows its published revision."}
          </p>
          <div className="actions">
            <button
              disabled={busy}
              onClick={() =>
                action(async () => {
                  note();
                  await adopt(
                    await api(
                      "/admin/content/home/draft",
                      {
                        content: working,
                        expected_draft: state.draft.id,
                        reason,
                      },
                      "PUT",
                    ),
                  );
                })
              }
            >
              Save draft
            </button>
            <button className="secondary" disabled={busy} onClick={preview}>
              Preview saved draft
            </button>
            {role === "admin" && (
              <button
                disabled={busy || dirty}
                onClick={() =>
                  action(async () => {
                    note();
                    await adopt(
                      await api("/admin/content/home/publish", {
                        revision_id: state.draft.id,
                        expected_published: state.published.id,
                        reason,
                      }),
                    );
                  })
                }
              >
                Publish saved draft
              </button>
            )}
          </div>
          <div className="cms-fields">
            {Object.entries(working).map(([key, value]) => (
              <details className="cms-group" key={key} open={key === "hero"}>
                <summary>{friendly(key)}</summary>
                <Field
                  value={value}
                  path={key}
                  change={(v) => {
                    setWorking({ ...working, [key]: v });
                    setDirty(true);
                  }}
                />
              </details>
            ))}
          </div>
          <label htmlFor="cms-reason">Change note</label>
          <input
            id="cms-reason"
            value={reason}
            placeholder="Describe what changed"
            onChange={(e) => setReason(e.target.value)}
          />
          <article className="card">
            <h2>Revision history</h2>
            {history.map((r) => (
              <article key={r.id} className="cms-revision">
                <strong>{r.reason}</strong>
                <p>
                  {new Date(r.created_at).toLocaleString()}
                  {r.id === state.published.id ? " · Published" : ""}
                  {r.id === state.draft.id ? " · Current draft" : ""}
                </p>
                {role === "admin" && r.id !== state.published.id && (
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() =>
                      action(async () => {
                        note();
                        await adopt(
                          await api("/admin/content/home/restore", {
                            revision_id: r.id,
                            expected_published: state.published.id,
                            reason,
                          }),
                        );
                      })
                    }
                  >
                    Restore and publish this revision
                  </button>
                )}
              </article>
            ))}
          </article>
        </>
      ) : (
        <p>Loading website content…</p>
      )}
    </section>
  );
}
