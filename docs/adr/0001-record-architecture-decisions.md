# 0001 — Registrar decisões arquiteturais

- **Status:** aceito
- **Data:** 2026-06-30

## Contexto

Projetos assistidos por IA acumulam decisões de design rapidamente. Sem um
registro, o "porquê" se perde, e agentes (e humanos novos) repetem discussões
ou revertem escolhas deliberadas sem saber.

## Decisão

Vamos registrar decisões arquiteturais significativas como ADRs (Architecture
Decision Records) em `docs/adr/`, numerados sequencialmente, usando o
`template.md` deste diretório. Formato baseado no modelo de Michael Nygard.

## Consequências

- O "porquê" das escolhas fica versionado junto ao código.
- Agentes ganham contexto de alto nível confiável para consultar.
- Custo pequeno: exige a disciplina de escrever um ADR curto quando uma
  decisão não óbvia é tomada.
