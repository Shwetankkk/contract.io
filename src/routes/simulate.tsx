import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Zap } from "lucide-react";
import { z } from "zod";
import { SCENARIOS, SERVICES_V1, type ServiceSpec } from "@/data/specs";
import { diffSpecs, overallSeverity } from "@/lib/diff";
import { computeBlastRadius } from "@/lib/graph";
import { validateChange } from "@/lib/validate.functions";
import { DependencyGraph } from "@/components/DependencyGraph";
import { DiffViewer } from "@/components/DiffViewer";
import { AIReportCard } from "@/components/AIReportCard";
import { SeverityBadge } from "@/components/SeverityBadge";

const SearchSchema = z.object({ service: z.string().optional() });

export const Route = createFileRoute("/simulate")({
  validateSearch: SearchSchema,
  head: () => ({
    meta: [
      { title: "Simulate — contract.io" },
      {
        name: "description",
        content: "Run a breaking-change scenario and watch the AI explain the blast radius live.",
      },
    ],
  }),
  component: SimulatePage,
});

function SimulatePage() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const runFn = useServerFn(validateChange);

  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof runFn>[0]) => runFn(input),
  });

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const oldSpec = SERVICES_V1.find((s) => s.id === scenario.service)! as ServiceSpec;
  const newSpec = useMemo(() => scenario.mutate(oldSpec), [scenario, oldSpec]);
  const changes = useMemo(() => diffSpecs(oldSpec, newSpec), [oldSpec, newSpec]);
  const sev = overallSeverity(changes);
  const impacted = useMemo(
    () => computeBlastRadius(SERVICES_V1, scenario.service, changes),
    [scenario, changes],
  );

  const broken = impacted.map((i) => i.serviceId);
  const highlights = impacted.map((i) => ({ from: i.serviceId, to: scenario.service }));

  const run = () => {
    mutation.mutate({
      data: {
        service: { id: oldSpec.id, name: oldSpec.name, version: oldSpec.version },
        newVersion: newSpec.version,
        changes,
        impacted,
      },
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="mono text-[11px] uppercase tracking-wider text-muted-foreground">
          simulate breaking change
        </div>
        <h1 className="mt-1 text-2xl font-semibold">
          Pick a scenario · diff is instant · AI explains the blast radius
        </h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((s) => {
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id}
              onClick={() => setScenarioId(s.id)}
              className={`rounded-md border p-3 text-left transition-colors ${
                active
                  ? "border-[color:var(--severity-safe)] bg-secondary/60"
                  : "border-border bg-card hover:bg-secondary/40"
              }`}
            >
              <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.service}
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">{s.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.description}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={run}
          disabled={mutation.isPending}
          className="glow-primary inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          {mutation.isPending ? "Validating…" : "Run AI validation"}
        </button>
        <div className="mono text-xs text-muted-foreground">
          deterministic diff:{" "}
          <span className="text-foreground">{changes.length} change(s)</span> ·{" "}
          impacted services:{" "}
          <span className="text-foreground">{impacted.length}</span>
        </div>
        <SeverityBadge severity={sev} />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mono mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            spec diff · {oldSpec.version} → {newSpec.version}
          </h2>
          <DiffViewer changes={changes} />
        </div>
        <div>
          <h2 className="mono mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            blast radius on the graph
          </h2>
          <DependencyGraph
            changedService={scenario.service}
            brokenServices={broken}
            highlightEdges={highlights}
            height={360}
          />
        </div>
      </section>

      <section>
        <h2 className="mono mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          downstream impact
        </h2>
        {impacted.length === 0 ? (
          <div className="mono rounded-md border border-border bg-card p-4 text-xs text-muted-foreground">
            # no downstream consumers affected by this change
          </div>
        ) : (
          <ul className="mono divide-y divide-border rounded-md border border-border bg-card text-xs">
            {impacted.map((i, idx) => (
              <li key={idx} className="px-3 py-2">
                <span className="sev-critical">{i.serviceId}</span>{" "}
                <span className="text-muted-foreground">→ {i.endpoint}</span>
                <div className="text-foreground">
                  broken fields: [{i.brokenFields.join(", ")}]
                </div>
                <div className="text-muted-foreground">{i.reason}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <AIReportCard report={mutation.data} loading={mutation.isPending} />
      </section>
    </div>
  );
}