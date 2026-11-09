// Os heróis do Aura Idle em pixel art: o esqueleto do pixelfx (rig.js, o boneco que atua nos golpes) veste a roupa de
// cada classe. O rig resolve a pose e entrega cada pixel com o tom (claro → escuro), a parte do corpo de onde veio e o
// pixel do boneco em pé correspondente (`src`); aqui cada parte ganha o material da classe (aço, pano, couro, pele,
// dourado) e por cima entram as peças que o boneco não tem: elmo com pluma, chapéu de mago, capuz, capa, saia do manto,
// cajado, aljava.
//
// Opções: cls (knight, mage, archer, paladin), pose (objeto de pose do pixelfx), look ({a: armadura, c: pano, t: detalhe},
// cores da skin), wind (0 a 1, quanto a capa balança), flip pelo place do createFx.
// Camadas: drawBack desenha a capa e o que fica atrás do corpo; draw desenha o corpo e o que fica na frente.
import { posed, posedParts, skeleton, STAND, hex, mix, rgb, DUMMY_PAL } from "pixelfx";

export const meta = {
  name: "Hero",
  desc: "The Aura Idle heroes: the pixelfx rig dressed per class (knight, mage, archer, paladin).",
  tags: ["actor", "hero", "aura-idle"],
  size: [112, 96],
  origin: [56, 82],
  duration: 1,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { cls: "knight", pose: null, look: { a: "#b8c0cc", c: "#6a1d30", t: "#d8ab4c" }, wind: 0 },
};

// ---------- o boneco em pé: de qual parte do corpo é cada pixel
const PART = { pelvis: 1, waist: 2, chest: 3, neck: 4, head: 5, face: 6, upperN: 7, elbowN: 8, foreN: 9, handN: 10, upperF: 11, elbowF: 12, foreF: 13, handF: 14, thighN: 15, kneeN: 16, shinN: 17, footN: 18, thighF: 19, kneeF: 20, shinF: 21, footF: 22 };
const REST_PART = new Uint8Array(24 * 38);
{
  const ink = hex(DUMMY_PAL.k) >>> 0;
  for (const pr of posedParts(STAND)) {
    if (pr.part > 22) continue;
    for (let i = 0; i < pr.n; i++) {
      if (pr.color[i] >>> 0 === ink) continue;
      const c = pr.xs[i] + 12, r = 38 + pr.ys[i];
      if (c >= 0 && r >= 0 && c < 24 && r < 38) REST_PART[r * 24 + c] = pr.part;
    }
  }
}
// tom de cada cor do boneco: as placas (A..D) e as juntas (E..G, um tom mais escuras)
const P = Object.fromEntries(Object.entries(DUMMY_PAL).map(([k, v]) => [k, hex(v) >>> 0]));
const TONE = new Map([[P.A, 0], [P.B, 1], [P.C, 2], [P.D, 3], [P.E, 1], [P.F, 2], [P.G, 3]]);
const INK = P.k, SEAM = P.J, MARK = P.m;

// ---------- materiais: 4 tons do claro ao escuro a partir de uma cor base
const shades = (c) => { const b = hex(c); return [mix(b, hex("#ffffff"), 0.32), b, mix(b, hex("#000000"), 0.32), mix(b, hex("#000000"), 0.55)]; };
const SKIN = shades("#f0b98e"), LEATHER = shades("#8a5a36"), DARK = shades("#3d3550"), GOLD = shades("#e8b830");
const OUT = hex("#120d1a");

