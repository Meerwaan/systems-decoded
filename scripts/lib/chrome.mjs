// One place to find and launch the headless Chrome that HyperFrames ships.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

export function findChrome() {
  const names = new Set(["chrome-headless-shell.exe", "chrome-headless-shell", "chrome.exe"]);
  const walk = (dir, depth) => {
    if (depth > 5 || !fs.existsSync(dir)) return null;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => b.name.localeCompare(a.name))) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && names.has(entry.name)) return full;
      if (entry.isDirectory()) {
        const hit = walk(full, depth + 1);
        if (hit) return hit;
      }
    }
    return null;
  };
  const cached = walk(path.join(os.homedir(), ".cache", "hyperframes", "chrome"), 0);
  if (cached) return cached;
  const system = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
  ].find((p) => fs.existsSync(p));
  if (system) return system;
  throw new Error("Chrome introuvable. Lance `npx hyperframes browser ensure` puis réessaie.");
}

export const launchChrome = (args = []) => puppeteer.launch({ executablePath: findChrome(), headless: true, args });
