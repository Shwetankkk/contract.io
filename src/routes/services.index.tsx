import { createFileRoute } from "@tanstack/react-router";
import { SERVICES_V1 } from "@/data/specs";
import { StatusCard } from "@/components/StatusCard";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — contract.io" },
      { name: "description", content: "All registered microservices and their contract health." },
    ],
  }),
  component: ServicesList,
});

function ServicesList() {
  return (
    <div className="space-y-6">
      <div>
        <div className="mono text-[11px] uppercase tracking-wider text-muted-foreground">
          services
        </div>
        <h1 className="mt-1 text-2xl font-semibold">Registered services</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES_V1.map((s) => (
          <StatusCard key={s.id} service={s} state="ok" />
        ))}
      </div>
    </div>
  );
}