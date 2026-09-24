#!/usr/bin/env node
/**
 * Zero-dependency static file server for local preview of the demo sites.
 *
 *   npm run serve            # http://localhost:4173
 *   PORT=8080 npm run serve
 *
 * Serves the repository root so the site behaves exactly like GitHub Pages.
 */

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT) || 4173;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith("/")) pathname += "index.html";

    const filePath = normalize(join(root, pathname));
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    let target = filePath;
    try {
      if ((await stat(target)).isDirectory()) target = join(target, "index.html");
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("404 Not Found");
      return;
    }

    res.writeHead(200, { "Content-Type": TYPES[extname(target)] || "application/octet-stream" });
    createReadStream(target).pipe(res);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" }).end("500 Server Error");
  }
});

server.listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});
