import { summarizeEmail, draftReply, summarizeAndDraft } from "../src/index.ts";

async function run(): Promise<void> {
  const base = {
    subject: "SDK integration timeline",
    body: [
      "Hi Naol,",
      "",
      "Following up on last week’s demo. We’d like a timeline and estimate for integrating your SDK.",
      "We need SSO (Okta) and webhook retries. Can you meet Thursday or Friday?",
      "",
      "Best,",
      "Alex",
    ].join("\n"),
  } as const;

  const summary = await summarizeEmail({
    ...base,
    subject: "SDK integration timeline",
    options: {
      language: "en",
      tone: "neutral",
      style: "concise",
      maxSummaryBullets: 3,
      includeActionItems: true,
    },
  });

  console.log("\n=== Summary ===\n" + JSON.stringify(summary, null, 2));

  const reply = await draftReply({
    ...base,
    summary,
    options: { language: "en", tone: "neutral", style: "concise" },
  });

  console.log("\n=== Draft Reply ===\n" + JSON.stringify(reply, null, 2));

  const both = await summarizeAndDraft({
    ...base,
    options: { language: "en", tone: "neutral", style: "concise" },
  });

  console.log("\n=== Summarize + Draft ===\n" + JSON.stringify(both, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


