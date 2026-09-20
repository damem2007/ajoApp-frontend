"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Form from "@/components/ui/Form";
import { adminApi } from "@/lib/api/admin";
import { useSession } from "@/providers/session-provider";
import { useToast } from "@/providers/toast-provider";
export default function StaffAccept() {
  const { clear } = useSession();
  const router = useRouter();
  const { notify, run } = useToast();
  const [invitations, setInvitations] = useState<
    { id: string; token: string; role: string }[]
  >([]);
  return (
    <section>
      <h2>Accept a backoffice invitation</h2>
      <p>
        Sign in with the invited email address and verify it before accepting.
        Use the one-time code sent to that address.
      </p>
      <Form
        fields={[
          { name: "token", label: "Staff invitation code", minLength: 20 },
        ]}
        label="Accept staff invitation"
        submit={async (v) => {
          await adminApi.acceptStaff(String(v.token));
          clear();
          router.push("/sign-in");
          notify(
            "Invitation accepted. Sign in again to activate your staff session.",
          );
        }}
      />
      <details>
        <summary>Simulated notification test inbox</summary>
        <button
          type="button"
          className="secondary"
          onClick={() =>
            run(async () => setInvitations(await adminApi.testStaffInbox()))
          }
        >
          Load my test invitations
        </button>
        {invitations.map((i) => (
          <p key={i.id}>
            {i.role}: <code>{i.token}</code>
          </p>
        ))}
      </details>
    </section>
  );
}
