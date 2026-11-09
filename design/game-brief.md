# Game Brief: Aura Idle

**Pitch em uma frase:** um RPG idle em 3D no navegador do celular, em que seu herói luta sozinho, sua aura cresce em 10 tiers e cada volta ao jogo traz ouro, itens, mascotes e um evento novo.

## Loop principal
- O herói luta sozinho pelos estágios. A cada 10 estágios há um chefão com tempo limite.
- Abates rendem ouro, XP, itens, fragmentos, gemas e ovos.
- O jogador gasta em melhorias, equipa e evolui itens (com conjuntos), choca mascotes e distribui talentos.
- Quando o progresso trava, ele **ascende**, troca o avanço por almas (bônus permanente) e recomeça mais forte. Torre, Jornada e evento do dia dão metas paralelas.

## Objetivo e condição de falha: o que é "funcionar"
- **Objetivo:** subir o estágio máximo e o tier da aura, e completar a coleção (classes, skins, mascotes, conjuntos, cosméticos).
- **Falha:** perder para o chefão no tempo limite, o que faz o herói voltar um estágio. Não existe game over.
- **Uma sessão está completa quando** o jogador volta, recebe o ouro offline e a recompensa diária, faz pelo menos uma compra ou evolução que dê para sentir, e sai sabendo qual é a próxima meta.

## MVP para outras pessoas jogarem (versão de teste)
Os sistemas já estão construídos. O que falta é fazer o jogo **aguentar estranhos jogando**:
1. **Recursos que você ainda está desenvolvendo** *(preencher: liste aqui)*
2. **Save seguro:** exportar e importar o save como texto, e um botão de apagar progresso com confirmação. Hoje o save existe só no `localStorage` (salva a cada 5 s e ao sair da aba); se o navegador limpar os dados, o progresso se perde.
3. **Primeiros 5 minutos guiados:** dicas curtas que apontam para a primeira melhoria, o primeiro item, o primeiro chefão e a primeira ascensão. Hoje existe só um banner inicial.
4. **Balanceamento da curva:** a 1ª ascensão deve sair em cerca de 30 a 60 minutos, sem parede de progresso nos primeiros 100 estágios.
5. **Estabilidade no celular:** sem erros no console numa sessão de 30 min a ~390 px; FPS aceitável no modo "Leve"; carregamento rápido no 4G.
6. **Publicação:** link público (por exemplo, GitHub Pages), número de versão visível e um canal para os testadores mandarem opinião e bugs.

## Fora do escopo (não vamos fazer agora)
- Multiplayer, ranking online ou save na nuvem com conta.
- Compras com dinheiro real ou anúncios.
- Versão para loja (Play Store / App Store), traduções e jogo offline (PWA).
- Novos sistemas grandes além dos que você está terminando.

## Ordem de construção
1. Terminar os recursos que você está desenvolvendo (item 1 do MVP).
2. Save seguro: exportar, importar e apagar. É o que protege os testadores.
3. Balanceamento: simular a curva com `step(dt)` no teste headless e ajustar custos e recompensas.
4. Primeiros 5 minutos guiados.
5. Teste de estabilidade no celular a 390 px e correções.
6. Publicar a versão de teste, mostrar a versão no jogo e definir o canal de feedback.
7. Rodada com 3 a 5 testadores, depois `/playtest-report` e ajustes.

---
**Para quem / o que sentem:** quem joga no celular em pausas curtas e quer a sensação de "fiquei mais forte" a cada volta.

**Direção de arte e áudio:** 3D estilizado e brilhante, auras com bloom e partículas, números grandes e efeitos sonoros curtos e satisfatórios.

**Jogo de referência:** idles de herói automático, como Tap Titans. Do MVP fica só o loop "luta automática, melhorias, chefão a cada 10, ascensão"; ficam de fora o multiplayer e os clãs.
