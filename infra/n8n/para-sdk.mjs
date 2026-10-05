#!/usr/bin/env node
/* Converte os JSON compilados em exports/ para código do SDK oficial do n8n,
 * que é o formato que o servidor de MCP aceita em create_workflow_from_code.
 *
 * Por que existe: traduzir doze fluxos à mão é doze chances de errar um nome
 * de parâmetro em silêncio. O compilador já é a fonte da verdade; isto aqui é
 * só mais uma saída dele.
 *
 *   node infra/n8n/para-sdk.mjs 99-diagnostico > /tmp/x.js
 *   node infra/n8n/para-sdk.mjs --todos
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const EXPORTS = join(AQUI, 'exports');

/* Um identificador JavaScript válido e estável a partir do nome do nó.
 * Estável importa: rodar duas vezes tem que dar o mesmo arquivo, senão
 * qualquer diferença vira ruído no momento de conferir. */
const idDe = (nome, usados) => {
  let base = nome
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // tira acento
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((p, i) => i === 0 ? p.toLowerCase() : p[0].toUpperCase() + p.slice(1).toLowerCase())
    .join('');
  if (!base || /^[0-9]/.test(base)) base = 'no' + base;
  let nomeFinal = base, n = 2;
  while (usados.has(nomeFinal)) nomeFinal = base + (n++);
  usados.add(nomeFinal);
  return nomeFinal;
};

/* Serializa um valor para código JS, trocando as strings de expressão do n8n
 * ("=algo com {{ }}") pela chamada expr() que o SDK espera. */
/* Marca de credencial: literal() a escreve como newCredential('Nome'), que e
 * codigo e nao texto. Sem isto o modelo e a memoria subiam sem credencial e o
 * nó abria vazio no editor, sem dizer qual credencial escolher. */
const CRED = '\u0000cred:';
/* Objeto ou lista pequena sai numa linha so: o codigo vai inteiro para o
 * validador, e 900 linhas de chaves soltas sao 900 linhas para conferir. */
const literal = (v, ind = 0) => {
  if (v && typeof v === 'object') {
    const curto = literalEmLinha(v);
    if (curto.length + ind * 2 <= 110) return curto;
  }
  return literalLongo(v, ind);
};
const literalEmLinha = (v) => {
  if (Array.isArray(v)) return '[' + v.map(literalEmLinha).join(', ') + ']';
  if (v && typeof v === 'object') {
    const ks = Object.keys(v);
    if (!ks.length) return '{}';
    return '{ ' + ks.map(k => (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k)) + ': ' + literalEmLinha(v[k])).join(', ') + ' }';
  }
  return literalLongo(v, 0);
};
const literalLongo = (v, ind = 0) => {
  const esp = '  '.repeat(ind);
  if (v === null) return 'null';
  if (typeof v === 'string') {
    if (v.startsWith(CRED)) return `newCredential(${JSON.stringify(v.slice(CRED.length))})`;
    if (v.startsWith('=')) return `expr(${JSON.stringify(v.slice(1))})`;
    return JSON.stringify(v);
  }
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    if (v.every(x => typeof x === 'number')) return '[' + v.join(', ') + ']';
    return '[\n' + v.map(x => esp + '  ' + literal(x, ind + 1)).join(',\n') + '\n' + esp + ']';
  }
  if (typeof v === 'object') {
    const ks = Object.keys(v);
    if (ks.length === 0) return '{}';
    return '{\n' + ks.map(k => {
      const chave = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return esp + '  ' + chave + ': ' + literal(v[k], ind + 1);
    }).join(',\n') + '\n' + esp + '}';
  }
  return 'null';
};

/* Que construtor do SDK cada nó usa. O SDK separa por papel, não só por tipo:
 * um trigger é trigger(), um modelo de linguagem é languageModel(), e assim
 * por diante. Errar aqui gera fluxo que valida e não liga os subnós. */
const TRIGGERS = /(Trigger|trigger)$|webhook$|executeWorkflowTrigger$/;
const construtorDe = (tipo, ehSubno) => {
  if (tipo.endsWith('.lmChatOpenAi') || tipo.includes('lmChat')) return 'languageModel';
  if (tipo.includes('memoryPostgresChat') || tipo.includes('Memory')) return 'memory';
  if (tipo.includes('outputParser')) return 'outputParser';
  if (tipo.endsWith('Tool') || tipo.includes('toolWorkflow') || tipo.includes('toolCode')) return 'tool';
  if (ehSubno) return 'node';
  if (tipo === 'n8n-nodes-base.if') return 'ifElse';
  if (tipo === 'n8n-nodes-base.switch') return 'switchCase';
  if (tipo === 'n8n-nodes-base.merge') return 'merge';
  if (tipo === 'n8n-nodes-base.splitInBatches') return 'splitInBatches';
  if (TRIGGERS.test(tipo.split('.').pop())) return 'trigger';
  return 'node';
};

