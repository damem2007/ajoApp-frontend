import { request, download } from "./client";
import type {
  CircleDetail,
  Due,
  FormValues,
  Invitation,
  Json,
  Agreement,
} from "../types";
export interface FrequencyOption {
  value: string;
  label: string;
}
// Backend returns raw values (e.g. "weekly", "monthly") in
// CircleSetup.contribution_frequencies — map them to display labels here.
const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  "bi-weekly": "Bi-weekly",
  monthly: "Monthly",
  "bi-monthly": "Bi-monthly",
  quarterly: "Quarterly",
  "semi-annual": "Semi-annual",
  yearly: "Yearly",
};
export function toFrequencyOptions(values: string[]): FrequencyOption[] {
  return values.map((value) => ({
    value,
    label: FREQUENCY_LABELS[value] ?? value,
  }));
}
export interface CircleSetup {
  name_min_length: number;
  name_max_length: number;
  amount_max_minor: number;
  members_min: number;
  members_max: number;
  default_currency: string;
  currencies: string[];
  contribution_frequencies: string[];
  collection_frequencies: string[];
  default_contribution_frequency: string;
  default_collection_frequency: string;
  allow_overflow: false;
}
export interface PlanPreview {
  contribution_minor: number;
  target_minor: number;
  debit_dates: string[];
  payout_dates: string[];
  planned_members: number;
}

export const circlesApi = {
  setup: () => request<CircleSetup>("/public/circle-setup"),
  preview: (body: unknown) =>
    request<PlanPreview>("/circles/preview", { body }),
  list: () => request<CircleDetail[]>("/circles"),
  get: (id: string) => request<CircleDetail>("/circles/" + id),
  create: (body: unknown) => request<{ id: string }>("/circles", { body }),
  edit: (id: string, body: unknown) =>
    request<CircleDetail>("/circles/" + id, { method: "PUT", body }),
  publish: (id: string) =>
    request<Json>(`/circles/${id}/publish`, { body: {} }),
  leave: (id: string) => request<Json>(`/circles/${id}/leave`, { body: {} }),
  cancel: (id: string, body: FormValues) =>
    request<Json>(`/circles/${id}/cancel`, { body }),
  closeRecruitment: (id: string) =>
    request<Json>(`/circles/${id}/close-recruitment`, { body: {} }),
  join: (id: string, code?: string) =>
    request<Json>(`/circles/${id}/join`, { body: code ? { code } : {} }),
  invitations: (id: string) =>
    request<Invitation[]>(`/circles/${id}/invitations`),
  invite: (id: string, body: FormValues) =>
    request<Invitation>(`/circles/${id}/invitations`, { body }),
  revokeInvitation: (id: string) =>
    request<Json>(`/invitations/${id}/revoke`, { body: {} }),
  finalize: (id: string, order: string[]) =>
    request<Json>(`/circles/${id}/finalize`, { body: { payout_order: order } }),
  schedule: (id: string) => request<Due[]>(`/circles/${id}/schedule`),
  requestRevision: (id: string, body: FormValues) =>
    request<Json>(`/circles/${id}/request-revision`, { body }),
};
export const contractsApi = {
  get: (id: string) => request<Agreement>("/contracts/" + id),
  download: (id: string) =>
    download(`/contracts/${id}/pdf`, "ajo-agreement.pdf"),
  sign: (id: string, body: unknown) =>
    request<Json>(`/contracts/${id}/sign`, { body }),
};
