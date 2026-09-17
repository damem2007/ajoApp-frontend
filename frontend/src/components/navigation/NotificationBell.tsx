"use client";
import { useState } from "react";
import Link from "next/link";
import { notificationsApi } from "@/lib/api/notifications";
import { useResource } from "@/components/ui/Data";
import { useToast } from "@/providers/toast-provider";
import type { Notice } from "@/lib/types";
export function NotificationCard({
  notice: n,
  reload,
}: {
  notice: Notice;
  reload: () => void;
}) {
  const { run } = useToast(),
    [start, setStart] = useState<number | null>(null);
  return (
    <article
      className="card"
      onTouchStart={(e) => setStart(e.changedTouches[0].clientX)}
      onTouchEnd={(e) => {
        if (
          n.read &&
          start !== null &&
          e.changedTouches[0].clientX - start > 90
        )
          run(async () => {
            await notificationsApi.deleteRead(n.id);
            reload();
          });
        setStart(null);
      }}
    >
      <h2>{n.title}</h2>
      <p>{n.body}</p>
      <small>{new Date(n.created_at).toLocaleString()}</small>
      {n.read ? (
        <details>
          <summary>⋯ Notification actions</summary>
          <button
            className="secondary"
            onClick={() =>
              run(async () => {
                await notificationsApi.deleteRead(n.id);
                reload();
              })
            }
          >
            Delete read notification
          </button>
        </details>
      ) : (
        <button
          className="secondary"
          onClick={() =>
            run(async () => {
              await notificationsApi.read(n.id);
              reload();
            })
          }
        >
          Mark read
        </button>
      )}
    </article>
  );
}
export default function NotificationBell() {
  const [open, setOpen] = useState(false),
    { value, reload } = useResource(async () => {
      const [items, summary] = await Promise.all([
        notificationsApi.list(),
        notificationsApi.summary(),
      ]);
      return { items, unread: summary.unread };
    }),
    count = value?.unread || 0;
  return (
    <div id="notification-tools">
      <button
        className="notification-bell"
        aria-label={"Notifications" + (count ? ", " + count + " unread" : "")}
        aria-expanded={open}
        aria-controls="notification-dropdown"
        onClick={() => {
          setOpen(!open);
          reload();
        }}
      >
        <img src="/assets/bell.svg" alt="" width="22" height="22" />
        {count > 0 && (
          <span className="notification-badge">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      {open && (
        <div
          id="notification-dropdown"
          className="notification-panel"
          aria-label="Notifications"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <h2>Notifications</h2>
          <p>Your circle and account updates</p>
          {value?.items.length ? (
            value.items
              .slice(0, 20)
              .map((n) => (
                <NotificationCard key={n.id} notice={n} reload={reload} />
              ))
          ) : (
            <p>You’re all caught up.</p>
          )}
          <Link href="/app/notifications" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
          <button className="secondary" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
