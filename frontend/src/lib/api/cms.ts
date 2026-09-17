import { request } from "./client";
import type { CmsState, MarketingContent, RevisionSummary } from "../cms-types";
export const cmsApi = {
  state: () => request<CmsState>("/admin/content/home"),
  history: () => request<RevisionSummary[]>("/admin/content/home/revisions"),
  preview: () =>
    request<{ revision_id: string; content: MarketingContent }>(
      "/admin/content/home/preview-data",
    ),
  save: (content: unknown, expected_draft: string, reason: string) =>
    request<CmsState>("/admin/content/home/draft", {
      method: "PUT",
      body: { content, expected_draft, reason },
    }),
  publish: (revision_id: string, expected_published: string, reason: string) =>
    request<CmsState>("/admin/content/home/publish", {
      body: { revision_id, expected_published, reason },
    }),
  restore: (revision_id: string, expected_published: string, reason: string) =>
    request<CmsState>("/admin/content/home/restore", {
      body: { revision_id, expected_published, reason },
    }),
};
