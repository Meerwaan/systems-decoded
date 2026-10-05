import fs from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(import.meta.dirname, "../..");

// Accepted spellings for the ElevenLabs key in .env (the first one found wins).
const KEY_NAMES = ["ELEVENLABS_API_KEY", "ELEVEN_API_KEY", "XI_API_KEY", "elevenlabs", "elvenlabs"];

export function loadEnv() {
  const file = path.join(ROOT, ".env");
  const env = { ...process.env };
  if (fs.existsSync(file)) {
    for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!(k in env)) env[k] = v;
    }
  }
  return env;
}

export function elevenKey() {
  const env = loadEnv();
  for (const name of KEY_NAMES) if (env[name]) return env[name];
  throw new Error(
    `Clé ElevenLabs introuvable. Ajoute ELEVENLABS_API_KEY=... dans ${path.join(ROOT, ".env")}`,
  );
}
