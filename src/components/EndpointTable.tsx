import type { Endpoint } from "@/data/specs";

export function EndpointTable({ endpoints }: { endpoints: Endpoint[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <table className="mono w-full text-xs">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-semibold">Method</th>
            <th className="px-3 py-2 font-semibold">Path</th>
            <th className="px-3 py-2 font-semibold">Response fields</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {endpoints.map((e) => (
            <tr key={`${e.method} ${e.path}`}>
              <td className="px-3 py-2 sev-safe">{e.method}</td>
              <td className="px-3 py-2 text-foreground">{e.path}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {e.response.map((f) => f.name).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}