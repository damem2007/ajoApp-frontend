import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(process.cwd(), "..");
const generated = resolve(process.cwd(), "src/generated/api-types.ts");
const tmp = mkdtempSync(join(tmpdir(), "ajo-openapi-"));
const schema = join(tmp, "openapi.json");
const expected = join(tmp, "api-types.ts");

try {
  execFileSync("python", [resolve(root, "scripts/export_openapi.py"), "--output", schema], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, PYTHONPATH: resolve(root, "backend") },
  });
  execFileSync(
    "npx",
    ["--yes", "openapi-typescript@7.10.1", schema, "-o", expected],
    { cwd: process.cwd(), stdio: "inherit" },
  );
  const current = readFileSync(generated, "utf8");
  const next = readFileSync(expected, "utf8");
  if (current !== next) {
    console.error("Generated API types are stale. Run: npm run api:types");
    process.exitCode = 1;
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