// que material veste cada parte, por classe (s: aço/armadura, c: pano, t: detalhe dourado, k: pele, l: couro, d: escuro)
const DRESS = {
  knight: { head: "s", face: "s", neck: "d", chest: "s", waist: "l", pelvis: "c", upperN: "s", elbowN: "d", foreN: "s", handN: "l", upperF: "s", elbowF: "d", foreF: "s", handF: "l", thighN: "c", kneeN: "s", shinN: "s", footN: "l", thighF: "c", kneeF: "s", shinF: "s", footF: "l" },
  paladin: { head: "s", face: "s", neck: "t", chest: "s", waist: "t", pelvis: "c", upperN: "t", elbowN: "d", foreN: "s", handN: "s", upperF: "t", elbowF: "d", foreF: "s", handF: "s", thighN: "s", kneeN: "t", shinN: "s", footN: "s", thighF: "s", kneeF: "t", shinF: "s", footF: "s" },
  mage: { head: "c", face: "k", neck: "k", chest: "c", waist: "t", pelvis: "c", upperN: "c", elbowN: "c", foreN: "c", handN: "k", upperF: "c", elbowF: "c", foreF: "c", handF: "k", thighN: "c", kneeN: "c", shinN: "c", footN: "d", thighF: "c", kneeF: "c", shinF: "c", footF: "d" },
  archer: { head: "c", face: "k", neck: "c", chest: "l", waist: "d", pelvis: "l", upperN: "c", elbowN: "l", foreN: "l", handN: "l", upperF: "c", elbowF: "l", foreF: "l", handF: "l", thighN: "d", kneeN: "d", shinN: "l", footN: "l", thighF: "d", kneeF: "d", shinF: "l", footF: "l" },
};
const PART_NAME = Object.fromEntries(Object.entries(PART).map(([k, v]) => [v, k]));

function mats(o) {
  const L = o.look || meta.options.look;
  return { s: shades(L.a), c: shades(L.c), t: shades(L.t), k: SKIN, l: LEATHER, d: DARK };
}

// ---------- uma camada de pixels com contorno: as peças extras são desenhadas aqui e recebem a linha escura por fora
class Layer {
  constructor() { this.m = new Map(); }
  set(x, y, c) { this.m.set(((y + 200) << 10) | (x + 500), c); }
  has(x, y) { return this.m.has(((y + 200) << 10) | (x + 500)); }
  fill(fn, x0, y0, x1, y1) { for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) { const c = fn(x, y); if (c != null) this.set(x, y, c); } }
  // desenha no painter com contorno OUT em volta (só onde não há nada)
  draw(p, outline = true) {
    if (outline) for (const k of this.m.keys()) {
      const x = (k & 1023) - 500, y = (k >> 10) - 200;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!this.has(x + dx, y + dy)) p.px(x + dx, y + dy, OUT);
    }
    for (const [k, c] of this.m) p.px((k & 1023) - 500, (k >> 10) - 200, c);
  }
}
const tone3 = (S, u) => S[u < 0.3 ? 0 : u < 0.7 ? 1 : 2];

