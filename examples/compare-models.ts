import { ChatOllama } from "@langchain/ollama";

const MODELS = [
  { name: "qwen2.5:0.5b", size: "397MB" },
  { name: "sam860/LFM2:700m", size: "791MB" },
];

async function testModel(modelName: string): Promise<void> {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`Testing: ${modelName}`);
  console.log(`${"=".repeat(80)}\n`);

  const model = new ChatOllama({
    model: modelName,
    temperature: 0.2,
    baseUrl: "http://localhost:11434",
  });

  // Test 1: Simple generation
  console.log("--- Test 1: Simple Text Generation ---");
  try {
    const start1 = Date.now();
    const response1 = await model.invoke("Hello! Can you introduce yourself in one sentence?");
    const time1 = Date.now() - start1;
    console.log(`Response (${time1}ms):`, response1.content);
  } catch (err: any) {
    console.error("Test 1 failed:", err.message);
  }

  // Test 2: Email summarization (without structured output)
  console.log("\n--- Test 2: Email Summarization (Plain Text) ---");
  try {
    const start2 = Date.now();
    const emailPrompt = `Please summarize this email in a concise way:

Subject: SDK integration timeline

Body:
Hi Naol,

Following up on last week's demo. We'd like a timeline and estimate for integrating your SDK.
We need SSO (Okta) and webhook retries. Can you meet Thursday or Friday?

Best,
Alex

Please provide:
1. A one-sentence summary
2. Key points (bullet points)
3. Action items needed`;

    const response2 = await model.invoke(emailPrompt);
    const time2 = Date.now() - start2;
    console.log(`Response (${time2}ms):\n${response2.content}`);
  } catch (err: any) {
    console.error("Test 2 failed:", err.message);
  }

  // Test 3: JSON output request (without tools)
  console.log("\n--- Test 3: Requesting JSON Format ---");
  try {
    const start3 = Date.now();
    const jsonPrompt = `Summarize this email and respond ONLY with valid JSON in this exact format:
{
  "gist": "one sentence summary",
  "bullets": ["point 1", "point 2"],
  "actionItems": ["action 1", "action 2"],
  "sentiment": "positive or neutral or negative"
}

Email:
Subject: SDK integration timeline
Body: Hi Naol, Following up on last week's demo. We'd like a timeline and estimate for integrating your SDK. We need SSO (Okta) and webhook retries. Can you meet Thursday or Friday? Best, Alex

Respond with ONLY the JSON, no other text:`;

    const response3 = await model.invoke(jsonPrompt);
    const time3 = Date.now() - start3;
    console.log(`Raw response (${time3}ms):\n${response3.content}\n`);

    // Try to parse it
    try {
      let content = response3.content as string;
      // Clean up markdown code blocks if present
      content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(content);
      console.log("✅ Successfully parsed JSON:");
      console.log(JSON.stringify(parsed, null, 2));
    } catch (parseErr) {
      console.log("❌ Failed to parse as JSON - model didn't follow format correctly");
    }
  } catch (err: any) {
    console.error("Test 3 failed:", err.message);
  }

  // Test 4: Draft reply in JSON format
  console.log("\n--- Test 4: Draft Reply (JSON Format) ---");
  try {
    const start4 = Date.now();
    const replyPrompt = `Draft a professional reply to this email and respond ONLY with valid JSON:

Original Email:
Subject: SDK integration timeline
Body: Hi Naol, Following up on last week's demo. We'd like a timeline and estimate for integrating your SDK. We need SSO (Okta) and webhook retries. Can you meet Thursday or Friday? Best, Alex

Respond with ONLY valid JSON in this exact format (no markdown, no other text):
{
  "draftReply": {
    "subject": "Re: subject line here",
    "body": "email body text here",
    "quickReplies": ["optional quick reply 1", "optional quick reply 2"]
  }
}`;

    const response4 = await model.invoke(replyPrompt);
    const time4 = Date.now() - start4;
    console.log(`Raw response (${time4}ms):\n${response4.content}\n`);

    // Try to parse it
    try {
      let content = response4.content as string;
      content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(content);
      console.log("✅ Successfully parsed JSON:");
      console.log(JSON.stringify(parsed, null, 2));
    } catch (parseErr) {
      console.log("❌ Failed to parse as JSON - model didn't follow format correctly");
    }
  } catch (err: any) {
    console.error("Test 4 failed:", err.message);
  }
}

async function runComparison(): Promise<void> {
  console.log("\n🔬 MODEL COMPARISON TEST");
  console.log("Testing models WITHOUT structured output enforcement");
  console.log("Using pure JSON prompt engineering\n");

  for (const model of MODELS) {
    await testModel(model.name);
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log("COMPARISON COMPLETE");
  console.log(`${"=".repeat(80)}\n`);
}

runComparison().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
