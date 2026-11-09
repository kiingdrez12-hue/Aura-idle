// Ponto de entrada do pacote do pixelfx usado pelo Aura Idle.
// Gera vendor/pixelfx.js (IIFE, expõe window.PixelFX). Veja tools/pixelfx/README.md.
import { createFrame, clearFrame, createFx, composite } from "pixelfx";
import * as hitSpark from "pixelfx/fx/impacts/hit-spark";
import * as critHit from "pixelfx/fx/impacts/crit-hit";
import * as poof from "pixelfx/fx/spawn/poof";
import * as plasmaExplosion from "pixelfx/fx/explosions/plasma-explosion";
// versão própria do Aura Idle: espada com brilho só em volta, sem coluna de luz
import * as lootAura from "./fx/loot-aura.js";
// auras do herói: 10 estilos próprios em volta do corpo
import * as aura from "./fx/aura.js";
import * as manaBurst from "pixelfx/fx/arcane/mana-burst";
import * as swordSlash from "pixelfx/fx/melee/sword-slash";
import * as doubleSlash from "pixelfx/fx/melee/double-slash";
import * as spinSlash from "pixelfx/fx/melee/spin-slash";
import * as hammerSmash from "pixelfx/fx/melee/hammer-smash";
import * as starFall from "pixelfx/fx/arcane/star-fall";
import * as arcaneMissiles from "pixelfx/fx/arcane/arcane-missiles";
import * as chainLightning from "pixelfx/fx/lightning/chain-lightning";
import * as thunderclap from "pixelfx/fx/lightning/thunderclap";
// anel de chamas no chão, recolorido em dourado: a onda sagrada do paladino (sem raio vindo do alto)
import * as fireRing from "pixelfx/fx/fire/fire-ring";
import * as spawnPortal from "pixelfx/fx/spawn/spawn-portal";
import * as collectBurst from "pixelfx/fx/pickups/collect-burst";
import * as chestOpen from "pixelfx/fx/pickups/chest-open";

window.PixelFX = {
  createFrame, clearFrame, createFx, composite,
  FX: {
    hitSpark, critHit, poof, plasmaExplosion, lootAura, aura, manaBurst,
    swordSlash, doubleSlash, spinSlash, hammerSmash, starFall, arcaneMissiles, chainLightning, thunderclap, fireRing, spawnPortal, collectBurst, chestOpen,
  },
};