// ---------- peças extras
function cape(L, J, o, M, wind) {
  // pano preso nos dois ombros, caindo atrás das pernas e balançando
  const a = J.shoulderF, b = J.shoulderN, top = Math.min(a[1], b[1]) + 1, bot = -4, sway = -2 - 3 * wind;
  const xl = Math.min(a[0], b[0]) - 1, xr = Math.max(a[0], b[0]) + 1;
  L.fill((x, y) => {
    const u = (y - top) / (bot - top); if (u < 0 || u > 1) return null;
    const l = xl - 2 + sway * u - u * 2.5, r = xr - 1 + sway * u * 0.6;
    if (x < l || x > r) return null;
    const v = (x - l) / Math.max(1, r - l), fold = Math.sin(v * 9 + u * 2) > 0.55;
    return u > 0.92 ? M.t[1] : fold ? M.c[2] : tone3(M.c, 1 - v * 0.6);
  }, xl - 8, top, xr + 2, bot);
}
function plume(L, J, color) {
  // pluma do elmo: sai do topo e cai para trás
  const [cx, cy] = J.crown;
  for (let s = 0; s <= 1; s += 0.04) {
    const x = cx - 1 - s * 8, y = cy - 2 - Math.sin(s * Math.PI) * 4 + s * 3, w = 1.6 * (1 - s * 0.6);
    for (let k = -w; k <= w; k += 0.5) L.set(Math.round(x), Math.round(y + k), k < -w * 0.3 ? color[0] : k > w * 0.4 ? color[2] : color[1]);
  }
}
function crest(L, J, M) {
  // asas douradas do elmo do paladino
  const [cx, cy] = J.crown;
  for (const side of [-1, 1]) for (let s = 0; s < 4; s++) for (let h = 0; h < 3 - s * 0.5; h++) {
    const x = Math.round(cx + side * (2 + s)), y = Math.round(cy + 2 - h - s * 0.7);
    L.set(x, y, h >= 2 - s * 0.5 ? M.t[0] : M.t[s < 2 ? 1 : 2]);
  }
  for (let h = 0; h < 3; h++) L.set(Math.round(cx), Math.round(cy + 1 - h), M.t[h ? 0 : 1]);
}
function wizardHat(L, J, M) {
  // aba larga e cone torto para trás
  const [hx, hy] = J.head, by = hy - 2.2;
  L.fill((x, y) => { const d = ((x - hx) / 7.2) ** 2 + ((y - by) / 1.7) ** 2; return d <= 1 ? (y < by ? M.c[1] : M.c[2]) : null; }, hx - 8, by - 2, hx + 8, by + 2);
  for (let s = 0; s <= 1; s += 0.03) {
    const y = by - 1 - s * 12, x = hx - s * s * 6, w = 4.6 * (1 - s) + 0.4;
    for (let k = -w; k <= w; k += 0.5) L.set(Math.round(x + k), Math.round(y), k < -w * 0.3 ? M.c[0] : k > w * 0.4 ? M.c[2] : M.c[1]);
  }
  for (let x = -4; x <= 4; x++) L.set(Math.round(hx + x * 0.95), Math.round(by - 2), M.t[x % 3 === 0 ? 0 : 1]);
}
function hood(L, J, M) {
  // ponta do capuz caindo atrás da cabeça
  const [hx, hy] = J.head;
  for (let s = 0; s <= 1; s += 0.05) { const x = hx - 3 - s * 5, y = hy - 2 + s * 6, w = 2.2 * (1 - s) + 0.5; for (let k = -w; k <= w; k += 0.5) L.set(Math.round(x), Math.round(y + k), k < 0 ? M.c[1] : M.c[2]); }
}
function robe(L, J, M) {
  // saia do manto, da cintura até perto dos pés, abrindo em sino
  const top = J.pelvis[1] - 1, bot = Math.max(J.ankleN[1], J.ankleF[1]) - 1, cx = (J.hipN[0] + J.hipF[0]) / 2;
  const legL = Math.min(J.kneeN[0], J.kneeF[0], J.ankleN[0], J.ankleF[0]), legR = Math.max(J.kneeN[0], J.kneeF[0], J.ankleN[0], J.ankleF[0]);
  L.fill((x, y) => {
    const u = (y - top) / (bot - top); if (u < 0 || u > 1) return null;
    const l = Math.max(cx - 9, Math.min(cx - 4 - u * 3, legL - 1.5 * u)), r = Math.min(cx + 9, Math.max(cx + 4 + u * 3, legR + 1.5 * u));
    if (x < l || x > r) return null;
    const v = (x - l) / (r - l);
    if (u > 0.86) return M.t[1];
    return Math.abs(v - 0.5) < 0.06 ? M.t[2] : tone3(M.c, v * 0.8 + 0.1);
  }, cx - 14, top, cx + 14, bot);
}
function staff(L, J, M, o) {
  // cajado de madeira na mão da frente, com orbe brilhando na cor do detalhe
  const [x0, y0] = J.handN, a = (o.pose && o.pose.sa != null ? o.pose.sa : -1.35);
  const dx = Math.cos(a), dy = Math.sin(a);
  for (let i = -9; i <= 17; i += 0.5) L.set(Math.round(x0 + dx * i), Math.round(y0 + dy * i), i > 15 ? LEATHER[0] : LEATHER[i % 3 < 1.5 ? 1 : 2]);
  const ox = x0 + dx * 19.5, oy = y0 + dy * 19.5;
  L.fill((x, y) => { const d = Math.hypot(x - ox, y - oy); return d <= 2.6 ? (d < 1.2 ? hex("#ffffff") : M.t[d < 2 ? 0 : 1]) : null; }, ox - 3, oy - 3, ox + 3, oy + 3);
}
function quiver(L, J) {
  // aljava nas costas, com as penas das flechas para fora
  const [cx, cy] = J.chest, x0 = cx - 4, y0 = cy - 6;
  for (let s = 0; s < 12; s++) for (let k = -1.5; k <= 1.5; k += 0.5) L.set(Math.round(x0 - s * 0.35 + k), Math.round(y0 + s), k < 0 ? LEATHER[1] : LEATHER[2]);
  for (const k of [-1, 0, 1]) { L.set(Math.round(x0 + k + 0.5), Math.round(y0 - 1), hex("#e8e8f0")); L.set(Math.round(x0 + k + 0.5), Math.round(y0 - 2), hex("#c84040")); }
}

