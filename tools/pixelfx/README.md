# pixelfx no Aura Idle

Os efeitos em pixel art vêm do [pixelfx](https://github.com/kiingdrez12-hue/pixelfx) (MIT, commit `a841596`).
O jogo carrega `vendor/pixelfx.js`, um pacote IIFE já gerado que expõe `window.PixelFX`
(`createFrame`, `clearFrame`, `createFx`, `composite` e os efeitos em `PixelFX.FX`).
Assim o jogo continua sem build: basta abrir `index.html`. Licença em `vendor/PIXELFX-LICENSE.txt`.

## Efeitos usados

| evento do jogo | efeito |
|---|---|
| golpe normal | `impacts/hit-spark` |
| golpe crítico | `impacts/crit-hit` |
| monstro derrotado | `spawn/poof` |
| elite derrotado | `explosions/plasma-explosion` |
| chefão derrotado | `explosions/big-explosion` (cortado em 2,6 s) |
| item raro ou melhor | `pickups/loot-beam` (na cor da raridade) |
| subir de nível | `arcane/mana-burst` (paleta dourada) |
| nova aura | `holy/holy-pillar` (nas cores da aura) |
| ataque especial | `arcane/magic-circle-cast` (nas cores da aura) |
| fúria | `explosions/firework-burst` |

No código (`index.html`): `pfx(id, x, y, z, opções)` cria um efeito na posição do mundo; `pfxUpd(dt)`
roda dentro de `step`. Cada efeito é desenhado num canvas e mostrado como `THREE.Sprite` com filtro
`Nearest` (26 pixels por unidade). Opções: `scale`, `flip`, `palette`, `life` (segundos até cortar),
`follow` (posição a seguir) e `minor` (efeito descartável). No modo de gráficos Leve, os efeitos
`minor` não aparecem, o limite cai de 12 para 4 efeitos ao mesmo tempo e o redesenho cai de 40 para 20 quadros por segundo.

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
