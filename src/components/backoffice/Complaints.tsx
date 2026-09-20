"use client";
import { useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { useResource, Loading, JsonView } from "@/components/ui/Data";
import Form from "@/components/ui/Form";
import { useToast } from "@/providers/toast-provider";
import type { Complaint, Json } from "@/lib/types";
function Review({ item: r, reload }: { item: Complaint; reload: () => void }) {
  const [evidence, setEvidence] = useState<Json | null>(null),
    { run, notify } = useToast();
  return (
    <article className="card">
      <h3>
        {r.category} · {r.status}
      </h3>
      <p>{r.description}</p>
      <p>{r.overdue ? "SLA overdue" : "Within SLA"}</p>
      <button
        className="secondary"
        onClick={() =>
          run(async () => setEvidence(await adminApi.evidence(r.id)))
        }
      >
        View evidence
      </button>
      {evidence && <JsonView value={evidence} />}
      <Form
        fields={[
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              "Triaged",
              "UnderInvestigation",
              "ActionTaken",
              "Dismissed",
            ],
          },
          {
            name: "reason",
            label: "Resolution / reason",
            type: "textarea",
            minLength: 5,
          },
          {
            name: "trust_delta",
            label: "Trust penalty (0 or negative)",
            type: "number",
            value: 0,
            max: 0,
          },
        ]}
        label="Record review"
        submit={async (v) => {
          await adminApi.resolve(r.id, v);
          reload();
          notify("Review recorded.");
        }}
      />
    </article>
  );
}
export default function Complaints() {
  const { value, error, reload } = useResource(adminApi.complaints);
  return (
    <>
      <h2>Complaints</h2>
      {value ? (
        value.map((r) => <Review key={r.id} item={r} reload={reload} />)
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
