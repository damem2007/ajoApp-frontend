export type Role = "member" | "admin" | "ops" | "support" | "compliance";
export type Json =
  string | number | boolean | null | Json[] | { [key: string]: Json };
export interface Account {
  id: string;
  email: string;
  phone: string;
  pseudonym: string;
  role: Role;
  email_verified: boolean;
  phone_verified: boolean;
  kyc_status: string;
  mfa_enabled: boolean;
  suspended?: boolean;
  trust_score: number;
  scheme_cap: number;
  commitments: number;
}
export interface SessionTokens {
  access_token: string;
  refresh_token: string;
}
export interface CircleConfig {
  name: string;
  description: string;
  category: string;
  currency: string;
  target_minor: number;
  contribution_minor?: number | null;
  planned_members: number;
  minimum_members: number;
  hard_cap: number;
  contribution_frequency: string;
  collection_frequency: string;
  start_date: string;
  privacy: string;
  payout_order_mode: string;
  invite_permission: string;
  trust_threshold: number;
  premium: boolean;
  identities_hidden: boolean;
  strict_minimum: boolean;
  allow_overflow: boolean;
  overflow_strategy: null;
  timezone?: string;
}
export interface Member {
  id: string;
  pseudonym: string;
  display_name?: string;
  rank: number | null;
  status: string;
}
export interface Obligation {
  contributed_minor: number;
  collected_minor: number;
  remaining_obligation_minor: number;
  net_position_minor: number;
}
export interface CircleDetail {
  id: string;
  name: string;
  state: string;
  config: CircleConfig;
  count: number;
  members: Member[];
  contract_id?: string;
  obligation?: Obligation;
  featured: boolean;
  removed: boolean;
}
export interface CatalogueCircle {
  id: string;
  name: string;
  description?: string;
  category: string;
  currency: string;
  target_minor: number;
  frequency: string;
  members: number;
  slots: number;
  trust_threshold: number;
  featured?: boolean;
  illustrative?: boolean;
  trust_label?: string;
  next_days?: number;
}
export interface Notice {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}
export interface Due {
  id: string;
  user_id: string;
  date: string;
  kind: string;
  amount_minor: number;
  status: string;
}
export interface Agreement {
  id: string;
  hash: string;
  signed_by: string[];
  content: Json;
}
export interface Invitation {
  id: string;
  uses: number;
  max_uses: number;
  revoked: boolean;
  code?: string;
  expires: number;
}
export interface KycCase {
  id: string;
  created_at: string;
  status: string;
  reason?: string;
  signals: Json;
}
export interface Bank {
  id: string;
  masked: string;
  status: string;
  mandate: boolean;
}
export interface Complaint {
  id: string;
  category: string;
  status: string;
  description: string;
  resolution?: string;
  overdue?: boolean;
}
export interface TrustEvent {
  created_at: string;
  delta: number;
  reason: string;
}
export interface AuditEvent {
  created_at: string;
  actor_id: string;
  action: string;
  resource: string;
}
export interface Payment extends Due {
  circle_id: string;
}
export interface PolicyVersion {
  id: string;
  data: Json;
}
export interface Delivery {
  id: string;
  title: string;
  channel: string;
  status: string;
  attempts: number;
}
export interface DataRequest {
  id: string;
  kind: string;
  status: string;
}
export type FormValues = Record<
  string,
  string | number | boolean | File | null
>;
