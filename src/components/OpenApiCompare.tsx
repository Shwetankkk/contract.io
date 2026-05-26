import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Upload, Zap } from "lucide-react";
import { importOpenApi } from "@/lib/openapi-import";
import { diffSpecs, overallSeverity } from "@/lib/diff";
import { validateChange } from "@/lib/validate.functions";
import { DiffViewer } from "@/components/DiffViewer";
import { SeverityBadge } from "@/components/SeverityBadge";
import { AIReportCard } from "@/components/AIReportCard";

// Soft client-side cap: 5 AI runs per browser per day. Keeps a public demo
// well within the $1/month free Lovable AI balance even if the link spreads.
const DAILY_CAP = 5;
const CAP_KEY = "contractio_ai_runs";

function getTodayCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(CAP_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    return date === new Date().toISOString().slice(0, 10) ? count : 0;
  } catch {
    return 0;
  }
}

function bumpTodayCount() {
  if (typeof window === "undefined") return;
  const date = new Date().toISOString().slice(0, 10);
  const count = getTodayCount() + 1;
  localStorage.setItem(CAP_KEY, JSON.stringify({ date, count }));
}

const SAMPLE_OLD = `{
  "openapi": "3.0.0",
  "info": { "title": "Orders API", "version": "1.4.0" },
  "paths": {
    "/users/{id}": {
      "get": {
        "summary": "Get user",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["id", "email", "age"],
                  "properties": {
                    "id":    { "type": "string" },
                    "email": { "type": "string" },
                    "age":   { "type": "integer" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/orders": {
      "get": {
        "summary": "List orders",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["id", "total", "currency"],
                    "properties": {
                      "id":       { "type": "string" },
                      "total":    { "type": "number" },
                      "currency": { "type": "string" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Create order",
        "responses": {
          "201": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["id"],
                  "properties": { "id": { "type": "string" } }
                }
              }
            }
          }
        }
      }
    },
    "/legacy/ping": {
      "get": {
        "summary": "Health ping (deprecated)",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": { "type": "object", "properties": { "ok": { "type": "boolean" } } }
              }
            }
          }
        }
      }
    }
  }
}`;

const SAMPLE_NEW = `{
  "openapi": "3.0.0",
  "info": { "title": "Orders API", "version": "2.0.0" },
  "paths": {
    "/users/{id}": {
      "get": {
        "summary": "Get user",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["id", "email", "userAge"],
                  "properties": {
                    "id":      { "type": "string" },
                    "email":   { "type": "string" },
                    "userAge": { "type": "integer" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/orders": {
      "get": {
        "summary": "List orders",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["id", "total", "currency"],
                    "properties": {
                      "id":         { "type": "string" },
                      "total":      { "type": "string" },
                      "currency":   { "type": "string" },
                      "customerId": { "type": "string" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Create order",
        "responses": {
          "201": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["id", "status"],
                  "properties": {
                    "id":     { "type": "string" },
                    "status": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/orders/{id}/refund": {
      "post": {
        "summary": "Refund an order",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["refundId"],
                  "properties": { "refundId": { "type": "string" } }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

export function OpenApiCompare() {
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const runFn = useServerFn(validateChange);

  const result = useMemo(() => {
    if (!oldText.trim() || !newText.trim()) {
      return { ok: false as const, message: "Paste both versions above to see the diff." };
    }
    const a = importOpenApi(oldText, "your-api");
    const b = importOpenApi(newText, "your-api");
    if (!a.ok || !a.spec) return { ok: false as const, message: `Old spec: ${a.error}` };
    if (!b.ok || !b.spec) return { ok: false as const, message: `New spec: ${b.error}` };
    const changes = diffSpecs(a.spec, b.spec);
    return { ok: true as const, oldSpec: a.spec, newSpec: b.spec, changes };
  }, [oldText, newText]);

  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof runFn>[0]) => runFn(input),
  });

  const loadSample = () => {
    setOldText(SAMPLE_OLD);
    setNewText(SAMPLE_NEW);
  };

  const run = () => {
    if (!result.ok) return;
    if (getTodayCount() >= DAILY_CAP) return;
    bumpTodayCount();
    mutation.mutate({
      data: {
        service: {
          id: result.oldSpec.id,
          name: result.oldSpec.name,
          version: result.oldSpec.version,
        },
        newVersion: result.newSpec.version,
        changes: result.changes,
        impacted: [],
      },
    });
  };

  return (
    <div className="space-y-4 rounded-md border border-border bg-card/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mono text-[11px] uppercase tracking-wider text-muted-foreground">
            bring your own api
          </div>
          <h2 className="mt-1 text-lg font-semibold">
            Paste two OpenAPI 3.x JSON specs · diff + AI analysis on YOUR data
          </h2>
          <p className="mono mt-1 text-xs text-muted-foreground">
            # supports OpenAPI 3.0/3.1 JSON · runs entirely in your browser + Lovable AI
          </p>
        </div>
        <button
          onClick={loadSample}
          className="mono inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Upload className="h-3.5 w-3.5" />
          load sample
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <SpecBox label="old spec (current prod)" value={oldText} onChange={setOldText} />
        <SpecBox label="new spec (proposed)" value={newText} onChange={setNewText} />
      </div>

      {!result.ok ? (
        <div className="mono rounded-md border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
          {result.message}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={run}
              disabled={
                mutation.isPending ||
                result.changes.length === 0 ||
                getTodayCount() >= DAILY_CAP
              }
              className="glow-primary inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              {mutation.isPending
                ? "Validating…"
                : getTodayCount() >= DAILY_CAP
                  ? `Daily demo limit reached (${DAILY_CAP}/day)`
                  : "Run AI validation"}
            </button>
            <div className="mono text-xs text-muted-foreground">
              deterministic diff:{" "}
              <span className="text-foreground">{result.changes.length} change(s)</span> ·{" "}
              {result.oldSpec.version} → {result.newSpec.version}
            </div>
            <SeverityBadge severity={overallSeverity(result.changes)} />
          </div>

          <DiffViewer changes={result.changes} />

          <AIReportCard report={mutation.data} loading={mutation.isPending} />
        </>
      )}
    </div>
  );
}

function SpecBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mono mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="paste openapi.json here…"
        className="mono h-56 w-full resize-y rounded-md border border-border bg-background/80 p-3 text-[11px] leading-relaxed text-foreground outline-none focus:border-[color:var(--severity-safe)]"
      />
    </div>
  );
}