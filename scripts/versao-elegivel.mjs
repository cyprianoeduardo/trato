#!/usr/bin/env node
// Versão mais nova de um pacote npm publicada há pelo menos N dias (padrão 7),
// ignorando pré-lançamentos (alpha, beta, rc, next…). Mesma regra do homeserver-atualizar.
//
//   node scripts/versao-elegivel.mjs @openai/codex opencode-ai   → tabela
//   node scripts/versao-elegivel.mjs --so-versao @openai/codex   → só a versão (para scripts)

import { execFileSync } from "node:child_process";

const DIAS = Number(process.env.DIAS_ESPERA ?? 7);

export function elegivel(tempos, agora = Date.now(), dias = DIAS) {
  const limite = agora - dias * 24 * 60 * 60 * 1000;
  const versoes = Object.entries(tempos)
    .filter(([v]) => /^\d+\.\d+\.\d+$/.test(v))
    .map(([v, t]) => ({ v, t: Date.parse(t) }))
    .sort((a, b) => b.t - a.t);
  const mais_nova = versoes[0] ?? null;
  const escolhida = versoes.find((x) => x.t <= limite) ?? null;
  return { escolhida, mais_nova };
}

function tempos(pacote) {
  const saida = execFileSync("npm", ["view", pacote, "time", "--json"], { encoding: "utf8" });
  return JSON.parse(saida);
}

function main(args) {
  const so = args[0] === "--so-versao";
  const pacotes = so ? args.slice(1) : args;
  if (!pacotes.length) {
    console.error("uso: versao-elegivel.mjs [--so-versao] <pacote>...");
    return 2;
  }
  for (const p of pacotes) {
    const { escolhida, mais_nova } = elegivel(tempos(p));
    if (!escolhida) {
      console.error(`${p}: nenhuma versão com ${DIAS}+ dias`);
      return 1;
    }
    if (so) {
      console.log(escolhida.v);
      continue;
    }
    const data = new Date(escolhida.t).toISOString().slice(0, 10);
    const extra = mais_nova && mais_nova.v !== escolhida.v ? `  (mais nova: ${mais_nova.v}, em espera)` : "";
    console.log(`${p}: ${escolhida.v} de ${data}${extra}`);
  }
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main(process.argv.slice(2)));
}
