export type {
  DraftTone,
  DraftStyle,
  DraftOptions,
  EmailInputBase,
  SummarizeEmailInput,
  DraftReplyInput,
  EmailSummary,
  SuggestedReply,
  SummarizeAndDraftInput,
  SummarizeAndDraftOutput,
} from "./types.ts";

import type {
  SummarizeEmailInput,
  EmailSummary,
  DraftReplyInput,
  SuggestedReply,
  SummarizeAndDraftInput,
  SummarizeAndDraftOutput,
} from "./types.ts";
import { summarizeEmailPrompt, draftReplyPrompt } from "./promptTemplates.ts";
import { getModel } from "./models.ts";
import { z } from "zod";

const DEFAULTS = {
  language: "en",
  tone: "neutral",
  style: "concise",
  maxSummaryBullets: 3,
  includeActionItems: true,
  promptVersion: "v1",
} as const;

function joinThreadContext(thread?: string[]): string {
  if (!thread || thread.length === 0) return "";
  const lines = thread.map((m, i) => `[${i + 1}] ${m}`).join("\n");
  return `Thread context (newest last):\n${lines}`;
}



export async function summarizeEmail(input: SummarizeEmailInput): Promise<EmailSummary> {
  const opts = input.options ?? {};
  const variables = {
    subject: input.subject ?? "(none)",
    body: input.body,
    threadContext: joinThreadContext(input.threadContext),
    language: opts.language ?? DEFAULTS.language,
    tone: opts.tone ?? DEFAULTS.tone,
    style: opts.style ?? DEFAULTS.style,
    maxSummaryBullets: opts.maxSummaryBullets ?? DEFAULTS.maxSummaryBullets,
    includeActionItems: opts.includeActionItems ?? DEFAULTS.includeActionItems,
    promptVersion: DEFAULTS.promptVersion,
  } as const;

  let finalPrompt = await summarizeEmailPrompt.format(variables);
  const llm: any = getModel();

  const summarySchema = z.object({
    gist: z.string(),
    bullets: z.array(z.string()),
    actionItems: z.array(z.string()),
    sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  });
  const responseSchema = z.object({ summary: summarySchema });
  const maybeStructured = llm.withStructuredOutput?.(responseSchema);

  // Try structured output first (for models that support it)
  if (maybeStructured) {
    try {
      const response = await maybeStructured.invoke(finalPrompt);
      return {
        gist: response.summary.gist,
        bullets: response.summary.bullets,
        actionItems: response.summary.actionItems,
        sentiment: response.summary.sentiment ?? "neutral",
      };
    } catch(err) {
      console.log("Structured output failed, falling back to JSON prompting");
      // fall through to manual parsing below
    }
  }

  // Fallback: Use JSON prompting for models without tool support
  finalPrompt = finalPrompt + `\n\nRespond with ONLY valid JSON in this exact format (no markdown, no other text):
{
  "summary": {
    "gist": "one sentence summary here",
    "bullets": ["key point 1", "key point 2"],
    "actionItems": ["action 1", "action 2"],
    "sentiment": "positive or neutral or negative"
  }
}`;

  const raw = await llm.invoke(finalPrompt);
  let content = typeof raw === "string" ? raw : raw.content?.toString() ?? JSON.stringify(raw);

  // Clean up markdown code blocks if present
  content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  const obj = JSON.parse(content);
  const s = obj?.summary ?? {};
  return {
    gist: typeof s.gist === "string" ? s.gist : "",
    bullets: Array.isArray(s.bullets) ? s.bullets : [],
    actionItems: Array.isArray(s.actionItems) ? s.actionItems : [],
    sentiment: s.sentiment ?? "neutral",
  };
  
}

export async function draftReply(_input: DraftReplyInput): Promise<SuggestedReply> {
  const opts = _input.options ?? {};
  const variables = {
    subject: _input.subject ?? "(none)",
    body: _input.body,
    threadContext: joinThreadContext(_input.threadContext),
    language: opts.language ?? DEFAULTS.language,
    tone: opts.tone ?? DEFAULTS.tone,
    style: opts.style ?? DEFAULTS.style,
    maxSummaryBullets: opts.maxSummaryBullets ?? DEFAULTS.maxSummaryBullets,
    includeActionItems: opts.includeActionItems ?? DEFAULTS.includeActionItems,
    promptVersion: DEFAULTS.promptVersion,
    summaryGist: _input.summary?.gist ?? "",
    summaryBullets: _input.summary?.bullets?.join("; ") ?? "",
    summaryActionItems: _input.summary?.actionItems?.join("; ") ?? "",
    summarySentiment: _input.summary?.sentiment ?? "",
  } as const;

  let finalPrompt = await draftReplyPrompt.format(variables);
  const llm: any = getModel();

  const replySchema = z.object({
    subject: z.string(),
    body: z.string(),
    quickReplies: z.array(z.string()).optional(),
  });
  const responseSchema = z.object({ draftReply: replySchema });
  const maybeStructured = llm.withStructuredOutput?.(responseSchema);

  // Try structured output first (for models that support it)
  if (maybeStructured) {
    try {
      const parsed = await maybeStructured.invoke(finalPrompt);
      const r = parsed.draftReply;
      return {
        subject: r.subject,
        body: r.body,
        quickReplies: r.quickReplies,
      };
    } catch {
      console.log("Structured output failed for draft reply, falling back to JSON prompting");
      // fallthrough
    }
  }

  // Fallback: Use JSON prompting for models without tool support
  finalPrompt = finalPrompt + `\n\nRespond with ONLY valid JSON in this exact format (no markdown, no other text):
{
  "draftReply": {
    "subject": "Re: subject line here",
    "body": "email body text here",
    "quickReplies": ["optional quick reply 1", "optional quick reply 2"]
  }
}`;

  const raw = await llm.invoke(finalPrompt);
  let content = typeof raw === "string" ? raw : raw.content?.toString() ?? JSON.stringify(raw);

  // Clean up markdown code blocks if present
  content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  const parsed = JSON.parse(content);
  const r = parsed?.draftReply ?? {};
  return {
    subject: typeof r.subject === "string" ? r.subject : (_input.subject?.toLowerCase().startsWith("re:") ? _input.subject! : `Re: ${_input.subject ?? "Your email"}`),
    body: typeof r.body === "string" ? r.body : "",
    quickReplies: Array.isArray(r.quickReplies) ? r.quickReplies : undefined,
  };
}

export async function summarizeAndDraft(
  _input: SummarizeAndDraftInput,
): Promise<SummarizeAndDraftOutput> {
  const summary = await summarizeEmail(_input);
  const reply = await draftReply({ ..._input, summary });
  return { summary, draftReply: reply };
}


