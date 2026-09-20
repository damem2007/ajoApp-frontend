"use client";
import Form from "@/components/ui/Form";
import { adminApi } from "@/lib/api/admin";
import { useResource, Table } from "@/components/ui/Data";
import { useSession } from "@/providers/session-provider";
import { useToast } from "@/providers/toast-provider";
export default function StaffOnboarding() {
  const { user } = useSession();
  const { value, reload } = useResource(adminApi.staffInvitations);
  const { notify } = useToast();
  if (user?.permissions && !user.permissions.includes("members.manage"))
    return null;
  return (
    <section>
      <h3>Backoffice onboarding</h3>
      <p>
        Invite a colleague to register or sign in with their verified email and
        accept the invitation from Account. Roles become active only after
        acceptance.
      </p>
      <Form
        fields={[
          { name: "email", label: "Staff email", type: "email" },
          {
            name: "role",
            label: "Staff role",
            type: "select",
            options: ["admin", "ops", "compliance", "support"],
          },
          { name: "reason", label: "Invitation reason", minLength: 5 },
        ]}
        label="Invite backoffice user"
        submit={async (v) => {
          await adminApi.inviteStaff(v);
          reload();
          notify("Staff invitation queued for email delivery.");
        }}
      />
      {value && (
        <Table
          heads={["Email", "Role", "Status", "Invited by", "Created"]}
          rows={value.map((i) => [
            i.email,
            i.role,
            i.status,
            i.created_by,
            i.created_at,
          ])}
        />
      )}
    </section>
  );
}
