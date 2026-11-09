# pixelfx no Aura Idle

Os efeitos em pixel art vêm do [pixelfx](https://github.com/kiingdrez12-hue/pixelfx) (MIT, commit `a841596`).
O jogo carrega `vendor/pixelfx.js`, um pacote IIFE já gerado que expõe `window.PixelFX`
(`createFrame`, `clearFrame`, `createFx`, `composite` e os efeitos em `PixelFX.FX`).
Assim o jogo continua sem build: basta abrir `index.html`. Licença em `vendor/PIXELFX-LICENSE.txt`.

## Efeitos usados

| evento do jogo | efeito |
|---|---|
| golpe do cavaleiro / crítico | `melee/sword-slash` / `melee/double-slash` |
| Redemoinho de Lâminas (cavaleiro) | `melee/spin-slash` a cada giro, nas cores da aura |
| tiro do mago ou arqueiro no alvo | `impacts/hit-spark` |
| crítico do mago | `arcane/arcane-missiles`, nas cores da aura |
| Chuva de Meteoros (mago) | `arcane/star-fall` sobre o grupo, nas cores da aura (os meteoros 3D ficam só como dano) |
| crítico do arqueiro | `lightning/chain-lightning` |
| Chuva de Flechas (arqueiro) | `arcane/star-fall` dourado (as flechas 3D ficam só como dano) |
| crítico do paladino | `melee/hammer-smash` |
| Julgamento Divino (paladino) | `holy/smite` no lugar do cilindro 3D |
| qualquer crítico | `impacts/crit-hit` |
| monstro / elite / chefão derrotado | `spawn/poof` / `explosions/plasma-explosion` / a mesma em tons de fogo e maior |
| chegada do chefão | `spawn/spawn-portal` |
| fúria | `lightning/thunderclap` (com silhueta vazia, para não desenhar o boneco do pixelfx) |
| item raro ou melhor no chão / coletado | `pickups/loot-beam` / `pickups/collect-burst`, na cor da raridade |
| subir de nível | `arcane/mana-burst` (paleta dourada) |
| nova aura | `holy/holy-pillar` (nas cores da aura) |

No código (`index.html`): `pfx(id, x, y, z, opções)` cria um efeito na posição do mundo; `pfxUpd(dt)` roda dentro
de `step` e `pfxDraw()` desenha uma vez por quadro, antes de renderizar. Cada efeito é desenhado num canvas e mostrado
como `THREE.Sprite` com filtro `Nearest` (26 pixels por unidade; `PFX_BODY` = 1.3 deixa a figura do pixelfx do tamanho
do herói). Opções: `scale`, `flip`, `palette`, `accent`, `actor`, `life` (segundos até cortar), `follow` (posição a
seguir) e `minor` (efeito descartável).

**Limites de desempenho** (constantes no topo do bloco do pixelfx): no máximo `PFX_MAX` = 8 efeitos ao mesmo tempo,
dos quais `PFX_MINOR` = 5 menores; redesenho a 30 qps (15 no modo Leve); e `PFX_BUDGET` = 4 ms de desenho por quadro;
o que passar disso fica para o próximo quadro, em rodízio. No modo Leve os efeitos `minor` não aparecem e o limite cai
para 4. Medido a 390 px em combate pesado: cerca de 4 ms por quadro em média. `explosions/big-explosion` foi tirado
porque custava 8 ms em média, com picos de 45 ms.

## Adicionar ou trocar efeitos

1. Importe o efeito em `tools/pixelfx/entry.js` e coloque-o em `FX`.
2. Gere o pacote de novo (precisa de Node 18+):

```bash
git clone https://github.com/kiingdrez12-hue/pixelfx /tmp/pixelfx
mkdir -p /tmp/pfxnm && ln -sfn /tmp/pixelfx /tmp/pfxnm/pixelfx
NODE_PATH=/tmp/pfxnm npx esbuild@0.25.10 tools/pixelfx/entry.js --bundle --format=iife --minify \
  --target=es2019 --legal-comments=none --outfile=vendor/pixelfx.js
```

Prefira efeitos sem `actor` no `meta`: esses desenham o boneco de teste do pixelfx junto.
