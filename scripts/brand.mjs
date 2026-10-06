// Export the profile picture: brand/avatar.svg → brand/avatar.png (1080×1080),
// plus a control sheet showing it as TikTok crops it (circle, three sizes, dark and light UI).
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";
import { launchChrome } from "./lib/chrome.mjs";

export async function brand() {
  const dir = path.join(ROOT, "brand");
  const svg = fs.readFileSync(path.join(dir, "avatar.svg"), "utf8");
  const uri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const sizes = [320, 110, 40];
  const row = (bg) =>
    `<div style="display:flex;align-items:center;gap:40px;padding:40px 48px;background:${bg}">` +
    sizes.map((s) => `<img src="${uri}" width="${s}" height="${s}" style="border-radius:50%;display:block">`).join("") +
    `</div>`;

  const browser = await launchChrome();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
    await page.setContent(`<body style="margin:0;background:#070a0c"><img src="${uri}" width="1080" height="1080" style="display:block"></body>`);
    await page.screenshot({ path: path.join(dir, "avatar.png") });

    await page.setViewport({ width: 660, height: 800, deviceScaleFactor: 2 });
    await page.setContent(`<body style="margin:0">${row("#000000")}${row("#ffffff")}</body>`);
    await page.screenshot({ path: path.join(dir, "avatar-controle.png"), fullPage: true });
  } finally {
    await browser.close();
  }
  console.log("\n  brand/avatar.png (1080×1080) · brand/avatar-controle.png (aperçu recadré en cercle)\n");
}
