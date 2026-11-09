// Auras do Aura Idle: um efeito próprio, no estilo do pixelfx, desenhado EM VOLTA do corpo do herói (nada no chão).
// A forma vem da silhueta do boneco do pixelfx (24x38 px, a proporção do herói 3D): um campo de distância até o
// corpo diz onde fica o contorno, e cada tier desenha algo diferente nesse contorno.
//
// Camadas: drawBack é desenhado atrás do herói 3D (chamas, brilho, a metade de trás das órbitas);
// draw fica na frente dele (a metade da frente das órbitas, faíscas). O meio do corpo nunca é pintado.
//
// Opções: style (0 a 9, um por tier), palette (escuro → claro), seed.
// Tudo se repete a cada `duration` segundos sem emenda (ruído que rola em grade periódica, órbitas inteiras).
import { stockActor, tileNoise, rand, Rng, TAU, clamp, fit, hex, mix, rgb, WHITE, cycle, bolt } from "pixelfx";

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
  // só para as prévias desenharem o boneco no meio; a forma da aura vem de stockActor(2) acima
  actor: 2,
  options: {
    palette: ["#14141c", "#2a2e3c", "#4a5468", "#7a849a", "#aab4c8", "#d4dae6", "#ffffff", "#ffffff"],
    style: 0,
    seed: 7,
  },
};

// ---------- a silhueta e os campos de distância (calculados uma vez)
const A = stockActor(2);
const X0 = -56, Y0 = -100, W = 112, H = 108; // a grade cobre o quadro inteiro, em coordenadas locais (pés na origem)
const BODY = new Uint8Array(W * H), D = new Float32Array(W * H), U = new Float32Array(W * H);
for (let y = 0; y < A.h; y++)
  for (let x = 0; x < A.w; x++)
    if (A.mask.data[y * A.w + x]) {
      const gx = x + A.x - X0, gy = y + A.y - Y0;
      if (gx >= 0 && gy >= 0 && gx < W && gy < H) BODY[gy * W + gx] = 1;
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
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const d = D[y * W + x]; if (d >= 1.5 && d < 2.6 && y + Y0 <= -6) RIM.push([x + X0, y + Y0]); }
const CHEST = [0, -24], HEAD = [0, -33];

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
      else c = C[Math.min(7, Math.max(1, Math.round(7 - k * 5.5)))];
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
// brasas/estrelas subindo do contorno, sem tocar o chão
function motes(p, t, C, { n, seed, rise = 26, life = [0.8, 1.6], spread = 14, star = 0, rainbow = 0 }) {
  cycle(t, meta.duration, n, seed, (g) => g.range(life[0], life[1]), (age, L, r) => {
    const x0 = r.sign() * r.range(4, spread), y0 = -r.range(6, 36), k = Math.min(1, age / 0.2, (L - age) / 0.4);
    if (k <= 0) return;
    const x = x0 + Math.sin(age * r.range(2, 4) + r.range(0, TAU)) * 1.5, y = y0 - rise * age;
    const c = rainbow ? hsl((age / L + r.next()) % 1, 0.9, 0.7) : C[r.chance(0.4) ? 7 : 5];
    if (star && r.chance(0.4)) glint(p, Math.round(x), Math.round(y), 1, c, k);
    else { p.dot(x, y, c, k); p.glow(x + 0.5, y + 0.5, 3, c, 0.3 * k); }
  });
}

