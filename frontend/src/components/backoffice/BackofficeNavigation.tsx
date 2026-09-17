"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/providers/session-provider";
export const modules = [
  ["overview", "Overview"],
  ["users", "Users"],
  ["kyc", "Identity reviews"],
  ["circles", "Circles"],
  ["payments", "Payments"],
  ["complaints", "Complaints"],
  ["policies", "Policies"],
  ["jobs", "Jobs"],
  ["deliveries", "Deliveries"],
  ["data-requests", "Data requests"],
  ["audit", "Audit"],
] as const;
export default function BackofficeNavigation() {
  const pathname = usePathname(),
    { user } = useSession();
  if (pathname.endsWith("/cms/preview")) return null;
  return (
    <>
      <h1>Back office</h1>
      <p>
        Staff actions are permission-controlled and recorded in the audit trail.
      </p>
      <nav className="actions" aria-label="Back-office modules">
        {[
          ...modules,
          ...(user && ["admin", "ops"].includes(user.role)
            ? [["cms", "Website CMS"]]
            : []),
        ].map(([key, label]) => {
          const href =
            key === "overview" ? "/backoffice" : "/backoffice/" + key;
          if (pathname.endsWith("/cms/preview")) return null;
          return (
            <Link
              key={key}
              href={href}
              className={pathname === href ? "active" : "secondary"}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
