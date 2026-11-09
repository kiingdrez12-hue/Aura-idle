// Item no chão do Aura Idle: a espada caída com um brilho na cor da raridade só em volta dela.
// Adaptado de pixelfx/src/fx/pickups/loot-beam.js (MIT, Patch e Hugo Duprez; ver vendor/PIXELFX-LICENSE.txt),
// sem a coluna de luz que sobe e sem as partículas que voam para o alto.
// Opção `power` (0 a 1): raridades altas ganham anéis um pouco maiores e mais brilhos.
// Opção `sword` (1/0): com 0 desenha só o brilho; o jogo põe o ícone do próprio item por cima.
import { fit, ease, cycle, band, WHITE, hex, mix } from "pixelfx";
import { Layer, glint, pool, blobShadow } from "pixelfx/fx/pickups/_lib";

export const meta = {
  name: "Loot aura",
  desc: "A dropped sword with a small pool and rings of rarity light around it, and a few low sparkles. No beam.",
  tags: ["pickup", "loot", "rarity", "drop", "item", "loop"],
  size: [64, 40],
  origin: [32, 30],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#140a24", "#2c1250", "#4b1d86", "#7330c0", "#a050f0", "#c890ff", "#ecd4ff", "#ffffff"],
    power: 0.5,
    sword: 1,
    seed: 4,
  },
};

const RINGS = [0.08, 0.58];
const STEEL = ["#151726", "#2c3149", "#4f5775", "#8a93b3", "#d6dcef", "#ffffff"].map(hex);
const GOLD = ["#3a2008", "#7a4a10", "#b8801c", "#e8b432", "#ffe27a", "#fff6cc"].map(hex);
const LEATHER = ["#1e0f0e", "#3e2016", "#633620"].map(hex);
const INK = hex("#0d0b14");
const L = new Layer(40, 24);
const since = (ph, k) => (((ph - RINGS[k]) % 1) + 1) % 1;

// a espada, igual à do loot-beam: 22 px do pomo à ponta, apoiada na guarda e na ponta
const OX = 4, axis = (x) => Math.floor(-4 + (x + 4) / 7 + 0.5);
function sword(p, C, ph) {
  const edgeLit = (x) => (Math.abs(x + OX - 0.5) < 6 ? C[6] : mix(STEEL[4], C[6], 0.45));
  L.begin(-16, -12);
  L.set = ((set) => (x, y, c) => set.call(L, x + OX, y, c))(Object.getPrototypeOf(L).set);
  for (let x = -11; x <= 10; x++) {
    const a = axis(x);
    if (x <= -9) {
      const m = x + 10;
      if (m === 0) L.set(x, a - 1, C[6]), L.set(x, a, WHITE), L.set(x, a + 1, C[4]);
      else L.set(x, a, m < 0 ? C[5] : C[3]);
    } else if (x <= -5) {
      L.set(x, a, LEATHER[x % 2 ? 2 : 1]);
      L.set(x, a + 1, LEATHER[x % 2 ? 1 : 0]);
    } else if (x <= -3) {
      for (let y = a - 3; y <= a + 3; y++) {
        const end = y === a - 3 || y === a + 3;
        L.set(x, y, y === a ? (x === -4 ? C[6] : C[4]) : x === -4 ? (end ? GOLD[3] : mix(GOLD[4], C[6], 0.3)) : end ? GOLD[0] : GOLD[1]);
      }
    } else {
      const tip = x - 8;
      if (tip < 1) L.set(x, a - 1, edgeLit(x));
      if (tip < 2) L.set(x, a, tip === 1 ? edgeLit(x) : mix(STEEL[3], C[4], 0.2));
      L.set(x, a + 1, tip === 2 ? STEEL[2] : STEEL[0]);
    }
  }
  delete L.set;
  L.outline(INK).draw(p);
  const g = (ph - 0.72) / 0.16;
  if (g > 0 && g < 1) {
    const x = -1 + 9 * ease.inOutSine(g);
    glint(p, x + OX, axis(Math.round(x)) - 1, 2.6 * Math.sin(g * Math.PI), WHITE, 0.5);
  }
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), T = meta.duration, ph = t / T, w = 16 + 6 * o.power;
  // poça de luz da raridade sob a espada
  pool(p, 0.5, 0, w, 3.5, C[4], 0.26 + 0.14 * o.power);
  p.glow(0.5, -2, 11 + 5 * o.power, C[5], 0.32 + 0.2 * o.power);
  for (let k = 0; k < RINGS.length; k++) ring(p, C, since(ph, k) * T, true, o.power);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), T = meta.duration, ph = t / T;
  if (o.sword) {
    blobShadow(p, OX - 0.5, 12.5, 0.95);
    sword(p, C, ph);
  }
  for (let k = 0; k < RINGS.length; k++) ring(p, C, since(ph, k) * T, false, o.power);
  sparkles(p, C, t, T, o.seed, o.power);
}

// anel que pulsa no chão a partir da espada, curto para não invadir a cena
function ring(p, C, a, back, power) {
  const L1 = 1.1, k = a / L1;
  if (k >= 1) return;
  const r = 4 + (10 + 6 * power) * ease.outCubic(k), th = Math.max(1, 2.4 * (1 - k));
  band(p, 0.5, 0, r, 0.22, th, Math.min(1, 1.1 * (1 - k)), [C[2], C[4], C[5], C[6]], (g) => Math.sin(g) < 0 === back, k < 0.12);
}

// poucos brilhos baixos em volta da espada, que piscam e não sobem
function sparkles(p, C, t, T, seed, power) {
  cycle(t, T, Math.round(5 + 9 * power), seed, (g) => g.range(0.6, 1.2), (age, life, r) => {
    const x = r.sign() * r.range(3, 14), y = -r.range(1, 6 + 4 * power) - 4 * age;
    const k = Math.min(1, age / 0.2, (life - age) / 0.3);
    if (k <= 0) return;
    const tw = 0.5 + 0.5 * Math.sin(age * r.range(9, 14) + r.range(0, 6.28));
    if (tw * k > 0.35) glint(p, x, y, tw > 0.8 ? 2 : 1, C[6], 0.35 * k);
    else p.dot(x, y, C[5], k);
  });
}
