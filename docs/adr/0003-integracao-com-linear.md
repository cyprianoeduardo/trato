# 0003 — Integração com o Linear: MCP no container e, depois, consulta periódica sem webhook

- **Status:** proposto (modo 1 aceito; modo 2 a implementar)
- **Data:** 2026-11-11

## Contexto

As tarefas do trato vivem no Linear, e o Claude e o Codex devem trabalhar a partir delas de
dois jeitos: (1) com o Eduardo no container, lendo e atualizando issues; (2) sozinhos, quando
uma issue for marcada para um agente.

O caminho usual para o (2) é webhook: o Linear chama um endereço público quando a issue muda.
Isso exige expor um serviço da casa à internet. O host não expõe nada hoje (zona `public`
fechada, tudo atrás do Caddy na rede de casa).

O texto de uma issue é entrada não confiável: quem escreve no workspace do Linear passaria a
comandar um agente com acesso ao código e a credenciais (injeção de prompt).

## Decisão

**Modo 1 — interativo (aceito).** MCP oficial do Linear (`https://mcp.linear.app/mcp`),
configurado no projeto (`.mcp.json` para o Claude, `config/codex.toml` para o Codex), login
OAuth guardado no volume do projeto (`trato-config`, `trato-claude`).

**Modo 2 — autônomo (a implementar).** Sem webhook. Um processo local **consulta** a API do
Linear de tempos em tempos (só conexão de saída), procura issues que atendam a **todas** as
condições abaixo e dispara um agente sem interface para cada uma:

- label de agente (ex.: `agente:codex`, `agente:claude`);
- criada ou marcada **pelo usuário do Eduardo** (filtro pelo id, não pelo nome);
- estado de entrada (ex.: `Todo`); ao pegar, move para `In Progress` e comenta.

O agente roda como serviço do homeserver (usuário `stacks`, padrão do `agentes.just`), num
**clone próprio** do repositório (nunca em `/srv/dev`), com rede restrita (Linear, GitHub,
provedores do modelo), token do GitHub limitado a este repositório, e termina em **PR** (nunca
push na `main`). O resultado volta como comentário na issue.

## Consequências

- Nada da casa fica exposto à internet; a demora é o intervalo da consulta (minutos).
- Uma issue escrita por outra pessoa não dispara agente; mesmo a sua só vira PR, que você revisa.
- O modo 2 é um serviço novo (consulta + execução + limites de tempo e custo) e entra pelo
  `agentes.just` ou pelo Paperclip, não por este repositório.
- `claude -p` sem interface usa crédito de API (cobrança separada da assinatura); o Codex usa
  o login do ChatGPT.
- A confirmar na prática: o login OAuth do MCP dentro do container (retorno em `localhost`
  passa pelo encaminhamento de portas do VS Code) e o formato `url` do MCP no Codex.
