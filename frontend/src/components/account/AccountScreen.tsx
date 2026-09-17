"use client";
import { runtimeApi } from "@/lib/api/runtime";
import { useState, useEffect } from "react";
import Link from "next/link";
import Form from "@/components/ui/Form";
import { useResource, JsonView, Table, Loading } from "@/components/ui/Data";
import { useSession } from "@/providers/session-provider";
import { useToast } from "@/providers/toast-provider";
import { authApi } from "@/lib/api/auth";
import { accountApi } from "@/lib/api/account";
import type { Json } from "@/lib/types";
import SecuritySettings from "./SecuritySettings";
export default function AccountScreen() {
  const { user, refresh } = useSession(),
    { notify, run } = useToast(),
    [sandbox, setSandbox] = useState(false),
    [inbox, setInbox] = useState<Json | null>(null),
    { value: kyc, error, reload } = useResource(accountApi.kyc),
    { value: banks, reload: reloadBanks } = useResource(
      () =>
        user?.kyc_status === "Approved"
          ? accountApi.banks()
          : Promise.resolve([]),
      [user?.kyc_status],
    );
  useEffect(() => {
    runtimeApi
      .health()
      .then((h) => setSandbox(h.sandbox))
      .catch(() => {});
  }, []);
  if (!user) return <Loading />;
  return (
    <>
      <h1>Your account</h1>
      <p>Complete verification, link a bank, and manage security.</p>
      <Table
        heads={["Email verified", "Phone verified", "KYC", "MFA"]}
        rows={[
          [
            String(user.email_verified),
            String(user.phone_verified),
            user.kyc_status,
            String(user.mfa_enabled),
          ],
        ]}
      />
      {(!user.email_verified || !user.phone_verified) && (
        <>
          <Form
            fields={[
              {
                name: "channel",
                label: "Channel",
                type: "select",
                options: ["email", "sms"],
              },
              { name: "code", label: "Verification code" },
            ]}
            label="Verify"
            submit={async (values) => {
              await authApi.verify(values);
              await refresh();
            }}
          />
          <div className="actions">
            {["email", "sms"].map((channel) => (
              <button
                key={channel}
                onClick={() =>
                  run(() => authApi.resend(channel), "Verification queued")
                }
              >
                Resend {channel}
              </button>
            ))}
            {sandbox && (
              <button
                onClick={() => run(async () => setInbox(await authApi.inbox()))}
              >
                Read sandbox verification inbox
              </button>
            )}
          </div>
          {inbox && <JsonView value={inbox} />}
        </>
      )}
      {user.email_verified &&
        user.phone_verified &&
        ["NotSubmitted", "Rejected", "ResubmissionRequired"].includes(
          user.kyc_status,
        ) && (
          <article className="card">
            <h2>Identity verification</h2>
            <Form
              fields={[
                { name: "identity", label: "Identity document", type: "file" },
                { name: "selfie", label: "Selfie image", type: "file" },
                {
                  name: "id_type",
                  label: "Document type",
                  type: "select",
                  options: ["passport", "national-id", "drivers-license"],
                },
                { name: "id_number", label: "Document number" },
                {
                  name: "country",
                  label: "Issuing country",
                  type: "select",
                  options: ["NG", "CA", "US", "GB"],
                },
                {
                  name: "province",
                  label: "Province (optional)",
                  optional: true,
                },
                { name: "expiry", label: "Expiry date", type: "date" },
                { name: "legal_name", label: "Legal name" },
                { name: "dob", label: "Date of birth", type: "date" },
              ]}
              label="Submit for verification"
              submit={async (values) => {
                if (
                  !(values.identity instanceof File) ||
                  !(values.selfie instanceof File)
                )
                  throw Error("Choose both files.");
                const document = await accountApi.upload(
                    values.identity,
                    "identity",
                  ),
                  selfie = await accountApi.upload(values.selfie, "selfie");
                delete values.identity;
                delete values.selfie;
                const device =
                  sessionStorage.getItem("ajoDevice") || crypto.randomUUID();
                sessionStorage.setItem("ajoDevice", device);
                await accountApi.submitKyc({
                  ...values,
                  document_id: document.id,
                  selfie_id: selfie.id,
                  device_fingerprint: device,
                });
                await refresh();
                reload();
                notify("Identity verification submitted.");
              }}
            />
          </article>
        )}
      {kyc ? (
        <Table
          heads={["Submission", "Status", "Reason"]}
          rows={kyc.map((k) => [k.created_at, k.status, k.reason])}
        />
      ) : (
        <Loading error={error} />
      )}{" "}
      {user.kyc_status === "Approved" && (
        <article className="card">
          <h2>Linked banks</h2>
          <Table
            heads={["Bank", "Status", "Mandate"]}
            rows={(banks || []).map((b) => [
              b.masked,
              b.status,
              String(b.mandate),
            ])}
          />
          {banks
            ?.filter((b) => b.mandate)
            .map((b) => (
              <button
                className="secondary"
                key={b.id}
                onClick={() =>
                  run(async () => {
                    await accountApi.disableMandate(b.id);
                    reloadBanks();
                  })
                }
              >
                Disable mandate {b.masked}
              </button>
            ))}
          <Form
            fields={[
              {
                name: "provider_token",
                label: sandbox
                  ? "Sandbox bank token (sandbox-ok-unique-name)"
                  : "Provider bank token",
              },
              {
                name: "mandate_accepted",
                label: "I authorize the contribution mandate",
                type: "checkbox",
              },
            ]}
            label="Link bank"
            submit={async (values) => {
              await accountApi.linkBank(values);
              reloadBanks();
              notify("Bank linked.");
            }}
          />
        </article>
      )}
      <SecuritySettings />
      <Link href="/app/account/security">Security settings</Link>
      <article className="card">
        <h2>Notification preferences</h2>
        <Form
          fields={[
            { name: "email", label: "Email", type: "checkbox", value: true },
            { name: "sms", label: "SMS", type: "checkbox", value: true },
            { name: "push", label: "Push", type: "checkbox", value: true },
            {
              name: "locale",
              label: "Language",
              type: "select",
              options: ["en"],
            },
            {
              name: "push_token",
              label: "Push device token (optional)",
              optional: true,
            },
          ]}
          label="Save preferences"
          submit={async (values) => {
            values.push_token = values.push_token || null;
            await authApi.preferences(values);
            notify("Preferences saved.");
          }}
        />
      </article>
      <article className="card">
        <h2>Your data</h2>
        <button className="secondary" onClick={() => run(accountApi.export)}>
          Download my data
        </button>
        {["export", "deletion"].map((kind) => (
          <button
            className="secondary"
            key={kind}
            onClick={() =>
              run(async () => {
                const result = await authApi.dataRequest(kind);
                notify("Request submitted: " + result.id);
              })
            }
          >
            Request {kind}
          </button>
        ))}
      </article>
    </>
  );
}
