import type { Endpoint, Field, ServiceSpec } from "@/data/specs";

export type Severity = "critical" | "warning" | "info" | "safe";

export interface SpecChange {
  kind:
    | "endpoint_removed"
    | "endpoint_added"
    | "field_removed"
    | "field_added"
    | "field_renamed"
    | "field_type_changed"
    | "field_required_added"
    | "field_required_removed";
  severity: Severity;
  endpoint: string; // "METHOD path"
  area: "request" | "response";
  field?: string;
  from?: string;
  to?: string;
  detail: string;
}

const epKey = (e: Endpoint) => `${e.method} ${e.path}`;

function diffFields(
  oldFields: Field[],
  newFields: Field[],
  endpoint: string,
  area: "request" | "response",
): SpecChange[] {
  const changes: SpecChange[] = [];
  const oldMap = new Map(oldFields.map((f) => [f.name, f]));
  const newMap = new Map(newFields.map((f) => [f.name, f]));

  // Detect renames heuristically: removed + added pair with same type and required.
  const removed = oldFields.filter((f) => !newMap.has(f.name));
  const added = newFields.filter((f) => !oldMap.has(f.name));
  const usedAdded = new Set<string>();

  for (const r of removed) {
    const match = added.find(
      (a) => !usedAdded.has(a.name) && a.type === r.type && a.required === r.required,
    );
    if (match) {
      usedAdded.add(match.name);
      changes.push({
        kind: "field_renamed",
        severity: area === "response" ? "critical" : "warning",
        endpoint,
        area,
        field: r.name,
        from: r.name,
        to: match.name,
        detail: `${area} field "${r.name}" appears renamed to "${match.name}"`,
      });
    } else {
      changes.push({
        kind: "field_removed",
        severity: "critical",
        endpoint,
        area,
        field: r.name,
        detail: `${area} field "${r.name}" was removed`,
      });
    }
  }

  for (const a of added) {
    if (usedAdded.has(a.name)) continue;
    const severity: Severity =
      area === "request" && a.required ? "critical" : "safe";
    changes.push({
      kind: "field_added",
      severity,
      endpoint,
      area,
      field: a.name,
      detail:
        area === "request" && a.required
          ? `New REQUIRED request field "${a.name}" — existing callers will fail validation`
          : `Field "${a.name}" added (${a.required ? "required" : "optional"})`,
    });
  }

  // Modified
  for (const [name, oldF] of oldMap) {
    const newF = newMap.get(name);
    if (!newF) continue;
    if (newF.type !== oldF.type) {
      changes.push({
        kind: "field_type_changed",
        severity: "critical",
        endpoint,
        area,
        field: name,
        from: oldF.type,
        to: newF.type,
        detail: `Type of "${name}" changed ${oldF.type} → ${newF.type}`,
      });
    }
    if (!oldF.required && newF.required) {
      changes.push({
        kind: "field_required_added",
        severity: area === "request" ? "critical" : "warning",
        endpoint,
        area,
        field: name,
        detail: `"${name}" became required`,
      });
    } else if (oldF.required && !newF.required) {
      changes.push({
        kind: "field_required_removed",
        severity: "info",
        endpoint,
        area,
        field: name,
        detail: `"${name}" became optional`,
      });
    }
  }

  return changes;
}

export function diffSpecs(oldSpec: ServiceSpec, newSpec: ServiceSpec): SpecChange[] {
  const changes: SpecChange[] = [];
  const oldEps = new Map(oldSpec.endpoints.map((e) => [epKey(e), e]));
  const newEps = new Map(newSpec.endpoints.map((e) => [epKey(e), e]));

  for (const [k, e] of oldEps) {
    if (!newEps.has(k)) {
      changes.push({
        kind: "endpoint_removed",
        severity: "critical",
        endpoint: k,
        area: "response",
        detail: `Endpoint ${k} was removed`,
      });
    } else {
      const nE = newEps.get(k)!;
      changes.push(...diffFields(e.request ?? [], nE.request ?? [], k, "request"));
      changes.push(...diffFields(e.response, nE.response, k, "response"));
    }
  }

  for (const [k] of newEps) {
    if (!oldEps.has(k)) {
      changes.push({
        kind: "endpoint_added",
        severity: "safe",
        endpoint: k,
        area: "response",
        detail: `New endpoint ${k} added`,
      });
    }
  }

  return changes;
}

export function overallSeverity(changes: SpecChange[]): Severity {
  if (changes.some((c) => c.severity === "critical")) return "critical";
  if (changes.some((c) => c.severity === "warning")) return "warning";
  if (changes.some((c) => c.severity === "info")) return "info";
  return "safe";
}