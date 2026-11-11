import assert from "node:assert/strict";
import { test } from "node:test";
import { elegivel } from "./versao-elegivel.mjs";

const DIA = 24 * 60 * 60 * 1000;
const agora = Date.parse("2026-11-11T12:00:00Z");
const em = (d) => new Date(agora - d * DIA).toISOString();

test("escolhe a mais nova com 7+ dias e ignora pré-lançamentos", () => {
  const tempos = {
    created: em(400),
    modified: em(0),
    "1.0.0": em(30),
    "1.1.0": em(8),
    "1.2.0": em(2),
    "1.3.0-beta.1": em(1),
  };
  const { escolhida, mais_nova } = elegivel(tempos, agora, 7);
  assert.equal(escolhida.v, "1.1.0");
  assert.equal(mais_nova.v, "1.2.0");
});

test("nenhuma elegível", () => {
  const { escolhida } = elegivel({ "0.1.0": em(1) }, agora, 7);
  assert.equal(escolhida, null);
});
