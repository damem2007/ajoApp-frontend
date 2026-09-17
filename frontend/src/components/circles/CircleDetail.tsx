"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { circlesApi, contractsApi } from "@/lib/api/circles";
import { complaintsApi } from "@/lib/api/notifications";
import { useResource, JsonView, Loading, Table } from "@/components/ui/Data";
import Form from "@/components/ui/Form";
import { useToast } from "@/providers/toast-provider";
import { useSession } from "@/providers/session-provider";
import { amount } from "@/lib/money";
import CircleWizard from "./CircleWizard";
import type { Agreement, Invitation } from "@/lib/types";
export default function CircleDetail({
  id,
  edit = false,
}: {
  id: string;
  edit?: boolean;
}) {
  const { value, error, reload } = useResource(async () => {
      const circle = await circlesApi.get(id),
        schedule = await circlesApi.schedule(id),
        contract: Agreement | null = circle.contract_id
          ? await contractsApi.get(circle.contract_id)
          : null,
        invitations: Invitation[] =
          circle.state === "Recruiting" ? await circlesApi.invitations(id) : [];
      return { circle, schedule, contract, invitations };
    }, [id]),
    { run, notify } = useToast(),
    { user } = useSession(),
    router = useRouter();
  if (!value) return <Loading error={error} />;
  const { circle: c, schedule, contract, invitations } = value,
    fmt = (n: number) => amount(n, c.config.currency);
  if (edit) return <CircleWizard initial={c.config} id={id} />;
  async function act(action: () => Promise<unknown>) {
    await run(async () => {
      await action();
      reload();
    });
  }
  return (
    <>
      <h1>{c.name}</h1>
      <p>{c.config.description}</p>
      <span className="tag">{c.state}</span>
      <div className="actions">
        <Link href="/app/circles">Back to circles</Link>
        {c.state === "Draft" && (
          <button onClick={() => act(() => circlesApi.publish(id))}>
            Publish circle
          </button>
        )}
        {["Draft", "Recruiting", "Finalizable"].includes(c.state) && (
          <>
            <Link href={"/app/circles/" + id + "/edit"}>Edit rules</Link>
            <button
              className="secondary"
              onClick={() =>
                run(async () => {
                  await circlesApi.leave(id);
                  router.push("/app/circles");
                })
              }
            >
              Leave
            </button>
          </>
        )}
        {c.state === "Recruiting" && (
          <button onClick={() => act(() => circlesApi.closeRecruitment(id))}>
            Close recruitment
          </button>
        )}
        {contract && (
          <button
            onClick={() => run(() => contractsApi.download(c.contract_id!))}
          >
            Download agreement PDF
          </button>
        )}
      </div>
      <details>
        <summary>Circle rules</summary>
        <JsonView value={c.config} />
      </details>
      {c.config.contribution_minor ? (
        <p>
          Fixed contribution: {fmt(c.config.contribution_minor)} per member per
          debit. Derived payout: {fmt(c.config.target_minor)}.
        </p>
      ) : (
        <p>This historical circle uses its original payout-based agreement.</p>
      )}
      <Table
        heads={["Member", "Payout position", "Status"]}
        rows={c.members.map((m) => [
          m.display_name || m.pseudonym,
          m.rank === null ? "Not drawn" : m.rank + 1,
          m.status,
        ])}
      />
      {c.obligation && (
        <Table
          heads={["Contributed", "Collected", "Remaining", "Net position"]}
          rows={[
            [
              fmt(c.obligation.contributed_minor),
              fmt(c.obligation.collected_minor),
              fmt(c.obligation.remaining_obligation_minor),
              fmt(c.obligation.net_position_minor),
            ],
          ]}
        />
      )}{" "}
      {["Draft", "Recruiting", "Finalizable"].includes(c.state) && (
        <details>
          <summary>Cancel this uncontracted circle</summary>
          <Form
            fields={[{ name: "reason", label: "Reason", minLength: 5 }]}
            label="Cancel circle"
            submit={(v) => act(() => circlesApi.cancel(id, v))}
          />
        </details>
      )}
      {c.state === "Recruiting" && (
        <>
          <details>
            <summary>Create an invitation</summary>
            <Form
              fields={[
                {
                  name: "max_uses",
                  label: "Allowed uses",
                  type: "number",
                  value: 1,
                  min: 1,
                },
                {
                  name: "expires_hours",
                  label: "Expires in hours",
                  type: "number",
                  value: 72,
                  min: 1,
                },
                {
                  name: "recipient_email",
                  label: "Recipient email (optional)",
                  type: "email",
                  optional: true,
                },
              ]}
              label="Create invitation"
              submit={async (v) => {
                v.recipient_email = v.recipient_email || null;
                const invitation = await circlesApi.invite(id, v);
                notify(
                  "Circle ID: " + id + " · Invitation code: " + invitation.code,
                );
                reload();
              }}
            />
          </details>
          {invitations.map((i) => (
            <div className="actions" key={i.id}>
              <span>
                {i.uses}/{i.max_uses} uses · {i.revoked ? "Revoked" : "Open"}
              </span>
              {!i.revoked && (
                <button
                  onClick={() => act(() => circlesApi.revokeInvitation(i.id))}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </>
      )}
      {c.state === "Finalizable" && (
        <Form
          fields={
            c.config.payout_order_mode === "random"
              ? []
              : [
                  {
                    name: "order",
                    label: "Payout order: member IDs, separated by commas",
                    value: c.members.map((m) => m.id).join(","),
                  },
                ]
          }
          label="Create agreement"
          submit={(v) =>
            act(() =>
              circlesApi.finalize(
                id,
                c.config.payout_order_mode === "random"
                  ? []
                  : String(v.order)
                      .split(",")
                      .map((s) => s.trim()),
              ),
            )
          }
        />
      )}{" "}
      {contract && (
        <>
          <details>
            <summary>Review current agreement and schedule</summary>
            <JsonView value={contract.content} />
            <p>SHA-256: {contract.hash}</p>
          </details>
          <p>
            {contract.signed_by.length} / {c.count} members have accepted this
            version.
          </p>
          {c.state === "PendingSignatures" &&
            !contract.signed_by.includes(user!.id) && (
              <Form
                fields={[
                  { name: "typed_name", label: "Your full name" },
                  {
                    name: "accepted",
                    label: "I reviewed and accept this agreement",
                    type: "checkbox",
                  },
                ]}
                label="Accept agreement"
                submit={(v) =>
                  act(() =>
                    contractsApi.sign(c.contract_id!, {
                      ...v,
                      contract_hash: contract.hash,
                    }),
                  )
                }
              />
            )}{" "}
          {c.state === "PendingSignatures" && (
            <details>
              <summary>Request a revised agreement</summary>
              <Form
                fields={[
                  {
                    name: "reason",
                    label: "Reason for revision",
                    minLength: 5,
                  },
                ]}
                label="Request revision"
                submit={(v) => act(() => circlesApi.requestRevision(id, v))}
              />
            </details>
          )}
        </>
      )}
      {schedule.length > 0 && (
        <>
          <h2>Payment schedule</h2>
          <Table
            heads={["Date", "Member", "Type", "Amount", "Status"]}
            rows={schedule.map((d) => [
              d.date,
              c.members.find((m) => m.id === d.user_id)?.pseudonym || d.user_id,
              d.kind,
              fmt(d.amount_minor),
              d.status,
            ])}
          />
        </>
      )}
      <details>
        <summary>Report a concern</summary>
        <Form
          fields={[
            {
              name: "target_id",
              label: "Member (optional)",
              type: "select",
              optional: true,
              options: [
                ["", "Whole circle"],
                ...c.members.map((m) => [m.id, m.pseudonym] as const),
              ],
            },
            {
              name: "category",
              label: "Category",
              type: "select",
              options: [
                "non-payment",
                "fraud",
                "harassment",
                "identity-concern",
                "other",
              ],
            },
            {
              name: "description",
              label: "Describe the concern",
              type: "textarea",
              minLength: 10,
            },
          ]}
          label="Submit report"
          submit={async (v) => {
            await complaintsApi.create({
              ...v,
              target_id: v.target_id || null,
              circle_id: id,
            });
            notify("Report submitted. Track it under Reports.");
          }}
        />
      </details>
    </>
  );
}
