export type ReviewStatus = "pending" | "approved" | "rejected";

export type PublishDraft = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  featured: boolean;
  coverImage?: string;
};

/**
 * AI-discovered candidate; not published until manually approved in admin.
 * CMS-ready: mirrors future API shape (id, status, source, structured fields).
 */
export type FoundOpportunityCandidate = {
  id: string;
  status: ReviewStatus;
  sourceTitle: string;
  sourceUrl: string;
  sourceDomain: string;
  sourceName?: string;
  country?: string;
  category: string;
  deadline?: string;
  confidence?: number;
  /** Turkish summary, 2–4 lines in mock data */
  aiSummary: string;
};
