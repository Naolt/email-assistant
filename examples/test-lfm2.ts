import { ChatOllama } from "@langchain/ollama";

async function testLFM2(): Promise<void> {
  console.log("Testing LiquidAI LFM2:700m model...\n");

  const model = new ChatOllama({
    model: "sam860/LFM2:700m",
    temperature: 0.2,
    baseUrl: "http://localhost:11434",
  });

  // Test 1: Simple generation
  console.log("=== Test 1: Simple Text Generation ===");
  try {
    const response1 = await model.invoke("Hello! Can you introduce yourself?");
    console.log("Response:", response1.content);
    console.log("\n");
  } catch (err) {
    console.error("Test 1 failed:", err);
  }

  // Test 2: Email summarization (without structured output)
  console.log("=== Test 2: Email Summarization (Plain Text) ===");
  try {
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
    console.log("Response:", response2.content);
    console.log("\n");
  } catch (err) {
    console.error("Test 2 failed:", err);
  }

  // Test 3: JSON output request (without tools)
  console.log("=== Test 3: Requesting JSON Format ===");
  try {
    const jsonPrompt = `Summarize this email and respond ONLY with valid JSON in this exact format:
{
  "gist": "one sentence summary",
  "bullets": ["point 1", "point 2"],
  "actionItems": ["action 1", "action 2"]
}

Email:
Subject: SDK integration timeline
Body: Hi Naol, Following up on last week's demo. We'd like a timeline and estimate for integrating your SDK. We need SSO (Okta) and webhook retries. Can you meet Thursday or Friday? Best, Alex

Respond with ONLY the JSON, no other text:`;

    const response3 = await model.invoke(jsonPrompt);
    console.log("Raw response:", response3.content);

    // Try to parse it
    try {
      const parsed = JSON.parse(response3.content as string);
      console.log("\nParsed JSON:", JSON.stringify(parsed, null, 2));
    } catch (parseErr) {
      console.log("\nFailed to parse as JSON - model didn't follow format");
    }
  } catch (err) {
    console.error("Test 3 failed:", err);
  }
}

testLFM2().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
