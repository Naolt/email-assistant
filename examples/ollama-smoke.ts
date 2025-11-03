import { getModel } from "../src/models.ts";
import { z } from "zod";

async function run(): Promise<void> {
  const llm: any = getModel();

  const cases = [
    {
      label: "math",
      prompt: "Return JSON {\"answer\": number}. What is 2 + 2?",
      schema: z.object({ answer: z.number() }),
    },
    {
      label: "definition",
      prompt: "Return JSON {\"definition\": string}. In one sentence, what is an API?",
      schema: z.object({ definition: z.string() }),
    },
    {
      label: "colors",
      prompt: "Return JSON {\"colors\": string[]}. List three colors.",
      schema: z.object({ colors: z.array(z.string()) }),
    },
  ] as const;

  for (const c of cases) {
    const maybeStructured = llm.withStructuredOutput?.(c.schema);
    if (maybeStructured) {
      const parsed = await maybeStructured.invoke(c.prompt);
      console.log(`\n[structured:${c.label}]`, JSON.stringify(parsed, null, 2));
      continue;
    }
    const res = await llm.invoke(c.prompt);
    const text = typeof res === "string" ? res : JSON.stringify(res);
    console.log(`\n[raw:${c.label}]`, text);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


