import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(process.cwd(), "..");
const schema = resolve(root, ".generated/openapi.json");
const output = resolve(process.cwd(), "src/generated/api-types.ts");

mkdirSync(dirname(schema), { recursive: true });
mkdirSync(dirname(output), { recursive: true });

execFileSync("python", [resolve(root, "scripts/export_openapi.py"), "--output", schema], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, PYTHONPATH: resolve(root, "backend") },
});
execFileSync(
  resolve(process.cwd(), "node_modules/.bin/openapi-typescript"),
  [schema, "-o", output],
  { cwd: process.cwd(), stdio: "inherit" },
);
rmSync(resolve(root, ".generated"), { recursive: true, force: true });
