// The long format's frame: 1920 × 1080. BRAND.W / BRAND.H size the stage's render targets, the camera's aspect and
// every screen-space line (build3d's lineMat, the fat lines of a car, the motes) — they were the shorts' 1080 × 1920,
// and a long rendered its 3D in portrait, stretched three times across the frame. Import this FIRST in a long's
// main.js: a module's top level runs in import order, so everything imported after it (a car's line resolution
// is set at its top level) sees the landscape frame. The shorts never import it.
import { BRAND } from "./brand.js";

BRAND.W = 1920;
BRAND.H = 1080;
