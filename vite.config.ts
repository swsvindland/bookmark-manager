import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import tailwindcss from "@tailwindcss/vite";

// Emits sw.js with this build's files to precache, and a version that changes whenever any of
// them does (which is what makes browsers install the new worker)
function serviceWorker(): Plugin {
  return {
    name: "service-worker",
    apply: "build",
    // After index.html is added to the bundle, so it's part of the version
    enforce: "post",
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle)
        .filter((file) => file.startsWith("assets/"))
        .sort();
      const hash = createHash("sha256").update(files.join("\n"));
      const html = bundle["index.html"];
      if (html?.type === "asset") hash.update(html.source);
      const source = readFileSync(path.resolve(__dirname, "src/sw.js"), "utf8")
        .replace("__VERSION__", hash.digest("hex").slice(0, 12))
        .replace("__PRECACHE__", JSON.stringify(["/", ...files.map((file) => `/${file}`)]));
      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    serviceWorker(),
    // The code below enables dev tools like taking screenshots of your site
    // while it is being developed on chef.convex.dev.
    // Feel free to remove this code if you're no longer developing your app with Chef.
    mode === "development"
      ? {
          name: "inject-chef-dev",
          transform(code: string, id: string) {
            if (id.includes("main.tsx")) {
              return {
                code: `${code}

/* Added by Vite plugin inject-chef-dev */
window.addEventListener('message', async (message) => {
  if (message.source !== window.parent) return;
  if (message.data.type !== 'chefPreviewRequest') return;

  const worker = await import('https://chef.convex.dev/scripts/worker.bundled.mjs');
  await worker.respondToMessage(message);
});
            `,
                map: null,
              };
            }
            return null;
          },
        }
      : null,
    // End of code for taking screenshots on chef.convex.dev.
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
