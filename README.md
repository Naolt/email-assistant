# Email Assistant (Summary + Draft Reply)

A small TypeScript tool that:
- Summarizes an email (gist, key bullets, optional action items)
- Drafts a suggested reply (subject + body)

## Status
Scaffolded. Implementation intentionally left blank for clarity; only types and entry points exist.

## Project layout
- `src/index.ts`: Public types and `summarizeAndDraft` function signature
- `src/cli.ts`: Minimal CLI wrapper (calls `summarizeAndDraft`)
- `tsconfig.json`, `.eslintrc.cjs`, `.prettierrc.json`: Tooling config

## Scripts
- `dev`: run the CLI with ts-node (requires deps installed)
- `build`: bundle with tsup (outputs CJS + ESM + d.ts)
- `lint`: run ESLint
- `format`: run Prettier

## Next steps
- Choose provider (OpenAI/Anthropic/Ollama) and implement `summarizeAndDraft`
- Add environment config handling (API keys)
- Add tests (Vitest) for shape/edge cases


