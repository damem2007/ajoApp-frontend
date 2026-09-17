import { request, download } from "./client";
import type {
  Account,
  AuditEvent,
  CircleDetail,
  Complaint,
  DataRequest,
  Delivery,
  FormValues,
  Json,
  KycCase,
  Payment,
  PolicyVersion,
} from "../types";
export const adminApi = {
  metrics: () => request<Record<string, Json>>("/admin/metrics"),
  users: () => request<Account[]>("/admin/users"),
  userStatus: (id: string, body: FormValues) =>
    request<Json>(`/admin/users/${id}/status`, { body }),
  userRole: (id: string, body: FormValues) =>
    request<Json>(`/admin/users/${id}/role`, { body }),
  userTrust: (id: string, body: FormValues) =>
    request<Json>(`/admin/users/${id}/trust`, { body }),
  kyc: () => request<KycCase[]>("/admin/kyc"),
  kycEvidence: (id: string) =>
    request<{
      identity: { document_id: string; selfie_id: string };
      [key: string]: Json;
    }>("/admin/kyc/" + id),
  document: (id: string) => download("/admin/documents/" + id, id),
  reviewKyc: (id: string, body: FormValues) =>
    request<Json>(`/admin/kyc/${id}/review`, { body }),
  circles: () => request<CircleDetail[]>("/admin/circles"),
  circleState: (id: string, body: FormValues) =>
    request<Json>(`/admin/circles/${id}/state`, { body }),
  curate: (id: string, body: FormValues) =>
    request<Json>(`/admin/circles/${id}/curation`, { body }),
  payments: () => request<Payment[]>("/admin/payments"),
  retry: (id: string, body: FormValues) =>
    request<Json>(`/admin/payments/${id}/retry`, { body }),
  reconcile: (id: string, body: FormValues) =>
    request<Json>(`/admin/payments/${id}/reconcile`, { body }),
  complaints: () => request<Complaint[]>("/admin/complaints"),
  evidence: (id: string) => request<Json>(`/admin/complaints/${id}/evidence`),
  resolve: (id: string, body: FormValues) =>
    request<Json>(`/admin/complaints/${id}/resolve`, { body }),
  policies: () => request<PolicyVersion[]>("/admin/policies"),
  policy: (policy: Json, reason: string) =>
    request<Json>("/admin/policies", { body: { policy, reason } }),
  jobs: (body: FormValues) => request<Json>("/admin/jobs/run", { body }),
  ledger: () => download("/admin/ledger.csv", "ajo-ledger.csv"),
  deliveries: () => request<Delivery[]>("/admin/notifications"),
  resend: (id: string, body: FormValues) =>
    request<Json>(`/admin/notifications/${id}/resend`, { body }),
  dataRequests: () => request<DataRequest[]>("/admin/data-requests"),
  reviewData: (id: string, body: FormValues) =>
    request<Json>("/admin/data-requests/" + id, { body }),
  audit: () => request<AuditEvent[]>("/admin/audit"),
};
