# 0005 — Host Bluefin: usuário `dev`, Remote-SSH local e SELinux por projeto

- **Status:** aceito
- **Data:** 2026-11-09

## Contexto

O host saiu do Windows + NixOS-WSL e foi para o Bluefin-DX (Fedora atômico).
Três coisas mudaram em relação ao que os ADRs 0002 e 0004 supunham:

1. O Bluefin-DX traz o Docker (daemon root) e põe os usuários do grupo
   `wheel` nos grupos `docker`, `incus-admin` e `libvirt`. Estar no grupo
   `docker` é ser root sem senha (o mesmo problema que o ADR 0002 evitou).
2. Rodar os Dev Containers no Podman do usuário de desktop deixa o pior caso
   (fuga do container) com acesso a todo o home dele: vault, provas, chaves.
3. O Fedora tem SELinux. Bind mounts do home para o container dão
   "Permission denied" sem relabel; o WSL não tinha isso.

Os projetos já eram autossuficientes (`mise.toml`, `devcontainer.json`,
`compose.yaml`). O que estava implícito no `configuration.nix` era o contrato
com o host.

## Decisão

- Os projetos rodam sob um **usuário dedicado, `dev`**, sem senha, fora de
  `wheel`/`docker`/`incus-admin`/`libvirt`, com Podman rootless e linger,
  como o `stacks` do homeserver. Projetos ficam em `/srv/dev/projetos`.
- O VS Code continua sendo do usuário de desktop e entra no `dev` por
  **Remote-SSH local** (`sshd` só em `127.0.0.1`, `AllowUsers dev`, só chave,
  sem encaminhamento de agente). É o equivalente exato da extensão WSL.
- Do lado do `dev`, as configurações de máquina do VS Code apontam o
  Dev Containers para o `podman` e repetem o corte de credenciais do ADR 0004.
- SELinux: cada `devcontainer.json` monta o workspace com
  `relabel=private` (`workspaceMount`). **Nunca** `label=disable`.
- Nenhum Dev Container recebe o socket do Podman. Serviços que precisam do
  motor (`supabase start`, `podman compose`) rodam pelo terminal do `dev`,
  fora do container.
- O Docker do Bluefin fica mascarado (recomendado; opcional no guia).
- Tudo isso é aplicado e desfeito pelo módulo `dev.just` do host.

### Contrato com o host (seção "Host requirements" do AGENTS.md)

```yaml
runtime:   podman rootless do usuário que abre o projeto (socket ligado)
toolchain: nenhuma no host; tudo no Dev Container (mise lá dentro)
selinux:   workspaceMount com relabel=private no devcontainer.json
vs_code:   dev.containers.dockerPath = podman; copyGitConfig = false;
           gitCredentialHelperConfigLocation = none (ADR 0004)
nunca:     grupo docker, socket do Podman montado no container, label=disable
```

## Consequências

- Fuga de container cai no `dev`: não alcança o home do desktop, o
  homeserver (`stacks`) nem o sudo.
- O UID do `dev` não é 1000. O Dev Containers ajusta o usuário da imagem
  (imagem `-uid`) e o `postCreateCommand` refaz o dono dos volumes; volumes
  importados de outro host funcionam sem `chown` manual.
- Containers dos projetos não aparecem no `podman ps` do desktop nem no
  Dockge: `just -g dev-ps`.
- Agentes do homeserver (`stacks`) não enxergam `/srv/dev`. Liberação, se
  um dia for preciso, é por projeto.
- O `sshd` passa a rodar no host, só no loopback. Enquanto o `dev.just`
  estiver aplicado, nenhum outro usuário entra por SSH.
- Substitui as partes de host do `SETUP-NIXOS.md` (vira histórico).
