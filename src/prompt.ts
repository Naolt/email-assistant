import type {
  DraftOptions,
  DraftReplyInput,
  EmailSummary,
  SummarizeEmailInput,
} from "./types.ts";

export type ChatRole = "system" | "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface PromptConfig {
  promptVersion?: string; // e.g., "v1"
  role?: string; // system role description
  instruction?: string[]; // task steps
  outputConstraints?: string[]; // rules to follow
  styleOrTone?: string[]; // tone/style guidelines
  outputFormat?: string[]; // structural guidance
  examples?: string[]; // optional few-shot examples
  context?: string; // background info
}

const defaultConfig: Required<Pick<PromptConfig, "promptVersion" | "role">> = {
  promptVersion: "v1",
  role: "an assistant that summarizes emails and drafts replies",
};

function section(label: string, value?: string | string[]): string {
  if (!value || (Array.isArray(value) && value.length === 0)) return "";
  const body = Array.isArray(value) ? value.map((v) => `- ${v}`).join("\n") : value;
  return `${label}\n${body}`;
}

function buildCommonUserBlocks(
  config: PromptConfig | undefined,
  options: DraftOptions | undefined,
): string {
  const bulletsLimit = options?.maxSummaryBullets ?? 3;
  const includeActions = options?.includeActionItems ?? true;

  const constraints = [
    `Language: ${options?.language ?? "en"}`,
    `Tone: ${options?.tone ?? "neutral"}`,
    `Style: ${options?.style ?? "concise"}`,
    `Max summary bullets: ${bulletsLimit}`,
    includeActions ? "Include action items if explicit or strongly implied" : "Do not include action items",
    "Do not include quoted original text in replies",
  ];

  const output = [
    "Return JSON with keys:",
    "summary.gist (1–2 sentences)",
    "summary.bullets (max N terse bullets)",
    "summary.actionItems ([] if none)",
    "summary.sentiment (positive|neutral|negative)",
    "summary.confidence (0–1)",
    "draftReply.subject",
    "draftReply.body",
    "draftReply.quickReplies (0–3 short one-liners)",
  ];

  return [
    section("Your task is as follows:", config?.instruction ?? [
      "Summarize the email and propose a reply",
    ]),
    section("Ensure your response follows these rules:", [
      ...constraints,
      ...(config?.outputConstraints ?? []),
    ]),
    section("Follow these style and tone guidelines in your response:", config?.styleOrTone),
    section("Structure your response as follows:", config?.outputFormat ?? output),
    section("Here’s some background that may help you:", config?.context),
    section("Here are some examples to guide your response:", config?.examples),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function renderEmailBlock(subject?: string, body?: string, thread?: string[]): string {
  const threadBlock = thread && thread.length
    ? `\nThread context (newest last):\n${thread.map((m, i) => `[${i + 1}] ${m}`).join("\n")}`
    : "";
  return [
    `Email subject: ${subject ?? "(none)"}`,
    threadBlock,
    "Email body:\n\"\"\"",
    body?.trim() ?? "",
    "\"\"\"",
  ].join("\n");
}

export function buildSummarizePrompt(
  input: SummarizeEmailInput,
  cfg?: PromptConfig,
): ChatMessage[] {
  const config = { ...defaultConfig, ...(cfg ?? {}) };
  const system: ChatMessage = {
    role: "system",
    content: `You are ${config.role}. Prompt version: ${config.promptVersion}.`,
  };
  const userBody = [
    buildCommonUserBlocks(config, input.options),
    renderEmailBlock(input.subject, input.body, input.threadContext),
    "Now perform the task as instructed above.",
  ].join("\n\n");
  const user: ChatMessage = { role: "user", content: userBody };
  return [system, user];
}

export function buildDraftReplyPrompt(
  input: DraftReplyInput,
  cfg?: PromptConfig,
): ChatMessage[] {
  const config = { ...defaultConfig, ...(cfg ?? {}) };
  const system: ChatMessage = {
    role: "system",
    content: `You are ${config.role}. Prompt version: ${config.promptVersion}.`,
  };

  const summaryBlock = input.summary
    ? section("Precomputed summary:", [
        `gist: ${input.summary.gist}`,
        `bullets: ${input.summary.bullets.join("; ")}`,
        `actionItems: ${input.summary.actionItems.join("; ")}`,
        `sentiment: ${input.summary.sentiment ?? "neutral"}`,
      ])
    : "";

  const userBody = [
    buildCommonUserBlocks(config, input.options),
    summaryBlock,
    renderEmailBlock(input.subject, input.body, input.threadContext),
    "Now perform the task as instructed above.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const user: ChatMessage = { role: "user", content: userBody };
  return [system, user];
}


