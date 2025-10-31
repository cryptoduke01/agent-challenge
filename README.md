# Sentra — AI Code Guardian
Built for the Nosana Builders Challenge — Agents 102

![Sentra](./assets/NosanaBuildersChallenge03.jpg)

## Overview

Sentra is a production-ready AI Code Guardian that analyzes code for security risks, performance bottlenecks, documentation gaps, and generates an exportable report. It combines a Mastra-powered agent, MCP resources, and a responsive Next.js UI — packaged for deployment on the Nosana network.

## Features

- Security scanning for common vulnerabilities and unsafe patterns
- Performance analysis (complexity hotspots, inefficient code paths)
- Documentation insights and auto-suggested comments
- Consolidated report generation with prioritized recommendations
- Real-time, reactive UI with sessioned analysis and export

## Architecture

- Mastra Agent: `src/mastra/agents/codeguardian-agent.ts`
- Tools: `src/mastra/tools/*`
  - Code Analyzer, Security Scanner, Performance Optimizer,
    Documentation Generator, Report Generator, Repository Connector
- MCP Integration: `src/mastra/mcp`
- API Routes: `src/app/api`
- UI: `src/components`, pages in `src/app`
- Shared types/utils: `src/lib`

## MCP Tools Implemented

- Code Analyzer — AST/heuristic checks for complexity and hotspots
- Security Scanner — unsafe APIs, insecure patterns
- Performance Optimizer — duplicated work, unnecessary sync/await, heavy loops
- Documentation Generator — missing comments, naming clarity suggestions
- Report Generator — aggregates results into a single report
- Repository Connector — groundwork for repo-based analysis

## Local Development

Prerequisites: Node 18+, pnpm

```bash
pnpm install

# Terminal 1
pnpm run dev:agent

# Terminal 2
pnpm run dev:ui
```

App: http://localhost:3000
Mastra Playground: http://localhost:4111

Env (optional example):
```env
OLLAMA_API_URL=https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnjakkybnxbw.node.k8s.prd.nos.ci/api
MODEL_NAME_AT_ENDPOINT=qwen3:8b
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🛠 Build & Run (Production)

```bash
pnpm build
pnpm start
```

## Docker

```bash
# Build and run locally
docker build -t dukedotsol/sentra-ai:latest .
docker run -d -p 3000:3000 --name sentra-test dukedotsol/sentra-ai:latest

# Push
docker push dukedotsol/sentra-ai:latest
```

## Deploy to Nosana

- Image: `dukedotsol/sentra-ai:latest`
- Job file: `nosana-job.json`

CLI example:
```bash
nosana job post --file ./nosana-job.json --market nvidia-3090 --timeout 30
```

Health check: GET `/` on port 3000

## Screenshots

- Dashboard showing analysis results, recommendations, and export.
- Optional: architecture diagram (Mastra ↔ MCP ↔ Next.js ↔ Docker/Nosana).

## Tech Stack

- Next.js, React, TypeScript, Tailwind
- Mastra (agent framework), MCP
- Docker, Nosana

## Roadmap

- Git repository ingestion and branch/file selection
- Inline fix suggestions with diffs
- Model selection via MCP param
- Specialized multi-agent roles (security, performance, docs)

## License

MIT
