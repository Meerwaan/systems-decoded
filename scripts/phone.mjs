// A copy of a rendered film that fits what the Claude app can carry to the phone: 30 MiB per file.
// For the day Merwan is away from the home Wi-Fi, where the desk (front.mjs) cannot be reached.
// Same picture size, same frame rate, the sound track copied untouched (the mastering is not
// redone); the picture is re-encoded in two passes at the bitrate that fills the room, and the
// result is measured against the original so the report says how much was lost — on these films,
// nothing an eye can see (SSIM ≈ 0.993, PSNR ≈ 46–48 dB), and TikTok compresses harder anyway.
//   npm run phone -- 005   →   renders/005-arret-urgence-iphone.mp4
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";
import { tool } from "./lib/ffmpeg.mjs";

const LIMIT = 30 * 1024 * 1024; // what one file may weigh on its way to the phone
const TARGET = 29.2 * 1024 * 1024; // room for the container, and for a rate control that overshoots a little

export function phone(dir) {
  const name = path.basename(dir);
  const src = path.join(ROOT, "renders", `${name}.mp4`);
  const out = path.join(ROOT, "renders", `${name}-iphone.mp4`);
  if (!fs.existsSync(src)) throw new Error(`Rendu introuvable : ${src} (npm run render -- ${name.slice(0, 3)})`);
  const ffmpeg = tool("ffmpeg");
  const ffprobe = tool("ffprobe");
  if (!ffmpeg || !ffprobe) throw new Error("ffmpeg et ffprobe sont introuvables");

  if (fs.statSync(src).size < LIMIT) {
    fs.copyFileSync(src, out);
    console.log(`\n  ${name}.mp4 passe tel quel (${(fs.statSync(src).size / 1048576).toFixed(1)} Mio) → ${out}\n`);
    return out;
  }
  const probe = (args) => spawnSync(ffprobe, ["-v", "error", ...args, src], { encoding: "utf8" }).stdout.trim();
  const duration = Number(probe(["-show_entries", "format=duration", "-of", "csv=p=0"]));
  const audio = Number(probe(["-select_streams", "a:0", "-show_entries", "stream=bit_rate", "-of", "csv=p=0"])) || 0;
  const video = Math.floor(((TARGET * 8) / duration - audio) / 1000 - 12); // kbit/s
  if (!(duration > 0) || video < 600) throw new Error(`Film trop long pour tenir en 30 Mio avec une image correcte (${Math.round(duration)} s)`);

  const log = path.join(ROOT, "renders", `.pass-${name}`);
  const run = (args) => {
    const r = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
    if (r.status !== 0) throw new Error(`ffmpeg a échoué (${r.status})`);
  };
  // aq-mode 3 gives the dark areas their share of the bits: these films are mostly dark
  const picture = (pass) => [
    "-i", src, "-map", "0:v:0", "-c:v", "libx264", "-preset", "veryslow", "-profile:v", "high", "-level:v", "4.2", "-pix_fmt", "yuv420p",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-b:v", `${video}k`, "-x264-params", "aq-mode=3",
    "-pass", String(pass), "-passlogfile", log,
  ];
  try {
    run([...picture(1), "-an", "-f", "null", process.platform === "win32" ? "NUL" : "/dev/null"]);
    run([...picture(2), "-map", "0:a:0", "-c:a", "copy", "-movflags", "+faststart", out]);
  } finally {
    for (const f of fs.readdirSync(path.dirname(log))) if (f.startsWith(path.basename(log))) fs.rmSync(path.join(path.dirname(log), f), { force: true });
  }
  const size = fs.statSync(out).size;
  if (size >= LIMIT) throw new Error(`La copie pèse ${(size / 1048576).toFixed(1)} Mio : au-dessus de la limite`);

  // how far from the original? (SSIM: 1 = identical · PSNR in dB: higher is closer; above 45, nothing shows)
  const m = spawnSync(ffmpeg, ["-hide_banner", "-i", out, "-i", src, "-lavfi", "[0:v][1:v]ssim;[0:v][1:v]psnr", "-an", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 });
  const ssim = /SSIM.*All:([\d.]+)/.exec(m.stderr ?? "")?.[1];
  const psnr = /PSNR.*average:([\d.]+).*min:([\d.]+)/.exec(m.stderr ?? "");
  console.log(`\n  ${name}-iphone.mp4 · ${(size / 1048576).toFixed(1)} Mio · image ${video} kbit/s, son d'origine`);
  if (ssim && psnr) console.log(`  écart avec l'original : SSIM ${Number(ssim).toFixed(4)} · PSNR ${Number(psnr[1]).toFixed(1)} dB en moyenne, ${Number(psnr[2]).toFixed(1)} dB sur la pire image`);
  console.log(`  → ${out}\n`);
  return out;
}
