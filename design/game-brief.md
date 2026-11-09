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
- **Ritmo de retorno:** todo dia (login, 3 missões, 3 lutas do Chefe Mundial, Torre); toda semana (missões semanais, novo chefe); a cada 28 dias (nova temporada); longo prazo (relíquias, estrelas dos mascotes).
- **Uma sessão está completa quando** o jogador volta, recebe o ouro offline e a recompensa diária, faz pelo menos uma compra ou evolução que dê para sentir, e sai sabendo qual é a próxima meta.

## MVP para outras pessoas jogarem (versão de teste)
Os sistemas já estão construídos. O que falta é fazer o jogo **aguentar estranhos jogando**:
1. **Retenção (feito):** Passe de Temporada gratuito (28 dias, missões semanais, borda exclusiva), Relíquias Ancestrais (essência da ascensão), Chefe Mundial semanal (mascote exclusivo na faixa 10) e Evolução de mascotes (★1 a ★5). *(Adicione aqui outros recursos que ainda quiser.)*
2. **Save seguro (feito):** na aba Perfil: exportar (copiar código ou baixar arquivo), importar (código ou arquivo, com verificação), restaurar backup e apagar progresso (digitando APAGAR). Backup automático 1x por dia e antes de importar, restaurar ou apagar; save corrompido é preservado em vez de apagado.
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
1. ~~Recursos de retenção~~ feito (passe, relíquias, chefe mundial, evolução de mascotes).
2. ~~Save seguro~~ feito.
3. Balanceamento (1ª parte feita): XP mais lenta (`12×1,22^(nível−1)`) e aviso de ascensão só depois de 2 fugas seguidas do chefão. Medido em `tests/headless/balanceamento.js`. Falta: a parede perto do estágio 100 e a curva depois da 1ª ascensão.
4. Primeiros 5 minutos guiados.
5. Teste de estabilidade no celular a 390 px e correções.
6. Publicar a versão de teste, mostrar a versão no jogo e definir o canal de feedback.
7. Rodada com 3 a 5 testadores, depois `/playtest-report` e ajustes.

---
**Para quem / o que sentem:** quem joga no celular em pausas curtas e quer a sensação de "fiquei mais forte" a cada volta.

**Direção de arte e áudio:** 3D estilizado e brilhante, auras com bloom e partículas, números grandes e efeitos sonoros curtos e satisfatórios.

**Jogo de referência:** idles de herói automático, como Tap Titans. Do MVP fica só o loop "luta automática, melhorias, chefão a cada 10, ascensão"; ficam de fora o multiplayer e os clãs.
