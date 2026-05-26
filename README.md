# contract.io

An AI-powered API contract diffing and blast-radius analyzer. Paste two versions of an OpenAPI spec and instantly see what broke, what's safe, and which downstream services are at risk — explained in plain English by Gemini.

> Built as a portfolio project to explore how far you can take an app built **purely with AI** (Lovable + Gemini), end to end.

**Live demo:** _add your published URL here_

---

## Why

Every backend team eventually hits the same wall: someone ships a "small" change to an API contract and three downstream services break in production. Existing tools (oasdiff, optic, Bump) handle the diff, but the *"so what?"* still lands on a human at 2am.

contract.io tries to answer the "so what?" automatically:

1. **Deterministic diff engine** — parses two OpenAPI 3.x specs, classifies every change (endpoint added/removed, field renamed/typed, required flipped, etc.) and tags severity.
2. **Dependency graph** — visualizes which services consume which endpoints using React Flow.
3. **AI blast-radius report** — Gemini reads the diff + graph and writes a human report: who breaks, how bad, what to do.

## Stack

- **React 19** + **TanStack Start** (file-based routing, server functions, SSR)
- **Vite 7** + **Tailwind v4** + **shadcn/ui**
- **React Flow** for the dependency graph
- **Lovable AI Gateway** → **Google Gemini** for the blast-radius reports
- **Lovable Cloud** (Supabase under the hood) for persistence
- Deployed to **Cloudflare Workers**

## Try it on your own API

Head to `/simulate` and paste any OpenAPI 3.x JSON into the two boxes. Tweak the second one and hit compare to see the diff + AI report run against your real contract. No signup, nothing stored.

```bash
# example: grab the petstore spec to play with
curl https://petstore3.swagger.io/api/v3/openapi.json
```

## Run locally

```bash
bun install
bun run dev
```

Then open http://localhost:5173.

## Project structure

```text
src/
  routes/          # TanStack Start file-based routes (/, /dashboard, /simulate, /services)
  components/      # UI: DiffViewer, DependencyGraph, AIReportCard, OpenApiCompare, ...
  lib/
    diff.ts            # deterministic OpenAPI diff engine
    graph.ts           # dependency graph builder
    openapi-import.ts  # OpenAPI 3.x -> internal ServiceSpec parser
    validate.functions.ts  # server function calling Gemini via Lovable AI
  data/specs.ts    # built-in demo specs
```

## License

[MIT](./LICENSE) — use it, fork it, learn from it.

## Author

**Shwetank Singh** — [LinkedIn](https://www.linkedin.com/in/iamshwetanksingh/) · [GitHub](https://github.com/Shwetankkk)