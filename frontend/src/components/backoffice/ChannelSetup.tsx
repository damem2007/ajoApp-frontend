"use client";
import { adminApi } from "@/lib/api/admin";
import { useResource, Loading } from "@/components/ui/Data";
import Form from "@/components/ui/Form";
import { useToast } from "@/providers/toast-provider";
export default function ChannelSetup() {
  const { value, error, reload } = useResource(adminApi.channels);
  const { notify } = useToast();
  return (
    <section>
      <h3>Notification channels</h3>
      <p>
        Disabled channels are skipped for new notifications and delivery.
        Existing notification history is retained.
      </p>
      {value ? (
        value.map((c) => (
          <Form
            key={c.id + String(c.enabled) + c.display_name}
            fields={[
              {
                name: "display_name",
                label: c.id + " display name",
                value: c.display_name,
              },
              {
                name: "enabled",
                label: "Enable " + c.id,
                type: "checkbox",
                value: c.enabled,
              },
              { name: "reason", label: c.id + " change reason", minLength: 5 },
            ]}
            label={"Save " + c.id + " channel"}
            submit={async (v) => {
              await adminApi.updateChannel(c.id, v);
              reload();
              notify("Notification channel saved.");
            }}
          />
        ))
      ) : (
        <Loading error={error} />
      )}
    </section>
  );
}
