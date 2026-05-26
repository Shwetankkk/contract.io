import { Brain, Loader2 } from "lucide-react";
import type { AIReport } from "@/lib/validate.functions";
import { SeverityBadge } from "./SeverityBadge";

export function AIReportCard({
  report,
  loading,
}: {
  report?: AIReport;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-md border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin sev-safe" />
          AI is reasoning over the dependency graph…
        </div>
      </div>
    );
  }
  if (!report) return null;
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 sev-safe" />
          <div className="text-sm font-semibold">AI Impact Report</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="mono text-[10px] text-muted-foreground">
            confidence {(report.confidence * 100).toFixed(0)}%
          </span>
          <SeverityBadge severity={report.severity} />
        </div>
      </div>
      <div className="grid gap-4 p-4 text-sm md:grid-cols-2">
        <Section title="Blast radius" body={report.blastRadius} />
        <Section title="User impact" body={report.userImpact} />
        <Section title="Recommended fix" body={report.fix} />
        <Section title="Safe rollout plan" body={report.rollout} />
      </div>
      {report.error && (
        <div className="mono border-t border-border px-4 py-2 text-[11px] sev-warning">
          note: {report.error}
        </div>
      )}
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="mt-1 whitespace-pre-wrap leading-relaxed text-foreground">
        {body || "—"}
      </div>
    </div>
  );
}