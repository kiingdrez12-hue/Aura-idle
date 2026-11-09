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

---

# Estrutura de estúdio (Claude Code Game Studios)

Agentes, skills, hooks e regras em `.claude/`, copiados de
[Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)
(MIT, framework v1.2.0 — licença em `.claude/LICENSE-CCGS.txt`).
49 subagentes coordenados; cada um cuida de um domínio.

## Technology Stack

- **Engine**: Web — Three.js r128 (sem Godot/Unity/Unreal)
- **Language**: JavaScript (HTML + CSS + um único `<script>` em `index.html`)
- **Version Control**: Git with trunk-based development
- **Build System**: nenhum (arquivo único, sem build)
- **Asset Pipeline**: nenhum; Three.js e pós-processamento via CDN

> **Nota**: os agentes especialistas de Godot, Unity e Unreal não se aplicam a
> este projeto. Use os agentes gerais (game-designer, economy-designer,
> gameplay-programmer, ui-programmer, qa-lead etc.). O código fica em
> `index.html`, não em `src/`.

## Project Structure

@.claude/docs/directory-structure.md
## Technical Preferences

`project.yaml` at the repo root is the primary config store — engine, specialists,
naming, platform, performance, modes. Skills resolve it via `resolve_config`
(see `.claude/docs/config-resolution.md`).

`.claude/docs/technical-preferences.md` is the **legacy fallback**, read on demand
when a key is absent from `project.yaml`. It is not imported here: before
`/setup-engine` runs it is almost entirely `[TO BE CONFIGURED]` placeholders, and
after it runs `project.yaml` holds the real values.

## Coordination Rules

@.claude/docs/coordination-rules.md

## Collaboration Protocol

**User-driven collaboration, not autonomous execution.**
Every task follows: **Question -> Options -> Decision -> Draft -> Approval**

- Agents MUST ask "May I write this to [filepath]?" before using Write/Edit tools
  (exempt: `active.md` appends, agent memory, a subagent's new file at the path
  its orchestrating skill named; see `.claude/rules/agent-memory.md`)
- Agents MUST show drafts or summaries before requesting approval
- Multi-file changes require explicit approval for the full changeset
- No commits without user instruction
- A skipped or dismissed question is not an answer: act on nothing, re-ask in
  plain text and wait
- Started outside this file's folder? Warn first: hooks, deny rules and the
  ask-first mode load only when Claude Code starts here

See `docs/COLLABORATIVE-DESIGN-PRINCIPLE.md` for full protocol and examples.

> **First session?** If the project has no engine configured and no game concept,
> run `/start` to begin the guided onboarding flow.

## Coding Standards

@.claude/docs/coding-standards.md

## Context Management

Read `.claude/docs/context-management.md` on demand — it is a reference, not
session context. Two of its conventions are load-bearing and cited by name
elsewhere in the repo, so they are restated here rather than lost:

- **`production/session-state/active.md` is the session checkpoint.** The file is
  the memory, not the conversation. Read it first after any compaction, crash, or
  `/clear`.
- **Helpers in `.claude/scripts/` emit observations, never verdicts.** A script
  that scores or judges will eventually contradict a mode or override it cannot
  see. (Cited by `artifact-check.sh` and `adr-dep-graph.sh`.)
