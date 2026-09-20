"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api/auth";
import { saveSession, storedSession } from "@/lib/api/client";
import type { Account, FormValues } from "@/lib/types";
type SessionState = {
  user: Account | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signIn: (values: FormValues) => Promise<void>;
  register: (values: FormValues) => Promise<void>;
  signOut: () => Promise<void>;
  clear: () => void;
};
const Context = createContext<SessionState | null>(null);
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(null),
    [loading, setLoading] = useState(true);
  async function refresh() {
    setUser(await authApi.me());
  }
  function clear() {
    saveSession(null);
    setUser(null);
  }
  useEffect(() => {
    if (storedSession())
      refresh()
        .catch(clear)
        .finally(() => setLoading(false));
    else setLoading(false);
  }, []);
  async function signIn(values: FormValues) {
    saveSession(await authApi.login(values));
    await refresh();
  }
  async function register(values: FormValues) {
    saveSession(await authApi.register(values));
    await refresh();
  }
  async function signOut() {
    try {
      await authApi.logout();
    } finally {
      clear();
    }
  }
  return (
    <Context.Provider
      value={{ user, loading, refresh, signIn, register, signOut, clear }}
    >
      {children}
    </Context.Provider>
  );
}
export function useSession() {
  const value = useContext(Context);
  if (!value) throw Error("SessionProvider is required");
  return value;
}
