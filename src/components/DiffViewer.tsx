import type { SpecChange } from "@/lib/diff";
import { SeverityBadge } from "./SeverityBadge";

export function DiffViewer({ changes }: { changes: SpecChange[] }) {
  if (changes.length === 0) {
    return (
      <div className="mono rounded-md border border-border bg-card p-4 text-xs text-muted-foreground">
        # no changes detected
      </div>
    );
  }
  return (
    <div className="mono divide-y divide-border rounded-md border border-border bg-card text-xs">
      {changes.map((c, i) => (
        <div key={i} className="grid grid-cols-[80px_1fr] gap-3 px-3 py-2">
          <div className="flex items-start">
            <SeverityBadge severity={c.severity} />
          </div>
          <div>
            <div className="text-muted-foreground">
              {c.endpoint} <span className="opacity-60">· {c.area}</span>
            </div>
            <div className="text-foreground">
              {c.kind === "field_renamed" ? (
                <>
                  <span className="sev-critical">- {c.from}</span>{" "}
                  <span className="sev-safe">+ {c.to}</span> ({c.detail})
                </>
              ) : c.kind === "field_removed" || c.kind === "endpoint_removed" ? (
                <span className="sev-critical">- {c.detail}</span>
              ) : c.kind === "field_added" || c.kind === "endpoint_added" ? (
                <span className="sev-safe">+ {c.detail}</span>
              ) : c.kind === "field_type_changed" ? (
                <span className="sev-warning">~ {c.detail}</span>
              ) : (
                <span>~ {c.detail}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}