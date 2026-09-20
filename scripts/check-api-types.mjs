import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = process.cwd();
const committed = resolve(process.env.AJO_COMMITTED_API_TYPES || join(root, "src", "generated", "api-types.ts"));
const temp = mkdtempSync(join(tmpdir(), "ajo-types-check-"));
const expected = join(temp, "api-types.ts");

try {
  execFileSync(process.execPath, [resolve(root, "scripts", "generate-api-types.mjs")], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, AJO_API_TYPES_OUTPUT: expected },
  });
  if (readFileSync(committed, "utf8") !== readFileSync(expected, "utf8")) {
    console.error("Generated API types are stale. Run: npm run api:types");
    process.exitCode = 1;
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
