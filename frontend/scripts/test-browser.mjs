/** Run isolated browser fixtures; no suite writes real account or financial data. */
import { spawn } from "node:child_process";
import path from "node:path";
for (const name of [
  "next-frontend-ui",
  "next-catalogue-ui",
  "next-sandbox-ui",
  "next-backoffice-ui",
  "password-fields-ui",
]) {
  const code = await new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [path.resolve("../tests/" + name + ".cjs")],
      { stdio: "inherit", env: process.env },
    );
    child.on("exit", (code) => resolve(code));
  });
  if (code !== 0) process.exit(code || 1);
}
