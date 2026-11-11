# 0002 — Trocar Docker por Podman (rootless) como motor de container

- **Status:** aceito
- **Data:** 2026-07-03

## Contexto

A feature `docker-outside-of-docker` usada nos Dev Containers monta o socket
do daemon Docker do host — que roda como root — dentro do container. Qualquer
processo com acesso a esse socket controla o motor de containers da máquina
inteira; um container comprometido (ou um agente de IA rodando comandos ali)
herda esse alcance. Isso é o "Docker socket privilege escalation", um vetor de
ataque conhecido.

## Decisão

Vamos usar **Podman em modo rootless** como motor de container, tanto no host
(NixOS, via `virtualisation.podman` com `dockerCompat = true`) quanto para
qualquer acesso ao motor de dentro de um Dev Container. Removemos a feature
`docker-outside-of-docker`; quando um projeto precisar falar com o motor do
host, montamos o socket **rootless** do Podman
(`$XDG_RUNTIME_DIR/podman/podman.sock`) em vez do socket root do Docker.

`dockerCompat = true` mantém ferramentas que esperam o binário `docker`
(Supabase CLI, scripts existentes) funcionando sem alteração.

## Consequências

- Um container comprometido não tem mais caminho direto para root do host: o
  socket rootless autentica como o usuário comum que o iniciou.
- Deixamos de precisar colocar o usuário no grupo `docker` (que é, na prática,
  equivalente a root) — outro ganho de segurança colateral.
- `compose.yaml` continua igual; roda via `podman compose` (~90% de
  compatibilidade com a spec do Docker Compose — testar casos de borda).
- Rootless tem overhead de inicialização (~25-30% mais lento para iniciar
  muitos containers em sequência); irrelevante para serviços de longa duração
  como os deste template.
- Bind mounts exigem `--userns=keep-id` para o mapeamento de UID funcionar
  como esperado.
