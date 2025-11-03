#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

import { summarizeAndDraft } from "./index.js";

async function main(): Promise<void> {
  const subject = process.argv[2] || "";
  const bodyFile = process.argv[3];

  if (!bodyFile || !fs.existsSync(bodyFile)) {
    console.error("Usage: email-assistant \"Subject here\" /absolute/path/to/body.txt");
    process.exit(1);
  }

  const abs = path.resolve(bodyFile);
  const body = fs.readFileSync(abs, "utf8");

  try {
    const result = await summarizeAndDraft({ subject, body });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(String(err));
    process.exit(1);
  }
}

// Note: actual implementation is pending; summarizeAndDraft throws for now
main();


