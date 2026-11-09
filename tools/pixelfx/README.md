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
| Julgamento Divino (paladino) | `fire/fire-ring` dourado: onda sagrada correndo pelo chão (sem raio vindo do alto) |
| qualquer crítico | `impacts/crit-hit` |
| monstro / elite / chefão derrotado | `spawn/poof` / `explosions/plasma-explosion` / a mesma em tons de fogo e maior |
| chegada do chefão | `spawn/spawn-portal` |
| fúria | `lightning/thunderclap` (com silhueta vazia, para não desenhar o boneco do pixelfx) |
| qualquer item no chão / item raro coletado | `tools/pixelfx/fx/loot-aura.js` (versão própria do `pickups/loot-beam`: espada com brilho só em volta, sem coluna de luz) / `pickups/collect-burst`, na cor da raridade |
| subir de nível | `arcane/mana-burst` (paleta dourada) |
| baú (qualquer tier) | `pickups/chest-open` num cartão de notificação no canto inferior direito, com luz e madeira nas cores do tier (`chestPal`); o baú não cai mais no chão e a recompensa chega quando a tampa abre |
| nova aura | `arcane/mana-burst` maior, nas cores da aura (sem coluna de luz) |
| aura do herói (sempre ativa) | `tools/pixelfx/fx/aura.js`, efeito próprio com 10 estilos, um por tier, em volta do corpo (nada no chão); substitui o disco, as runas, o cilindro, a espiral, os anéis, a coroa e as asas 3D |

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

## Efeitos próprios

`tools/pixelfx/fx/` guarda efeitos próprios do jogo, importados por `entry.js` como os do pixelfx. Hoje:

- `aura.js`: a aura do herói. O corpo é um volume do tamanho do herói 3D como ele aparece na tela (tronco em
  elipse e cabeça, `BODY_TOP` = 30 px); a distância até esse corpo diz onde fica o contorno, e cada estilo desenha
  em volta dele: 0 Comum, contorno que respira e pulso; 1 Incomum, redemoinho de vento e folhas; 2 Rara, raios
  pulando pelo corpo e saindo para fora; 3 Épica, chamas roxas; 4 Lendária, fogo e brasas; 5 Mítica, chamas de
  coração escuro, fumaça e raios; 6 Ancestral, espíritos com cauda; 7 Exaltada, cristais em órbita; 8 Divina, raios
  de luz e auréola; 9 Primordial, fogo cósmico em arco-íris e estrelas. Todos têm um brilho suave atrás do corpo.
  `drawBack` vai atrás do herói 3D e `draw` na frente; no jogo, as duas camadas ficam sobre o raio da câmera que
  passa pelos pés, e `auraDraw` escala o sprite para que os `BODY_TOP` px tenham a altura do herói projetada na tela
  (`AURA_HERO_H` = 2 unidades). Redesenho a 20 qps (10 no Leve). As partículas 3D que giravam nos pés ficam
  escondidas e a luz da aura sobe para o peito, mais fraca, para não fazer mancha no chão.
  Nada é desenhado abaixo dos pés, e `tests/headless/auras.js` confere.

- `hero.js`: os heróis em pixel art. O esqueleto do pixelfx (`rig.js`, o boneco dos golpes) resolve a pose e entrega
  cada pixel com tom e parte do corpo; aqui cada parte veste o material da classe (aço, pano, couro, pele, dourado)
  nas cores da skin, e entram as peças extras: elmo com pluma (cavaleiro), asas douradas e cruz (paladino), chapéu,
  barba, manto em sino e cajado (mago), capuz e aljava (arqueiro), capa. A cor da raridade da armadura vai para os
  detalhes e a da arma puxa a lâmina. No jogo (`heroSet`, `heroDraw`, `heroPose`): sprite nos pés, 38 px de corpo =
  `HERO_H` (3) unidades em pé na tela; parado respira, andando dá passos, o golpe toca a trilha do efeito da classe
  (`swordSlash`, `hammerSmash`, `arcaneMissiles`; o arqueiro tem `BOW_TRACK`), o especial do cavaleiro gira com
  `spinSlash`, e o desenho espelha quando o herói vira para a esquerda da tela. O modelo 3D continua montado (posição,
  direção) mas escondido; o retrato do perfil vem de `heroBust`. `tests/headless/herois-pixel.js` confere.

- Monstros (`critters/*` do pixelfx: `mobSlime`, `mobFrog`, `mobSnake`, `mobBat`, `mobGhost`, `mobSkull`, `mobEye`,
  `mobWisp`, `mobJelly`): vestem os inimigos (`mobDress`). Cada cenário (`BIOMES` no `index.html`) escolhe o trio para
  os tipos slime, goblin e skeleton do jogo e o chefão; as cores giram com o bioma (`hue`). Os quadros de cada bicho
  são desenhados uma vez, a 12 qps, aos poucos (2 por chamada), e guardados (`MOB_CACHE`, até 15 conjuntos).

`loot-aura.js`, a espada do `loot-beam` com poça, anéis e brilhos baixos na cor da raridade (opção `power`, de 0 a 1,
para raridades altas), sem a coluna de luz.

Nenhum efeito pode levantar ou derrubar coluna de luz sobre o herói ou os itens: `holy/smite`, `holy/holy-pillar`,
`pickups/loot-beam` e `arcane/magic-circle-cast` ficaram de fora por isso, e `tests/headless/sem-feixes.js` confere.

O teste `tests/headless/efeitos-pixelfx.js` dispara cada situação do jogo e confere que **todo** efeito do pacote é
criado e desenha pixels. Ao adicionar um efeito ao pacote, ligue-o no jogo, ou o teste falha.

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
