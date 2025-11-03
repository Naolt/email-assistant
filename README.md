# Email Assistant (Summary + Draft Reply)

A small TypeScript tool that:
- Summarizes an email (gist, key bullets, optional action items)
- Drafts a suggested reply (subject + body)
- Supports both cloud models (Gemini) and local models (Ollama)

## Features

- **Multi-provider support**: Works with Gemini API and local Ollama models
- **Intelligent fallback**: Uses structured output when available, falls back to JSON prompting for smaller models
- **Small model optimization**: Tested with sub-1GB models like LiquidAI LFM2:700m
- **Type-safe**: Full TypeScript with Zod validation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment (`.env`):
```env
MODEL_PROVIDER=ollama
OLLAMA_MODEL=sam860/LFM2:700m
OLLAMA_HOST=http://localhost:11434
GEMINI_MODEL=gemini-2.5-pro
GOOGLE_API_KEY=your_api_key_here
```

3. For Ollama models, make sure Ollama is running:
```bash
ollama serve
```

## Project Layout

- `src/index.ts`: Core functions (`summarizeEmail`, `draftReply`, `summarizeAndDraft`)
- `src/models.ts`: Model provider configuration (Ollama/Gemini)
- `src/config.ts`: Environment configuration
- `examples/`: Demo scripts
- `tsconfig.json`, `.eslintrc.cjs`, `.prettierrc.json`: Tooling config

## Scripts

- `dev`: Run the CLI with ts-node (requires deps installed)
- `build`: Bundle with tsup (outputs CJS + ESM + d.ts)
- `lint`: Run ESLint
- `format`: Run Prettier

## Example Scripts

### Basic Demo
Run the basic email summarization and reply draft demo:
```bash
npx tsx examples/summarize-demo.ts
```

### Model Comparison
Compare different Ollama models (Qwen 2.5:0.5b vs LiquidAI LFM2:700m):
```bash
npx tsx examples/compare-models.ts
```

This will test both models on:
- Simple text generation
- Email summarization (plain text)
- JSON format compliance
- Draft reply generation

See [MODEL_COMPARISON.md](MODEL_COMPARISON.md) for detailed benchmark results.

### Test Specific Model
Test a specific model without structured output:
```bash
npx tsx examples/test-lfm2.ts
```

## Supported Models

### Cloud Models
- **Gemini 2.5 Pro** (via Google AI API)

### Local Models (Ollama)
Tested and working:
- **LiquidAI LFM2:700m** (791 MB) - Best quality/size ratio, recommended
- **Qwen 2.5:0.5b** (397 MB) - Very small but limited comprehension

Pull models with:
```bash
ollama pull sam860/LFM2:700m
ollama pull qwen2.5:0.5b
```




