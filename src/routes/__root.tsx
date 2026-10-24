import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CookieConsent } from "@/components/CookieConsent";
import { SovereignInspectionGuard } from "@/components/SovereignInspectionGuard";
import { AuthProvider } from "@/lib/auth-context";
import { MobileFloatingNavbar } from "@/components/MobileFloatingNavbar";

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
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const handleHardReset = () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.removeItem("asji_unlocked_global");
        window.location.href = "/";
      }
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-lg text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 border border-primary/30 text-primary mb-3">
          <span className="text-xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
          Session Restored
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The compliance scanner encountered a temporary context reload. Click below to resume your
          audit session immediately.
        </p>

        {error?.message && (
          <div className="mt-4 p-3 bg-black/60 border border-white/10 rounded-xl text-left text-xs font-mono text-muted-foreground overflow-x-auto max-h-24">
            <code>{error.message}</code>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 cursor-pointer"
          >
            Reload Scanner
          </button>
          <button
            onClick={handleHardReset}
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent cursor-pointer"
          >
            Fresh Session
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover",
      },
      { title: "ASJi One – Global Data Privacy Compliance & Technical Scanner" },
      {
        name: "description",
        content:
          "Inspect tracking cookies, consent mechanisms, and server security headers across 15 sovereign global jurisdictions with ASJi One.",
      },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "author", content: "ASJi Law & Legal Engineering" },
      { property: "og:site_name", content: "ASJi One" },
      {
        property: "og:title",
        content: "ASJi One – Global Data Privacy Compliance & Technical Scanner",
      },
      {
        property: "og:description",
        content:
          "Inspect tracking cookies, consent mechanisms, and server security headers across 15 sovereign global jurisdictions with ASJi One.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.asjione.com/asji-logo.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ASJiOne" },
      {
        name: "twitter:title",
        content: "ASJi One – Global Data Privacy Compliance & Technical Scanner",
      },
      {
        name: "twitter:description",
        content:
          "Inspect tracking cookies, consent mechanisms, and server security headers across 15 sovereign global jurisdictions with ASJi One.",
      },
      { name: "twitter:image", content: "https://www.asjione.com/asji-logo.jpg" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="w-full max-w-full overflow-x-hidden min-h-screen bg-background">
      <head>
        <HeadContent />
      </head>
      <body className="w-full max-w-full overflow-x-hidden min-h-screen bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  useEffect(() => {
    const handleAdminHash = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash.toLowerCase();
        if (hash === "#admin" || hash.startsWith("#admin/")) {
          window.location.href = "/admin";
        }
      }
    };
    handleAdminHash();
    window.addEventListener("hashchange", handleAdminHash);
    return () => window.removeEventListener("hashchange", handleAdminHash);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        <CookieConsent />
        <SovereignInspectionGuard />
        <MobileFloatingNavbar />
      </AuthProvider>
    </QueryClientProvider>
  );
}
