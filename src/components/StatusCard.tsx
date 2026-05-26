import { Link } from "@tanstack/react-router";
import type { ServiceSpec } from "@/data/specs";

export function StatusCard({
  service,
  state,
  reason,
}: {
  service: ServiceSpec;
  state: "ok" | "warning" | "critical";
  reason?: string;
}) {
  const cls =
    state === "critical"
      ? "bg-sev-critical sev-critical"
      : state === "warning"
        ? "bg-sev-warning sev-warning"
        : "bg-sev-safe sev-safe";
  const dotCls =
    state === "critical"
      ? "bg-[var(--severity-critical)]"
      : state === "warning"
        ? "bg-[var(--severity-warning)]"
        : "bg-[var(--severity-safe)]";
  return (
    <Link
      to="/services/$id"
      params={{ id: service.id }}
      className={`group block rounded-lg border p-4 transition-colors hover:bg-secondary/40 ${cls}`}
    >
      <div className="flex items-center justify-between">
        <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {service.id}
        </div>
        <span className={`h-2 w-2 rounded-full ${dotCls}`} />
      </div>
      <div className="mt-1 text-base font-semibold text-foreground">{service.name}</div>
      <div className="mono text-[11px] text-muted-foreground">v{service.version}</div>
      <div className="mt-3 mono text-[11px] leading-snug">
        {reason ?? `${service.endpoints.length} endpoints · ${service.calls.length} deps`}
      </div>
    </Link>
  );
}