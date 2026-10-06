// Simulador mínimo do runtime de um nó Code do n8n.
//
// Roda o jsCode EXTRAÍDO DO EXPORT (não uma cópia colada) dentro de uma função
// async com o mesmo contorno que o n8n oferece: $input, $env, this.helpers.
// Assim o que a bateria testa é exatamente o que vai ser importado; se alguém
// mudar o SDK e recompilar, a bateria acompanha sozinha.
//
// Regra 1.3 da Ana: toda lógica nova de Code node vira réplica local com casos
// nomeados, PASS e FAIL no console, ANTES de produção.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const EXPORTS = path.resolve(aqui, '..', '..', 'infra', 'n8n', 'exports');

export function pegarCodigo(arquivo, nomeDoNo) {
  const w = JSON.parse(fs.readFileSync(path.join(EXPORTS, arquivo), 'utf8'));
  const n = w.nodes.find(x => x.name === nomeDoNo);
  if (!n) throw new Error(`não achei o nó "${nomeDoNo}" em ${arquivo}`);
  if (!n.parameters || typeof n.parameters.jsCode !== 'string')
    throw new Error(`o nó "${nomeDoNo}" não tem jsCode`);
  return n.parameters.jsCode;
}

// `http` é a lista de respostas falsas: [{ quando: /regex/, metodo, responde }]
// Toda chamada não prevista estoura, para o teste não passar por acidente.
// `nos` simula o $('Nome do nó') do n8n: { 'Nome': [{ json: {...} }] }.
export async function rodar(codigo, { itens = [], env = {}, http = [], nos = {}, memoria = {}, bloquear = [] } = {}) {
  const chamadas = [];
  const helpers = {
    async httpRequest(op) {
      chamadas.push({ metodo: op.method, url: op.url, body: op.body, headers: op.headers, op });
      const r = http.find(x =>
        (!x.metodo || x.metodo === op.method) && x.quando.test(op.url));
      if (!r) throw new Error(`chamada HTTP não prevista: ${op.method} ${op.url}`);
      return typeof r.responde === 'function' ? r.responde(op) : r.responde;
    },
  };
  const $input = {
    first: () => itens[0],
    all: () => itens,
    last: () => itens[itens.length - 1],
    item: itens[0],   // modo runOnceForEachItem: o item da vez
  };
  const ctx = { helpers };
  const $ = (nome) => {
    if (!nos[nome]) throw new Error(`o teste não deu a saída do nó "${nome}"`);
    return { first: () => nos[nome][0], all: () => nos[nome], item: nos[nome][0] };
  };
  // require: o nó Code do n8n libera módulos nativos (crypto) e a lib colada usa.
  // $getWorkflowStaticData: a memória do fluxo (no n8n só persiste em produção).
  const $getWorkflowStaticData = () => memoria;
  // Como no task runner do n8n: sem URL/URLSearchParams globais, e o require só
  // entrega o que NODE_FUNCTION_ALLOW_BUILTIN libera (`bloquear` simula o resto).
  const req = createRequire(import.meta.url);
  const requireN8n = (m) => { if (bloquear.includes(m)) throw new Error(`Module '${m}' is disallowed`); return req(m); };
  const fn = new Function('$input', '$env', '$json', '$now', '$', 'require', '$getWorkflowStaticData', 'URL', 'URLSearchParams',
    `return (async function () {\n${codigo}\n});`)($input, env, itens[0]?.json, new Date(), $, requireN8n, $getWorkflowStaticData, undefined, undefined);
  const saida = await fn.call(ctx);
  return { saida, chamadas };
}

// ------------------------------------------------------------------ placar
let ok = 0, falhou = 0;
const falhas = [];

export function caso(nome, fn) {
  return fn().then(
    () => { ok++; console.log(`  PASS  ${nome}`); },
    e => { falhou++; falhas.push([nome, e.message]); console.log(`  FAIL  ${nome}\n        ${e.message}`); });
}

export function igual(achado, esperado, oque = 'valor') {
  const a = JSON.stringify(achado), b = JSON.stringify(esperado);
  if (a !== b) throw new Error(`${oque}: esperado ${b}, veio ${a}`);
}

export function verdade(cond, oque) {
  if (!cond) throw new Error(oque);
}

export function placar() {
  const total = ok + falhou;
  console.log(`\n  ${ok}/${total} PASS`);
  if (falhou) {
    console.log(`  ${falhou} FALHA(S):`);
    for (const [n, m] of falhas) console.log(`    - ${n}: ${m}`);
    process.exit(1);
  }
}
