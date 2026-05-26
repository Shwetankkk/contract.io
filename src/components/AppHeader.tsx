import { Link } from "@tanstack/react-router";
import { Activity, GitBranch, Network, Zap } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 sev-safe">
            <Activity className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">contract.io</div>
            <div className="mono text-[10px] uppercase text-muted-foreground">
              api contract validator
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink to="/" icon={<Network className="h-3.5 w-3.5" />} label="Overview" />
          <NavLink to="/services" icon={<GitBranch className="h-3.5 w-3.5" />} label="Services" />
          <NavLink to="/simulate" icon={<Zap className="h-3.5 w-3.5" />} label="Simulate" />
        </nav>
        <div className="ml-auto flex items-center gap-2 mono text-[11px] text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-primary glow-primary" />
          env: production · region us-west-2
        </div>
      </div>
    </header>
  );
}

function NavLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      activeProps={{ className: "bg-secondary text-foreground" }}
    >
      {icon}
      {label}
    </Link>
  );
}