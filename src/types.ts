export type DraftTone = "neutral" | "friendly" | "formal";
export type DraftStyle = "concise" | "detailed";

export interface DraftOptions {
  tone?: DraftTone;
  style?: DraftStyle;
  language?: string; // e.g., "en"
  maxSummaryBullets?: number;
  includeActionItems?: boolean;
}

export interface EmailInputBase {
  subject?: string;
  body: string;
  threadContext?: string[]; // prior messages, newest last
  sender?: string;
  recipient?: string;
}

export interface SummarizeEmailInput extends EmailInputBase {
  options?: DraftOptions;
}

export interface EmailSummary {
  gist: string; // 1–2 sentences
  bullets: string[];
  actionItems: string[];
  sentiment?: "positive" | "neutral" | "negative";
}

export interface DraftReplyInput extends EmailInputBase {
  /** Optional precomputed summary to guide reply generation */
  summary?: EmailSummary;
  options?: DraftOptions;
}

export interface SuggestedReply {
  subject: string;
  body: string; // reply text only (no quoted text)
  /** Optional short one-liner suggestions similar to Gmail Smart Reply */
  quickReplies?: string[]; // e.g., up to 3 items
}

export interface SummarizeAndDraftInput extends DraftReplyInput {}

export interface SummarizeAndDraftOutput {
  summary: EmailSummary;
  draftReply: SuggestedReply;
}


