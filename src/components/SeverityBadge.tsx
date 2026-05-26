import type { Severity } from "@/lib/diff";

const LABEL: Record<Severity, string> = {
  critical: "CRITICAL",
  warning: "WARNING",
  info: "INFO",
  safe: "SAFE",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`mono inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-sev-${severity} sev-${severity}`}
    >
      {LABEL[severity]}
    </span>
  );
}