// ---------- o corpo vestido
function body(p, o, M) {
  const R = posed(o.pose || STAND), dress = DRESS[o.cls] || DRESS.knight, k = o.cls === "knight" || o.cls === "paladin";
  for (let i = 0; i < R.n; i++) {
    let c = R.color[i] >>> 0;
    const x = R.xs[i], y = R.ys[i], s = R.src[i];
    if (c === INK) c = OUT;
    else if (TONE.has(c) || c === SEAM || c === MARK) {
      const part = s >= 0 ? REST_PART[s] : 0, nm = PART_NAME[part];
      const mat = nm ? M[dress[nm]] : M.s;
      let t = c === SEAM ? 3 : c === MARK ? 0 : TONE.get(c);
      let col = mat[t];
      // detalhes pintados sobre o boneco em pé (coordenadas do boneco: coluna sc, linha sr)
      if (s >= 0) {
        const sc = s % 24, sr = (s / 24) | 0;
        if (k && nm === "face" && sr === 4) col = OUT; // fresta do visor
        if (k && nm === "chest" && Math.abs(sc - 12.5) < 2.2) col = M.c[Math.min(3, t)]; // tabardo
        if (o.cls === "paladin" && nm === "chest" && (Math.abs(sc - 12.5) < 0.8 || sr === 11) && Math.abs(sc - 12.5) < 2.2) col = M.t[0]; // cruz
        if (o.cls === "mage" && nm === "chest" && Math.abs(sc - 12.5) < 0.9) col = M.t[1]; // faixa do manto
        if ((o.cls === "mage" || o.cls === "archer") && nm === "face" && sr === 4 && (sc === 14 || sc === 16)) col = OUT; // olhos
        if (o.cls === "mage" && nm === "face" && sr >= 6) col = hex("#e8e4ee"); // barba
        if (o.cls === "archer" && nm === "chest" && sr - sc === 0) col = LEATHER[3]; // alça da aljava
      }
      if (c === MARK) col = k ? M.t[0] : col;
      c = col;
    }
    p.px(x, y, c);
  }
}

export function drawBack(p, t, o) {
  const M = mats(o), J = skeleton(o.pose || STAND).joints, L = new Layer();
  if (o.cls === "knight" || o.cls === "paladin" || o.cls === "mage") cape(L, J, o, M, o.wind || 0);
  if (o.cls === "archer") quiver(L, J);
  if (o.cls === "archer") hood(L, J, M);
  L.draw(p);
}
export function draw(p, t, o) {
  const M = mats(o), J = skeleton(o.pose || STAND).joints;
  if (o.cls === "mage") { const R = new Layer(); robe(R, J, M); body(p, o, M); R.draw(p); }
  else body(p, o, M);
  const L = new Layer();
  if (o.cls === "knight") plume(L, J, M.c);
  if (o.cls === "paladin") crest(L, J, M);
  if (o.cls === "mage") { wizardHat(L, J, M); staff(L, J, M, o); }
  L.draw(p);
}
