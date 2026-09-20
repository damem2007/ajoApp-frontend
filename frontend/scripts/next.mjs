/** Load Next's environment files before selecting the listening address. */
import nextEnv from "@next/env";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
nextEnv.loadEnvConfig(process.cwd(), process.argv[2] === "dev");
const require = createRequire(import.meta.url);
const command = process.argv[2];
const host = process.env.FRONTEND_HOST;
const port = process.env.FRONTEND_PORT;
if (
  !["dev", "start"].includes(command) ||
  !host ||
  !port ||
  !/^\d+$/.test(port) ||
  Number(port) < 1 ||
  Number(port) > 65535
) {
  throw new Error(
    "Set FRONTEND_HOST and a valid FRONTEND_PORT in frontend/.env.local.",
  );
}
const child = spawn(
  process.execPath,
  [
    require.resolve("next/dist/bin/next"),
    command,
    "--hostname",
    host,
    "--port",
    port,
    ...process.argv.slice(3),
  ],
  { stdio: "inherit", env: process.env },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("error", () => {
  console.error("Unable to start the frontend process.");
  process.exit(1);
});
child.on("exit", (code, signal) =>
  process.exit(code ?? (signal === "SIGINT" ? 130 : 1)),
);
