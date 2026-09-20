"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { useResource, Loading } from "@/components/ui/Data";
import Form from "@/components/ui/Form";
import { useToast } from "@/providers/toast-provider";
type Tier = { score: number; cap: number };
export default function ParticipantConfig({
  onSaved,
}: {
  onSaved: () => void;
}) {
  const { value, error, reload } = useResource(adminApi.participantConfig);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const { notify } = useToast();
  useEffect(() => {
    if (value) setTiers(value.tiers.map((t) => ({ ...t })));
  }, [value]);
  if (!value) return <Loading error={error} />;
  function update(index: number, key: keyof Tier, raw: string) {
    setTiers((rows) =>
      rows.map((row, i) =>
        i === index ? { ...row, [key]: raw === "" ? NaN : Number(raw) } : row,
      ),
    );
  }
  return (
    <section className="panel" aria-label="Circle-participant config">
      <h3>Circle-participant config</h3>
      <p>
        Set the maximum concurrent circle commitments for each trust-score
        threshold. A participant receives the highest cap among the tiers they
        qualify for. Existing commitments are retained; lowered caps prevent
        additional commitments.
      </p>
      {tiers.map((tier, index) => (
        <div className="fields" key={index}>
          <label>
            Minimum trust score — tier {index + 1}
            <input
              type="number"
              min="0"
              step="1"
              value={Number.isNaN(tier.score) ? "" : tier.score}
              onChange={(e) => update(index, "score", e.target.value)}
            />
          </label>
          <label>
            Concurrent circle cap — tier {index + 1}
            <input
              type="number"
              min="1"
              step="1"
              value={Number.isNaN(tier.cap) ? "" : tier.cap}
              onChange={(e) => update(index, "cap", e.target.value)}
            />
          </label>
          <button
            type="button"
            className="secondary"
            disabled={tiers.length <= 1}
            onClick={() =>
              setTiers((rows) => rows.filter((_, i) => i !== index))
            }
          >
            Remove tier {index + 1}
          </button>
        </div>
      ))}
      <button
        type="button"
        className="secondary"
        disabled={tiers.length >= 100}
        onClick={() =>
          setTiers((rows) => [
            ...rows,
            {
              score:
                Math.max(
                  ...rows.map((t) => (Number.isFinite(t.score) ? t.score : 0)),
                ) + 10,
              cap: 1,
            },
          ])
        }
      >
        Add tier
      </button>
      <Form
        fields={[
          {
            name: "reason",
            label: "Participant configuration change reason",
            minLength: 5,
          },
        ]}
        label="Save participant config"
        submit={async (v) => {
          if (
            !tiers.length ||
            tiers.some(
              (t) =>
                !Number.isSafeInteger(t.score) ||
                t.score < 0 ||
                !Number.isSafeInteger(t.cap) ||
                t.cap < 1,
            )
          )
            throw Error(
              "Enter whole, nonnegative scores and positive circle caps.",
            );
          if (!tiers.some((t) => t.score === 0))
            throw Error(
              "Include a score-zero tier so every participant has a limit.",
            );
          if (new Set(tiers.map((t) => t.score)).size !== tiers.length)
            throw Error("Each trust-score threshold must be unique.");
          await adminApi.saveParticipantConfig(tiers, String(v.reason));
          reload();
          onSaved();
          notify("Circle-participant config saved.");
        }}
      />
    </section>
  );
}
