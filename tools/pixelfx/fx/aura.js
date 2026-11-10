// Auras do Aura Idle: um EMBLEMA circular de energia atrás do herói, na altura do quadril, girando sem parar.
// Cada tier tem um emblema com tema próprio, em traço fino e brilhante (pixel art de linha): anel simples, vendaval,
// tempestade, círculo arcano, coroa de brasas, lua de sangue, bastião de gelo, órbita de cristal, sol sagrado e
// anéis do cosmos.
//
// Camadas: drawBack desenha o emblema atrás do herói; draw desenha o que passa na frente dele (a metade de baixo das
// órbitas: cristais, folhas, estrelas, faíscas), para o emblema parecer estar em volta do corpo.
//
// Opções: style (0 a 9, um por tier), palette (escuro → claro), seed.
// Tudo se repete a cada `duration` segundos sem emenda (giros inteiros, ruído em grade periódica).
import { tileNoise, Rng, TAU, clamp, fit, rgb, WHITE, cycle, bolt } from "pixelfx";

export const meta = {
  name: "Aura",
  desc: "A spinning ring emblem behind the hero in ten themes: plain ring, gale, storm, arcane circle, ember crown, blood moon, frost, crystal orbit, holy sun, cosmic rings.",
  tags: ["aura", "status", "loop", "aura-idle"],
  size: [128, 128],
  origin: [64, 96],
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

// BODY_TOP px = a altura do herói em pé. O jogo escala o sprite para que esses px tenham a altura do herói na tela.
export const BODY_TOP = 48;
// o emblema: centro no quadril do herói, raio de quase meio corpo
const CX = 0, CY = -20, R = 21;

// ---------- peças
function hsl(h, s, l) {
  const f = (n) => { const k = (n + h * 12) % 12, q = s * Math.min(l, 1 - l); return l - q * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return rgb(f(0) * 255, f(8) * 255, f(4) * 255);
}
const wrap = (a) => ((a % TAU) + TAU) % TAU;
// anel de espessura w: cf(ângulo, e) devolve a cor (ou null para pular); e = distância até a linha do anel
function ring(p, r, w, cf, cx = CX, cy = CY) {
  const m = Math.ceil(r + w + 1), h = Math.max(0.6, w / 2);
  for (let dy = -m; dy <= m; dy++) for (let dx = -m; dx <= m; dx++) {
    const e = Math.hypot(dx, dy) - r;
    if (Math.abs(e) > h) continue;
    const c = cf(wrap(Math.atan2(dy, dx)), e);
    if (c != null) p.dot(cx + dx, cy + dy, c, 1);
  }
  if (r > 8 && HALO) for (let dy = -m - 1; dy <= m + 1; dy++) for (let dx = -m - 1; dx <= m + 1; dx++) {
    const e = Math.hypot(dx, dy) - r;
    if (e > h && e <= h + 1.1) p.light(cx + dx, cy + dy, HALO, 0.55);
    else if (e < -h && e >= -h - 1.1) p.light(cx + dx, cy + dy, HALO, 0.3);
  }
}
let HALO = 0; // cor do brilho em volta dos traços (definida a cada quadro pela paleta)
// quanto um ponto do anel está perto da "cabeça" de um cometa que corre por ele (1 na cabeça, 0 no fim da cauda)
const comet = (a, head, len) => { const d = wrap(head - a); return d < len ? 1 - d / len : 0; };
// cor de traço: tom da paleta que clareia conforme k (0 a 1)
const tone = (C, k) => (k > 0.85 ? WHITE : C[Math.max(3, Math.min(7, Math.round(4 + k * 3)))]);
const pol = (r, a, cx = CX, cy = CY) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
const seg = (p, r0, a0, r1, a1, c) => { const [x0, y0] = pol(r0, a0), [x1, y1] = pol(r1, a1); p.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), c, 1); };
const glint = (p, x, y, r, c, k = 1) => {
  for (let j = 1; j <= r; j++) { const a = k * (1 - j / (r + 1)); p.dot(x + j, y, c, a); p.dot(x - j, y, c, a); p.dot(x, y + j, c, a); p.dot(x, y - j, c, a); }
  p.dot(x, y, WHITE, k);
  p.glow(x + 0.5, y + 0.5, 3 + r, c, 0.35 * k);
};
// algo girando no anel; a metade de baixo passa na frente do herói
function orbit(p, ph, layer, { n, r, turns = 1, phase = 0, squash = 1, draw }) {
  for (let i = 0; i < n; i++) {
    const a = wrap((ph * turns + i / n + phase) * TAU), front = Math.sin(a) > 0.15;
    if ((layer === "front") !== front) continue;
    draw(CX + Math.cos(a) * r, CY + Math.sin(a) * r * squash, a, i);
  }
}
// cristal facetado apontando para o ângulo a (comprimento L, meia largura wd)
function shard(p, x, y, a, L, wd, C) {
  const ca = Math.cos(a), sa = Math.sin(a);
  for (let s = -1; s <= L; s++) {
    const k = s / L, hw = wd * (k < 0.3 ? 0.45 + k / 0.3 * 0.55 : 1 - (k - 0.3) / 0.7);
    for (let q = -Math.ceil(hw); q <= Math.ceil(hw); q++) {
      if (Math.abs(q) > hw + 0.3) continue;
      const px = Math.round(x + ca * s - sa * q), py = Math.round(y + sa * s + ca * q);
      p.dot(px, py, Math.abs(q) > hw - 0.7 ? C[2] : q < 0 ? (k < 0.5 ? C[7] : C[6]) : k < 0.5 ? C[5] : C[4], 1);
    }
  }
  p.dot(Math.round(x + ca * L * 0.3 - sa * -0.5), Math.round(y + sa * L * 0.3), WHITE, 1);
}
const glow = (p, C, k = 0.3, r = R + 12) => { p.glow(CX, CY, r, C[5], k * 1.5); p.glow(CX, CY, r * 0.6, C[6], k * 0.8); };

