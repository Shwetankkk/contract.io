import { Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="mono">
          <span className="text-foreground">contract.io</span> — built by{" "}
          <a
            href="https://www.linkedin.com/in/iamshwetanksingh/"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Shwetank Singh
          </a>{" "}
          to explore building real apps purely with AI.
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.linkedin.com/in/iamshwetanksingh/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Linkedin className="h-3.5 w-3.5" />
            LinkedIn
          </a>
          <a
            href="https://github.com/Shwetankkk"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}