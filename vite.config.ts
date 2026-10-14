// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Deployment target (Nitro preset).
// - On Vercel, the Vercel preset emits the serverless/function output Vercel
//   expects, so our TanStack Start server functions (including the server-side
//   freshness checker) run as serverless functions in production.
// - Inside a Lovable build, LOVABLE_NITRO_PRESET still pins Cloudflare and this
//   override is ignored, so Lovable sync keeps working unchanged.
// - Allow an explicit NITRO_PRESET/SERVER_PRESET env var to win (e.g. if you
//   later deploy elsewhere) and otherwise default to "vercel" for Assessment 3.
const deployPreset = process.env["NITRO_PRESET"] ?? process.env["SERVER_PRESET"] ?? "vercel";

export default defineConfig({
  // Hard-pin the deploy target so a build on Vercel's CI is deterministic.
  nitro: { preset: deployPreset },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
