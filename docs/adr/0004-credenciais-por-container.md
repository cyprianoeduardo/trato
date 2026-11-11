# 0004 — Credenciais por container, isoladas do host

- **Status:** aceito
- **Data:** 2026-07-14

## Contexto

Descoberto na prática: trabalhando em dois projetos com **contas GitHub
distintas**, o `git push` saía com a conta errada. A investigação revelou dois
sistemas de credencial **em conflito** dentro do Dev Container:

1. O VS Code Dev Containers injeta, por padrão, um `credential.helper` no
   gitconfig do container que **chama de volta o VS Code do host (Windows)**
   para obter credenciais. Ou seja: `git push` de dentro do container usava a
   identidade do **host**, não a do container.
2. O `gh`, autenticado dentro do container, tinha sua própria identidade — que
   o git simplesmente ignorava.

Somado a isso, `dev.containers.copyGitConfig` (padrão `true`) copia o
`~/.gitconfig` do host para dentro do container.

Resultado: credencial vazando do host para todos os containers, e impossível
ter contas diferentes por projeto.

## Decisão

Credenciais (GitHub, Claude, e **qualquer** CLI) são **por container** e
**isoladas do host**. Três partes:

**1. Cortar a ponte do VS Code** — settings GLOBAIS, valem para todo projeto:

```jsonc
"dev.containers.copyGitConfig": false,
"dev.containers.gitCredentialHelperConfigLocation": "none"
```

**2. Autenticação local ao container** — o git passa a usar o token do `gh`
do próprio container:

```
git config --global credential.helper '!gh auth git-credential'
```

**3. Persistência isolada** — volumes NOMEADOS do Podman, escopados por
`${devcontainerId}`, montados em:

- `~/.config` → superfície **genérica** de credencial (`XDG_CONFIG_HOME`):
  `gh`, `git` e a maioria das CLIs modernas. Serve para QUALQUER CLI que siga
  o XDG — não é preciso listar ferramenta por ferramenta.
- `~/.claude` → login do Claude Code.

Eles vivem no storage do Podman, **não** no filesystem do host.
`GIT_CONFIG_GLOBAL` aponta o `git config --global` para dentro do volume (em
vez de `~/.gitconfig`, que é efêmero).

**Protocolo GitHub: HTTPS, não SSH.** SSH reintroduziria acoplamento com o
host (o Dev Containers encaminha o SSH-agent do host) e exigiria gestão de
chaves e aliases por conta — justamente o atrito que estamos eliminando.

## Consequências

**Positivas**

- Cada projeto tem sua própria identidade GitHub: `gh auth login` dentro do
  container e pronto. Contas distintas nunca mais se cruzam.
- Nenhuma credencial no home do host: não existem `~/.gitconfig`,
  `~/.config/gh` nem `~/.claude` no NixOS.
- Rootless + user-namespace: nem o usuário do host lê os arquivos dos volumes
  sem `podman unshare`. Arquivos em modo `0600`.
- Genérico: qualquer CLI que siga o XDG persiste sozinha.

**Negativas e ARMADILHAS (aprendidas na marra — leia antes de mexer)**

- **NÃO persista o home inteiro.** Lá moram `.vscode-server` (cache que já
  causou um segfault difícil de diagnosticar), `.bashrc` (o `postStartCommand`
  faz `>>` e duplicaria linhas a cada start) e o toolchain do mise — que DEVE
  ser reinstalado limpo a cada rebuild.
- **NÃO use `remoteEnv` com `${containerEnv:PATH}`.** Trava o VS Code logo
  após "Container started", sem erro nenhum no log. Para pôr um binário no
  PATH, use symlink em `/usr/local/bin`.
- **Volume cujo alvo NÃO existe na imagem nasce `root:root`** (é o caso de
  `~/.claude`) e o usuário `vscode` não consegue escrever nele. Por isso o
  `postCreateCommand` começa com `sudo chown`. (`~/.config` escapa disso
  porque já existe na imagem e herda o dono no copy-up.)
- **O Dev Containers FOSSILIZA o `postCreateCommand` na label
  `devcontainer.metadata` da imagem.** Editar o `devcontainer.json` NÃO basta
  — e nem o "Rebuild Without Cache" resolve, porque ele recria o *container*
  mas reaproveita a *imagem*. É preciso **remover a imagem** para a config
  nova valer:
  `podman rmi localhost/vsc-<projeto>-<hash>-features localhost/vsc-<projeto>-<hash>-features-uid`
- Login é por container: ao abrir um projeto novo, `gh auth login` uma vez
  (depois persiste em volume).

## Emenda (2026-11-11) — nome fixo dos volumes

O `${devcontainerId}` muda quando o `devcontainer.json` é editado ou a pasta muda de lugar, e
cada mudança cria um volume novo e vazio (login perdido; aconteceu duas vezes em 07/2026).
Neste projeto os volumes têm nome fixo: `trato-config` e `trato-claude`.
