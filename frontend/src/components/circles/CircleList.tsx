"use client";
import Link from "next/link";
import { circlesApi } from "@/lib/api/circles";
import { useResource, Loading } from "@/components/ui/Data";
import { amount } from "@/lib/money";
export default function CircleList() {
  const { value, error } = useResource(circlesApi.list);
  return (
    <>
      <h1>Your circles</h1>
      <p>Your schedule, shared commitments, and progress.</p>
      <Link className="button" href="/app/circles/new">
        Start a circle
      </Link>
      {value ? (
        <div className="grid">
          {value.length ? (
            value.map((c) => (
              <article className="card" key={c.id}>
                <h2>{c.name}</h2>
                <span className="tag">{c.state}</span>
                <div className="amount">
                  {amount(c.config.target_minor, c.config.currency)}
                </div>
                {c.config.contribution_minor && (
                  <p>
                    {amount(c.config.contribution_minor, c.config.currency)} per
                    member per debit
                  </p>
                )}
                <p>
                  {c.count} / {c.config.planned_members} members ·{" "}
                  {c.config.contribution_frequency}
                </p>
                {c.obligation && (
                  <p>
                    Remaining obligation:{" "}
                    {amount(
                      c.obligation.remaining_obligation_minor,
                      c.config.currency,
                    )}
                  </p>
                )}
                <Link href={"/app/circles/" + c.id}>Open circle</Link>
              </article>
            ))
          ) : (
            <p>No circles yet. Start one or browse the marketplace.</p>
          )}
        </div>
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
