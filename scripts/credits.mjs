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

/**
 * Credits billed per character on a model, as ElevenLabs states it today (a free, read-only call).
 * Never a number kept in the code: on 2026-10-13 a rate remembered from the week before (0.135) announced
 * 336 credits for a run that was billed 2 491 — the model had gone to 1 credit per character.
 * If the rate cannot be read, 1: an announced cost may be too high, never too low.
 */
export async function creditRate(model) {
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/models", { headers: { "xi-api-key": elevenKey() } });
    if (!res.ok) return 1;
    const rates = (await res.json()).find((m) => m.model_id === model)?.model_rates;
    const rate = (rates?.character_cost_multiplier ?? 1) * (rates?.cost_discount_multiplier ?? 1);
    return rate > 0 ? rate : 1;
  } catch {
    return 1;
  }
}

/**
 * The guard every recording loop goes through: `budget` is a ceiling on what is really billed, not on what was announced.
 * `before(chars)` says whether the next request still fits; `after(cost, chars)` takes its real cost and says whether
 * to go on — a request billed well over its estimate stops the run at once, whatever is left of the budget.
 * A request on another model than the run's gives its own rate (`r`): two models never share an estimate.
 */
export function spendGuard(budget, rate) {
  let spent = 0;
  const estimate = (chars, r = rate) => Math.ceil(chars * r);
  return {
    estimate,
    get spent() {
      return spent;
    },
    before: (chars, r) => spent + estimate(chars, r) <= budget,
    after(cost, chars, r) {
      spent += cost;
      return cost <= estimate(chars, r) * 1.15 + 3 && spent <= budget;
    },
  };
}

export async function printCredits() {
  const c = await credits();
  const date = c.resets ? c.resets.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : "?";
  console.log(`\n  ElevenLabs (${c.tier}) : ${c.left.toLocaleString("fr-FR")} crédits restants sur ${c.limit.toLocaleString("fr-FR")} · remise à zéro le ${date}\n`);
  return c;
}
