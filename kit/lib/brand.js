// House palette and account identity, in code. Colours mirror the CSS tokens in kit/brand.css.
import profile from "../../brand/profil.json";

export const BRAND = {
  name: profile.name.toLocaleUpperCase("fr"), // shown in the HUD of every film; lights up when the system gives up its secret
  handle: `@${profile.handle}`,
  W: 1080,
  H: 1920,
  bg: 0x070a0c,
  ink: 0xe9e4d8,
  veille: 0x5cffb0, // the system alive
  signal: 0xff5b2e, // the threat
  graphite: 0x181c20,
  black: 0x0a0c0e,
  plastic: 0xd6d1c4,
  pcb: 0x0b2a20,
};
