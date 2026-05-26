import { useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { SERVICES_V1 } from "@/data/specs";
import { buildEdges } from "@/lib/graph";

interface Props {
  /** services that are broken (red) */
  brokenServices?: string[];
  /** the service whose spec changed (amber) */
  changedService?: string;
  /** edges to highlight (caller → target) */
  highlightEdges?: { from: string; to: string }[];
  height?: number;
}

function ServiceNode({ data }: NodeProps<{ label: string; sub: string; state: string }>) {
  const colorClass =
    data.state === "broken"
      ? "bg-sev-critical sev-critical"
      : data.state === "changed"
        ? "bg-sev-warning sev-warning"
        : "bg-sev-safe sev-safe";
  return (
    <div
      className={`rounded-md border px-3 py-2 backdrop-blur min-w-[160px] ${colorClass}`}
      style={{ background: "color-mix(in oklab, var(--card) 80%, transparent)" }}
    >
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <div className="mono text-[10px] uppercase opacity-70">service</div>
      <div className="text-sm font-semibold text-foreground">{data.label}</div>
      <div className="mono text-[10px] text-muted-foreground">{data.sub}</div>
      <Handle type="source" position={Position.Right} className="!bg-border" />
    </div>
  );
}

const nodeTypes = { service: ServiceNode };

export function DependencyGraph({
  brokenServices = [],
  changedService,
  highlightEdges = [],
  height = 460,
}: Props) {
  const { nodes, edges } = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {
      auth: { x: 0, y: 40 },
      users: { x: 260, y: 40 },
      orders: { x: 540, y: 40 },
      payments: { x: 540, y: 220 },
      notifications: { x: 260, y: 220 },
    };
    const broken = new Set(brokenServices);
    const ns: Node[] = SERVICES_V1.map((s) => ({
      id: s.id,
      type: "service",
      position: positions[s.id] ?? { x: 0, y: 0 },
      data: {
        label: s.name,
        sub: `v${s.version}`,
        state:
          s.id === changedService
            ? "changed"
            : broken.has(s.id)
              ? "broken"
              : "ok",
      },
    }));
    const hl = new Set(highlightEdges.map((e) => `${e.from}->${e.to}`));
    const es: Edge[] = buildEdges(SERVICES_V1).map((e, i) => {
      const isHl = hl.has(`${e.from}->${e.to}`);
      return {
        id: `e${i}`,
        source: e.from,
        target: e.to,
        animated: isHl,
        label: e.endpoint,
        labelStyle: {
          fontSize: 10,
          fill: "var(--color-muted-foreground)",
          fontFamily: "var(--font-mono)",
        },
        labelBgStyle: { fill: "var(--color-background)" },
        style: {
          stroke: isHl
            ? "var(--severity-critical)"
            : "color-mix(in oklab, var(--color-border) 100%, transparent)",
          strokeWidth: isHl ? 2.2 : 1.2,
        },
      };
    });
    return { nodes: ns, edges: es };
  }, [brokenServices, changedService, highlightEdges]);

  return (
    <div
      className="rounded-lg border border-border overflow-hidden"
      style={{ height, background: "var(--color-card)" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--grid-line)" />
        <Controls showInteractive={false} className="!bg-card !border-border" />
      </ReactFlow>
    </div>
  );
}