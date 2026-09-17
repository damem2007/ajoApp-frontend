export default function Legal({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <>
      <link rel="stylesheet" href="/assets/home.css" />
      <header className="wrap">
        <a className="brand" href="/">
          ajo<span>·</span>
        </a>
      </header>
      <main className="wrap section-inner">
        <h1>{title}</h1>
        <p>Draft information for the sandbox preview.</p>
        {body.split("\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <a href="/">Return home</a>
      </main>
    </>
  );
}
