import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
// Self-hosted, so first paint doesn't wait on a render-blocking request to Google Fonts
import "@fontsource/share-tech-mono";
import "./index.css";
import App from "./App";
import { Analytics } from "@vercel/analytics/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <App />
    <Analytics />
  </ConvexAuthProvider>,
);
