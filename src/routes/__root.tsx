import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "contract.io — AI API Contract Validator" },
      {
        name: "description",
        content:
          "Detect breaking API changes across microservices and get AI-explained blast radius before they hit prod.",
      },
      { property: "og:title", content: "contract.io — AI API Contract Validator" },
      {
        property: "og:description",
        content:
          "Dependency graph + diff engine + AI explainer for microservice API contracts.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "contract.io" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "author", content: "Shwetank Singh" },
      { name: "twitter:title", content: "contract.io — AI API Contract Validator" },
      { name: "description", content: "Contract.io analyzes OpenAPI specs, traces dependencies, and uses AI to explain microservice changes and their impact." },
      { property: "og:description", content: "Contract.io analyzes OpenAPI specs, traces dependencies, and uses AI to explain microservice changes and their impact." },
      { name: "twitter:description", content: "Contract.io analyzes OpenAPI specs, traces dependencies, and uses AI to explain microservice changes and their impact." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/025e3191-4990-4557-bbc1-9d23f8b3c8f6/id-preview-920f55e5--918ebfaf-2a38-4eb6-add8-218f73f72ab3.lovable.app-1779823345332.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/025e3191-4990-4557-bbc1-9d23f8b3c8f6/id-preview-920f55e5--918ebfaf-2a38-4eb6-add8-218f73f72ab3.lovable.app-1779823345332.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
