// Auras do Aura Idle: um efeito próprio, no estilo do pixelfx, desenhado EM VOLTA do corpo do herói (nada no chão).
// A forma nasce da silhueta do próprio herói em pixel art (o boneco em pé do rig2x, espelhado e engordado um pouco
// para cobrir elmo, chapéu e capa): um campo de distância até ela diz onde fica o contorno, e cada tier desenha
// uma coisa diferente em volta, com silhueta própria (labareda, vento, raios, asas, órbitas).
//
// Pixel art em faixas: cada chama tem contorno escuro, corpo, miolo claro e fio branco junto ao herói, sem
// pontilhado de transparência. Uma onda de energia sobe pelo corpo de tempos em tempos e as pontas se soltam.
//
// Camadas: drawBack é desenhado atrás do herói (chamas, asas, a metade de trás das órbitas);
// draw fica na frente dele (a metade da frente das órbitas, faíscas). O meio do corpo nunca é pintado.
//
// Opções: style (0 a 9, um por tier), palette (escuro → claro), seed.
// Tudo se repete a cada `duration` segundos sem emenda (ruído que rola em grade periódica, órbitas inteiras).
import { tileNoise, Rng, TAU, clamp, fit, hex, mix, rgb, WHITE, cycle, bolt } from "pixelfx";
import { posed, STAND } from "./rig2x.js";

export const meta = {
  name: "Aura",
  desc: "A body-hugging aura in ten styles: shimmer, wind, lightning, flames, dark fire, spirits, crystals, wings of light, cosmic fire.",
  tags: ["aura", "status", "loop", "aura-idle"],
  size: [176, 176],
  origin: [88, 160],
  duration: 4.8,
  loop: true,
  fps: 30,
  bg: "dark",
  options: {
    palette: ["#14141c", "#2a2e3c", "#4a5468", "#7a849a", "#aab4c8", "#d4dae6", "#ffffff", "#ffffff"],
    style: 0,
    seed: 7,
  },
};

// ---------- o corpo e os campos de distância (calculados uma vez)
// BODY_TOP px = a altura do herói em pé. O jogo escala o sprite para que esses px tenham a altura do herói na tela.
export const BODY_TOP = 48;
const HERO_PX = 76; // altura do boneco do rig2x, em px dele
const X0 = -88, Y0 = -160, W = 176, H = 164; // a grade cobre o quadro, em coordenadas locais (pés na origem)
const BODY = new Uint8Array(W * H), D = new Float32Array(W * H), U = new Float32Array(W * H);
{
  // silhueta do herói em pé, reduzida para BODY_TOP px, espelhada (ele vira para os dois lados) e engordada 2 px
  const r = posed(STAND), f = BODY_TOP / HERO_PX, raw = new Uint8Array(W * H);
  for (let i = 0; i < r.n; i++) {
    const y = Math.round(r.ys[i] * f) - Y0;
    if (y < 0 || y >= H) continue;
    for (const sx of [1, -1]) { const x = Math.round(r.xs[i] * f * sx) - X0; if (x >= 0 && x < W) raw[y * W + x] = 1; }
  }
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    let on = 0;
    for (let dy = -2; dy <= 2 && !on; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dy) <= 3 && raw[(y + dy) * W + x + dx]) { on = 1; break; }
    BODY[y * W + x] = on;
  }
  // fecha os buracos entre as pernas e os braços: tudo entre o primeiro e o último pixel de cada linha é corpo
  for (let y = 0; y < H; y++) { let a = -1, b = -1; for (let x = 0; x < W; x++) if (BODY[y * W + x]) { if (a < 0) a = x; b = x; } for (let x = a; a >= 0 && x <= b; x++) BODY[y * W + x] = 1; }
}
// distância (chanfro 3-4) até o pixel do corpo mais próximo
{
  const INF = 1e9;
  for (let i = 0; i < W * H; i++) D[i] = BODY[i] ? 0 : INF;
  const pass = (x, y, dx, dy, w) => {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;
    const v = D[ny * W + nx] + w;
    if (v < D[y * W + x]) D[y * W + x] = v;
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { pass(x, y, -1, 0, 3); pass(x, y, 0, -1, 3); pass(x, y, -1, -1, 4); pass(x, y, 1, -1, 4); }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { pass(x, y, 1, 0, 3); pass(x, y, 0, 1, 3); pass(x, y, 1, 1, 4); pass(x, y, -1, 1, 4); }
  for (let i = 0; i < W * H; i++) D[i] /= 3;
}
// "para cima é mais barato": as chamas sobem do corpo, então a distância olhando para baixo pesa menos
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    let best = D[y * W + x];
    for (let k = 1; k <= 70 && y + k < H; k++) {
      const v = D[(y + k) * W + x] + k * 0.5;
      if (v < best) best = v;
    }
    U[y * W + x] = best;
  }
