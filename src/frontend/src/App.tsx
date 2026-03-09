import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { NoteFormModal } from "./components/NoteFormModal";
import { BrowsePage } from "./pages/BrowsePage";
import { NoteDetailPage } from "./pages/NoteDetailPage";

// ---- Layout ----

function AppLayout() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onUploadClick={() => setUploadOpen(true)} />
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
      <NoteFormModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <Toaster position="top-right" richColors />
    </div>
  );
}

// ---- Routes ----

const rootRoute = createRootRoute({
  component: AppLayout,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: BrowsePage,
});

const noteDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notes/$id",
  component: NoteDetailPage,
});

const routeTree = rootRoute.addChildren([browseRoute, noteDetailRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
