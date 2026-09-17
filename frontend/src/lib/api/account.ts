import { request, download } from "./client";
import type { KycCase, Bank, FormValues, Json } from "../types";
export const accountApi = {
  kyc: () => request<KycCase[]>("/kyc"),
  upload: (file: File, kind: string) => {
    const body = new FormData();
    body.append("file", file);
    return request<{ id: string }>("/documents?kind=" + kind, { body });
  },
  submitKyc: (body: unknown) => request<Json>("/kyc", { body }),
  banks: () => request<Bank[]>("/banks"),
  linkBank: (body: FormValues) => request<Json>("/banks", { body }),
  disableMandate: (id: string) =>
    request<Json>(`/banks/${id}/disable`, {
      body: { reason: "Member revoked the bank mandate" },
    }),
  export: () => download("/me/export", "ajo-personal-data.json"),
};
