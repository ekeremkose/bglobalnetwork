// Node module hooks for the admin regression test: resolves the "@/" alias to src/,
// tries .ts/.tsx for extensionless imports, and loads .json as a default export.
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const SRC = path.join(process.cwd(), "src");
const EXT = [".ts", ".tsx", ".json", "/index.ts", "/index.tsx"];

function probe(base) {
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  for (const e of EXT) if (fs.existsSync(base + e)) return base + e;
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  let base = null;
  if (specifier.startsWith("@/")) base = path.join(SRC, specifier.slice(2));
  else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file://")) {
    base = path.resolve(path.dirname(new URL(context.parentURL).pathname), specifier);
  }
  if (base) {
    const file = probe(base);
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    // Next's package subpaths (next/cache, next/navigation) are extensionless CommonJS entries.
    if (err?.code === "ERR_MODULE_NOT_FOUND" && /^next\/[a-z-]+$/.test(specifier)) return nextResolve(specifier + ".js", context);
    throw err;
  }
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    const source = fs.readFileSync(new URL(url), "utf8");
    return { format: "module", source: `export default ${source};`, shortCircuit: true };
  }
  return nextLoad(url, context);
}
