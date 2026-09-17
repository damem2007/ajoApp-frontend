export type MarketingContent = {
  meta: { title: string; description: string };
  nav: { how: string; safeguards: string; circles: string; signin: string };
  hero: {
    lines: string[];
    body: string;
    primary: string;
    secondary: string;
    notice: string;
  };
  calculator: {
    title: string;
    subtitle: string;
    contribution: string;
    members: string;
    turn: string;
    pot: string;
    total: string;
    frequency: string;
    currency: string;
    note: string;
  };
  how: {
    title: string;
    body: string;
    steps: { title: string; body: string }[];
  };
  safeguards: {
    title: string;
    body: string;
    items: { title: string; body: string }[];
  };
  circles: {
    title: string;
    body: string;
    cta: string;
    examples: string;
    empty: string;
  };
  faq: { title: string; items: { question: string; answer: string }[] };
  closing: { title: string; body: string; primary: string; secondary: string };
  footer: {
    tagline: string;
    how: string;
    circles: string;
    terms: string;
    privacy: string;
  };
  legal: {
    terms_title: string;
    terms_body: string;
    privacy_title: string;
    privacy_body: string;
  };
};
export interface CmsRevision {
  id: string;
  content: MarketingContent;
}
export interface CmsState {
  slug: string;
  draft: CmsRevision;
  published: CmsRevision;
}
export interface RevisionSummary {
  id: string;
  reason: string;
  created_at: string;
  author_id?: string;
}
