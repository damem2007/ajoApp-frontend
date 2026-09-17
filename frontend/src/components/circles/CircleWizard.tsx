"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Form, { Field } from "@/components/ui/Form";
import { frequencies } from "@/lib/frequencies";
import { amount } from "@/lib/money";
import type { PlanPreview } from "@/lib/api/circles";
import { circlesApi } from "@/lib/api/circles";
import type { CircleConfig, FormValues } from "@/lib/types";
import { Table } from "@/components/ui/Data";
export default function CircleWizard({
  initial,
  id,
}: {
  initial?: CircleConfig;
  id?: string;
}) {
  const [preview, setPreview] = useState<PlanPreview | null>(null);
  const [step, setStep] = useState(0),
    [values, setValues] = useState<FormValues>({
      category: initial?.category || "Community",
      name: initial?.name || "",
      description: initial?.description || "",
      currency: initial?.currency || "CAD",
      contribution:
        (initial?.contribution_minor ||
          Math.round(
            (initial?.target_minor || 120000) / (initial?.planned_members || 6),
          )) / 100,
      members: initial?.planned_members || 6,
      frequency: initial?.contribution_frequency || "monthly",
      collection: initial?.collection_frequency || "monthly",
      start: initial?.start_date || new Date().toISOString().slice(0, 10),
      privacy: initial?.privacy || "public",
      order: initial?.payout_order_mode || "manual",
      invite: initial?.invite_permission || "any-member",
      trust: initial?.trust_threshold || 0,
      premium: initial?.premium || false,
      hidden: initial?.identities_hidden ?? true,
    }),
    router = useRouter();
  const names = ["Your goal", "People & rhythm", "Circle rules", "Review"];
  const options = frequencies.map((f) => [f.value, f.label] as const);
  const fields: Field[][] = [
    [
      {
        name: "category",
        label: "What is your circle for?",
        type: "select",
        value: String(values.category),
        options: ["Travel", "Education", "Family", "Community", "Business"],
      },
      {
        name: "name",
        label: "Give your circle a name",
        value: String(values.name),
        minLength: 3,
      },
      {
        name: "description",
        label: "What are you planning? (optional)",
        type: "textarea",
        value: String(values.description),
        optional: true,
      },
      {
        name: "currency",
        label: "Currency",
        type: "select",
        value: String(values.currency),
        options: ["CAD", "NGN", "USD", "GBP"],
      },
      {
        name: "contribution",
        label: "Each member contributes per debit",
        type: "number",
        value: Number(values.contribution),
        min: 0.01,
        step: "0.01",
      },
    ],
    [
      {
        name: "members",
        label: "Number of people (including you)",
        type: "number",
        value: Number(values.members),
        min: 2,
        max: 50,
      },
      {
        name: "frequency",
        label: "How often will everyone contribute?",
        type: "select",
        value: String(values.frequency),
        options,
      },
      {
        name: "collection",
        label: "How often will someone receive a payout?",
        type: "select",
        value: String(values.collection),
        options,
      },
      {
        name: "start",
        label: "First contribution date (UTC)",
        type: "date",
        value: String(values.start),
      },
    ],
    [
      {
        name: "privacy",
        label: "Who can discover this circle?",
        type: "select",
        value: String(values.privacy),
        options: [
          ["public", "Public marketplace"],
          ["private", "Invitation only"],
        ],
      },
      {
        name: "order",
        label: "How will payout order be decided?",
        type: "select",
        value: String(values.order),
        options: [
          ["manual", "Agree the order together"],
          ["random", "Draw a random order"],
        ],
      },
      {
        name: "invite",
        label: "Who can invite members?",
        type: "select",
        value: String(values.invite),
        options: [
          ["any-member", "Every member"],
          ["creator-only", "Circle creator"],
        ],
      },
      {
        name: "trust",
        label: "Minimum trust score",
        type: "number",
        value: Number(values.trust),
        min: 0,
      },
      {
        name: "premium",
        label: "Join via direct link only (public circles)",
        type: "checkbox",
        value: !!values.premium,
      },
      {
        name: "hidden",
        label: "Keep legal identities hidden from members",
        type: "checkbox",
        value: !!values.hidden,
      },
    ],
  ];
  function bodyFor(v: FormValues) {
    return {
      name: v.name,
      description: v.description,
      category: v.category,
      currency: v.currency,
      contribution_minor: Math.round(Number(v.contribution) * 100),
      minimum_members: v.members,
      planned_members: v.members,
      hard_cap: v.members,
      strict_minimum: true,
      allow_overflow: false,
      overflow_strategy: null,
      contribution_frequency: v.frequency,
      collection_frequency: v.collection,
      start_date: v.start,
      privacy: v.privacy,
      payout_order_mode: v.order,
      invite_permission: v.invite,
      trust_threshold: v.trust,
      premium: v.premium,
      identities_hidden: v.hidden,
    };
  }
  const matching = values.frequency === values.collection,
    contribution = Math.round(Number(values.contribution) * 100);
  return (
    <section className="wizard">
      <h1>{id ? "Edit circle rules" : "Start a circle"}</h1>
      <ol className="wizard-progress">
        {names.map((name, i) => (
          <li
            key={name}
            className={i === step ? "current" : ""}
            aria-current={i === step ? "step" : undefined}
          >
            {i + 1}. {name}
          </li>
        ))}
      </ol>
      <h2>{names[step]}</h2>
      <p>
        The contribution amount is fixed per member. Payouts are derived from
        the full cycle schedule.
      </p>
      {step < 3 ? (
        <Form
          key={step}
          fields={fields[step]}
          label="Continue"
          submit={async (next) => {
            if (
              step === 0 &&
              Math.abs(
                Number(next.contribution) * 100 -
                  Math.round(Number(next.contribution) * 100),
              ) > 0.00001
            )
              throw Error(
                "Enter a contribution with up to two decimal places.",
              );
            if (step === 1 && !Number.isInteger(Number(next.members)))
              throw Error("Choose a whole number of members.");
            if (step === 2 && next.premium && next.privacy === "private")
              throw Error("Direct-link-only is a public-circle option.");
            const merged = { ...values, ...next };
            if (step === 2)
              setPreview(await circlesApi.preview(bodyFor(merged)));
            setValues(merged);
            setStep(step + 1);
          }}
        />
      ) : (
        <>
          <Table
            heads={["Plan", "Your choice"]}
            rows={[
              ["Circle", String(values.name)],
              [
                "Contribution per member per debit",
                amount(contribution, String(values.currency)),
              ],
              ["People", String(values.members) + " · fixed maximum"],
              [
                "Payout per member",
                matching
                  ? amount(
                      contribution * Number(values.members),
                      String(values.currency),
                    )
                  : amount(preview?.target_minor || 0, String(values.currency)),
              ],
              [
                "Contributions / payouts",
                String(values.frequency) + " / " + String(values.collection),
              ],
              ["First date", String(values.start) + " UTC"],
            ]}
          />
          <p>
            An early payout does not end a member’s remaining contributions.
            Mixed-frequency dates must provide sufficient funding for each
            payout.
          </p>
          <Form
            fields={[]}
            label="Save draft circle"
            submit={async () => {
              const body = bodyFor(values);
              if (id) {
                await circlesApi.edit(id, body);
                router.push("/app/circles/" + id);
              } else {
                const circle = await circlesApi.create(body);
                router.push("/app/circles/" + circle.id);
              }
            }}
          />
        </>
      )}
      {step > 0 && (
        <button className="secondary" onClick={() => setStep(step - 1)}>
          Back
        </button>
      )}
    </section>
  );
}
