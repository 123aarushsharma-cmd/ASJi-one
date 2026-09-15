import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";

const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const HOST = "0.0.0.0";

const candidatePaths = [
  ".output/server/index.mjs",
  ".vercel/output/functions/__server.func/index.mjs",
  "dist/server/index.mjs",
];

const targetPath = candidatePaths.find((p) => existsSync(p));

if (targetPath) {
  try {
    const fullPath = path.resolve(process.cwd(), targetPath);
    const mod = await import(pathToFileURL(fullPath).href);
    const handler = mod.default || mod;

    if (typeof handler === "function") {
      const server = http.createServer((req, res) => {
        handler(req, res);
      });
      server.listen(PORT, HOST, () => {
        console.log(`[ASJi Server] Serving on http://${HOST}:${PORT}`);
      });
    } else {
      const child = spawn(process.execPath, [targetPath], {
        stdio: "inherit",
        env: { ...process.env, PORT: String(PORT), HOST },
      });
      child.on("exit", (code) => process.exit(code ?? 0));
    }
  } catch (err) {
    console.error("[ASJi Server] Failed to initialize handler, fallback to preview:", err);
    runPreviewFallback();
  }
} else {
  runPreviewFallback();
}

function runPreviewFallback() {
  const child = spawn("npx", ["vite", "preview", "--host", HOST, "--port", String(PORT)], {
    stdio: "inherit",
    shell: true,
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}