// ---------- os 10 estilos
const STYLES = [
  // 0 Comum: um contorno de luz que respira, poucos pontos subindo
  { back(p, t, ph, C) { const b = 0.75 + 0.25 * Math.sin(ph * TAU * 2); band(p, ph, C, { r0: 2.2 * b + 0.6, amp: 1.6, py: 4, a: 0.7 }); },
    front(p, t, ph, C) { motes(p, t, C, { n: 5, seed: 11, rise: 14 }); } },
  // 1 Incomum: vento verde em volta, fitas girando e folhinhas
  { back(p, t, ph, C) { band(p, ph, C, { r0: 2.5, amp: 2.5, py: 6, sx: 0.3, a: 0.65 }); wind(p, ph, C, "back"); },
    front(p, t, ph, C) { wind(p, ph, C, "front"); } },
  // 2 Rara: faíscas elétricas pulando no contorno
  { back(p, t, ph, C) { band(p, ph, C, { r0: 2.4, amp: 1.4, py: 8, a: 0.6 }); arcs(p, ph, C, 0); },
    front(p, t, ph, C) { arcs(p, ph, C, 1); } },
  // 3 Épica: chamas roxas lambendo para cima
  { back(p, t, ph, C) { band(p, ph, C, { r0: 3.5, amp: 7, up: 1, py: 10, a: 0.9 }); },
    front(p, t, ph, C) { motes(p, t, C, { n: 6, seed: 31, rise: 30 }); } },
  // 4 Lendária: fogo laranja alto e brasas
  { back(p, t, ph, C) { band(p, ph, C, { r0: 4.5, amp: 10, up: 1, py: 12, a: 1, light: 0.18 }); },
    front(p, t, ph, C) { motes(p, t, C, { n: 12, seed: 41, rise: 38 }); } },
  // 5 Mítica: chamas carmesim de coração escuro e fumaça no alto
  { back(p, t, ph, C) { smoke(p, t, C); band(p, ph, C, { r0: 5, amp: 11, up: 1, py: 12, a: 1, inner: 0.35, light: 0.16 }); },
    front(p, t, ph, C) { motes(p, t, C, { n: 10, seed: 51, rise: 34 }); } },
  // 6 Ancestral: espíritos verde-água com cauda girando em volta
  { back(p, t, ph, C) { band(p, ph, C, { r0: 2.4, amp: 2, py: 5, a: 0.55 }); wisps(p, ph, C, "back"); },
    front(p, t, ph, C) { wisps(p, ph, C, "front"); } },
  // 7 Exaltada: brilho rosa e cristais orbitando no peito
  { back(p, t, ph, C) { band(p, ph, C, { r0: 3.4, amp: 2.4, py: 6, a: 0.75 }); crystals(p, ph, C, "back"); },
    front(p, t, ph, C) { crystals(p, ph, C, "front"); } },
  // 8 Divina: raios dourados saindo do corpo e auréola
  { back(p, t, ph, C) { rays(p, ph, C); band(p, ph, C, { r0: 3.6, amp: 2, py: 5, a: 0.85, light: 0.2 }); halo(p, ph, C, "back"); },
    front(p, t, ph, C) { halo(p, ph, C, "front"); motes(p, t, C, { n: 6, seed: 81, rise: 18, star: 1 }); } },
  // 9 Primordial: fogo cósmico em arco-íris e estrelas em órbita
  { back(p, t, ph, C) { band(p, ph, C, { r0: 5.5, amp: 12, up: 1, py: 12, a: 1, rainbow: 1, light: 0.2 }); stars(p, ph, C, "back"); },
    front(p, t, ph, C) { stars(p, ph, C, "front"); motes(p, t, C, { n: 10, seed: 91, rise: 30, star: 1, rainbow: 1 }); } },
];

