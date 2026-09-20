import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root=process.cwd();
const temp=mkdtempSync(join(tmpdir(),"ajo-stale-contract-"));
const stale=join(temp,"api-types.ts");
writeFileSync(stale,"// intentionally stale contract\n");

try {
  const result=spawnSync(process.execPath,[resolve(root,"scripts","check-api-types.mjs")],{
    cwd:root,
    encoding:"utf8",
    env:{...process.env,AJO_COMMITTED_API_TYPES:stale},
  });
  if(result.status===0){
    console.error("Drift check did not fail for an intentionally stale contract.");
    process.exit(1);
  }
  console.log("API contract drift negative check passed.");
} finally {
  rmSync(temp,{recursive:true,force:true});
}
