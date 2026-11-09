// Ponto de entrada do pacote do pixelfx usado pelo Aura Idle.
// Gera vendor/pixelfx.js (IIFE, expõe window.PixelFX). Veja tools/pixelfx/README.md.
import { createFrame, clearFrame, createFx, composite } from "pixelfx";
import * as hitSpark from "pixelfx/fx/impacts/hit-spark";
import * as critHit from "pixelfx/fx/impacts/crit-hit";
import * as poof from "pixelfx/fx/spawn/poof";
import * as plasmaExplosion from "pixelfx/fx/explosions/plasma-explosion";
import * as bigExplosion from "pixelfx/fx/explosions/big-explosion";
import * as fireworkBurst from "pixelfx/fx/explosions/firework-burst";
import * as lootBeam from "pixelfx/fx/pickups/loot-beam";
import * as manaBurst from "pixelfx/fx/arcane/mana-burst";
import * as magicCircle from "pixelfx/fx/arcane/magic-circle-cast";
import * as holyPillar from "pixelfx/fx/holy/holy-pillar";

window.PixelFX = {
  createFrame, clearFrame, createFx, composite,
  FX: { hitSpark, critHit, poof, plasmaExplosion, bigExplosion, fireworkBurst, lootBeam, manaBurst, magicCircle, holyPillar },
};
