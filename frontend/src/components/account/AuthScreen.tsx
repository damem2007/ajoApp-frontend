"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Form from "@/components/ui/Form";
import { useSession } from "@/providers/session-provider";
export default function AuthScreen({
  register = false,
}: {
  register?: boolean;
}) {
  const session = useSession(),
    router = useRouter();
  return (
    <>
      <link rel="stylesheet" href="/assets/platform.css" />
      <main className="legal">
        <h1>{register ? "Create your account" : "Welcome to Ajo"}</h1>
        <p>
          {register
            ? "Verify your email and phone before submitting identity documents."
            : "Sign in to manage your contribution circles."}
        </p>
        <Form
          fields={[
            { name: "email", label: "Email", type: "email" },
            ...(register
              ? [
                  {
                    name: "phone",
                    label: "Phone with country code",
                    type: "tel" as const,
                  },
                ]
              : []),
            {
              name: "password",
              label: register ? "Password (12+ characters)" : "Password",
              type: "password",
              minLength: register ? 12 : undefined,
            },
            ...(!register
              ? [{ name: "totp", label: "MFA code (optional)", optional: true }]
              : []),
          ]}
          label={register ? "Register" : "Sign in"}
          submit={async (values) => {
            if (!values.totp) delete values.totp;
            if (register) {
              await session.register(values);
              router.push("/app/account");
            } else {
              await session.signIn(values);
              const next = new URLSearchParams(location.search).get("next");
              router.push(
                next?.startsWith("/") && !next.startsWith("//")
                  ? next
                  : "/app/circles",
              );
            }
          }}
        />
        <Link href={register ? "/sign-in" : "/register"}>
          {register ? "Back to sign in" : "Create an account"}
        </Link>
      </main>
    </>
  );
}
