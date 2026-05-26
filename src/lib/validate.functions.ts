import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ChangeSchema = z.object({
  kind: z.string(),
  severity: z.enum(["critical", "warning", "info", "safe"]),
  endpoint: z.string(),
  area: z.enum(["request", "response"]),
  field: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  detail: z.string(),
});

const ImpactedSchema = z.object({
  serviceId: z.string(),
  endpoint: z.string(),
  brokenFields: z.array(z.string()),
  reason: z.string(),
});

const InputSchema = z.object({
  service: z.object({ id: z.string(), name: z.string(), version: z.string() }),
  newVersion: z.string(),
  changes: z.array(ChangeSchema),
  impacted: z.array(ImpactedSchema),
});

export interface AIReport {
  severity: "critical" | "warning" | "info" | "safe";
  confidence: number;
  blastRadius: string;
  userImpact: string;
  fix: string;
  rollout: string;
  error?: string;
}

export const validateChange = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<AIReport> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        severity: "info",
        confidence: 0,
        blastRadius: "AI is not configured.",
        userImpact: "Set LOVABLE_API_KEY to enable AI explanations.",
        fix: "",
        rollout: "",
        error: "missing_api_key",
      };
    }

    const prompt = `You are an SRE assistant reviewing an API contract change.

Service: ${data.service.name} (id: ${data.service.id})
Current version: ${data.service.version}  →  Proposed: ${data.newVersion}

Detected changes (from a deterministic diff engine):
${JSON.stringify(data.changes, null, 2)}

Impacted downstream callers (from dependency graph):
${JSON.stringify(data.impacted, null, 2)}

Produce a blast-radius report. Speak to a senior engineer. Be specific about which fields and services are affected. Do not invent services not listed above.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You are an expert backend / SRE assistant. You output strict JSON via the provided tool. Be terse, technical, and concrete.",
            },
            { role: "user", content: prompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "emit_report",
                description: "Emit the blast radius report.",
                parameters: {
                  type: "object",
                  properties: {
                    severity: {
                      type: "string",
                      enum: ["critical", "warning", "info", "safe"],
                    },
                    confidence: {
                      type: "number",
                      description: "0..1 confidence in this assessment",
                    },
                    blastRadius: {
                      type: "string",
                      description:
                        "1-3 sentences naming which services and fields break and why.",
                    },
                    userImpact: {
                      type: "string",
                      description: "What a real end-user sees (errors, wrong data, latency).",
                    },
                    fix: {
                      type: "string",
                      description:
                        "Concrete versioning + backward-compat fix (deprecation alias, dual-write, etc).",
                    },
                    rollout: {
                      type: "string",
                      description: "Safe rollout / migration plan with timeline phases.",
                    },
                  },
                  required: [
                    "severity",
                    "confidence",
                    "blastRadius",
                    "userImpact",
                    "fix",
                    "rollout",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "emit_report" } },
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("AI gateway error", res.status, txt);
        return {
          severity: "info",
          confidence: 0,
          blastRadius:
            res.status === 429
              ? "AI rate limited. Try again in a moment."
              : res.status === 402
                ? "AI credits exhausted on this workspace."
                : "AI gateway error.",
          userImpact: "",
          fix: "",
          rollout: "",
          error: `status_${res.status}`,
        };
      }

      const json = await res.json();
      const call = json.choices?.[0]?.message?.tool_calls?.[0];
      const args = call?.function?.arguments;
      if (!args) {
        return {
          severity: "info",
          confidence: 0,
          blastRadius: "AI returned no structured output.",
          userImpact: "",
          fix: "",
          rollout: "",
          error: "no_tool_call",
        };
      }
      const parsed =
        typeof args === "string" ? JSON.parse(args) : args;
      return {
        severity: parsed.severity,
        confidence: Number(parsed.confidence) || 0,
        blastRadius: parsed.blastRadius,
        userImpact: parsed.userImpact,
        fix: parsed.fix,
        rollout: parsed.rollout,
      };
    } catch (e) {
      console.error("validateChange failed", e);
      return {
        severity: "info",
        confidence: 0,
        blastRadius: "Could not reach AI gateway.",
        userImpact: "",
        fix: "",
        rollout: "",
        error: e instanceof Error ? e.message : "unknown",
      };
    }
  });