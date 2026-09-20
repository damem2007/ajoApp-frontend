const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
function config(file, env) {
  const output = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "../src/lib", file), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
  ).outputText;
  const exported = {};
  vm.runInNewContext(output, { exports: exported, process: { env }, URL });
  return exported;
}
assert.equal(
  config("backend-origin.ts", {
    NEXT_PUBLIC_API_BASE_URL: "https://api.example.test/api/v1/",
  }).backendOrigin(),
  "https://api.example.test",
);
assert.equal(
  config("backend-origin.ts", {
    AJO_API_ORIGIN: "http://server.example.test:9020",
    NEXT_PUBLIC_API_BASE_URL: "https://ignored.example.test",
  }).backendOrigin(),
  "http://server.example.test:9020",
);
assert.throws(
  () => config("backend-origin.ts", {}).backendOrigin(),
  /Set AJO_API_ORIGIN or NEXT_PUBLIC_API_BASE_URL/,
);
for (const value of [
  "file:///private",
  "https://secret:password@api.example.test",
  "https://api.example.test/?override=other",
  "https://api.example.test/unrelated",
]) {
  assert.throws(
    () =>
      config("backend-origin.ts", {
        NEXT_PUBLIC_API_BASE_URL: value,
      }).backendOrigin(),
    /Configure the API base URL/,
  );
}
const preferences = config("client-config.ts", {
  NEXT_PUBLIC_REFRESH_INTERVAL_SECONDS: "7",
  NEXT_PUBLIC_DEFAULT_PAGE_SIZE: "3",
}).clientSettings();
assert.equal(preferences.refreshIntervalMs, 7000);
assert.equal(preferences.defaultPageSize, 3);
for (const value of [undefined, "0", "-1", "NaN", "1.5"]) {
  assert.throws(
    () =>
      config("client-config.ts", {
        NEXT_PUBLIC_REFRESH_INTERVAL_SECONDS: value,
        NEXT_PUBLIC_DEFAULT_PAGE_SIZE: "3",
      }).clientSettings(),
    /positive integer/,
  );
}
console.log(
  "Frontend configuration checks passed: required origin, server override, safe validation, supplied polling interval and page size.",
);

assert.equal(
  JSON.stringify(
    config("dev-origins.ts", {
      AJO_ALLOWED_DEV_ORIGINS: "localhost,127.0.0.1,localhost",
    }).allowedDevOrigins(),
  ),
  JSON.stringify(["localhost", "127.0.0.1"]),
);
assert.throws(
  () => config("dev-origins.ts", {}).allowedDevOrigins(),
  /Set AJO_ALLOWED_DEV_ORIGINS/,
);
assert.throws(
  () =>
    config("dev-origins.ts", {
      AJO_ALLOWED_DEV_ORIGINS: "http:\/\/localhost:9520",
    }).allowedDevOrigins(),
  /without schemes/,
);
