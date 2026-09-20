"use client";
import Form, { type Field } from "@/components/ui/Form";
import { useResource, Loading } from "@/components/ui/Data";
import { adminApi } from "@/lib/api/admin";
import { circlesApi } from "@/lib/api/circles";
import { frequencies } from "@/lib/frequencies";
import { useToast } from "@/providers/toast-provider";
export default function SystemSetup() {
  const state = useResource(circlesApi.setup);
  const policies = useResource(adminApi.policies);
  const { notify } = useToast();
  if (!state.value || !policies.value)
    return <Loading error={state.error || policies.error} />;
  const setup = state.value;
  const fields: Field[] = [
    ...(
      [
        "name_min_length",
        "name_max_length",
        "amount_max_minor",
        "members_min",
        "members_max",
      ] as const
    ).map((name) => ({
      name,
      label: name.replaceAll("_", " "),
      type: "number" as const,
      value: setup[name],
      min: name.startsWith("members") ? 2 : 1,
    })),
    {
      name: "currencies",
      label: "Enabled currencies (comma separated)",
      value: setup.currencies.join(", "),
    },
    {
      name: "default_currency",
      label: "Default currency",
      value: setup.default_currency,
    },
    {
      name: "default_contribution_frequency",
      label: "Default contribution frequency",
      type: "select",
      value: setup.default_contribution_frequency,
      options: frequencies.map((f) => [f.value, f.label] as const),
    },
    {
      name: "default_collection_frequency",
      label: "Default payout frequency",
      type: "select",
      value: setup.default_collection_frequency,
      options: frequencies.map((f) => [f.value, f.label] as const),
    },
    ...frequencies.flatMap((f) => [
      {
        name: "contribution_" + f.value,
        label: "Allow contributions: " + f.label,
        type: "checkbox" as const,
        value: setup.contribution_frequencies.includes(f.value),
      },
      {
        name: "collection_" + f.value,
        label: "Allow payouts: " + f.label,
        type: "checkbox" as const,
        value: setup.collection_frequencies.includes(f.value),
      },
    ]),
    { name: "reason", label: "Change reason", minLength: 5 },
  ];
  return (
    <section>
      <h3>Circle configuration</h3>
      <p>
        Changes apply to new circles and edited drafts. Membership cannot exceed
        the cycle’s agreed capacity.
      </p>
      <Form
        key={policies.value.at(-1)?.id}
        fields={fields}
        label="Save system setup"
        submit={async (v) => {
          const latest = (await adminApi.policies()).at(-1);
          if (
            !latest ||
            !latest.data ||
            typeof latest.data !== "object" ||
            Array.isArray(latest.data)
          )
            throw Error("Policy unavailable");
          const circle_setup = { ...setup };
          for (const key of [
            "name_min_length",
            "name_max_length",
            "amount_max_minor",
            "members_min",
            "members_max",
          ] as const)
            circle_setup[key] = Number(v[key]);
          circle_setup.default_currency = String(
            v.default_currency,
          ).toUpperCase();
          circle_setup.default_contribution_frequency = String(
            v.default_contribution_frequency,
          );
          circle_setup.default_collection_frequency = String(
            v.default_collection_frequency,
          );
          circle_setup.contribution_frequencies = frequencies
            .filter((f) => v["contribution_" + f.value])
            .map((f) => f.value);
          circle_setup.collection_frequencies = frequencies
            .filter((f) => v["collection_" + f.value])
            .map((f) => f.value);
          const { currencies: unused, ...configuration } = circle_setup;
          await adminApi.policy(
            {
              ...latest.data,
              currencies: String(v.currencies)
                .split(",")
                .map((c) => c.trim().toUpperCase())
                .filter(Boolean),
              circle_setup: configuration,
            },
            String(v.reason),
          );
          state.reload();
          policies.reload();
          notify("System setup saved.");
        }}
      />
    </section>
  );
}