// ---------- os 10 emblemas
const STYLES = [
  // 0 Comum · Anel simples: um anel fino com um cometa de luz correndo por ele e marcas girando ao contrário
  { back(p, t, ph, C) {
      glow(p, C, 0.2);
      const head = ph * TAU * 2;
      ring(p, R, 2, (a) => tone(C, comet(a, wrap(head), 2.2)));
      for (let i = 0; i < 8; i++) { const a = (i / 8 - ph) * TAU; seg(p, R + 3, a, R + 5, a, i % 2 ? C[4] : C[6]); }
      const [hx, hy] = pol(R, head); glint(p, Math.round(hx), Math.round(hy), 2, C[7]);
    },
    front() {} },
  // 1 Incomum · Vendaval: duas lâminas de vento girando em sentidos opostos e folhas em órbita
  { back(p, t, ph, C) {
      glow(p, C, 0.22);
      for (const [r, dir, off] of [[R, 1, 0], [R, 1, Math.PI], [R - 6, -1, 0.8], [R - 6, -1, 0.8 + Math.PI]]) {
        const head = dir * ph * TAU * 2 + off;
        ring(p, r, 3, (a, e) => { const k = dir > 0 ? comet(a, wrap(head), 2.4) : comet(wrap(-a), wrap(-head), 2.4); return k > 0 && Math.abs(e) <= 0.4 + k * 1.3 ? (Math.abs(e) > k * 1.1 ? C[3] : tone(C, k)) : null; });
      }
      leaves(p, ph, C, "back");
    },
    front(p, t, ph, C) { leaves(p, ph, C, "front"); } },
  // 2 Rara · Espiral de tempestade: anel elétrico serrilhado, dois fios trançados e faíscas saltando para fora
  { back(p, t, ph, C) {
      glow(p, C, 0.3);
      const f = Math.floor(ph * 72);
      for (const [k, c] of [[0, C[4]], [1, C[7]]]) {
        let px, py;
        for (let i = 0; i <= 72; i++) {
          const a = (i / 72 + ph) * TAU, j = new Rng(700 + (i % 72) * 13 + f * 7 + k * 99).range(-2.4, 2.4);
          const [x, y] = pol(R + j + Math.sin(a * 6 + ph * TAU * 6 + k * 2) * 1.6, a);
          if (i) p.line(Math.round(px), Math.round(py), Math.round(x), Math.round(y), c, 1);
          px = x; py = y;
        }
      }
      sparks(p, ph, C, 0);
    },
    front(p, t, ph, C) { sparks(p, ph, C, 1); } },
  // 3 Épica · Círculo arcano: dois anéis, runas correndo entre eles e uma estrela de seis pontas girando por dentro
  { back(p, t, ph, C) {
      glow(p, C, 0.3);
      ring(p, R + 3, 2, (a) => tone(C, 0.35 + 0.65 * comet(a, wrap(ph * TAU), 1.6)));
      ring(p, R - 3, 1, (a) => tone(C, 0.2 + 0.6 * comet(wrap(-a), wrap(ph * TAU * 2), 1.2)));
      for (let i = 0; i < 12; i++) { const a = (i / 12 + ph) * TAU, [x, y] = pol(R, a), X = Math.round(x), Y = Math.round(y), g = RUNE[i % RUNE.length], on = (Math.floor(ph * 24) + i) % 12 < 2; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (g[r][c] === "1") p.dot(X + c - 1, Y + r - 1, on ? WHITE : C[6], 1); }
      for (let k = 0; k < 2; k++) for (let i = 0; i < 3; i++) { const a0 = (i / 3 + k / 6 - ph) * TAU; seg(p, R - 4, a0, R - 4, a0 + TAU / 3, k ? C[5] : C[6]); }
      ring(p, 5, 1, () => C[6]); p.dot(CX, CY, WHITE, 1);
    },
    front(p, t, ph, C) { motes(p, t, C, 8, 33); } },
  // 4 Lendária · Coroa de brasas: anel de fogo com labaredas arrastadas pelo giro e brasas se soltando
  { back(p, t, ph, C) {
      glow(p, C, 0.34);
      const m = R + 16;
      for (let dy = -m; dy <= m; dy++) for (let dx = -m; dx <= m; dx++) {
        const d = Math.hypot(dx, dy), a = wrap(Math.atan2(dy, dx)), e = d - R;
        if (e < -3 || e > 15) continue;
        // as labaredas inclinam para trás do giro: quanto mais longe do anel, mais atrasado o ângulo
        const n = tileNoise((a - e * 0.09) / TAU * 14 + ph * 14, e * 0.22 - ph * 6, 14, 6, 5) * 0.5 + 0.5;
        const reach = 2.5 + 13 * n * n * (0.6 + 0.4 * Math.sin(a * 3 - ph * TAU * 3));
        if (e > reach) continue;
        const k = e < 0 ? -e / 3 : e / reach;
        p.dot(CX + dx, CY + dy, reach - e < 1.1 && e > 0 ? C[2] : Math.abs(e) < 1 ? C[7] : k < 0.35 ? C[6] : k < 0.7 ? C[5] : C[4], 1);
      }
      embers(p, t, C, "back");
    },
    front(p, t, ph, C) { embers(p, t, C, "front"); } },
  // 5 Mítica · Lua de sangue: anel duplo, estrela de cinco pontas girando, lua crescente e gotas escorrendo
  { back(p, t, ph, C) {
      glow(p, C, 0.32);
      ring(p, R + 2, 2, (a) => tone(C, 0.3 + 0.7 * comet(a, wrap(-ph * TAU), 2)));
      ring(p, R - 1, 1, () => C[4]);
      for (let i = 0; i < 5; i++) { const a0 = (i / 5 + ph) * TAU - Math.PI / 2; seg(p, R - 2, a0, R - 2, a0 + TAU * 0.4, i === Math.floor(ph * 20) % 5 ? C[7] : C[5]); }
      for (let i = 0; i < 5; i++) { const [x, y] = pol(R - 1, (i / 5 + ph) * TAU - Math.PI / 2); p.disc(x, y, 1.6, C[6], 1); }
      // lua crescente no alto à esquerda: disco claro com um disco escuro mordendo
      const [mx, my] = pol(R + 5, Math.PI * 1.28);
      for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const d = Math.hypot(dx, dy), d2 = Math.hypot(dx - 2.4, dy + 0.8); if (d <= 4.6 && d2 > 3.9) p.dot(Math.round(mx) + dx, Math.round(my) + dy, d > 3.6 ? C[3] : d2 < 4.8 ? C[7] : C[6], 1); }
      drips(p, t, C);
    },
    front(p, t, ph, C) { motes(p, t, C, 6, 53); } },
  // 6 Ancestral · Bastião de gelo: anel com raios de floco de neve e cristais de gelo crescendo para fora
  { back(p, t, ph, C) {
      glow(p, C, 0.3);
      ring(p, R, 2, (a) => tone(C, 0.35 + 0.65 * comet(a, wrap(ph * TAU), 1.8)));
      ring(p, R - 6, 1, (a) => (Math.floor(a / TAU * 48 + ph * 48) % 3 ? C[5] : null));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8 + ph * 0.5) * TAU;
        seg(p, R - 5, a, R - 1, a, C[6]);
        seg(p, R - 4, a - 0.09, R - 2, a, C[5]); seg(p, R - 4, a + 0.09, R - 2, a, C[5]);
        const grow = 0.75 + 0.25 * Math.sin(ph * TAU * 4 + i * 1.3), [x, y] = pol(R + 1, a);
        shard(p, x, y, a, (i % 2 ? 8 : 13) * grow, i % 2 ? 2 : 2.8, C);
      }
      snow(p, t, C);
    },
    front() {} },
  // 7 Exaltada · Órbita de cristal: anel pontilhado com contas de luz e cristais grandes orbitando em volta do herói
  { back(p, t, ph, C) {
      glow(p, C, 0.3);
      ring(p, R + 2, 1, (a) => (Math.floor(a / TAU * 60 - ph * 60) % 2 ? C[5] : C[3]));
      beads(p, ph, C, "back"); gems(p, ph, C, "back");
    },
    front(p, t, ph, C) { beads(p, ph, C, "front"); gems(p, ph, C, "front"); } },
  // 8 Divina · Sol sagrado: anel dourado duplo com raios longos e curtos girando e uma estrela de quatro pontas
  { back(p, t, ph, C) {
      glow(p, C, 0.4, R + 18);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16 + ph * 0.5) * TAU, long = i % 2 === 0, L = (long ? 11 : 6) * (0.85 + 0.15 * Math.sin(ph * TAU * 4 + i));
        seg(p, R + 3, a - 0.07, R + 3 + L, a, C[5]); seg(p, R + 3, a + 0.07, R + 3 + L, a, C[5]); seg(p, R + 3, a, R + 3 + L, a, long ? C[7] : C[6]);
      }
      ring(p, R + 1, 2, (a, e) => (e > 0.4 ? C[4] : tone(C, 0.5 + 0.5 * comet(a, wrap(ph * TAU * 2), 1.4))));
      ring(p, R - 4, 1, () => C[5]);
      for (let i = 0; i < 4; i++) { const a = (i / 4 - ph * 0.5) * TAU; seg(p, 4, a, R - 5, a, C[6]); seg(p, 4, a + 0.5, R - 9, a, C[4]); seg(p, 4, a - 0.5, R - 9, a, C[4]); }
      ring(p, 4, 1, () => C[7]);
    },
    front(p, t, ph, C) {
      orbit(p, ph, "front", { n: 6, r: R + 1, turns: 2, draw: (x, y) => glint(p, Math.round(x), Math.round(y), 2, C[7]) });
      motes(p, t, C, 8, 83);
    } },
  // 9 Primordial · Anéis do cosmos: três anéis em arco-íris girando em sentidos opostos, marcas de relógio e
  // duas estrelas com cauda em órbita inclinada em volta do herói
  { back(p, t, ph, C) {
      glow(p, C, 0.36, R + 18);
      const hue = (a, o = 0) => hsl(wrap(a + ph * TAU + o) / TAU, 0.95, 0.62);
      ring(p, R + 6, 2, (a) => hue(a));
      for (let i = 0; i < 12; i++) { const a = (i / 12 - ph * 0.5) * TAU; seg(p, R + 7, a, R + (i % 3 ? 9 : 11), a, hsl(i / 12, 0.9, 0.7)); }
      ring(p, R, 2, (a, e) => { const k = comet(a, wrap(-ph * TAU * 2), 2.6) + comet(a, wrap(-ph * TAU * 2 + Math.PI), 2.6); return k > 0 ? (k > 0.8 ? WHITE : hue(a, 2)) : Math.abs(e) < 0.6 ? hsl(wrap(a) / TAU, 0.7, 0.32) : null; });
      ring(p, R - 7, 1, (a) => (Math.floor(a / TAU * 24 + ph * 48) % 2 ? hue(-a, 4) : null));
      seg(p, 0, 0, R - 8, ph * TAU * 2 - Math.PI / 2, WHITE); seg(p, 0, 0, R - 12, ph * TAU - Math.PI / 2, hsl(ph, 0.9, 0.7));
      p.disc(CX, CY, 1.6, WHITE, 1);
      comets(p, ph, "back");
    },
    front(p, t, ph, C) { comets(p, ph, "front"); motes(p, t, C, 10, 93, 1); } },
];

