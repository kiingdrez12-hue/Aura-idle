# Análise de Etapa do Projeto

**Data**: 2026-11-09
**Etapa configurada**: Concept (definida pelo `/start`)
**Etapa observada**: Concept pela tabela de heurísticas; na prática, o jogo já está construído
**Confiança da etapa**: CONCERNS — os sinais são ambíguos

## Por que CONCERNS

Pela tabela de heurísticas, faltam o documento de conceito e a engine, o que dá
**Concept**. Mas `index.html` já contém um jogo idle jogável, com cerca de 1.150
linhas e 116 funções. A tabela não enxerga esse código porque a pasta do código
não está definida: a engine ainda não foi registrada no `project.yaml`. Por isso
a contagem de arquivos-fonte, que decidiria entre as linhas Pre-Production e
Production, ficou **NOT ASSESSED**.

Com rigor `minimal`, nada roda o `/gate-check`, então a etapa configurada fica
onde o `/start` a deixou. É esperado que ela não acompanhe o progresso.

## Visão de completude

- **Design**: 0 GDDs e nenhum `design/game-brief.md`. Com rigor `minimal`, o
  único documento de design esperado é o resumo (brief), e ele ainda falta.
- **Código**: um arquivo, `index.html`, com estes sistemas identificados:
  - combate com estágios, chefes e críticos
  - ouro e melhorias (dano, velocidade, crítico, ouro, aura, espírito, xp)
  - itens com raridades e conjuntos (4 conjuntos com bônus de 2, 4 e 6 peças)
  - inventário com auto-venda
  - 12 pets em 6 raridades, chocados de ovos
  - 6 talentos
  - ascensão, com almas
  - torre com recorde e tentativas
  - conquistas
  - perfil com retratos, bordas e acessórios
  - classes e skins
  - evento do dia
  - save em `localStorage`
  - abas: hero, up, inv, pet, tal, asc, jor, prof
- **Arquitetura**: 0 ADRs. Não é lacuna com rigor `minimal`.
- **Produção**: nenhuma história. Com rigor `minimal`, a ordem de construção do
  resumo é o plano; não há sprints.
- **Testes**: nenhum teste automatizado. O `CLAUDE.md` já descreve como verificar:
  `node --check` no script e Playwright com SwiftShader usando `step(dt)`.

## Lacunas (só as que o rigor `minimal` considera)

1. **Engine não registrada.** O `CLAUDE.md` diz Web / Three.js r128, mas o
   `project.yaml` não tem `engine`. Sem isso, as skills não acham o código.
   Próximo passo: `/setup-engine`.
2. **Sem resumo do jogo.** Não existe `design/game-brief.md`. Como o jogo já
   existe, o melhor é escrever o resumo a partir do que está construído, e não
   inventar um conceito novo com `/brainstorm`.

## Próximos passos recomendados

1. `/setup-engine`: registrar Web / Three.js r128 e definir `index.html` como
   raiz do código.
2. Escrever o resumo `design/game-brief.md` a partir do código existente: os
   pilares, o loop principal e a ordem de construção dos próximos recursos.
3. `/create-stories`: transformar a lista de próximos recursos do resumo em
   histórias.
4. `/dev-story`: implementar a primeira história.
