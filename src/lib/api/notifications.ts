import { request } from "./client";
import type { Notice, Json, TrustEvent, Complaint, FormValues } from "../types";
export const notificationsApi = {
  summary: () => request<{ unread: number }>("/notifications/summary"),
  list: () => request<Notice[]>("/notifications"),
  read: (id: string) =>
    request<Json>(`/notifications/${id}/read`, { body: {} }),
  deleteRead: (id: string) =>
    request<void>("/notifications/" + id, { method: "DELETE" }),
};
export const trustApi = { list: () => request<TrustEvent[]>("/trust") };
export const complaintsApi = {
  list: () => request<Complaint[]>("/complaints"),
  create: (body: FormValues) => request<Json>("/complaints", { body }),
};
