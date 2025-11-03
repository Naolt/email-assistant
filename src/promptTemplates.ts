import { PromptTemplate } from "@langchain/core/prompts";

// Summarize email → JSON
// Variables expected:
// - subject, body, threadContext (string, pre-joined), language, tone, style,
//   maxSummaryBullets (number), includeActionItems (boolean), promptVersion (string)
export const summarizeEmailPrompt = PromptTemplate.fromTemplate(
  [
    "You are an assistant that summarizes emails. Prompt version: {promptVersion}.",
    "\n\nConstraints:",
    "- Language: {language}",
    "- Tone: {tone}",
    "- Style: {style}",
    "- Max summary bullets: {maxSummaryBullets}",
    "- Include action items: {includeActionItems}",
    "\n\nEmail subject: {subject}",
    "{threadContext}",
    "Email body:\n\"\"\"\n{body}\n\"\"\"",
    "\n\nReturn only JSON with the specified keys—no extra text.",
  ].join("\n"),
);

// Draft reply → JSON
// Variables expected:
// - subject, body, threadContext (string, pre-joined), language, tone, style,
//   maxSummaryBullets (number), includeActionItems (boolean), promptVersion (string)
// - Optional precomputed summary fields as strings: summaryGist, summaryBullets, summaryActionItems, summarySentiment
export const draftReplyPrompt = PromptTemplate.fromTemplate(
  [
    "You are an assistant that drafts concise, helpful email replies. Prompt version: {promptVersion}.",
    "\n\nConstraints:",
    "- Language: {language}",
    "- Tone: {tone}",
    "- Style: {style}",
    "- Do not include quoted original text",
    "\n\nIf provided, use this precomputed summary to guide the reply:",
    "- gist: {summaryGist}",
    "- bullets: {summaryBullets}",
    "- actionItems: {summaryActionItems}",
    "- sentiment: {summarySentiment}",
    "\n\nEmail subject: {subject}",
    "{threadContext}",
    "Email body:\n\"\"\"\n{body}\n\"\"\"",
    "\n\nReturn only JSON with the specified keys—no extra text.",
  ].join("\n"),
);


