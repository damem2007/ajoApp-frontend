"use client";
import { adminApi } from "@/lib/api/admin";
import { useResource, Loading } from "@/components/ui/Data";
import Form from "@/components/ui/Form";
import { useToast } from "@/providers/toast-provider";
export default function Payments() {
  const { value, error, reload } = useResource(adminApi.payments),
    { notify } = useToast();
  return (
    <>
      <h2>Payments</h2>
      {value ? (
        value.map((d) => (
          <article className="card" key={d.id}>
            <h3>
              {d.kind} · {d.status}
            </h3>
            <p>
              {d.id} · {d.date} · {d.amount_minor} minor units
            </p>
            {d.status === "Failed" && (
              <Form
                fields={[
                  { name: "reason", label: "Retry reason", minLength: 5 },
                ]}
                label="Schedule retry"
                submit={async (v) => {
                  await adminApi.retry(d.id, v);
                  reload();
                  notify("Retry scheduled.");
                }}
              />
            )}
            {["Pending", "Settled"].includes(d.status) && (
              <Form
                fields={[
                  {
                    name: "status",
                    label: "Reconciliation result",
                    type: "select",
                    options:
                      d.status === "Settled"
                        ? ["Reversed"]
                        : ["Settled", "Failed"],
                  },
                  { name: "event_id", label: "Unique evidence reference" },
                  {
                    name: "reason",
                    label: "Evidence / reason",
                    type: "textarea",
                    minLength: 5,
                  },
                ]}
                label="Reconcile sandbox payment"
                submit={async (v) => {
                  await adminApi.reconcile(d.id, v);
                  reload();
                  notify("Reconciliation recorded.");
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
