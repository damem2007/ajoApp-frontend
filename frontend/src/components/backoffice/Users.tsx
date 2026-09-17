"use client";
import { adminApi } from "@/lib/api/admin";
import { useResource, Loading } from "@/components/ui/Data";
import Form from "@/components/ui/Form";
import { useToast } from "@/providers/toast-provider";
export default function Users() {
  const { value, error, reload } = useResource(adminApi.users),
    { notify } = useToast();
  return (
    <>
      <h2>Users</h2>
      {value ? (
        value.map((u) => (
          <article className="card" key={u.id}>
            <h3>{u.pseudonym || u.email}</h3>
            <p>
              {u.email} · {u.role} · {u.kyc_status}
            </p>
            <details>
              <summary>Manage account</summary>
              <Form
                fields={[
                  {
                    name: "suspended",
                    label: "Suspend account",
                    type: "checkbox",
                    value: u.suspended,
                  },
                  { name: "reason", label: "Reason", minLength: 5 },
                ]}
                label="Update account status"
                submit={async (v) => {
                  await adminApi.userStatus(u.id, v);
                  reload();
                  notify("Account updated.");
                }}
              />
              <Form
                fields={[
                  {
                    name: "role",
                    label: "Role",
                    type: "select",
                    value: u.role,
                    options: [
                      "member",
                      "admin",
                      "ops",
                      "support",
                      "compliance",
                    ],
                  },
                  { name: "reason", label: "Role change reason", minLength: 5 },
                ]}
                label="Update role"
                submit={async (v) => {
                  await adminApi.userRole(u.id, v);
                  reload();
                  notify("Role updated; prior sessions revoked.");
                }}
              />
              <Form
                fields={[
                  {
                    name: "delta",
                    label: "Trust adjustment",
                    type: "number",
                    value: 0,
                  },
                  { name: "reason", label: "Adjustment reason", minLength: 5 },
                ]}
                label="Adjust trust"
                submit={async (v) => {
                  await adminApi.userTrust(u.id, v);
                  notify("Adjustment recorded.");
                }}
              />
            </details>
          </article>
        ))
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
