# Cursor + IA — Jogo de Cartas

Pacote de configuração para adicionar ao repositório do projeto.

## Instalação

Copie/extraia o conteúdo deste pacote na raiz do repositório.

Estrutura principal:

```text
.cursor/
├─ agents/
├─ commands/
├─ hooks/
├─ rules/
├─ scripts/
├─ skills/
├─ hooks.json
└─ worktrees.json

docs/ai/
AGENTS.md
README_CURSOR_AI.md
```

## Como começar

1. Garanta que a documentação do jogo esteja no repositório.
2. Abra o projeto no Cursor.
3. Confira em **Customize** se Rules, Skills, Subagents e Hooks foram descobertos.
4. Para uma feature não trivial, use `/jc-plan`.
5. Para implementar, use `/jc-implement`.
6. Para revisar antes de integrar, use `/jc-review`.

## Filosofia da configuração

- Rules ficam curtas e focadas.
- Skills carregam o conhecimento procedural sob demanda.
- Commands são wrappers explícitos, não cópias gigantes das skills.
- Subagentes deste pacote são principalmente read-only para reduzir colisões.
- Paralelismo de escrita usa worktrees.
- O agente principal continua responsável pela integração.
- Hooks pedem confirmação antes de comandos de Git/arquivos potencialmente destrutivos.

## Observação sobre paths

As regras procuram a documentação pelo nome (`01_DOCUMENTO_DO_JOGO.md`, `02_CATALOGO_DE_CARTAS.md`, etc.), portanto ela pode estar em `docs/` ou em outra pasta do repositório. Para melhor organização, recomenda-se consolidar a documentação técnica em `docs/` quando o repositório de código for criado.
