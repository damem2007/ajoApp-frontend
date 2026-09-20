"use client";
import { useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { useResource, Loading, JsonView, Table } from "@/components/ui/Data";
import Form from "@/components/ui/Form";
import { useToast } from "@/providers/toast-provider";
import ParticipantConfig from "./ParticipantConfig";
import ChannelSetup from "./ChannelSetup";
import SystemSetup from "./SystemSetup";
import type { Json } from "@/lib/types";
export function Overview() {
  const { value, error } = useResource(adminApi.metrics);
  return (
    <>
      <h2>Overview</h2>
      {value ? (
        <div className="grid">
          {Object.entries(value).map(([key, v]) => (
            <article className="card" key={key}>
              <h3>{key.replaceAll("_", " ")}</h3>
              <div className="metric">
                {typeof v === "object" ? JSON.stringify(v) : String(v)}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
export function Policies() {
  const { value, error, reload } = useResource(adminApi.policies),
    { notify } = useToast();
  return (
    <>
      <h2>System setup & policies</h2>
      <SystemSetup />
      <ParticipantConfig onSaved={reload} />
      <ChannelSetup />
      <p>
        Changes create a new policy version. Existing contracts retain their
        frozen rules. Unresolved values remain null.
      </p>
      {value ? (
        <Form
          key={value.at(-1)?.id}
          fields={[
            {
              name: "policy",
              label: "Policy configuration",
              type: "textarea",
              value: JSON.stringify(value.at(-1)?.data, null, 2),
            },
            { name: "reason", label: "Change reason", minLength: 5 },
          ]}
          label="Create policy version"
          submit={async (v) => {
            await adminApi.policy(
              JSON.parse(String(v.policy)),
              String(v.reason),
            );
            reload();
            notify("New policy version saved.");
          }}
        />
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
export function Jobs() {
  const [result, setResult] = useState<Json | null>(null),
    { run } = useToast();
  return (
    <>
      <h2>Jobs</h2>
      <Form
        fields={[
          {
            name: "as_of",
            label: "Process through date (sandbox only)",
            type: "date",
            value: new Date().toISOString().slice(0, 10),
          },
        ]}
        label="Run due jobs"
        submit={async (v) => setResult(await adminApi.jobs(v))}
      />
      <p>Use scheduler_paused in Policies for the emergency stop.</p>
      <button className="secondary" onClick={() => run(adminApi.ledger)}>
        Download ledger CSV
      </button>
      {result && <JsonView value={result} />}
    </>
  );
}
export function Deliveries() {
  const { value, error, reload } = useResource(adminApi.deliveries),
    { notify } = useToast();
  return (
    <>
      <h2>Deliveries</h2>
      {value ? (
        value.map((n) => (
          <article className="card" key={n.id}>
            <h3>{n.title}</h3>
            <p>
              {n.channel} · {n.status} · {n.attempts} attempts
            </p>
            {n.title !== "Verification code" && (
              <Form
                fields={[
                  { name: "reason", label: "Resend reason", minLength: 5 },
                ]}
                label="Resend"
                submit={async (v) => {
                  await adminApi.resend(n.id, v);
                  reload();
                  notify("Notification queued.");
                }}
              />
            )}
          </article>
        ))
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
export function DataRequests() {
  const { value, error, reload } = useResource(adminApi.dataRequests),
    { notify } = useToast();
  return (
    <>
      <h2>Data requests</h2>
      {value ? (
        value.map((r) => (
          <article className="card" key={r.id}>
            <h3>
              {r.kind} · {r.status}
            </h3>
            <Form
              fields={[
                {
                  name: "status",
                  label: "Review outcome",
                  type: "select",
                  options: ["UnderReview", "Retained"],
                },
                {
                  name: "reason",
                  label: "Retention or review reason",
                  type: "textarea",
                  minLength: 5,
                },
              ]}
              label="Record review"
              submit={async (v) => {
                await adminApi.reviewData(r.id, v);
                reload();
                notify("Review recorded.");
              }}
            />
          </article>
        ))
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
export function Audit() {
  const { value, error } = useResource(adminApi.audit);
  return (
    <>
      <h2>Audit</h2>
      {value ? (
        <Table
          heads={["When", "Actor", "Action", "Resource"]}
          rows={value.map((a) => [
            a.created_at,
            a.actor_id,
            a.action,
            a.resource,
          ])}
        />
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
