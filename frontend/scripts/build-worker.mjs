/** Emit the browser worker from its TypeScript source. */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
const source = path.resolve("src/workers/service-worker.ts");
const output = ts.transpileModule(fs.readFileSync(source, "utf8"), {
  compilerOptions: {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ES2020,
  },
  fileName: source,
}).outputText;
fs.writeFileSync(
  path.resolve("public/sw.js"),
  "// Generated from src/workers/service-worker.ts; edit that source.\n" +
    output,
);
