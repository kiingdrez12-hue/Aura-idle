# Aura Idle — notas para o Claude Code

- Todo o jogo está em `index.html` (HTML + CSS + um único `<script>`). Não há build.
- Three.js r128 via cdnjs; pós-processamento via cdn.jsdelivr.net/npm/three@0.128.0/examples/js/.
- Save em `localStorage` na chave `auraIdleSave1`; objeto `S` mesclado sobre `DEF`. Ao adicionar campos ao save, inclua em `DEF` e na mesclagem do load.
- Bônus somam em `IT` via `calcIT()` (itens + `petIT()` + `talIT()`). Multiplicadores: `dmgAt`, `goldM`, `xpM`, evento do dia `EV()`.
- Abas: `data-t` em `.tab` mapeado para painéis `pg*`; renderização ao trocar de aba.
- Atenção: a classe `.dn` é dos números de dano flutuantes (position:absolute). Não reutilize nomes de classe genéricos.
- Interface pensada para celular (~390px de largura). Teste nessa largura.

## Verificação
- Sintaxe: extraia o `<script>` e rode `node --check`.
- Teste headless: Playwright + Chromium com `--use-gl=swiftshader`, trocando as URLs da CDN por `node_modules/three/` (three@0.128.0). A função global `step(dt)` avança a simulação.
