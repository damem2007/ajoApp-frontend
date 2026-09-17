"use client";
import { runtimeApi } from "@/lib/api/runtime";
import { useResource } from "@/components/ui/Data";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/providers/session-provider";
import { useToast } from "@/providers/toast-provider";
import NotificationBell from "./NotificationBell";
export default function WorkspaceLayout({
  children,
  staff = false,
}: {
  children: React.ReactNode;
  staff?: boolean;
}) {
  const { value: health } = useResource(runtimeApi.health);
  const { user, loading, signOut } = useSession(),
    router = useRouter(),
    pathname = usePathname(),
    { run } = useToast();
  useEffect(() => {
    if (!loading && !user)
      router.replace("/sign-in?next=" + encodeURIComponent(pathname));
  }, [loading, user, pathname, router]);
  if (loading || !user) return <p role="status">Checking account…</p>;
  if (staff && user.role === "member")
    return <p role="alert">The back office is available to staff accounts.</p>;
  if (staff && pathname.endsWith("/cms/preview")) return <>{children}</>;
  const links = [
    ["Circles", "/app/circles"],
    ["Marketplace", "/app/marketplace"],
    ["Invitations", "/app/invitations"],
    ["Account", "/app/account"],
    ["Notifications", "/app/notifications"],
    ["Trust", "/app/trust"],
    ["Reports", "/app/reports"],
    ...(user.role !== "member" ? [["Back office", "/backoffice"]] : []),
  ];
  return (
    <>
      <link rel="stylesheet" href="/assets/platform.css" />
      <link rel="stylesheet" href="/assets/marketplace.css" />
      <header>
        <Link className="brand" href="/">
          ajo<span>·</span>
        </Link>
        <span>
          {health?.sandbox ? "Sandbox · No real money" : "Contribution circles"}
        </span>
        <div className="header-tools">
          <div>
            {user.pseudonym || user.email} · {user.role}
          </div>
          <NotificationBell />
        </div>
      </header>
      <div className="shell">
        <nav id="navigation" aria-label="Main navigation">
          {links.map(([name, href]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "active" : ""}
            >
              {name}
            </Link>
          ))}
          <button
            className="secondary"
            onClick={() =>
              run(async () => {
                await signOut();
                router.push("/sign-in");
              })
            }
          >
            Sign out
          </button>
        </nav>
        <main>{children}</main>
      </div>
      <footer>Ajo · Contributions and obligations, clearly recorded.</footer>
    </>
  );
}
