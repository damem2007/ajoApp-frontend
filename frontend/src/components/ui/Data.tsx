"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/providers/toast-provider";
export function JsonView({ value }: { value: unknown }) {
  return <pre>{JSON.stringify(value, null, 2)}</pre>;
}
export function Table({
  heads,
  rows,
}: {
  heads: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="scroll">
      <table>
        <thead>
          <tr>
            {heads.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((v, j) => (
                <td key={j}>{v ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function useResource<T>(
  load: () => Promise<T>,
  dependencies: unknown[] = [],
) {
  const [value, setValue] = useState<T | null>(null),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0),
    { notify } = useToast();
  useEffect(() => {
    let active = true;
    setValue(null);
    setError("");
    load()
      .then((value) => {
        if (active) setValue(value);
      })
      .catch((error) => {
        if (active) {
          setError(error.message);
          notify(error.message, true);
        }
      });
    return () => {
      active = false;
    };
  }, [...dependencies, version]);
  return { value, error, reload: () => setVersion((v) => v + 1) };
}
export function Loading({ error }: { error?: string }) {
  return <p role="status">{error || "Loading…"}</p>;
}