const RUNE = ["010,111,010", "101,010,101", "111,101,111", "110,011,110", "010,101,010", "111,010,010"].map((s) => s.split(","));
function leaves(p, ph, C, layer) {
  orbit(p, ph, layer, { n: 6, r: R + 6, turns: 2, draw: (x, y, a, i) => {
    const X = Math.round(x), Y = Math.round(y + Math.sin(ph * TAU * 6 + i * 2) * 1.5), fl = Math.cos(a) > 0 ? 1 : -1;
    p.dot(X, Y, C[6], 1); p.dot(X + fl, Y, C[5], 1); p.dot(X + fl, Y - 1, C[7], 1); p.dot(X + 2 * fl, Y - 1, C[4], 1); p.dot(X - fl, Y + 1, C[3], 1);
  } });
}
function sparks(p, ph, C, front) {
  const f = Math.floor(ph * 72), r = new Rng(9100 + f * 7);
  for (let i = 0; i < 5; i++) {
    const a = r.range(0, TAU), L = r.range(5, 12), a2 = a + r.range(-0.5, 0.5);
    if ((Math.sin(a) > 0.15 ? 1 : 0) !== front) continue;
    const [x0, y0] = pol(R, a), [x1, y1] = pol(R + L, a2), pts = bolt(r, x0, y0, x1, y1, { jag: 0.4, depth: 2 });
    for (let j = 1; j < pts.length; j++) { p.line(pts[j - 1][0], pts[j - 1][1] + 1, pts[j][0], pts[j][1] + 1, C[3], 1); p.line(pts[j - 1][0], pts[j - 1][1], pts[j][0], pts[j][1], j < 3 ? WHITE : C[6], 1); }
    p.glow(x0, y0, 6, C[5], 0.5);
  }
}
function embers(p, t, C, layer) {
  cycle(t, meta.duration, 16, 41, (g) => g.range(0.5, 1.1), (age, L, r) => {
    const a0 = r.range(0, TAU), a = a0 - age * 1.6, rad = R + 3 + age * r.range(8, 16), k = Math.min(1, age / 0.1, (L - age) / 0.3);
    if (k <= 0 || (layer === "front") !== Math.sin(a) > 0.15) return;
    const [x, y] = pol(rad, a), X = Math.round(x), Y = Math.round(y - age * 4);
    p.dot(X, Y, age < L * 0.4 ? C[7] : C[6], k); p.dot(X, Y + 1, C[4], k * 0.8); p.glow(X, Y, 4, C[5], 0.3 * k);
  });
}
function drips(p, t, C) {
  cycle(t, meta.duration, 5, 57, (g) => g.range(0.9, 1.5), (age, L, r) => {
    const a = r.range(0.25, 2.9), [x, y0] = pol(R + 2, a), len = Math.min(7, age * 10), X = Math.round(x), fall = age > 0.7 ? (age - 0.7) * 26 : 0;
    for (let s = 0; s <= len; s++) { const y = Math.round(y0 + s + fall); if (y > 2) break; p.dot(X, y, s === Math.floor(len) ? C[7] : C[5], 1 - (age / L) * 0.4); }
  });
}
function snow(p, t, C) {
  cycle(t, meta.duration, 8, 61, (g) => g.range(1, 1.8), (age, L, r) => {
    const x = Math.round(r.range(-R - 8, R + 8) + Math.sin(age * 3 + r.range(0, 6)) * 2), y = Math.round(CY - R - 6 + age * r.range(14, 22)), k = Math.min(1, age / 0.2, (L - age) / 0.3);
    if (k <= 0 || y > -2) return;
    if (r.chance(0.4)) glint(p, x, y, 1, C[7], k); else p.dot(x, y, C[7], k);
  });
}
function beads(p, ph, C, layer) {
  orbit(p, ph, layer, { n: 14, r: R + 2, turns: -1, draw: (x, y, a, i) => { p.dot(Math.round(x), Math.round(y), i % 2 ? C[7] : C[6], 1); if (i % 2) p.glow(x, y, 3, C[5], 0.35); } });
}
function gems(p, ph, C, layer) {
  orbit(p, ph, layer, { n: 5, r: R + 3, turns: 1, draw: (x, y, a, i) => {
    const big = i % 2 === 0;
    shard(p, x, y - (big ? 7 : 5), Math.PI / 2 + Math.sin(ph * TAU * 2 + i) * 0.25, big ? 14 : 10, big ? 3.6 : 2.6, C);
    p.glow(x, y, 8, C[5], 0.4);
    if ((Math.floor(ph * 48) + i * 5) % 16 === 0) glint(p, Math.round(x), Math.round(y - 4), 3, C[7]);
  } });
}
function comets(p, ph, layer) {
  // duas estrelas com cauda numa órbita achatada e inclinada: passam por trás do herói em cima e pela frente embaixo
  for (let c = 0; c < 2; c++) for (let s = 26; s >= 0; s--) {
    const a = wrap((ph * 2 + c / 2) * TAU - s * 0.06), front = Math.sin(a) > 0;
    if ((layer === "front") !== front) continue;
    const x = Math.cos(a) * (R + 9), y = Math.sin(a) * 9 + Math.cos(a) * 7, X = Math.round(CX + x), Y = Math.round(CY + y), col = hsl(wrap(a + c * 3) / TAU, 0.95, 0.68);
    if (s === 0) glint(p, X, Y, 4, col);
    else if (s < 18 || s % 2 === 0) { p.dot(X, Y, s < 6 ? WHITE : col, 1); if (s < 10) p.dot(X, Y + 1, col, 1); }
  }
}
// pontos de luz subindo devagar em volta do emblema
function motes(p, t, C, n, seed, rainbow = 0) {
  cycle(t, meta.duration, n, seed, (g) => g.range(0.8, 1.5), (age, L, r) => {
    const x = Math.round(r.range(-R - 6, R + 6) + Math.sin(age * 3 + r.range(0, 6)) * 2), y = Math.round(CY + r.range(-R, R * 0.6) - age * 16), k = Math.min(1, age / 0.2, (L - age) / 0.4);
    if (k <= 0) return;
    const c = rainbow ? hsl((age / L + r.next()) % 1, 0.9, 0.7) : C[7];
    if (r.chance(0.35)) glint(p, x, y, 1, c, k); else { p.dot(x, y, c, k); p.dot(x, y + 1, C[5], k * 0.7); }
  });
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8);
  HALO = C[4];
  STYLES[clamp(o.style | 0, 0, 9)].back(p, t, t / meta.duration, C);
}
export function draw(p, t, o) {
  const C = fit(o.palette, 8);
  HALO = C[4];
  STYLES[clamp(o.style | 0, 0, 9)].front(p, t, t / meta.duration, C);
}
