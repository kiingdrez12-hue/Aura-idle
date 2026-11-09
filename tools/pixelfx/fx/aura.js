// Auras do Aura Idle: um efeito próprio, no estilo do pixelfx, desenhado EM VOLTA do corpo do herói (nada no chão).
// A forma é um volume do tamanho do herói na tela (tronco + cabeça, BODY_TOP px): um campo de distância até o
// corpo diz onde fica o contorno, e cada tier desenha algo diferente em volta dele.
//
// Camadas: drawBack é desenhado atrás do herói 3D (chamas, brilho, a metade de trás das órbitas);
// draw fica na frente dele (a metade da frente das órbitas, faíscas). O meio do corpo nunca é pintado.
//
// Opções: style (0 a 9, um por tier), palette (escuro → claro), seed.
// Tudo se repete a cada `duration` segundos sem emenda (ruído que rola em grade periódica, órbitas inteiras).
import { tileNoise, rand, Rng, TAU, clamp, fit, hex, mix, rgb, WHITE, cycle, bolt } from "pixelfx";

export const meta = {
  name: "Aura",
  desc: "A body-hugging aura in ten styles: outline glow, wind, sparks, flames, spirit wisps, crystals, radiance, cosmic fire.",
  tags: ["aura", "status", "loop", "aura-idle"],
  size: [112, 112],
  origin: [56, 100],
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
// O corpo é o volume do herói 3D como ele aparece na tela, visto de cima pela câmera: tronco em elipse e cabeça
// redonda, BODY_TOP px de altura. O jogo escala o sprite para que esses BODY_TOP px tenham a altura do herói na tela.
export const BODY_TOP = 30;
const X0 = -56, Y0 = -100, W = 112, H = 108; // a grade cobre o quadro inteiro, em coordenadas locais (pés na origem)
const BODY = new Uint8Array(W * H), D = new Float32Array(W * H), U = new Float32Array(W * H);
for (let gy = 0; gy < H; gy++)
  for (let gx = 0; gx < W; gx++) {
    const x = gx + X0 + 0.5, y = gy + Y0 + 0.5;
    const torso = (x / 8.5) ** 2 + ((y + 12) / 12) ** 2 <= 1, head = x * x + (y + 24) ** 2 <= 36;
    if (torso || head) BODY[gy * W + gx] = 1;
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
    for (let k = 1; k <= 34 && y + k < H; k++) {
      const v = D[(y + k) * W + x] + k * 0.42;
      if (v < best) best = v;
    }
    U[y * W + x] = best;
  }
// o contorno: pixels logo fora do corpo, para faíscas e raios
const RIM = [];
// (só acima dos tornozelos: nada sai em direção ao chão)
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const d = D[y * W + x]; if (d >= 1.5 && d < 2.6 && y + Y0 <= -5) RIM.push([x + X0, y + Y0]); }
const CHEST = [0, -15], HEAD = [0, -24];

