// Mock microservice OpenAPI-style specs (simplified).
// Each service exposes endpoints; "calls" lists endpoints it consumes from others.

export type FieldType = "string" | "number" | "integer" | "boolean" | "object" | "array";

export interface Field {
  name: string;
  type: FieldType;
  required: boolean;
  description?: string;
}

export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  summary: string;
  request?: Field[];
  response: Field[];
}

export interface ServiceCall {
  /** target service id */
  service: string;
  /** "METHOD path" of the target endpoint */
  endpoint: string;
  /** fields the caller actually reads from the response */
  consumes: string[];
}

export interface ServiceSpec {
  id: string;
  name: string;
  description: string;
  version: string;
  endpoints: Endpoint[];
  calls: ServiceCall[];
}

const usersV1: ServiceSpec = {
  id: "users",
  name: "Users Service",
  description: "Identity, profile and account data",
  version: "1.4.2",
  endpoints: [
    {
      method: "GET",
      path: "/users/{id}",
      summary: "Get user profile",
      response: [
        { name: "id", type: "string", required: true },
        { name: "email", type: "string", required: true },
        { name: "name", type: "string", required: true },
        { name: "age", type: "integer", required: true, description: "Used by pricing tiers" },
        { name: "country", type: "string", required: true },
        { name: "createdAt", type: "string", required: true },
      ],
    },
    {
      method: "POST",
      path: "/users",
      summary: "Create user",
      request: [
        { name: "email", type: "string", required: true },
        { name: "name", type: "string", required: true },
        { name: "age", type: "integer", required: true },
      ],
      response: [
        { name: "id", type: "string", required: true },
        { name: "email", type: "string", required: true },
      ],
    },
  ],
  calls: [{ service: "auth", endpoint: "POST /auth/validate", consumes: ["valid", "userId"] }],
};

const ordersV1: ServiceSpec = {
  id: "orders",
  name: "Orders Service",
  description: "Cart, checkout and order lifecycle",
  version: "2.1.0",
  endpoints: [
    {
      method: "POST",
      path: "/orders",
      summary: "Create order",
      request: [
        { name: "userId", type: "string", required: true },
        { name: "items", type: "array", required: true },
      ],
      response: [
        { name: "orderId", type: "string", required: true },
        { name: "total", type: "number", required: true },
        { name: "currency", type: "string", required: true },
      ],
    },
    {
      method: "GET",
      path: "/orders/{id}",
      summary: "Get order",
      response: [
        { name: "orderId", type: "string", required: true },
        { name: "userId", type: "string", required: true },
        { name: "total", type: "number", required: true },
        { name: "status", type: "string", required: true },
      ],
    },
  ],
  calls: [
    { service: "users", endpoint: "GET /users/{id}", consumes: ["id", "age", "country"] },
    { service: "payments", endpoint: "POST /payments/charge", consumes: ["paymentId", "status"] },
    { service: "notifications", endpoint: "POST /notifications/send", consumes: ["delivered"] },
  ],
};

const paymentsV1: ServiceSpec = {
  id: "payments",
  name: "Payments Service",
  description: "Charging, refunds and payment intents",
  version: "3.0.4",
  endpoints: [
    {
      method: "POST",
      path: "/payments/charge",
      summary: "Charge a card",
      request: [
        { name: "userId", type: "string", required: true },
        { name: "amount", type: "number", required: true },
        { name: "currency", type: "string", required: true },
      ],
      response: [
        { name: "paymentId", type: "string", required: true },
        { name: "status", type: "string", required: true },
        { name: "processedAt", type: "string", required: true },
      ],
    },
  ],
  calls: [
    { service: "users", endpoint: "GET /users/{id}", consumes: ["id", "country"] },
    { service: "notifications", endpoint: "POST /notifications/send", consumes: ["delivered"] },
  ],
};

