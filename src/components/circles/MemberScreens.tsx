"use client";
import { useRouter } from "next/navigation";
import Form from "@/components/ui/Form";
import { circlesApi } from "@/lib/api/circles";
import Marketplace from "@/components/Marketplace";
import {
  complaintsApi,
  notificationsApi,
  trustApi,
} from "@/lib/api/notifications";
import { Loading, Table, useResource } from "@/components/ui/Data";
import { NotificationCard } from "@/components/navigation/NotificationBell";
import { useSession } from "@/providers/session-provider";
export function MemberMarketplace() {
  const router = useRouter();
  return (
    <Marketplace
      join={async (c) => {
        await circlesApi.join(c.id);
        router.push("/app/circles/" + c.id);
      }}
      query={
        typeof window === "undefined"
          ? ""
          : new URLSearchParams(location.search).get("q") || ""
      }
    />
  );
}
export function Invitations() {
  const router = useRouter();
  return (
    <>
      <h1>Join with an invitation</h1>
      <Form
        fields={[
          { name: "circle_id", label: "Circle ID" },
          { name: "code", label: "Invitation code" },
        ]}
        label="Join circle"
        submit={async (v) => {
          await circlesApi.join(String(v.circle_id), String(v.code));
          router.push("/app/circles/" + v.circle_id);
        }}
      />
    </>
  );
}
export function Notifications() {
  const { value, error, reload } = useResource(notificationsApi.list);
  return (
    <>
      <h1>Notifications</h1>
      {value ? (
        value.length ? (
          value.map((n) => (
            <NotificationCard key={n.id} notice={n} reload={reload} />
          ))
        ) : (
          <p>You’re all caught up.</p>
        )
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
export function Trust() {
  const { value, error } = useResource(trustApi.list),
    { user } = useSession();
  return (
    <>
      <h1>Your trust record</h1>
      <p>
        {user?.trust_score} points · Up to {user?.scheme_cap} concurrent circles
        · {user?.commitments} reserved slots
      </p>
      {value ? (
        <Table
          heads={["Date", "Change", "Reason"]}
          rows={value.map((t) => [t.created_at, t.delta, t.reason])}
        />
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
export function Reports() {
  const { value, error } = useResource(complaintsApi.list);
  return (
    <>
      <h1>Your reports</h1>
      {value ? (
        <Table
          heads={["Report", "Category", "Status", "Resolution"]}
          rows={value.map((r) => [r.id, r.category, r.status, r.resolution])}
        />
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
