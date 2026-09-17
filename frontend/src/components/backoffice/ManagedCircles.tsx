"use client";
import { adminApi } from "@/lib/api/admin";
import { useResource, Loading } from "@/components/ui/Data";
import Form from "@/components/ui/Form";
import { useToast } from "@/providers/toast-provider";
export default function ManagedCircles() {
  const { value, error, reload } = useResource(adminApi.circles),
    { notify } = useToast();
  return (
    <>
      <h2>Circles</h2>
      {value ? (
        value.map((c) => (
          <article className="card" key={c.id}>
            <h3>{c.name}</h3>
            <p>{c.state}</p>
            <Form
              fields={[
                {
                  name: "state",
                  label: "New state",
                  type: "select",
                  value: "Suspended",
                  options: ["Suspended", "Disputed", "Cycling", "Cancelled"],
                },
                { name: "reason", label: "Reason", minLength: 5 },
              ]}
              label="Update state"
              submit={async (v) => {
                await adminApi.circleState(c.id, v);
                reload();
                notify("State updated.");
              }}
            />
            <details>
              <summary>Marketplace curation</summary>
              <Form
                fields={[
                  {
                    name: "featured",
                    label: "Featured",
                    type: "checkbox",
                    value: c.featured,
                  },
                  {
                    name: "removed",
                    label: "Remove from marketplace",
                    type: "checkbox",
                    value: c.removed,
                  },
                  {
                    name: "premium",
                    label: "Premium",
                    type: "checkbox",
                    value: c.config.premium,
                  },
                  { name: "reason", label: "Reason", minLength: 5 },
                ]}
                label="Save curation"
                submit={async (v) => {
                  await adminApi.curate(c.id, v);
                  reload();
                  notify("Curation saved.");
                }}
              />
            </details>
          </article>
        ))
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