const notificationsV1: ServiceSpec = {
  id: "notifications",
  name: "Notifications Service",
  description: "Email, SMS and push delivery",
  version: "1.2.0",
  endpoints: [
    {
      method: "POST",
      path: "/notifications/send",
      summary: "Send a notification",
      request: [
        { name: "userId", type: "string", required: true },
        { name: "channel", type: "string", required: true },
        { name: "template", type: "string", required: true },
      ],
      response: [
        { name: "messageId", type: "string", required: true },
        { name: "delivered", type: "boolean", required: true },
      ],
    },
  ],
  calls: [{ service: "users", endpoint: "GET /users/{id}", consumes: ["email", "name"] }],
};

const authV1: ServiceSpec = {
  id: "auth",
  name: "Auth Service",
  description: "Tokens, sessions and validation",
  version: "1.8.1",
  endpoints: [
    {
      method: "POST",
      path: "/auth/validate",
      summary: "Validate a bearer token",
      request: [{ name: "token", type: "string", required: true }],
      response: [
        { name: "valid", type: "boolean", required: true },
        { name: "userId", type: "string", required: true },
        { name: "scopes", type: "array", required: true },
      ],
    },
  ],
  calls: [],
};

export const SERVICES_V1: ServiceSpec[] = [
  usersV1,
  ordersV1,
  paymentsV1,
  notificationsV1,
  authV1,
];

/**
 * Pre-baked breaking-change scenarios for the "Simulate Breaking Change" demo.
 * Each scenario mutates the v1 spec of one service into v2.
 */
export interface Scenario {
  id: string;
  service: string;
  title: string;
  description: string;
  mutate: (spec: ServiceSpec) => ServiceSpec;
}

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}

export const SCENARIOS: Scenario[] = [
  {
    id: "rename-age",
    service: "users",
    title: "Rename `age` → `userAge` on GET /users/{id}",
    description: "A backend dev renames a field for clarity. Downstream consumers still read `age`.",
    mutate: (s) => {
      const next = clone(s);
      const ep = next.endpoints.find((e) => e.path === "/users/{id}")!;
      const f = ep.response.find((x) => x.name === "age")!;
      f.name = "userAge";
      next.version = "1.5.0";
      return next;
    },
  },
  {
    id: "remove-country",
    service: "users",
    title: "Remove `country` field from GET /users/{id}",
    description: "Field deprecated and removed; consumers using it for tax/regions will break.",
    mutate: (s) => {
      const next = clone(s);
      const ep = next.endpoints.find((e) => e.path === "/users/{id}")!;
      ep.response = ep.response.filter((f) => f.name !== "country");
      next.version = "1.5.0";
      return next;
    },
  },
  {
    id: "type-change-total",
    service: "orders",
    title: "Change `total` from number → string on /orders/{id}",
    description: "Type narrowed to string ('12.50'). Math on the caller side fails silently.",
    mutate: (s) => {
      const next = clone(s);
      const ep = next.endpoints.find((e) => e.path === "/orders/{id}")!;
      ep.response.find((f) => f.name === "total")!.type = "string";
      next.version = "2.2.0";
      return next;
    },
  },
  {
    id: "remove-endpoint",
    service: "payments",
    title: "Remove POST /payments/charge",
    description: "Endpoint deleted in favor of a new intents flow. Anyone calling charge breaks.",
    mutate: (s) => {
      const next = clone(s);
      next.endpoints = next.endpoints.filter((e) => e.path !== "/payments/charge");
      next.version = "4.0.0";
      return next;
    },
  },
  {
    id: "add-required-input",
    service: "notifications",
    title: "Add required `priority` field on POST /notifications/send",
    description: "New required request field — callers not sending it get 400.",
    mutate: (s) => {
      const next = clone(s);
      const ep = next.endpoints.find((e) => e.path === "/notifications/send")!;
      ep.request!.push({ name: "priority", type: "string", required: true });
      next.version = "1.3.0";
      return next;
    },
  },
  {
    id: "additive-safe",
    service: "users",
    title: "Add optional `avatarUrl` to GET /users/{id} (safe)",
    description: "Additive optional field. No callers should break.",
    mutate: (s) => {
      const next = clone(s);
      const ep = next.endpoints.find((e) => e.path === "/users/{id}")!;
      ep.response.push({ name: "avatarUrl", type: "string", required: false });
      next.version = "1.5.0";
      return next;
    },
  },
];