const PAPEL_SUBNO = {
  ai_languageModel: 'model',
  ai_memory: 'memory',
  ai_tool: 'tools',
  ai_outputParser: 'outputParser',
  ai_embedding: 'embedding',
};

export function paraSdk(wf) {
  const usados = new Set();
  const porNome = new Map();
  for (const n of wf.nodes) porNome.set(n.name, n);

  /* Quem é subnó: alvo de uma ligação ai_*. Precisa ser descoberto antes de
   * escrever qualquer coisa, porque muda o construtor e tira o nó da cadeia
   * principal. */
  const subnoDe = new Map();          // nome do subnó -> {pai, papel}
  for (const [origem, saidas] of Object.entries(wf.connections || {})) {
    for (const [tipo, ramos] of Object.entries(saidas)) {
      if (!tipo.startsWith('ai_')) continue;
      for (const ramo of ramos || []) {
        for (const lig of ramo || []) {
          subnoDe.set(origem, { pai: lig.node, papel: PAPEL_SUBNO[tipo] || tipo });
        }
      }
    }
  }

  const vars = new Map();
  for (const n of wf.nodes) vars.set(n.name, idDe(n.name, usados));

  /* Os subnós de cada pai, agrupados pelo papel que o SDK espera. */
  const subnosDoPai = new Map();
  for (const [filho, { pai, papel }] of subnoDe) {
    if (!subnosDoPai.has(pai)) subnosDoPai.set(pai, {});
    const m = subnosDoPai.get(pai);
    if (papel === 'tools') (m.tools ||= []).push(vars.get(filho));
    else m[papel] = vars.get(filho);
  }

  const linhas = [];
  linhas.push("import { workflow, node, trigger, ifElse, switchCase, merge, splitInBatches, nextBatch, languageModel, memory, tool, outputParser, newCredential, expr } from '@n8n/workflow-sdk';");
  linhas.push('');

  /* Declara os subnós primeiro: o pai referencia as variáveis deles. */
  const ordem = [...wf.nodes].sort((a, b) =>
    (subnoDe.has(b.name) ? 1 : 0) - (subnoDe.has(a.name) ? 1 : 0));

  for (const n of ordem) {
    const v = vars.get(n.name);
    const ctor = construtorDe(n.type, subnoDe.has(n.name));
    const cfg = { name: n.name };
    if (Array.isArray(n.position)) cfg.position = n.position;
    if (n.parameters && Object.keys(n.parameters).length) cfg.parameters = n.parameters;
    if (n.credentials) {
      cfg.credentials = {};
      for (const [k, c] of Object.entries(n.credentials)) cfg.credentials[k] = CRED + ((c && c.name) || k);
    }
    if (n.executeOnce) cfg.executeOnce = true;
    if (n.alwaysOutputData) cfg.alwaysOutputData = true;
    if (n.retryOnFail) cfg.retryOnFail = true;
    if (n.maxTries !== undefined) cfg.maxTries = n.maxTries;
    if (n.waitBetweenTries !== undefined) cfg.waitBetweenTries = n.waitBetweenTries;
    if (n.onError) cfg.onError = n.onError;
    if (n.webhookId) cfg.webhookId = n.webhookId;

    const sub = subnosDoPai.get(n.name);
    /* ifElse, switchCase, merge e splitInBatches são construtores dedicados do
     * SDK: eles JÁ sabem o tipo do nó, e passar `type` é rejeitado. */
    const SEM_TIPO = new Set(['ifElse', 'switchCase', 'merge', 'splitInBatches']);
    const corpo = [
      ...(SEM_TIPO.has(ctor) ? [] : [`  type: ${JSON.stringify(n.type)},`]),
      `  version: ${n.typeVersion ?? 1},`,
      `  config: ${literal(cfg, 1)}`,
    ];
    /* subnodes entra dentro de config, e as variáveis não podem ir por
     * literal() porque são referências, não strings. */
    if (sub) {
      const partes = [];
      if (sub.model) partes.push(`model: ${sub.model}`);
      if (sub.memory) partes.push(`memory: ${sub.memory}`);
      if (sub.outputParser) partes.push(`outputParser: ${sub.outputParser}`);
      if (sub.tools) partes.push(`tools: [${sub.tools.join(', ')}]`);
      /* O config é o último item de `corpo`, não o índice 2: quando o
       * construtor dispensa `type` o array tem um item a menos, e escrever
       * corpo[2] editaria a linha errada. */
      const iCfg = corpo.length - 1;
      corpo[iCfg] = corpo[iCfg].replace(/\}$/, `,\n    subnodes: { ${partes.join(', ')} }\n  }`);
    }
    linhas.push(`const ${v} = ${ctor}({\n${corpo.join('\n')}\n});`);
    linhas.push('');
  }

  /* A composição segue o grafo de verdade, em vez de despejar pares soltos.
   *
   * O motivo é o IF: no SDK ele não se liga por índice de saída, e sim por
   * .onTrue(cadeia) e .onFalse(cadeia), com a cadeia inteira dentro. Emitir
   * .add(no).to(outro) para as duas saídas compila e liga errado, o que é
   * pior do que não compilar: o fluxo abre bonito no editor e manda a
   * mensagem pelo ramo trocado. */
  const idWf = (wf.name || 'fluxo').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

  const saidasMain = (nome) => ((wf.connections || {})[nome] || {}).main || [];
  const primeiroDe = (ramo) => (ramo && ramo[0]) ? ramo[0].node : null;

  /* Monta a cadeia a partir de um nó, devolvendo o texto do encadeamento.
   * `visitados` corta ciclo (o Wait do gateway volta para trás). */
  /* `visitados` é UM conjunto para o fluxo inteiro. Nó que já saiu com a
   * cadeia dele aparece depois só pelo nome (é o caso de dois ramos que se
   * juntam, como as três leituras de mídia no 01). Antes cada ramo do IF
   * levava uma cópia do conjunto, e a mesma cadeia saía repetida em cada
   * caminho e de novo em .add() soltos: correto, mas quatro vezes maior. */
  const cadeia = (nome, visitados) => {
    if (!nome) return null;
    if (visitados.has(nome)) return vars.get(nome) || null;
    visitados.add(nome);
    const n = porNome.get(nome);
    const v = vars.get(nome);
    if (!n || !v) return null;
    const ctor = construtorDe(n.type, false);
    const saidas = saidasMain(nome);

    if (ctor === 'ifElse') {
      const sim = cadeia(primeiroDe(saidas[0]), visitados);
      const nao = cadeia(primeiroDe(saidas[1]), visitados);
      let s = v;
      if (sim) s += `\n    .onTrue(${sim})`;
      if (nao) s += `\n    .onFalse(${nao})`;
      return s;
    }

    const seguinte = cadeia(primeiroDe(saidas[0]), visitados);
    return seguinte ? `${v}.to(${seguinte})` : v;
  };

  const gatilhos = wf.nodes.filter(n =>
    construtorDe(n.type, false) === 'trigger' && !subnoDe.has(n.name));
  const comp = [`export default workflow(${JSON.stringify(idWf)}, ${JSON.stringify(wf.name)})`];
  const jaNaCadeia = new Set();
  for (const g of gatilhos) {
    const c = cadeia(g.name, jaNaCadeia);
    comp.push(`  .add(${c})`);
  }
  /* Nó que nenhum gatilho alcança (ramo de volta do Wait, por exemplo) sai
   * como cadeia própria, senão some do fluxo sem ninguém notar. */
  for (const [origem, saidas] of Object.entries(wf.connections || {})) {
    if (!saidas.main || jaNaCadeia.has(origem)) continue;
    const c = cadeia(origem, jaNaCadeia);
    if (c) comp.push(`  .add(${c})`);
  }
  linhas.push(comp.join('\n') + ';');
  linhas.push('');
  return linhas.join('\n');
}

/* ------------------------------------------------------------------ CLI */
const arg = process.argv[2];
const rodandoDireto = process.argv[1] && process.argv[1].endsWith('para-sdk.mjs');
if (rodandoDireto && arg) {
  const alvos = arg === '--todos'
    ? readdirSync(EXPORTS).filter(f => f.endsWith('.json')).sort()
    : [arg.endsWith('.json') ? arg : arg + '.json'];
  if (arg === '--todos') {
    const saida = join(AQUI, 'sdk-n8n');
    mkdirSync(saida, { recursive: true });
    for (const f of alvos) {
      const wf = JSON.parse(readFileSync(join(EXPORTS, f), 'utf8'));
      writeFileSync(join(saida, f.replace('.json', '.sdk.js')), paraSdk(wf));
      console.log('  ' + f.replace('.json', '.sdk.js'));
    }
    console.log(`  ${alvos.length} convertidos em infra/n8n/sdk-n8n`);
  } else {
    const wf = JSON.parse(readFileSync(join(EXPORTS, alvos[0]), 'utf8'));
    process.stdout.write(paraSdk(wf));
  }
}
