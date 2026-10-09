import assert from "node:assert/strict";
import { sanitizeKetherNextPath } from "../lib/auth/safeNextPath";

const allowed=[
  "/profile","/story?chapter=1","/database/warframes/valkyr/build",
  "/search?q=Valkyr","/clan#members","/"
];
const blocked=[
  null,undefined,"","https://evil.example/","http://evil.example",
  "//evil.example", "/\\evil.example", "/%5cevil.example",
  "/%2fevil.example", "/%2Fevil.example", "/story%0aLocation:%20evil",
  "/story\\redirect", "javascript:alert(1)", "relative/path"
];
for(const path of allowed){
  assert.equal(sanitizeKetherNextPath(path),path,"Allowed internal path was rejected");
}
for(const path of blocked){
  assert.equal(sanitizeKetherNextPath(path),"/profile","Unsafe path was not blocked: "+String(path));
}
console.log("KETHER OAuth safe return paths:",allowed.length+blocked.length,"passed");
