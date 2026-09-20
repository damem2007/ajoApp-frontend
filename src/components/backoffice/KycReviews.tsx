"use client";
import { useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { useResource, Loading, JsonView } from "@/components/ui/Data";
import Form from "@/components/ui/Form";
import { useToast } from "@/providers/toast-provider";
import type { Json, KycCase } from "@/lib/types";
function Review({ item: k, reload }: { item: KycCase; reload: () => void }) {
  const [evidence, setEvidence] = useState<Awaited<
      ReturnType<typeof adminApi.kycEvidence>
    > | null>(null),
    { run, notify } = useToast();
  return (
    <article className="card">
      <h3>{k.id}</h3>
      <p>{k.status}</p>
      <JsonView value={k.signals} />
      <button
        className="secondary"
        onClick={() =>
          run(async () => setEvidence(await adminApi.kycEvidence(k.id)))
        }
      >
        View evidence
      </button>
      {evidence && (
        <>
          <JsonView value={evidence.identity} />
          {["document_id", "selfie_id"].map((key) => (
            <button
              key={key}
              onClick={() =>
                run(() =>
                  adminApi.document(
                    evidence.identity[key as keyof typeof evidence.identity],
                  ),
                )
              }
            >
              Download {key}
            </button>
          ))}
        </>
      )}
      {["Pending", "UnderReview"].includes(k.status) && (
        <Form
          fields={[
            {
              name: "decision",
              label: "Decision",
              type: "select",
              value: "UnderReview",
              options: [
                "UnderReview",
                "Approved",
                "Rejected",
                "ResubmissionRequired",
              ],
            },
            {
              name: "duplicate_reviewed",
              label: "Duplicate signals reviewed",
              type: "checkbox",
            },
            { name: "reason", label: "Reason", type: "textarea", minLength: 5 },
          ]}
          label="Record decision"
          submit={async (v) => {
            await adminApi.reviewKyc(k.id, v);
            reload();
            notify("Review recorded.");
          }}
        />
      )}
    </article>
  );
}
export default function KycReviews() {
  const { value, error, reload } = useResource(adminApi.kyc);
  return (
    <>
      <h2>Identity reviews</h2>
      {value ? (
        value.map((k) => <Review key={k.id} item={k} reload={reload} />)
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
