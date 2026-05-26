import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { SERVICES_V1 } from "@/data/specs";
import { buildEdges } from "@/lib/graph";
import { DependencyGraph } from "@/components/DependencyGraph";
import { StatusCard } from "@/components/StatusCard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — contract.io" },
      {
        name: "description",
        content:
          "Live overview of every microservice contract, dependency graph and CI guard status.",
      },
      { property: "og:title", content: "Dashboard — contract.io" },
      {
        property: "og:description",
        content: "Microservice contract health, dependency graph and CI guard at a glance.",
      },
      { property: "og:url", content: "/dashboard" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const edges = buildEdges(SERVICES_V1);
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mono text-[11px] uppercase tracking-wider text-muted-foreground">
            contract health overview
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            All systems green.{" "}
            <span className="text-muted-foreground">No breaking changes detected.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            contract.io watches every API across your microservices, diffs new versions
            against live consumers, and uses AI to explain the blast radius before
            anything ships.
          </p>
        </div>
        <Link
          to="/simulate"
          className="glow-primary inline-flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Zap className="h-4 w-4" />
          Simulate breaking change
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {SERVICES_V1.map((s) => (
          <StatusCard key={s.id} service={s} state="ok" />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="mono text-[11px] uppercase tracking-wider text-muted-foreground">
              service dependency graph
            </div>
            <div className="mono flex items-center gap-3 text-[10px] text-muted-foreground">
              <Legend color="var(--severity-safe)" label="ok" />
              <Legend color="var(--severity-warning)" label="changed" />
              <Legend color="var(--severity-critical)" label="broken" />
            </div>
          </div>
          <DependencyGraph />
        </div>
        <div className="space-y-3">
          <Stat label="Services" value={SERVICES_V1.length} />
          <Stat
            label="Endpoints"
            value={SERVICES_V1.reduce((n, s) => n + s.endpoints.length, 0)}
          />
          <Stat label="Cross-service deps" value={edges.length} />
          <div className="rounded-md border border-border bg-card p-4 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 sev-safe" />
              <span className="font-medium">CI guard active</span>
            </div>
            <p className="mono mt-2 text-[11px] leading-snug text-muted-foreground">
              # .github/workflows/contracts.yml{"\n"}- run: contractio validate ./openapi/*.yaml{"\n"}
              # blocks PRs with critical diffs
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}