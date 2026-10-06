// ElevenLabs balance (a free, read-only call): what is left this month, and when it resets.
import { elevenKey } from "./lib/env.mjs";

export async function credits() {
  const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": elevenKey() } });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const s = await res.json();
  const left = s.character_limit - s.character_count;
  return {
    tier: s.tier,
    used: s.character_count,
    limit: s.character_limit,
    left,
    resets: s.next_character_count_reset_unix ? new Date(s.next_character_count_reset_unix * 1000) : null,
  };
}

export async function printCredits() {
  const c = await credits();
  const date = c.resets ? c.resets.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : "?";
  console.log(`\n  ElevenLabs (${c.tier}) : ${c.left.toLocaleString("fr-FR")} crédits restants sur ${c.limit.toLocaleString("fr-FR")} · remise à zéro le ${date}\n`);
  return c;
}
