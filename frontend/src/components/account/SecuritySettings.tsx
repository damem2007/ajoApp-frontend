"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Form from "@/components/ui/Form";
import { useSession } from "@/providers/session-provider";
import { useToast } from "@/providers/toast-provider";
import { authApi } from "@/lib/api/auth";
export default function SecuritySettings() {
  const { user, clear } = useSession(),
    { run } = useToast(),
    router = useRouter(),
    [setup, setSetup] = useState<{
      secret: string;
      qr_data_url: string;
    } | null>(null),
    [busy, setBusy] = useState(false);
  return (
    <article className="card">
      <h2>Authenticator MFA</h2>
      {user?.mfa_enabled ? (
        <p>Authenticator protection is enabled.</p>
      ) : setup ? (
        <>
          <h3>Set up your authenticator</h3>
          <p>
            Scan this QR code with your authenticator app, then enter its
            six-digit code.
          </p>
          <img
            src={setup.qr_data_url}
            alt="Authenticator enrollment QR code"
            width="240"
            height="240"
          />
          <details>
            <summary>Can’t scan? Enter the setup key manually</summary>
            <p>{setup.secret}</p>
          </details>
          <Form
            fields={[{ name: "code", label: "Six-digit authenticator code" }]}
            label="Enable MFA"
            submit={async (values) => {
              await authApi.enableMfa(values);
              clear();
              router.push("/sign-in");
            }}
          />
        </>
      ) : (
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await run(async () => setSetup(await authApi.setupMfa()));
            setBusy(false);
          }}
        >
          {busy ? "Preparing…" : "Set up authenticator"}
        </button>
      )}
    </article>
  );
}
