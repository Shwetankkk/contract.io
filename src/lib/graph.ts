import type { ServiceSpec } from "@/data/specs";
import type { SpecChange } from "@/lib/diff";

export interface DepEdge {
  from: string; // caller service id
  to: string; // target service id
  endpoint: string;
  consumes: string[];
}

export function buildEdges(services: ServiceSpec[]): DepEdge[] {
  const edges: DepEdge[] = [];
  for (const s of services) {
    for (const c of s.calls) {
      edges.push({ from: s.id, to: c.service, endpoint: c.endpoint, consumes: c.consumes });
    }
  }
  return edges;
}

export interface ImpactedService {
  serviceId: string;
  endpoint: string;
  brokenFields: string[];
  reason: string;
}

/**
 * Given changes to `targetServiceId`, find which callers are impacted.
 */
export function computeBlastRadius(
  services: ServiceSpec[],
  targetServiceId: string,
  changes: SpecChange[],
): ImpactedService[] {
  const impacted: ImpactedService[] = [];
  for (const s of services) {
    if (s.id === targetServiceId) continue;
    for (const call of s.calls) {
      if (call.service !== targetServiceId) continue;
      // collect relevant changes for this called endpoint
      const relevant = changes.filter((c) => c.endpoint === call.endpoint);
      if (relevant.length === 0) continue;
      const broken: string[] = [];
      const reasons: string[] = [];
      for (const ch of relevant) {
        if (ch.kind === "endpoint_removed") {
          broken.push("*entire endpoint*");
          reasons.push(`endpoint ${call.endpoint} removed`);
          continue;
        }
        if (ch.area !== "response") continue;
        if (ch.field && call.consumes.includes(ch.field)) {
          broken.push(ch.field);
          reasons.push(ch.detail);
        } else if (ch.kind === "field_renamed" && ch.from && call.consumes.includes(ch.from)) {
          broken.push(ch.from);
          reasons.push(ch.detail);
        }
      }
      if (broken.length > 0) {
        impacted.push({
          serviceId: s.id,
          endpoint: call.endpoint,
          brokenFields: broken,
          reason: reasons.join("; "),
        });
      }
    }
  }
  return impacted;
}