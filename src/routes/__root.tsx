import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CookieConsent } from "@/components/CookieConsent";
import { GrievancePortalModal } from "@/components/GrievancePortalModal";
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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const errorMessage = error instanceof Error ? error.message : String(error || "");
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
    <div className="flex min-h-screen items-center justify-center bg-[#0D0E11] px-4">
      <div className="max-w-lg text-center rounded-xl border border-[#262932] bg-[#15171C] p-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-[#C9A227]/10 border border-[#C9A227]/40 text-[#C9A227] mb-3">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#FAF8F5] font-display">
          Session Restored
        </h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          The compliance scanner encountered a temporary context reload. Click below to resume your
          audit session immediately.
        </p>

        {errorMessage && (
          <div className="mt-4 p-3 bg-[#0D0E11] border border-[#262932] rounded-lg text-left text-xs font-mono text-[#A1A1AA] overflow-x-auto max-h-24">
            <code>{errorMessage}</code>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-lg bg-[#C9A227] px-5 py-2.5 text-sm font-semibold text-[#0D0E11] transition-colors hover:bg-[#DFB842] cursor-pointer"
          >
            Reload Scanner
          </button>
          <button
            onClick={handleHardReset}
            className="inline-flex items-center justify-center rounded-lg border border-[#262932] bg-[#0D0E11] px-5 py-2.5 text-sm font-semibold text-[#FAF8F5] transition-colors hover:border-[#C9A227]/50 cursor-pointer"
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
        name: "referrer",
        content: "strict-origin-when-cross-origin",
      },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "author", content: "ASJi Web and Legal Solution" },
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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,400&display=swap",
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
    <html
      lang="en"
      suppressHydrationWarning
      className="w-full max-w-full overflow-x-hidden min-h-screen bg-background"
    >
      <head>
        <HeadContent />
      </head>
      <body
        suppressHydrationWarning
        className="w-full max-w-full overflow-x-hidden min-h-screen bg-background text-foreground antialiased"
      >
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
        <AnimatePresence mode="wait" initial={false}>
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
        <GrievancePortalModal />
        <SovereignInspectionGuard />
        <MobileFloatingNavbar />
      </AuthProvider>
    </QueryClientProvider>
  );
}
