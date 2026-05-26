import type { Endpoint, Field, FieldType, ServiceSpec } from "@/data/specs";

type AnyObj = Record<string, any>;

const METHODS = ["get", "post", "put", "delete", "patch"] as const;

function resolveRef(doc: AnyObj, ref: string): AnyObj | null {
  if (!ref.startsWith("#/")) return null;
  const parts = ref.slice(2).split("/");
  let cur: any = doc;
  for (const p of parts) {
    if (cur == null) return null;
    cur = cur[p];
  }
  return cur ?? null;
}

function normalizeType(t: unknown): FieldType {
  const s = String(t ?? "string").toLowerCase();
  if (s === "string" || s === "number" || s === "integer" || s === "boolean" || s === "array" || s === "object") {
    return s as FieldType;
  }
  return "string";
}

function schemaToFields(doc: AnyObj, schema: AnyObj | null | undefined): Field[] {
  if (!schema) return [];
  if (schema.$ref) {
    const resolved = resolveRef(doc, schema.$ref);
    return schemaToFields(doc, resolved);
  }
  // unwrap arrays to their items if object
  if (schema.type === "array" && schema.items) {
    return schemaToFields(doc, schema.items);
  }
  if (schema.properties && typeof schema.properties === "object") {
    const required = new Set<string>(Array.isArray(schema.required) ? schema.required : []);
    return Object.entries(schema.properties).map(([name, propRaw]) => {
      const prop = (propRaw && (propRaw as AnyObj).$ref)
        ? (resolveRef(doc, (propRaw as AnyObj).$ref!) ?? {})
        : (propRaw as AnyObj);
      return {
        name,
        type: normalizeType(prop?.type ?? (prop?.properties ? "object" : "string")),
        required: required.has(name),
        description: typeof prop?.description === "string" ? prop.description : undefined,
      } satisfies Field;
    });
  }
  return [];
}

function extractRequestFields(doc: AnyObj, op: AnyObj): Field[] {
  const fields: Field[] = [];
  // path + query params
  if (Array.isArray(op.parameters)) {
    for (const p of op.parameters) {
      const param = p?.$ref ? (resolveRef(doc, p.$ref) ?? {}) : p;
      if (!param?.name) continue;
      const schema = param.schema ?? {};
      fields.push({
        name: String(param.name),
        type: normalizeType(schema.type ?? "string"),
        required: Boolean(param.required),
      });
    }
  }
  // request body (json)
  const body = op.requestBody?.$ref
    ? (resolveRef(doc, op.requestBody.$ref) ?? {})
    : op.requestBody;
  const jsonSchema = body?.content?.["application/json"]?.schema;
  if (jsonSchema) fields.push(...schemaToFields(doc, jsonSchema));
  return fields;
}

function extractResponseFields(doc: AnyObj, op: AnyObj): Field[] {
  const responses = op.responses ?? {};
  // Prefer 200, then 201, then any 2xx, then default
  const keys = Object.keys(responses);
  const preferred =
    keys.find((k) => k === "200") ??
    keys.find((k) => k === "201") ??
    keys.find((k) => /^2\d\d$/.test(k)) ??
    keys.find((k) => k === "default");
  if (!preferred) return [];
  const resp = responses[preferred]?.$ref
    ? (resolveRef(doc, responses[preferred].$ref) ?? {})
    : responses[preferred];
  const schema = resp?.content?.["application/json"]?.schema;
  return schemaToFields(doc, schema);
}

export interface ImportResult {
  ok: boolean;
  spec?: ServiceSpec;
  error?: string;
}

export function importOpenApi(raw: string, fallbackId = "imported"): ImportResult {
  let doc: AnyObj;
  try {
    doc = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: "Invalid JSON. Paste an OpenAPI 3.x JSON document." };
  }
  if (!doc || typeof doc !== "object") {
    return { ok: false, error: "Root must be an object." };
  }
  if (!doc.paths || typeof doc.paths !== "object") {
    return { ok: false, error: "Missing `paths` — is this an OpenAPI document?" };
  }

  const endpoints: Endpoint[] = [];
  for (const [path, pathItemRaw] of Object.entries(doc.paths)) {
    const pathItem = pathItemRaw as AnyObj;
    if (!pathItem || typeof pathItem !== "object") continue;
    for (const method of METHODS) {
      const op = pathItem[method];
      if (!op) continue;
      endpoints.push({
        method: method.toUpperCase() as Endpoint["method"],
        path,
        summary: String(op.summary ?? op.operationId ?? `${method.toUpperCase()} ${path}`),
        request: extractRequestFields(doc, op),
        response: extractResponseFields(doc, op),
      });
    }
  }

  if (endpoints.length === 0) {
    return { ok: false, error: "No operations found under `paths`." };
  }

  const spec: ServiceSpec = {
    id: fallbackId,
    name: String(doc.info?.title ?? fallbackId),
    description: String(doc.info?.description ?? "Imported OpenAPI spec"),
    version: String(doc.info?.version ?? "0.0.0"),
    endpoints,
    calls: [],
  };
  return { ok: true, spec };
}