import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = resolve(fileURLToPath(new URL(".", import.meta.url)));
const iosRoot = resolve(scriptDirectory, "..");
const repositoryRoot = resolve(iosRoot, "..");
const read = path => readFileSync(resolve(repositoryRoot, path), "utf8");

const requiredFiles = [
  "ios/KETHER.xcodeproj/project.pbxproj",
  "ios/KETHER.xcodeproj/xcshareddata/xcschemes/KETHER.xcscheme",
  "ios/KETHER/AppDelegate.swift",
  "ios/KETHER/KetherViewController.swift",
  "ios/KETHER/Info.plist",
  "ios/KETHER/PrivacyInfo.xcprivacy",
  "ios/KETHER/Assets.xcassets/AppIcon.appiconset/Contents.json",
  "ios/KETHER/Assets.xcassets/KetherLogo.imageset/Contents.json",
  "ios/scripts/generate-artwork.swift",
  "ios/release-request.json"
];

for (const path of requiredFiles) {
  assert.ok(existsSync(resolve(repositoryRoot, path)), `缺少 ${path}`);
}

const swift = read("ios/KETHER/KetherViewController.swift");
for (const action of ["fetch", "fetchWorldState", "fetchSheet", "fetchAvatar", "fetchMarketItems"]) {
  assert.match(swift, new RegExp(`action: '${action}'|case \\\"${action}\\\"`), `iOS 橋接缺少 ${action}`);
}
assert.match(swift, /WKWebView/);
assert.match(swift, /httpCookieStore/);
assert.match(swift, /KETHER_NATIVE_PLATFORM = 'ios'/);
assert.doesNotMatch(swift, /_removeAllItems|allowsArbitraryLoads/i, "不可使用私有 API 或任意 HTTP 放行");

const project = read("ios/KETHER.xcodeproj/project.pbxproj");
for (const value of ["KetherViewController.swift", "PrivacyInfo.xcprivacy", "Generate KETHER Artwork", "Copy KETHER Web Assets", "tw.kether.app.ios"]) {
  assert.ok(project.includes(value), `Xcode 專案缺少 ${value}`);
}

const info = read("ios/KETHER/Info.plist");
assert.match(info, /CFBundleShortVersionString/);
assert.match(info, /UISupportedInterfaceOrientations~ipad/);
assert.doesNotMatch(info, /NSAllowsArbitraryLoads/);

const privacy = read("ios/KETHER/PrivacyInfo.xcprivacy");
assert.match(privacy, /NSPrivacyAccessedAPICategoryUserDefaults/);
assert.match(privacy, /CA92\.1/);

const release = JSON.parse(read("ios/release-request.json"));
assert.match(release.versionName, /^\d+\.\d+\.\d+$/);
assert.ok(Number.isInteger(release.buildNumber) && release.buildNumber > 0);

const artworkGenerator = read("ios/scripts/generate-artwork.swift");
assert.match(artworkGenerator, /canvasSize:\s*1024/);
assert.match(artworkGenerator, /samplesPerPixel:\s*hasAlpha \? 4 : 3/);

const temporaryRoot = mkdtempSync(join(tmpdir(), "kether-ios-assets-"));
try {
  execFileSync(resolve(repositoryRoot, "ios/scripts/copy-web-assets.sh"), [temporaryRoot], { stdio: "pipe" });
  for (const path of [
    "index.html",
    "app-v34.js",
    "v3-data.js",
    "site-assets/kether-clan-logo.png",
    "site-assets/icon-warframe.png",
    "kether-hero-official.png"
  ]) {
    assert.ok(existsSync(join(temporaryRoot, path)), `App Bundle 缺少 ${path}`);
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}

console.log(`KETHER iOS ${release.versionName}（build ${release.buildNumber}）靜態驗證通過`);
