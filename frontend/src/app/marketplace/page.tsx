import Marketplace from "@/components/Marketplace";
export default function Page() {
  return (
    <>
      <link rel="stylesheet" href="/assets/landing.css" />
      <link rel="stylesheet" href="/assets/marketplace.css" />
      <header className="public-header">
        <a className="brand" href="/">
          ajo<span>·</span>
        </a>
        <nav aria-label="Public navigation">
          <a href="/marketplace">Find a circle</a>
          <a href="/">How it works</a>
          <a href="/app">Sign in ↗</a>
        </nav>
      </header>
      <main>
        <Marketplace />
      </main>
    </>
  );
}
