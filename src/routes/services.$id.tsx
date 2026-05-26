import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SERVICES_V1, type ServiceCall, type ServiceSpec } from "@/data/specs";
import { EndpointTable } from "@/components/EndpointTable";
import { DependencyGraph } from "@/components/DependencyGraph";

export const Route = createFileRoute("/services/$id")({
  loader: ({ params }) => {
    const service = SERVICES_V1.find((s) => s.id === params.id);
    if (!service) throw notFound();
    return { service };
  },
  notFoundComponent: () => (
    <div className="mono text-sm text-muted-foreground">
      # service not found
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mono text-sm sev-critical">! {error.message}</div>
  ),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { service } = Route.useLoaderData() as { service: ServiceSpec };
  const callers = SERVICES_V1.filter((s) =>
    s.calls.some((c) => c.service === service.id),
  );
  return (
    <div className="space-y-6">
      <Link
        to="/services"
        className="mono inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> all services
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {service.id} · v{service.version}
          </div>
          <h1 className="mt-1 text-2xl font-semibold">{service.name}</h1>
          <p className="text-sm text-muted-foreground">{service.description}</p>
        </div>
        <Link
          to="/simulate"
          search={{ service: service.id }}
          className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs hover:bg-secondary/80"
        >
          Simulate a change
        </Link>
      </header>

      <section>
        <h2 className="mono mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          endpoints
        </h2>
        <EndpointTable endpoints={service.endpoints} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mono mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            this service calls
          </h2>
          <ul className="mono space-y-1 rounded-md border border-border bg-card p-3 text-xs">
            {service.calls.length === 0 && (
              <li className="text-muted-foreground">— no outbound deps</li>
            )}
            {service.calls.map((c: ServiceCall, i: number) => (
              <li key={i}>
                <span className="sev-safe">{c.service}</span>{" "}
                <span className="text-muted-foreground">{c.endpoint}</span>{" "}
                <span className="text-muted-foreground">
                  · reads [{c.consumes.join(", ")}]
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mono mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            services that call this
          </h2>
          <ul className="mono space-y-1 rounded-md border border-border bg-card p-3 text-xs">
            {callers.length === 0 && (
              <li className="text-muted-foreground">— no callers</li>
            )}
            {callers.map((s) => (
              <li key={s.id}>
                <Link to="/services/$id" params={{ id: s.id }} className="sev-info hover:underline">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="mono mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          position in the dependency graph
        </h2>
        <DependencyGraph changedService={service.id} height={360} />
      </section>
    </div>
  );
}