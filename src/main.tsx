import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";

// Initialize theme based on browser preference
const root = document.documentElement;
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

const updateTheme = (isDark: boolean) => {
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

// Initial check
updateTheme(darkQuery.matches);

// Listen for system preference changes
darkQuery.addEventListener("change", (e) => updateTheme(e.matches));

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <App />
  </ConvexAuthProvider>,
);