function wind(p, ph, C, layer) {
  // três fitas de vento em alturas diferentes, cada uma um arco com cauda
  for (let b = 0; b < 3; b++) {
    const yc = -8 - b * 11, rx = 14 + b * 1.5, ry = 3.2;
    for (let s = 0; s < 14; s++) {
      const a = (ph * (2 + b) + b / 3) * TAU - s * 0.11, sn = Math.sin(a);
      if ((layer === "front") !== sn > 0) continue;
      const k = 1 - s / 14;
      p.dot(Math.cos(a) * rx, yc + sn * ry - s * 0.3, s < 2 ? C[7] : C[5], k * 0.9);
    }
    // uma folhinha na ponta
    const a = (ph * (2 + b) + b / 3) * TAU, sn = Math.sin(a);
    if ((layer === "front") === sn > 0) { const x = Math.round(Math.cos(a) * rx), y = Math.round(yc + sn * ry); p.dot(x, y, C[6]); p.dot(x + 1, y, C[4]); p.dot(x, y - 1, C[4]); }
  }
}
function arcs(p, ph, C, front) {
  // a cada 1/15 s, de 2 a 4 faíscas novas saltam entre pontos do contorno
  const f = Math.floor(ph * 72), r = new Rng(9000 + f * 7 + front);
  const n = 2 + Math.floor(r.next() * 3);
  for (let i = 0; i < n; i++) {
    const [x0, y0] = RIM[Math.floor(r.next() * RIM.length)];
    const a = r.next() * TAU, L = 5 + r.next() * 8, x1 = x0 + Math.cos(a) * L, y1 = Math.min(-4, y0 + Math.sin(a) * L);
    const pts = bolt(r, x0, y0, x1, y1, { jag: 0.35, depth: 3 });
    for (let j = 1; j < pts.length; j++) p.line(pts[j - 1][0], pts[j - 1][1], pts[j][0], pts[j][1], j < 2 ? WHITE : C[6], 1);
    p.glow(x0, y0, 6, C[5], 0.4);
  }
}
function smoke(p, t, C) {
  const dark = mix(C[0], hex("#000000"), 0.3);
  cycle(t, meta.duration, 7, 55, (g) => g.range(1.2, 2), (age, L, r) => {
    const k = Math.min(1, age / 0.3, (L - age) / 0.6);
    const x = r.range(-8, 8) + Math.sin(age * 2 + r.next() * 6) * 2, y = -42 - age * 16, rad = 2 + age * 2.2;
    if (k > 0) p.disc(x, y, rad, dark, 0.45 * k);
  });
}
function wisps(p, ph, C, layer) {
  // três espíritos em órbitas inclinadas, com cauda que some
  for (let w = 0; w < 3; w++) {
    const yc = -12 - w * 9, rx = 15 - w, ry = 5, tilt = (w - 1) * 3;
    for (let s = 18; s >= 0; s--) {
      const a = (ph * (w % 2 ? -2 : 2) + w / 3) * TAU - s * 0.09 * (w % 2 ? -1 : 1), sn = Math.sin(a);
      if ((layer === "front") !== sn > 0) continue;
      const x = Math.cos(a) * rx, y = yc + sn * ry + Math.cos(a) * tilt, k = 1 - s / 19;
      if (s === 0) { p.disc(x, y, 1.6, C[7], 1); p.glow(x, y, 7, C[5], 0.5); }
      else p.dot(x, y, s < 5 ? C[6] : C[4], k * 0.9);
    }
  }
}
function crystals(p, ph, C, layer) {
  orbit(p, ph, layer, { n: 6, rx: 15, ry: 4, yc: -22, turns: 1, tilt: 2, draw: (x, y, a, i) => {
    const X = Math.round(x), Y = Math.round(y + Math.sin(ph * TAU * 3 + i) * 1.5);
    // um losango de 3x5 com faces clara e escura
    p.dot(X, Y - 2, C[7]); p.dot(X - 1, Y - 1, C[6]); p.dot(X, Y - 1, WHITE); p.dot(X + 1, Y - 1, C[4]);
    p.dot(X - 1, Y, C[5]); p.dot(X, Y, C[6]); p.dot(X + 1, Y, C[3]); p.dot(X, Y + 1, C[3]); p.dot(X, Y + 2, C[2]);
    p.glow(X + 0.5, Y, 6, C[5], 0.35);
    if (((Math.floor(ph * 48) + i * 5) % 16) === 0) glint(p, X, Y - 2, 2, C[7], 1);
  } });
}
function rays(p, ph, C) {
  // raios curtos saindo do peito para fora do corpo, girando devagar e respirando
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = (i / N + ph * 0.25) * TAU, long = i % 2 === 0, L = (long ? 20 : 12) * (0.85 + 0.15 * Math.sin(ph * TAU * 2 + i));
    let started = false;
    for (let s = 0; s < 46; s += 0.5) {
      const x = CHEST[0] + Math.cos(a) * s, y = CHEST[1] + Math.sin(a) * s * 1.1;
      const gx = Math.round(x) - X0, gy = Math.round(y) - Y0;
      if (gx < 0 || gy < 0 || gx >= W || gy >= H) break;
      const d = D[gy * W + gx];
      if (!started) { if (d < 2) continue; started = s; }
      const k = (s - started) / L;
      if (k >= 1) break;
      if (y > -2) break; // nunca no chão
      p.dot(x, y, k < 0.3 ? C[7] : C[6], (1 - k) * (long ? 0.9 : 0.6));
    }
  }
}
function halo(p, ph, C, layer) {
  // auréola inclinada sobre a cabeça: a metade de trás atrás do herói, a da frente na frente
  const cx = HEAD[0], cy = HEAD[1] - 9, rx = 8, ry = 2.4;
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * TAU, sn = Math.sin(a);
    if ((layer === "front") !== sn > 0) continue;
    const g = ((i / 64 - ph * 2) % 1 + 1) % 1 < 0.08;
    p.dot(cx + Math.cos(a) * rx, cy + sn * ry, g ? WHITE : C[6], 1);
  }
  if (layer === "back") p.glow(cx, cy, 12, C[5], 0.3);
}
function stars(p, ph, C, layer) {
  orbit(p, ph, layer, { n: 5, rx: 17, ry: 5, yc: -20, turns: 1, tilt: 3, draw: (x, y, a, i) => {
    const c = hsl((ph + i / 5) % 1, 0.9, 0.72), tw = 0.6 + 0.4 * Math.sin(ph * TAU * 6 + i * 2);
    glint(p, Math.round(x), Math.round(y), tw > 0.85 ? 2 : 1, c, 1);
  } });
  orbit(p, ph, layer, { n: 3, rx: 11, ry: 3, yc: -36, turns: -2, draw: (x, y, a, i) => glint(p, Math.round(x), Math.round(y), 1, hsl((ph + 0.5 + i / 3) % 1, 0.9, 0.75), 0.9) });
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), ph = t / meta.duration;
  STYLES[clamp(o.style | 0, 0, 9)].back(p, t, ph, C);
}
export function draw(p, t, o) {
  const C = fit(o.palette, 8), ph = t / meta.duration;
  STYLES[clamp(o.style | 0, 0, 9)].front(p, t, ph, C);
}
