"use client";
import { useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import Marketplace from "./Marketplace";
import CmsEditor from "./CmsEditor";
import type { Circle } from "@/lib/api";
// The existing domain controllers keep their API contracts while React owns the
// shell and the shared catalogue/CMS. This boundary isolates the staged port.
export default function Workspace() {
  useEffect(() => {
    const roots = new Map<HTMLElement, Root>();
    const globals = window as unknown as {
      mountMarketplace: (
        host: HTMLElement,
        options: { join?: (circle: Circle) => Promise<void>; query?: string },
      ) => unknown;
      contentManager: (host: HTMLElement) => Promise<void>;
    };
    async function script(src: string) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () =>
          reject(Error("Unable to load workspace. Please reload."));
        document.body.append(s);
      });
    }
    async function start() {
      for (const name of [
        "frequencies",
        "marketplace-examples",
        "catalogue",
        "marketplace",
      ])
        await script("/assets/" + name + ".js");
      globals.mountMarketplace = (host, options) => {
        const r = createRoot(host);
        roots.set(host, r);
        r.render(<Marketplace join={options.join} query={options.query} />);
        return {
          refresh: () => {
            r.render(
              <Marketplace
                key={Date.now()}
                join={options.join}
                query={options.query}
              />,
            );
          },
        };
      };
      globals.contentManager = async (host) => {
        roots.get(host)?.unmount();
        const r = createRoot(host);
        roots.set(host, r);
        r.render(<CmsEditor />);
      };
      for (const name of [
        "core",
        "auth",
        "circles",
        "account",
        "notifications",
        "backoffice",
        "bootstrap",
      ])
        await script("/assets/workspace/" + name + ".js");
    }
    start().catch((e) => {
      const box = document.getElementById("message");
      if (box) {
        box.hidden = false;
        box.textContent = e.message;
      }
    });
    const observer = new MutationObserver(() => {
      for (const [host, r] of roots)
        if (!host.isConnected) {
          roots.delete(host);
          setTimeout(() => r.unmount(), 0);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      for (const r of roots.values()) setTimeout(() => r.unmount(), 0);
    };
  }, []);
  return (
    <>
      <link rel="stylesheet" href="/assets/platform.css" />
      <link rel="stylesheet" href="/assets/marketplace.css" />
      <header>
        <a className="brand" href="/">
          ajo<span>·</span>
        </a>
        <span id="mode">Contribution circles</span>
        <div className="header-tools">
          <div id="profile" />
          <div id="notification-tools" />
        </div>
      </header>
      <div className="shell">
        <nav id="navigation" aria-label="Main navigation" />
        <main>
          <div id="message" role="status" aria-live="polite" hidden />
          <section id="workspace">
            <h1>
              Save together.
              <br />
              Take your next step.
            </h1>
            <p>
              Create a circle, agree on a schedule, and take turns receiving
              your goal amount.
            </p>
          </section>
        </main>
      </div>
      <footer>Ajo · Contributions and obligations, clearly recorded.</footer>
    </>
  );
}
