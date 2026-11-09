// Ponto de entrada do pacote do pixelfx usado pelo Aura Idle.
// Gera vendor/pixelfx.js (IIFE, expõe window.PixelFX). Veja tools/pixelfx/README.md.
import { createFrame, clearFrame, createFx, composite, poseAt, READY } from "pixelfx";
import * as hitSpark from "pixelfx/fx/impacts/hit-spark";
import * as critHit from "pixelfx/fx/impacts/crit-hit";
import * as poof from "pixelfx/fx/spawn/poof";
import * as plasmaExplosion from "pixelfx/fx/explosions/plasma-explosion";
// versão própria do Aura Idle: espada com brilho só em volta, sem coluna de luz
import * as lootAura from "./fx/loot-aura.js";
// auras do herói: 10 estilos próprios em volta do corpo
import * as aura from "./fx/aura.js";
// os heróis em pixel art: o esqueleto do pixelfx vestido por classe
import * as hero from "./fx/hero.js";
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
// monstros: os bichos animados do pixelfx, um trio por cenário (index.html, MOBS e BIOMES)
import * as mobSlime from "pixelfx/fx/critters/slime";
import * as mobFrog from "pixelfx/fx/critters/frog";
import * as mobSnake from "pixelfx/fx/critters/snake";
import * as mobBat from "pixelfx/fx/critters/bat";
import * as mobGhost from "pixelfx/fx/critters/ghost";
import * as mobSkull from "pixelfx/fx/critters/flying-skull";
import * as mobEye from "pixelfx/fx/critters/eyeball";
import * as mobWisp from "pixelfx/fx/critters/wisp";
import * as mobJelly from "pixelfx/fx/critters/jellyfish";

window.PixelFX = {
  createFrame, clearFrame, createFx, composite, poseAt, READY,
  FX: {
    hitSpark, critHit, poof, plasmaExplosion, lootAura, aura, hero, manaBurst,
    swordSlash, doubleSlash, spinSlash, hammerSmash, starFall, arcaneMissiles, chainLightning, thunderclap, fireRing, spawnPortal, collectBurst, chestOpen,
    mobSlime, mobFrog, mobSnake, mobBat, mobGhost, mobSkull, mobEye, mobWisp, mobJelly,
  },
};
