import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  GitBranch,
  Github,
  Network,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { DependencyGraph } from "@/components/DependencyGraph";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "contract.io — AI API Contract Validator" },
      {
        name: "description",
        content:
          "Catch breaking API changes across microservices before they ship. Visual dependency graph, deterministic diff engine and AI-explained blast radius — built by Shwetank Singh.",
      },
      { property: "og:title", content: "contract.io — AI API Contract Validator" },
      {
        property: "og:description",
        content:
          "Detect breaking API changes, visualize the dependency graph and get AI-explained blast radius before anything hits prod.",
      },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="space-y-20">
      {/* HERO */}
      <section className="relative pt-8 md:pt-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--severity-safe)_18%,transparent)_0%,transparent_60%)]" />
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <div className="mono inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary glow-primary" />
              portfolio project · built with lovable ai
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Catch breaking API changes{" "}
              <span className="sev-safe">before they ship.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              <span className="text-foreground">contract.io</span> diffs OpenAPI specs
              across microservices, traces the blast radius through your dependency
              graph and uses AI to explain who breaks, why, and how to roll it out
              safely.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/simulate"
                className="glow-primary inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Zap className="h-4 w-4" />
                Try the live demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <Network className="h-4 w-4" />
                See the dashboard
              </Link>
              <a
                href="https://github.com/Shwetankkk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
            <div className="mono mt-6 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span>react 19</span>
              <span>· tanstack start</span>
              <span>· react flow</span>
              <span>· lovable ai (gemini)</span>
              <span>· tailwind v4</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-2xl bg-[color:var(--severity-safe)]/10 blur-2xl" />
            <div className="rounded-xl border border-border bg-card/60 p-3 shadow-2xl">
              <div className="mono mb-2 flex items-center gap-1.5 px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-[color:var(--severity-critical)]" />
                <span className="h-2 w-2 rounded-full bg-[color:var(--severity-warning)]" />
                <span className="h-2 w-2 rounded-full bg-[color:var(--severity-safe)]" />
                <span className="ml-2">service dependency graph · live</span>
              </div>
              <DependencyGraph height={360} />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IT DOES */}
      <section>
        <div className="mono text-[11px] uppercase tracking-wider text-muted-foreground">
          what it does
        </div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Three things, in one pipeline.
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<GitBranch className="h-4 w-4" />}
            title="Deterministic diff engine"
            body="Detects renames, type changes, removed endpoints and newly required fields. Each change gets a severity grade — critical, warning, info, safe."
          />
          <FeatureCard
            icon={<Network className="h-4 w-4" />}
            title="Dependency graph + blast radius"
            body="Visualizes which services depend on which endpoints, then traces a breaking change downstream so you see exactly who breaks before merging."
          />
          <FeatureCard
            icon={<Sparkles className="h-4 w-4" />}
            title="AI-written SRE report"
            body="Lovable AI turns the diff + graph into a plain-English blast-radius brief: who is impacted, user-facing risk, and a phased rollout plan."
          />
        </div>
      </section>

      {/* WHY I BUILT THIS */}
      <section className="rounded-xl border border-border bg-card/40 p-6 md:p-10">
        <div className="mono text-[11px] uppercase tracking-wider text-muted-foreground">
          # ./why-i-built-this
        </div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          A real tool, built end-to-end with AI.
        </h2>
        <div className="mt-4 grid gap-6 text-sm text-muted-foreground md:grid-cols-2 md:text-base">
          <p>
            I built <span className="text-foreground">contract.io</span> to see how far
            you can take an application built purely with AI — from blank canvas to a
            shippable product. The brief was a Python/FastAPI tool; I adapted it to
            React + TanStack Start so it runs natively on the web with zero infra.
          </p>
          <p>
            The diff engine, blast-radius algorithm, dependency graph and AI report
            pipeline are all here — no mocks behind the curtain. You can paste your
            own OpenAPI specs into the{" "}
            <Link to="/simulate" className="text-foreground underline-offset-4 hover:underline">
              Simulate
            </Link>{" "}
            page and watch it run on your data.
          </p>
        </div>
        <div className="mono mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="text-foreground">— Shwetank Singh</span>
          <a
            href="https://www.linkedin.com/in/iamshwetanksingh/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            linkedin.com/in/iamshwetanksingh
          </a>
          <a
            href="https://github.com/Shwetankkk"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            github.com/Shwetankkk
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <ShieldCheck className="mx-auto h-8 w-8 sev-safe" />
        <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
          Try it on your own API.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Paste two versions of an OpenAPI spec and get the diff + AI blast-radius
          report in seconds. No signup, no install.
        </p>
        <Link
          to="/simulate"
          className="glow-primary mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Zap className="h-4 w-4" />
          Open the simulator
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 sev-safe">
        {icon}
      </div>
      <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
