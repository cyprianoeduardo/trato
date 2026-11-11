# Constituição do Projeto

Princípios inegociáveis que valem para **toda** mudança, em **toda** sessão,
por humanos ou agentes. (Ideia emprestada do "constitution" do Spec-Kit.)
Mudanças a este arquivo são raras e deliberadas.

1. **Versões são pinadas.** Nada de `latest` em produção nem no dev. Bumps de
   versão são conscientes e vêm em commits próprios.

2. **Segredo nenhum entra no repositório.** `.env` é sagrado e ignorado.
   Só `.env.example` (chaves sem valores) é versionado.

3. **`mise run check` é o portão.** Nenhuma mudança é "pronta" sem lint, tipos
   e testes verdes.

4. **Módulos profundos.** Prefira interfaces simples que escondem complexidade.
   Rasos e numerosos são um cheiro de design ruim (Ousterhout).

5. **Fatias verticais, PRs pequenos.** Uma mudança completa e coesa por vez.
   Nada de PRs gigantes que misturam assuntos.

6. **Decisões viram registro.** Escolhas arquiteturais não óbvias viram ADR
   em `docs/adr/`. O código explica o "como"; o ADR explica o "porquê".

7. **Vocabulário ubíquo.** Um termo, um significado. O glossário de domínio
   vive em `CONTEXT.md` e é a linguagem comum de código, testes e conversas.

8. **Portabilidade.** Qualquer pessoa (ou agente) clona o repo e roda
   `mise run setup` numa máquina limpa. Se isso quebra, é bug prioritário.

9. **Alinhar antes de construir.** Diante de ambiguidade, pergunte primeiro
   (estilo "grilling"). Código errado feito rápido é retrabalho, não progresso.