// ---------- peças
// faixa em volta do corpo: r0 de espessura, amp a mais onde o ruído sobe (chamas), up > 0 usa o campo que sobe
function band(p, ph, C, { r0, amp, up = 0, py = 6, sx = 0.2, sy = 0.12, a = 1, inner = 0, rainbow = 0, seed = 1, light = 0.12 }) {
  const F = up ? U : D;
  for (let gy = 0; gy < H; gy++) {
    const y = gy + Y0;
    if (y > -1) break; // nada no chão: a aura termina nos pés
    for (let gx = 0; gx < W; gx++) {
      const i = gy * W + gx;
      if (BODY[i]) continue;
      const d = F[i];
      if (d > r0 + amp) continue;
      const x = gx + X0;
      const n = tileNoise(x * sx, y * sy + ph * py, 0, py, seed) * 0.5 + 0.5;
      const reach = r0 + amp * n * n;
      if (d >= reach) continue;
      const k = d / reach; // 0 junto ao corpo, 1 na ponta
      let c;
      if (rainbow) {
        const h = (ph + y * 0.012 + x * 0.004) % 1, l = 0.62 - k * 0.3;
        c = hsl(h, 0.95, l);
      } else if (inner && k < inner) c = mix(C[1], C[3], k / inner); // coração escuro (Mítica)
      // chamas (up) escurecem nas pontas; o contorno fica nas cores claras, para aparecer sobre o chão escuro
      else c = C[Math.min(7, Math.max(1, Math.round(7 - k * (up ? 5.5 : 3))))];
      // sólido por dentro, pontilhado só na borda (pixel art limpa)
      p.dot(x, y, c, a * (k < 0.55 ? 1 : (1 - k) / 0.45));
      if (light && (gx + gy) % 3 === 0) p.light(x, y, c, light * (1 - k));
    }
  }
}
function hsl(h, s, l) {
  const f = (n) => { const k = (n + h * 12) % 12, q = s * Math.min(l, 1 - l); return l - q * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return rgb(f(0) * 255, f(8) * 255, f(4) * 255);
}
// algo girando numa elipse em volta do corpo; front decide a camada pela metade da órbita
function orbit(p, ph, layer, { n, rx, ry, yc, turns = 1, tilt = 0, draw, phase = 0 }) {
  for (let i = 0; i < n; i++) {
    const a = (ph * turns + i / n + phase) * TAU, s = Math.sin(a), front = s > 0;
    if ((layer === "front") !== front) continue;
    const x = Math.cos(a) * rx, y = yc + s * ry + Math.cos(a) * tilt;
    draw(x, y, a, i, front);
  }
}
const glint = (p, x, y, r, c, k) => {
  for (let j = 1; j <= r; j++) { p.dot(x + j, y, c, k * (1 - j / (r + 1))); p.dot(x - j, y, c, k * (1 - j / (r + 1))); p.dot(x, y + j, c, k * (1 - j / (r + 1))); p.dot(x, y - j, c, k * (1 - j / (r + 1))); }
  p.dot(x, y, WHITE, k);
  p.glow(x + 0.5, y + 0.5, 3 + r, c, 0.35 * k);
};
// brasas/estrelas subindo em volta do corpo, sem tocar o chão
function motes(p, t, C, { n, seed, rise = 26, life = [0.8, 1.6], spread = 15, star = 0, rainbow = 0 }) {
  cycle(t, meta.duration, n, seed, (g) => g.range(life[0], life[1]), (age, L, r) => {
    const x0 = r.sign() * r.range(5, spread), y0 = -r.range(5, 30), k = Math.min(1, age / 0.2, (L - age) / 0.4);
    if (k <= 0) return;
    const x = x0 + Math.sin(age * r.range(2, 4) + r.range(0, TAU)) * 1.5, y = y0 - rise * age;
    const c = rainbow ? hsl((age / L + r.next()) % 1, 0.9, 0.7) : C[r.chance(0.4) ? 7 : 6];
    if (star && r.chance(0.5)) glint(p, Math.round(x), Math.round(y), 1, c, k);
    else { p.dot(x, y, c, k); p.dot(x, y + 1, C[5], k * 0.6); p.glow(x + 0.5, y + 0.5, 4, c, 0.35 * k); }
  });
}
// pulso: um anel de luz que sai do corpo e some (só acima dos pés)
function pulse(p, ph, C, { every = 1, a = 0.8 }) {
  const k = (ph * every) % 1, R = 3 + k * 14;
  for (let gy = 0; gy < H; gy++) {
    const y = gy + Y0;
    if (y > -2) break;
    for (let gx = 0; gx < W; gx++) {
      const d = D[gy * W + gx];
      if (Math.abs(d - R) < 0.8) p.dot(gx + X0, y, k < 0.3 ? C[7] : C[6], a * (1 - k));
    }
  }
}

// ---------- os 10 estilos
const STYLES = [
  // 0 Comum: contorno de luz que respira, um pulso que sai do corpo e pontos subindo
  { back(p, t, ph, C) { const b = 0.75 + 0.25 * Math.sin(ph * TAU * 2); band(p, ph, C, { r0: 3.5 * b + 1.5, amp: 3, py: 4, a: 0.95, light: 0.18 }); pulse(p, ph, C, { every: 2, a: 0.8 }); },
    front(p, t, ph, C) { motes(p, t, C, { n: 9, seed: 11, rise: 16 }); } },
  // 1 Incomum: redemoinho de vento em volta, fitas girando e folhas
  { back(p, t, ph, C) { band(p, ph, C, { r0: 3.2, amp: 3, py: 6, sx: 0.3, a: 0.85 }); wind(p, ph, C, "back"); },
    front(p, t, ph, C) { wind(p, ph, C, "front"); } },
  // 2 Rara: corpo eletrificado, raios pulando pelo contorno e saindo para fora
  { back(p, t, ph, C) { band(p, ph, C, { r0: 3, amp: 2, py: 8, a: 0.8, light: 0.15 }); arcs(p, ph, C, 0); },
    front(p, t, ph, C) { arcs(p, ph, C, 1); } },
  // 3 Épica: chamas roxas lambendo para cima
  { back(p, t, ph, C) { band(p, ph, C, { r0: 4, amp: 10, up: 1, py: 10, a: 0.95, light: 0.15 }); },
    front(p, t, ph, C) { motes(p, t, C, { n: 9, seed: 31, rise: 32 }); } },
  // 4 Lendária: fogo alto e brasas
  { back(p, t, ph, C) { band(p, ph, C, { r0: 5, amp: 14, up: 1, py: 12, a: 1, light: 0.2 }); },
    front(p, t, ph, C) { motes(p, t, C, { n: 16, seed: 41, rise: 40 }); } },
  // 5 Mítica: chamas de coração escuro, fumaça no alto e raios vermelhos
  { back(p, t, ph, C) { smoke(p, t, C); band(p, ph, C, { r0: 5.5, amp: 15, up: 1, py: 12, a: 1, inner: 0.35, light: 0.18 }); },
    front(p, t, ph, C) { motes(p, t, C, { n: 12, seed: 51, rise: 36 }); arcs(p, ph, C, 1, 2); } },
  // 6 Ancestral: espíritos com cauda girando em volta
  { back(p, t, ph, C) { band(p, ph, C, { r0: 3.4, amp: 3, py: 5, a: 0.85 }); wisps(p, ph, C, "back"); },
    front(p, t, ph, C) { wisps(p, ph, C, "front"); } },
  // 7 Exaltada: brilho e cristais orbitando no peito
  { back(p, t, ph, C) { band(p, ph, C, { r0: 3.6, amp: 3, py: 6, a: 0.85, light: 0.15 }); crystals(p, ph, C, "back"); },
    front(p, t, ph, C) { crystals(p, ph, C, "front"); } },
  // 8 Divina: raios de luz saindo do corpo e auréola
  { back(p, t, ph, C) { rays(p, ph, C); band(p, ph, C, { r0: 4, amp: 3, py: 5, a: 0.9, light: 0.22 }); halo(p, ph, C, "back"); },
    front(p, t, ph, C) { halo(p, ph, C, "front"); motes(p, t, C, { n: 8, seed: 81, rise: 20, star: 1 }); } },
  // 9 Primordial: fogo cósmico em arco-íris, estrelas em órbita e raios
  { back(p, t, ph, C) { band(p, ph, C, { r0: 6, amp: 16, up: 1, py: 12, a: 1, rainbow: 1, light: 0.22 }); stars(p, ph, C, "back"); },
    front(p, t, ph, C) { stars(p, ph, C, "front"); motes(p, t, C, { n: 12, seed: 91, rise: 32, star: 1, rainbow: 1 }); } },
];

function wind(p, ph, C, layer) {
  // quatro fitas de vento em alturas diferentes, cada uma um arco longo com cauda
  for (let b = 0; b < 4; b++) {
    const yc = -6 - b * 8, rx = 16 + b * 2, ry = 4;
    for (let s = 0; s < 22; s++) {
      const a = (ph * (2 + b) + b / 4) * TAU - s * 0.1, sn = Math.sin(a);
      if ((layer === "front") !== sn > 0) continue;
      const k = 1 - s / 22;
      const x = Math.cos(a) * rx, y = yc + sn * ry - s * 0.25;
      p.dot(x, y, s < 3 ? C[7] : s < 10 ? C[6] : C[5], k); p.dot(x, y + 1, C[5], k * 0.8);
    }
    const a = (ph * (2 + b) + b / 4) * TAU, sn = Math.sin(a);
    if ((layer === "front") === sn > 0) { const x = Math.round(Math.cos(a) * rx), y = Math.round(yc + sn * ry); p.dot(x, y, WHITE); p.dot(x + 1, y, C[6]); p.dot(x, y - 1, C[6]); p.dot(x - 1, y + 1, C[4]); p.glow(x, y, 5, C[5], 0.35); }
  }
}
function arcs(p, ph, C, front, few = 0) {
  // a cada 1/15 s, raios novos: uns saltam pelo contorno, outros saem para fora do corpo
  const f = Math.floor(ph * 72), r = new Rng(9000 + f * 7 + front);
  const n = few || 3 + Math.floor(r.next() * 3);
  for (let i = 0; i < n; i++) {
    const [x0, y0] = RIM[Math.floor(r.next() * RIM.length)];
    const out = Math.atan2(y0 - CHEST[1], x0 - CHEST[0]) + r.range(-0.8, 0.8), L = 7 + r.next() * 12;
    const x1 = x0 + Math.cos(out) * L, y1 = Math.min(-4, y0 + Math.sin(out) * L);
    const pts = bolt(r, x0, y0, x1, y1, { jag: 0.4, depth: 3 });
    for (let j = 1; j < pts.length; j++) {
      p.line(pts[j - 1][0] + 1, pts[j - 1][1], pts[j][0] + 1, pts[j][1], C[4], 0.7);
      p.line(pts[j - 1][0], pts[j - 1][1], pts[j][0], pts[j][1], j < 3 ? WHITE : C[6], 1);
    }
    p.glow(x0, y0, 8, C[5], 0.5);
    p.glow(x1, y1, 5, C[6], 0.4);
  }
}
function smoke(p, t, C) {
  const dark = mix(C[0], hex("#000000"), 0.3);
  cycle(t, meta.duration, 8, 55, (g) => g.range(1.2, 2), (age, L, r) => {
    const k = Math.min(1, age / 0.3, (L - age) / 0.6);
    const x = r.range(-9, 9) + Math.sin(age * 2 + r.next() * 6) * 2, y = -36 - age * 16, rad = 2 + age * 2.4;
    if (k > 0) p.disc(x, y, rad, dark, 0.5 * k);
  });
}
function wisps(p, ph, C, layer) {
  // três espíritos em órbitas inclinadas, com cauda longa que some
  for (let w = 0; w < 3; w++) {
    const yc = -11 - w * 8, rx = 17 - w, ry = 5, tilt = (w - 1) * 3;
    for (let s = 24; s >= 0; s--) {
      const a = (ph * (w % 2 ? -2 : 2) + w / 3) * TAU - s * 0.09 * (w % 2 ? -1 : 1), sn = Math.sin(a);
      if ((layer === "front") !== sn > 0) continue;
      const x = Math.cos(a) * rx, y = yc + sn * ry + Math.cos(a) * tilt, k = 1 - s / 25;
      if (s === 0) { p.disc(x, y, 2.6, C[7], 1); p.dot(x, y, WHITE); p.glow(x, y, 9, C[5], 0.55); }
      else { p.dot(x, y, s < 6 ? C[7] : C[6], k); if (s < 14) p.dot(x, y + 1, C[5], k * 0.8); }
    }
  }
}
function crystals(p, ph, C, layer) {
  orbit(p, ph, layer, { n: 6, rx: 17, ry: 4.5, yc: -15, turns: 1, tilt: 2, draw: (x, y, a, i) => {
    const X = Math.round(x), Y = Math.round(y + Math.sin(ph * TAU * 3 + i) * 1.5);
    // um losango de 3x5 com faces clara e escura
    p.dot(X, Y - 2, C[7]); p.dot(X - 1, Y - 1, C[6]); p.dot(X, Y - 1, WHITE); p.dot(X + 1, Y - 1, C[4]);
    p.dot(X - 1, Y, C[5]); p.dot(X, Y, C[6]); p.dot(X + 1, Y, C[3]); p.dot(X, Y + 1, C[3]); p.dot(X, Y + 2, C[2]);
    p.glow(X + 0.5, Y, 7, C[5], 0.45);
    if (((Math.floor(ph * 48) + i * 5) % 16) === 0) glint(p, X, Y - 2, 2, C[7], 1);
  } });
}
function rays(p, ph, C) {
  // raios de luz saindo do peito para fora do corpo, girando devagar e respirando
  const N = 16;
  for (let i = 0; i < N; i++) {
    const a = (i / N + ph * 0.25) * TAU, long = i % 2 === 0, L = (long ? 26 : 15) * (0.85 + 0.15 * Math.sin(ph * TAU * 2 + i));
    let started = false;
    for (let s = 0; s < 50; s += 0.5) {
      const x = CHEST[0] + Math.cos(a) * s, y = CHEST[1] + Math.sin(a) * s * 1.1;
      const gx = Math.round(x) - X0, gy = Math.round(y) - Y0;
      if (gx < 0 || gy < 0 || gx >= W || gy >= H) break;
      const d = D[gy * W + gx];
      if (!started) { if (d < 2) continue; started = s; }
      const k = (s - started) / L;
      if (k >= 1) break;
      if (y > -2) break; // nunca no chão
      p.dot(x, y, k < 0.3 ? C[7] : C[6], (1 - k) * (long ? 1 : 0.7));
    }
  }
}
function halo(p, ph, C, layer) {
  // auréola inclinada sobre a cabeça: a metade de trás atrás do herói, a da frente na frente
  const cx = HEAD[0], cy = HEAD[1] - 11, rx = 8, ry = 2.4;
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * TAU, sn = Math.sin(a);
    if ((layer === "front") !== sn > 0) continue;
    const g = ((i / 64 - ph * 2) % 1 + 1) % 1 < 0.08;
    p.dot(cx + Math.cos(a) * rx, cy + sn * ry, g ? WHITE : C[6], 1);
    p.dot(cx + Math.cos(a) * rx, cy + sn * ry + 1, C[4], 0.7);
  }
  if (layer === "back") p.glow(cx, cy, 14, C[5], 0.35);
}
function stars(p, ph, C, layer) {
  orbit(p, ph, layer, { n: 5, rx: 19, ry: 5, yc: -14, turns: 1, tilt: 3, draw: (x, y, a, i) => {
    const c = hsl((ph + i / 5) % 1, 0.9, 0.72), tw = 0.6 + 0.4 * Math.sin(ph * TAU * 6 + i * 2);
    glint(p, Math.round(x), Math.round(y), tw > 0.85 ? 3 : 2, c, 1);
  } });
  orbit(p, ph, layer, { n: 3, rx: 11, ry: 3, yc: -34, turns: -2, draw: (x, y, a, i) => glint(p, Math.round(x), Math.round(y), 1, hsl((ph + 0.5 + i / 3) % 1, 0.9, 0.75), 0.9) });
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), ph = t / meta.duration;
  // um brilho suave atrás do corpo em todos os tiers (termina na altura dos pés)
  p.glow(CHEST[0], CHEST[1] - 3, 19, C[5], 0.28);
  p.glow(CHEST[0], CHEST[1] - 3, 12, C[6], 0.22);
  STYLES[clamp(o.style | 0, 0, 9)].back(p, t, ph, C);
}
export function draw(p, t, o) {
  const C = fit(o.palette, 8), ph = t / meta.duration;
  STYLES[clamp(o.style | 0, 0, 9)].front(p, t, ph, C);
}