// o contorno: pixels logo fora do corpo, para faíscas e raios (só acima dos tornozelos: nada sai para o chão)
const RIM = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const d = D[y * W + x]; if (d >= 1.5 && d < 2.6 && y + Y0 <= -7) RIM.push([x + X0, y + Y0]); }
const CHEST = [0, -Math.round(BODY_TOP * 0.56)], HEAD = [0, -Math.round(BODY_TOP * 0.86)], TOP = -BODY_TOP;

// ---------- peças
function hsl(h, s, l) {
  const f = (n) => { const k = (n + h * 12) % 12, q = s * Math.min(l, 1 - l); return l - q * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return rgb(f(0) * 255, f(8) * 255, f(4) * 255);
}
// A chama em faixas. r0: espessura junto ao corpo; amp: quanto as línguas sobem; up: usa o campo que sobe;
// taper: as línguas do meio são mais altas (labareda em gota); surge: ondas de energia subindo por loop;
// core: miolo escuro (Mítica); rainbow: fogo cósmico; edge: 1 desenha o contorno escuro.
function flame(p, ph, C, { r0, amp, up = 1, py = 10, sx = 0.11, sy = 0.07, taper = 0.6, surge = 0, core = 0, rainbow = 0, seed = 1, light = 0.14, breathe = 0.12, bits = 1 }) {
  const F = up ? U : D, br = 1 + breathe * Math.sin(ph * TAU * 4), R0 = r0 * br, A = amp * br;
  const sgY = surge ? -(((ph * surge) % 1) * (BODY_TOP + A + 14)) + 6 : 1e9;
  const maxR = R0 + A + 7, halfW = 20 + A * 0.5;
  for (let gy = 0; gy < H; gy++) {
    const y = gy + Y0;
    if (y > -1) break; // nada no chão: a aura termina nos pés
    const sg = Math.max(0, 1 - Math.abs(y - sgY) / 5), foot = y > -12 ? 0.3 + 0.7 * (-y / 12) : 1;
    for (let gx = 0; gx < W; gx++) {
      const i = gy * W + gx;
      if (BODY[i]) continue;
      const d = F[i];
      if (d > maxR) continue;
      const x = gx + X0;
      // duas oitavas rolando para cima em velocidades diferentes: línguas grandes que tremem nas pontas
      const n1 = tileNoise(x * sx, y * sy + ph * py, 0, py, seed) * 0.5 + 0.5;
      const n2 = tileNoise(x * sx * 2.3, y * sy * 2.1 + ph * py * 2, 0, py * 2, seed + 17) * 0.5 + 0.5;
      const n = n1 * 0.72 + n2 * 0.28, tp = 1 - taper * Math.min(1, (x / halfW) ** 2);
      const reach = (R0 + A * n * n * tp + sg * 2.5) * foot;
      if (d >= reach) {
        // pedaços soltos acima das pontas
        if (bits && up && d < reach + 6 && n2 > 0.8 && n1 > 0.5 && y < TOP * 0.4) p.dot(x, y, rainbow ? hsl((ph + y * 0.01) % 1, 0.95, 0.65) : C[d < reach + 3 ? 5 : 4], 1);
        continue;
      }
      const k = d / reach; // 0 junto ao corpo, 1 na ponta
      let c;
      if (rainbow) c = reach - d < 1.2 ? hsl((ph + y * 0.008 + 0.5) % 1, 0.9, 0.3) : hsl((ph * 2 + y * 0.008 + x * 0.003) % 1, 0.95, k < 0.2 ? 0.84 : k < 0.45 ? 0.7 : k < 0.75 ? 0.58 : 0.46);
      else if (reach - d < 1.2) c = C[2]; // contorno escuro: destaca a chama do chão
      else if (core && k < core) c = k < core * 0.5 ? C[0] : C[1]; // coração escuro (Mítica)
      else if (d < 1.4) c = C[7]; // fio branco junto ao herói
      else c = C[k < 0.2 ? 6 : k < 0.45 ? 5 : k < 0.75 ? 4 : 3];
      if (sg > 0.35 && !rainbow && !(core && k < core)) c = mix(c, WHITE, 0.55 * sg);
      p.dot(x, y, c, 1);
      if (light && (gx + gy) % 3 === 0) p.light(x, y, c, light * (1 - k));
    }
  }
}
// algo girando numa elipse em volta do corpo; a metade de trás da órbita vai na camada de trás
function orbit(p, ph, layer, { n, rx, ry, yc, turns = 1, tilt = 0, draw, phase = 0 }) {
  for (let i = 0; i < n; i++) {
    const a = (ph * turns + i / n + phase) * TAU, s = Math.sin(a), front = s > 0;
    if ((layer === "front") !== front) continue;
    draw(Math.cos(a) * rx, yc + s * ry + Math.cos(a) * tilt, a, i, front);
  }
}
const glint = (p, x, y, r, c, k) => {
  for (let j = 1; j <= r; j++) { const a = k * (1 - j / (r + 1)); p.dot(x + j, y, c, a); p.dot(x - j, y, c, a); p.dot(x, y + j, c, a); p.dot(x, y - j, c, a); }
  p.dot(x, y, WHITE, k);
  p.glow(x + 0.5, y + 0.5, 3 + r, c, 0.35 * k);
};
// brasas/estrelas subindo em volta do corpo, sem tocar o chão
function motes(p, t, C, { n, seed, rise = 40, life = [0.8, 1.6], spread = 24, star = 0, rainbow = 0, big = 0 }) {
  cycle(t, meta.duration, n, seed, (g) => g.range(life[0], life[1]), (age, L, r) => {
    const x0 = r.sign() * r.range(7, spread), y0 = -r.range(8, BODY_TOP), k = Math.min(1, age / 0.2, (L - age) / 0.4);
    if (k <= 0) return;
    const x = Math.round(x0 + Math.sin(age * r.range(2, 4) + r.range(0, TAU)) * 2.5), y = Math.round(y0 - rise * age);
    const c = rainbow ? hsl((age / L + r.next()) % 1, 0.9, 0.7) : C[r.chance(0.4) ? 7 : 6];
    if (star && r.chance(0.5)) glint(p, x, y, 2, c, k);
    else { p.dot(x, y, c, k); p.dot(x, y + 1, C[5], k); if (big) { p.dot(x + 1, y, c, k); p.dot(x + 1, y + 1, C[4], k); } p.dot(x, y + 2, C[3], k * 0.7); p.glow(x + 0.5, y + 0.5, 5, c, 0.35 * k); }
  });
}
// pulso: um anel de luz que sai do corpo e some (só acima dos pés)
function pulse(p, ph, C, { every = 1, reach = 20 }) {
  const k = (ph * every) % 1, R = 3 + k * reach;
  if (k > 0.85) return;
  for (let gy = 0; gy < H; gy++) {
    const y = gy + Y0;
    if (y > -3) break;
    for (let gx = 0; gx < W; gx++) {
      const d = D[gy * W + gx];
      if (Math.abs(d - R) < 1 && ((gx + gy) & 1 || k < 0.45)) p.dot(gx + X0, y, k < 0.3 ? C[7] : k < 0.6 ? C[6] : C[4], 1);
    }
  }
}

// ---------- os 10 estilos
const STYLES = [
  // 0 Comum: véu fino de energia que respira, um pulso saindo do corpo e pontos subindo
  { back(p, t, ph, C) { flame(p, ph, C, { r0: 3, amp: 7, py: 6, taper: 0.8, breathe: 0.3, bits: 0, light: 0.1 }); pulse(p, ph, C, { every: 3, reach: 14 }); },
    front(p, t, ph, C) { motes(p, t, C, { n: 8, seed: 11, rise: 22 }); } },
  // 1 Incomum: redemoinho de vento em volta, fitas girando e folhas
  { back(p, t, ph, C) { flame(p, ph, C, { r0: 3, amp: 8, py: 8, sx: 0.16, taper: 0.5, bits: 0 }); wind(p, ph, C, "back"); },
    front(p, t, ph, C) { wind(p, ph, C, "front"); leaves(p, t, C); } },
  // 2 Rara: corpo eletrificado, raios pulando pelo contorno e saindo para fora, anel elétrico na cintura
  { back(p, t, ph, C) { flame(p, ph, C, { r0: 3.5, amp: 6, up: 0, py: 16, sx: 0.3, sy: 0.3, taper: 0, breathe: 0.25, bits: 0, light: 0.18 }); arcs(p, ph, C, 0); zapRing(p, ph, C, "back"); },
    front(p, t, ph, C) { arcs(p, ph, C, 1); zapRing(p, ph, C, "front"); } },
  // 3 Épica: labareda roxa com onda de energia subindo
  { back(p, t, ph, C) { flame(p, ph, C, { r0: 4, amp: 22, py: 10, surge: 3 }); },
    front(p, t, ph, C) { motes(p, t, C, { n: 10, seed: 31, rise: 46 }); } },
  // 4 Lendária: fogo alto, largo e cheio de brasas
  { back(p, t, ph, C) { flame(p, ph, C, { r0: 5.5, amp: 34, py: 12, sx: 0.09, taper: 0.5, surge: 4, light: 0.2 }); },
    front(p, t, ph, C) { motes(p, t, C, { n: 20, seed: 41, rise: 60, big: 1, spread: 30 }); } },
  // 5 Mítica: chamas de coração negro, fumaça no alto e raios vermelhos
  { back(p, t, ph, C) { smoke(p, t, C); flame(p, ph, C, { r0: 6, amp: 34, py: 12, sx: 0.13, taper: 0.35, core: 0.42, surge: 3, light: 0.18 }); },
    front(p, t, ph, C) { motes(p, t, C, { n: 12, seed: 51, rise: 50, big: 1 }); arcs(p, ph, C, 1, 3); } },
  // 6 Ancestral: véu espectral, espíritos com cauda e runas flutuando
  { back(p, t, ph, C) { flame(p, ph, C, { r0: 3.5, amp: 12, py: 6, sx: 0.07, sy: 0.05, taper: 0.3, breathe: 0.2 }); wisps(p, ph, C, "back"); runes(p, ph, C, "back"); },
    front(p, t, ph, C) { wisps(p, ph, C, "front"); runes(p, ph, C, "front"); } },
  // 7 Exaltada: brilho cristalino, cristais grandes orbitando e estilhaços subindo
  { back(p, t, ph, C) { flame(p, ph, C, { r0: 4, amp: 10, py: 8, sx: 0.22, sy: 0.04, taper: 0.4, surge: 2, bits: 0, light: 0.16 }); crystals(p, ph, C, "back"); },
    front(p, t, ph, C) { crystals(p, ph, C, "front"); motes(p, t, C, { n: 9, seed: 71, rise: 30, star: 1 }); } },
  // 8 Divina: asas de luz, raios saindo do corpo e auréola
  { back(p, t, ph, C) { rays(p, ph, C); wingsOfLight(p, ph, C); flame(p, ph, C, { r0: 4.5, amp: 9, py: 6, taper: 0.5, breathe: 0.2, bits: 0, light: 0.24 }); halo(p, ph, C, "back"); },
    front(p, t, ph, C) { halo(p, ph, C, "front"); motes(p, t, C, { n: 10, seed: 81, rise: 26, star: 1, spread: 34 }); } },
  // 9 Primordial: fogo cósmico em arco-íris, o maior de todos, com estrelas em órbita e raios
  { back(p, t, ph, C) { flame(p, ph, C, { r0: 7, amp: 42, py: 12, sx: 0.08, taper: 0.45, rainbow: 1, surge: 4, light: 0.22 }); stars(p, ph, C, "back"); },
    front(p, t, ph, C) { stars(p, ph, C, "front"); motes(p, t, C, { n: 16, seed: 91, rise: 56, star: 1, rainbow: 1, spread: 34 }); arcs(p, ph, C, 1, 2); } },
];

function wind(p, ph, C, layer) {
  // cinco fitas de vento em alturas diferentes, cada uma um arco longo com cauda e ponta brilhante
  for (let b = 0; b < 5; b++) {
    const yc = -7 - b * 10, rx = 24 + (b % 2) * 5, ry = 5, sp = 2 + (b % 3), dir = b % 2 ? -1 : 1;
    for (let s = 0; s < 34; s++) {
      const a = (ph * sp * dir + b / 5) * TAU - s * 0.075 * dir, sn = Math.sin(a);
      if ((layer === "front") !== sn > 0) continue;
      const x = Math.cos(a) * rx, y = yc + sn * ry - s * 0.3;
      if (s > 22 && s % 2) continue; // a cauda se desfaz em traços
      p.dot(x, y, s < 4 ? C[7] : s < 14 ? C[6] : C[5], 1); p.dot(x, y + 1, s < 14 ? C[4] : C[3], 1);
      if (s < 8) p.dot(x, y - 1, C[5], 1);
    }
    const a = (ph * sp * dir + b / 5) * TAU, sn = Math.sin(a);
    if ((layer === "front") === sn > 0) { const x = Math.round(Math.cos(a) * rx), y = Math.round(yc + sn * ry); p.dot(x, y, WHITE); p.dot(x + dir, y, WHITE); p.glow(x, y, 6, C[5], 0.4); }
  }
}
function leaves(p, t, C) {
  cycle(t, meta.duration, 7, 19, (g) => g.range(1.2, 2), (age, L, r) => {
    const a = r.range(0, TAU) + age * r.range(2.5, 4), rad = r.range(16, 28), k = Math.min(1, age / 0.2, (L - age) / 0.3);
    if (k <= 0 || Math.sin(a) < 0) return;
    const x = Math.round(Math.cos(a) * rad), y = Math.round(-10 - age * 22 + Math.sin(a) * 4);
    p.dot(x, y, C[6], k); p.dot(x + 1, y, C[5], k); p.dot(x + 1, y - 1, C[7], k); p.dot(x + 2, y - 1, C[4], k);
  });
}
function arcs(p, ph, C, front, few = 0) {
  // a cada 1/15 s, raios novos: saem do contorno do corpo para fora
  const f = Math.floor(ph * 72), r = new Rng(9000 + f * 7 + front);
  const n = few || 3 + Math.floor(r.next() * 3);
  for (let i = 0; i < n; i++) {
    const [x0, y0] = RIM[Math.floor(r.next() * RIM.length)];
    const out = Math.atan2(y0 - CHEST[1], x0 - CHEST[0]) + r.range(-0.8, 0.8), L = 10 + r.next() * 20;
    const x1 = x0 + Math.cos(out) * L, y1 = Math.min(-5, y0 + Math.sin(out) * L);
    const pts = bolt(r, x0, y0, x1, y1, { jag: 0.4, depth: 3 });
    for (let j = 1; j < pts.length; j++) {
      p.line(pts[j - 1][0] + 1, pts[j - 1][1], pts[j][0] + 1, pts[j][1], C[4], 1);
      p.line(pts[j - 1][0], pts[j - 1][1] + 1, pts[j][0], pts[j][1] + 1, C[3], 1);
      p.line(pts[j - 1][0], pts[j - 1][1], pts[j][0], pts[j][1], j < 4 ? WHITE : C[6], 1);
    }
    p.glow(x0, y0, 9, C[5], 0.5);
    p.glow(x1, y1, 6, C[6], 0.45);
  }
}
function zapRing(p, ph, C, layer) {
  // anel elétrico serrilhado girando na altura do peito
  const N = 56, f = Math.floor(ph * 48);
  for (let i = 0; i < N; i++) {
    const a = (i / N + ph * 2) * TAU, sn = Math.sin(a);
    if ((layer === "front") !== sn > 0) continue;
    const j = ((i * 7 + f * 3) % 5) - 2, x = Math.cos(a) * 25, y = CHEST[1] + 4 + sn * 5 + j * 0.9;
    if ((i + f) % 9 < 2) continue; // falhas que correm pelo anel
    p.dot(x, y, (i + f) % 6 === 0 ? WHITE : C[6], 1); p.dot(x, y + 1, C[4], 1);
  }
}
function smoke(p, t, C) {
  const dark = mix(C[0], hex("#000000"), 0.35);
  cycle(t, meta.duration, 10, 55, (g) => g.range(1.2, 2), (age, L, r) => {
    const k = Math.min(1, age / 0.3, (L - age) / 0.6);
    const x = r.range(-14, 14) + Math.sin(age * 2 + r.next() * 6) * 3, y = TOP - 18 - age * 24, rad = 3 + age * 3.4;
    if (k > 0) p.disc(x, y, rad, dark, 0.55 * k);
  });
}
function wisps(p, ph, C, layer) {
  // três espíritos em órbitas inclinadas, com cauda longa que some e olhinhos
  for (let w = 0; w < 3; w++) {
    const yc = -16 - w * 13, rx = 27 - w * 2, ry = 7, tilt = (w - 1) * 5, dir = w % 2 ? -1 : 1;
    for (let s = 34; s >= 0; s--) {
      const a = (ph * 2 * dir + w / 3) * TAU - s * 0.065 * dir, sn = Math.sin(a);
      if ((layer === "front") !== sn > 0) continue;
      const x = Math.cos(a) * rx, y = yc + sn * ry + Math.cos(a) * tilt;
      if (s === 0) { p.disc(x, y, 3.6, C[6], 1); p.disc(x, y, 2.4, C[7], 1); p.dot(x - 1, y, C[1]); p.dot(x + 1, y, C[1]); p.glow(x, y, 12, C[5], 0.55); }
      else if (s < 26 || s % 2 === 0) { const th = s < 8 ? 2 : s < 18 ? 1 : 0; for (let q = -th; q <= th; q++) p.dot(x, y + q, q === 0 ? (s < 10 ? C[7] : C[6]) : C[5], 1); p.dot(x, y + th + 1, C[3], 1); }
    }
  }
}
// runas: glifos de 5x5 girando devagar em volta
const GLYPH = ["01110,10001,11111,10001,01110", "00100,01110,10101,00100,00100", "10001,01010,00100,01010,10001", "11111,00100,01110,00100,11111"].map((s) => s.split(","));
function runes(p, ph, C, layer) {
  orbit(p, ph, layer, { n: 4, rx: 33, ry: 6, yc: CHEST[1] - 6, turns: 1, tilt: -4, phase: 0.1, draw: (x, y, a, i) => {
    const X = Math.round(x) - 2, Y = Math.round(y + Math.sin(ph * TAU * 3 + i * 1.7) * 2) - 2, g = GLYPH[i], on = (Math.floor(ph * 24) + i * 3) % 12 < 9;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (g[r][c] === "1") { p.dot(X + c, Y + r, on ? C[7] : C[5], 1); p.dot(X + c, Y + r + 1, C[2], 0.9); }
    p.glow(X + 2.5, Y + 2.5, 8, C[5], on ? 0.5 : 0.25);
  } });
}
function crystals(p, ph, C, layer) {
  orbit(p, ph, layer, { n: 6, rx: 28, ry: 7, yc: CHEST[1], turns: 1, tilt: 3, draw: (x, y, a, i) => {
    const X = Math.round(x), Y = Math.round(y + Math.sin(ph * TAU * 3 + i) * 2.5), big = i % 2 === 0, h = big ? 6 : 4, w = big ? 3 : 2;
    // losango facetado: contorno escuro, face clara à esquerda, escura à direita, brilho no topo
    for (let dy = -h; dy <= h; dy++) {
      const ww = Math.round(w * (1 - Math.abs(dy) / (h + 0.5)));
      for (let dx = -ww; dx <= ww; dx++) p.dot(X + dx, Y + dy, Math.abs(dx) === ww ? C[2] : dx < 0 ? (dy < 0 ? C[7] : C[6]) : dy < 0 ? C[5] : C[4], 1);
    }
    p.dot(X, Y - h - 1, C[2]); p.dot(X, Y + h + 1, C[2]); p.dot(X - 1, Y - 2, WHITE);
    p.glow(X + 0.5, Y, 9, C[5], 0.45);
    if ((Math.floor(ph * 48) + i * 5) % 16 === 0) glint(p, X, Y - h, 3, C[7], 1);
  } });
}
function rays(p, ph, C) {
  // raios de luz saindo do peito para fora do corpo, girando devagar e respirando
  const N = 10;
  for (let i = 0; i < N; i++) {
    const a = (i / N + ph * 0.25) * TAU, long = i % 2 === 0, L = (long ? 34 : 18) * (0.8 + 0.2 * Math.sin(ph * TAU * 3 + i));
    let started = false;
    for (let s = 0; s < 90; s += 0.5) {
      const x = CHEST[0] + Math.cos(a) * s, y = CHEST[1] + Math.sin(a) * s * 1.1;
      const gx = Math.round(x) - X0, gy = Math.round(y) - Y0;
      if (gx < 0 || gy < 0 || gx >= W || gy >= H) break;
      const d = D[gy * W + gx];
      if (!started) { if (d < 3) continue; started = s; }
      const k = (s - started) / L;
      if (k >= 1 || y > -3) break; // nunca no chão
      p.dot(x, y, k < 0.35 ? C[7] : k < 0.7 ? C[6] : C[5], 1);
      if (long && k < 0.5) p.dot(x + 1, y, C[5], 1);
    }
  }
}
function wingsOfLight(p, ph, C) {
  // duas asas de penas de luz abertas atrás dos ombros, batendo devagar
  const flap = Math.sin(ph * TAU * 2) * 0.16, sy = Math.round(TOP * 0.72);
  for (const side of [-1, 1]) {
    for (let f = 0; f < 6; f++) {
      const u = f / 5, ang = -0.38 - u * 0.85 + flap * (1 - u * 0.5), L = 44 - u * 18 + (f === 1 ? 4 : 0);
      const bx = side * (6 + f * 1.2), by = sy + f * 2.5;
      for (let s = 0; s <= L; s++) {
        const k = s / L, bend = k * k * 9 * (0.5 + u);
        const x = Math.round(bx + side * (Math.cos(ang) * s)), y = Math.round(by + Math.sin(ang) * s + bend);
        if (y > -4) break;
        const th = k < 0.12 ? 2 : k < 0.7 ? 4 - Math.round(u * 1.5) : 2;
        for (let q = 0; q <= th; q++) p.dot(x, y + q, q === 0 ? (k < 0.6 ? C[7] : C[6]) : q === th ? C[4] : C[6], 1);
        p.dot(x, y - 1, C[5], 1); p.dot(x, y + th + 1, C[2], 1);
      }
    }
    p.glow(side * 22, sy - 12, 22, C[5], 0.3);
  }
}
function halo(p, ph, C, layer) {
  // auréola inclinada sobre a cabeça: a metade de trás atrás do herói, a da frente na frente
  const cx = HEAD[0], cy = TOP - 7, rx = 12, ry = 3.4;
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * TAU, sn = Math.sin(a);
    if ((layer === "front") !== sn > 0) continue;
    const g = ((i / 96 - ph * 2) % 1 + 1) % 1 < 0.1, x = cx + Math.cos(a) * rx, y = cy + sn * ry;
    p.dot(x, y, g ? WHITE : C[7], 1); p.dot(x, y + 1, C[5], 1); p.dot(x, y + 2, C[3], 1);
  }
  if (layer === "back") p.glow(cx, cy, 18, C[5], 0.4);
}
function stars(p, ph, C, layer) {
  // anel de poeira estelar, estrelas grandes em órbita e uma coroa pequena no alto
  orbit(p, ph, layer, { n: 40, rx: 34, ry: 8, yc: CHEST[1] - 2, turns: 1, tilt: 6, draw: (x, y, a, i) => { if (i % 3) p.dot(x, y, hsl((ph + i / 40) % 1, 0.9, 0.7), 1); } });
  orbit(p, ph, layer, { n: 5, rx: 34, ry: 8, yc: CHEST[1] - 2, turns: 1, tilt: 6, draw: (x, y, a, i) => {
    const c = hsl((ph + i / 5) % 1, 0.9, 0.72), tw = 0.6 + 0.4 * Math.sin(ph * TAU * 6 + i * 2);
    glint(p, Math.round(x), Math.round(y), tw > 0.85 ? 5 : 3, c, 1);
  } });
  orbit(p, ph, layer, { n: 3, rx: 16, ry: 4, yc: TOP - 12, turns: -2, draw: (x, y, a, i) => glint(p, Math.round(x), Math.round(y), 2, hsl((ph + 0.5 + i / 3) % 1, 0.9, 0.75), 0.9) });
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), ph = t / meta.duration;
  // um brilho suave atrás do corpo em todos os tiers (termina na altura dos pés)
  p.glow(CHEST[0], CHEST[1] - 4, 30, C[5], 0.28);
  p.glow(CHEST[0], CHEST[1] - 4, 19, C[6], 0.22);
  STYLES[clamp(o.style | 0, 0, 9)].back(p, t, ph, C);
}
export function draw(p, t, o) {
  const C = fit(o.palette, 8), ph = t / meta.duration;
  STYLES[clamp(o.style | 0, 0, 9)].front(p, t, ph, C);
}
