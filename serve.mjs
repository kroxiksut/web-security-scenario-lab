// Zero-dependency, cross-platform static file server for the lab.
// Usage: node serve.mjs [root] [--port N]   (env: PORT, default 4173)
// Serves the given directory (default: current working directory) over HTTP.
// This is the "runs on any trivial static server" guarantee — no backend logic.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const args = process.argv.slice(2);
const portArg = (() => {
  const i = args.indexOf("--port");
  return i !== -1 ? args[i + 1] : undefined;
})();
const root = resolve(args.find((a) => !a.startsWith("--") && a !== portArg) ?? ".");
const port = Number(portArg ?? process.env.PORT ?? 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
};

async function resolvePath(urlPath) {
  // Strip query/hash, decode, and block path traversal outside root.
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const unsafe = normalize(join(root, clean));
  if (unsafe !== root && !unsafe.startsWith(root + sep)) return null;
  try {
    const info = await stat(unsafe);
    if (info.isDirectory()) return join(unsafe, "index.html");
    return unsafe;
  } catch {
    // Fall back to index.html inside a directory-like path.
    return clean.endsWith("/") ? join(unsafe, "index.html") : unsafe;
  }
}

const server = createServer(async (req, res) => {
  const filePath = await resolvePath(req.url ?? "/");
  if (!filePath) {
    res.writeHead(403).end("403 Forbidden");
    return;
  }
  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "content-type": MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end("404 Not Found");
  }
});

server.listen(port, () => {
  console.log(`web-security-scenario-lab: serving ${root}`);
  console.log(`  http://localhost:${port}/`);
});
