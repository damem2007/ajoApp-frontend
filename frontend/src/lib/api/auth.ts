import { request, saveSession } from "./client";
import type { Account, FormValues, Json, SessionTokens } from "../types";
export const authApi = {
  me: () => request<Account>("/me"),
  login: (values: FormValues) =>
    request<SessionTokens>("/auth/login", { body: values }),
  register: (values: FormValues) =>
    request<SessionTokens>("/auth/register", { body: values }),
  logout: async () => {
    try {
      await request<void>("/auth/logout", { body: {} });
    } finally {
      saveSession(null);
    }
  },
  verify: (values: FormValues) =>
    request<Json>("/auth/verify", { body: values }),
  resend: (channel: string) =>
    request<Json>("/auth/resend/" + channel, { body: {} }),
  inbox: () => request<Json>("/auth/sandbox-inbox"),
  setupMfa: () =>
    request<{ secret: string; qr_data_url: string }>("/auth/mfa/setup", {
      body: {},
    }),
  enableMfa: (values: FormValues) =>
    request<Json>("/auth/mfa/enable", { body: values }),
  preferences: (values: FormValues) =>
    request<Json>("/me/preferences", { method: "PUT", body: values }),
  dataRequest: (kind: string) =>
    request<{ id: string }>("/data-requests/" + kind, { body: {} }),
};
