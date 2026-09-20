import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const frontendRoot = process.cwd();
const backendRoot = resolve(process.env.AJO_BACKEND_DIR || join(frontendRoot, "..", "backend"));
const output = resolve(process.env.AJO_API_TYPES_OUTPUT || join(frontendRoot, "src", "generated", "api-types.ts"));
const temp = mkdtempSync(join(tmpdir(), "ajo-openapi-"));
const schema = join(temp, "openapi.json");
const executable = process.platform === "win32"
  ? join(frontendRoot, "node_modules", ".bin", "openapi-typescript.cmd")
  : join(frontendRoot, "node_modules", ".bin", "openapi-typescript");

try {
  execFileSync("python", [join(backendRoot, "scripts", "export_openapi.py"), "--output", schema], {
    cwd: backendRoot,
    stdio: "inherit",
    env: { ...process.env, PYTHONPATH: backendRoot },
  });
  mkdirSync(dirname(output), { recursive: true });
  execFileSync(executable, [schema, "-o", output], { cwd: frontendRoot, stdio: "inherit" });
  const banner = [
    "/**",
    " * THIS FILE IS GENERATED FROM THE FASTAPI OPENAPI CONTRACT.",
    " * DO NOT EDIT MANUALLY.",
    " */",
    "",
  ].join("\n");
  const generated = readFileSync(output, "utf8");
  writeFileSync(output, generated.startsWith("/**\n * THIS FILE IS GENERATED") ? generated : banner + generated);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
