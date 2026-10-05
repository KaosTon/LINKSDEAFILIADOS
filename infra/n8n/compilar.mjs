// Compila os arquivos infra/n8n/sdk/*.js (código do Workflow SDK do n8n) para
// o formato de export que a interface do n8n importa. Implementa só o que os
// fluxos usam: node, trigger, ifElse, languageModel, memory, tool,
// newCredential, expr, e os encadeamentos .to / .onTrue / .onFalse / subnodes.
//
//   node infra/n8n/compilar.mjs
//
// O código SDK já passou pelo validador oficial do n8n (MCP). O que este
// arquivo faz é só a tradução para JSON, com a mesma forma dos exports reais
// da Ana (nodes, connections, settings), que serviram de gabarito.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const SDK = path.join(aqui, 'sdk'), OUT = path.join(aqui, 'exports');
fs.mkdirSync(OUT, { recursive: true });

/* O id do nó é derivado do arquivo mais o nome do nó, e não sorteado.
 *
 * Sorteado, cada recompilação reescrevia os oito exports inteiros, e o diff
 * deixava de mostrar o que mudou de verdade: oito arquivos alterados para uma
 * linha de código trocada. Pior que isso na prática, quando o fluxo já estiver
 * rodando no n8n do cliente: reimportar uma versão nova com ids diferentes faz
 * o n8n tratar cada nó como outro nó. Fica impossível atualizar um fluxo no ar
 * sem perder o que está preso ao id.
 *
 * Determinístico, o mesmo nó tem o mesmo id para sempre, e o diff volta a
 * dizer a verdade. O formato é o de um UUID v5 (sha1 do texto, com os bits de
 * versão e variante no lugar), porque é o que o n8n espera ver. */
function idEstavel(semente, nome) {
  const h = crypto.createHash('sha1').update(semente + '\u0000' + nome).digest();
  const b = Buffer.from(h.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x50;          // versão 5
  b[8] = (b[8] & 0x3f) | 0x80;          // variante RFC 4122
  const x = b.toString('hex');
  return `${x.slice(0,8)}-${x.slice(8,12)}-${x.slice(12,16)}-${x.slice(16,20)}-${x.slice(20)}`;
}

export function compilar(codigo, semente) {
  const nodes = [], conns = {};
  const uuid = (nome) => idEstavel(semente, nome);
  const liga = (de, para, tipo = 'main', saida = 0, entrada = 0) => {
    conns[de] ??= {}; conns[de][tipo] ??= [];
    while (conns[de][tipo].length <= saida) conns[de][tipo].push([]);
    conns[de][tipo][saida].push({ node: para, type: tipo, index: entrada });
  };
  const expr = s => (s.startsWith('=') ? s : '=' + s);
  const newCredential = nome => ({ id: 'CRIAR-NA-UI', name: nome });
  const limpa = v => JSON.parse(JSON.stringify(v));

  // Cada builder é uma CADEIA com cabeça (quem recebe a conexão de entrada) e
  // cauda (de onde sai a próxima). "a.to(b).to(c)" liga a→b, b→c e devolve a
  // cadeia a…c, para que "x.onFalse(a.to(b).to(c))" ligue x→a, e não x→c.
  function cadeia(cabeca, cauda) {
    const ch = { nome: cabeca, cauda };
    ch.to = alvo => { liga(ch.cauda, alvo.nome, 'main', 0); return cadeia(ch.nome, alvo.cauda); };
    return ch;
  }
  function fazNode(def) {
    // retryOnFail, alwaysOutputData e companhia moram DENTRO de config. Fora
    // dele o SDK oficial ignora calado, e este compilador tambem ignorava:
    // quatro fluxos subiram sem o retry que o comentario prometia.
    const fora = Object.keys(def).filter(k => !['type', 'version', 'config', 'output'].includes(k));
    if (fora.length) throw new Error(`nó "${(def.config || {}).name}": ${fora.join(', ')} fora de config; o n8n ignora. Mova para dentro de config.`);
    const c = def.config || {};
    const n = { parameters: limpa(c.parameters || {}), id: uuid(c.name), name: c.name, type: def.type,
      typeVersion: def.version, position: c.position || [0, 0] };
    // Escrever o corpo de um nó Code como lista de linhas e esquecer o
    // .join deixa jsCode como array. O JSON sai válido, o validador oficial
    // aceita, a topologia fecha, e só na hora de rodar no n8n do cliente é
    // que o nó estoura. Aqui isso vira erro de compilação.
    if (n.parameters && 'jsCode' in n.parameters && typeof n.parameters.jsCode !== 'string')
      throw new Error(`nó "${c.name}": jsCode virou ${Array.isArray(n.parameters.jsCode) ? 'array' : typeof n.parameters.jsCode}, e tem que ser texto. Faltou .join('\\n')?`);
    // E o código tem que ser código. Escapar uma barra invertida errado faz
    // `/\\/+$/` virar `//+$/`, que é comentário seguido de lixo: o JSON sai
    // válido, o validador aceita, e o nó só estoura no n8n do cliente. Aqui
    // isso vira erro de compilação, com o nome do nó e a linha.
    if (n.parameters && typeof n.parameters.jsCode === 'string') {
      try { new Function(n.parameters.jsCode); }
      catch (e) {
        // `await` no topo é legítimo num nó Code do n8n, mas new Function não
        // aceita; a segunda tentativa embrulha em função assíncrona.
        try { new Function(`return (async () => {\n${n.parameters.jsCode}\n})`); }
        catch (e2) {
          throw new Error(`nó "${c.name}": o jsCode não é JavaScript válido: ${e2.message}`);
        }
      }
    }
    if (c.credentials) n.credentials = limpa(c.credentials);
    if (def.type.endsWith('.webhook') || def.type.endsWith('.wait')) n.webhookId = uuid(c.name + '#webhook');
    if (c.executeOnce) n.executeOnce = true;
    for (const k of ['retryOnFail', 'maxTries', 'waitBetweenTries', 'onError', 'alwaysOutputData']) if (c[k] !== undefined) n[k] = c[k];
    nodes.push(n);
    return cadeia(c.name, c.name);
  }
  function node(def) { return fazNode(def); }
  function trigger(def) { return fazNode(def); }
  const languageModel = def => fazNode(def);
  const memory = def => fazNode(def);
  const tool = def => fazNode(def);
  function ifElse(def) {
    const b = fazNode({ type: 'n8n-nodes-base.if', version: def.version, config: def.config });
    b.onTrue = alvo => { liga(b.nome, alvo.nome, 'main', 0); return b; };
    b.onFalse = alvo => { liga(b.nome, alvo.nome, 'main', 1); return b; };
    return b;
  }
  const pendentesSub = [];
  const nodeComSub = def => {
    const b = node(def);
    const s = def.config && def.config.subnodes;
    if (s) pendentesSub.push([b.nome, s]);
    return b;
  };
  function workflow(id, name) {
    const w = { id, name, ultimoNome: null };
    w.add = b => { w.ultimoNome = b.cauda; return w; };
    w.to = b => { liga(w.ultimoNome, b.nome, 'main', 0); w.ultimoNome = b.cauda; return w; };
    w._final = () => {
      for (const [agente, s] of pendentesSub) {
        if (s.model) liga(s.model.nome, agente, 'ai_languageModel', 0);
        if (s.memory) liga(s.memory.nome, agente, 'ai_memory', 0);
        for (const t of (s.tools || [])) liga(t.nome, agente, 'ai_tool', 0);
      }
      // errorWorkflow fica de fora do JSON de propósito: o id do 00 só existe
      // depois de importado. É um clique em Settings de cada workflow (guia).
      return { name, nodes, connections: conns, active: false,
        settings: { executionOrder: 'v1' }, meta: { templateCredsSetupCompleted: false }, tags: [] };
    };
    return w;
  }
  const corpo = codigo.replace(/^import .*$/m, '').replace(/export default /, 'return ');
  const fn = new Function('workflow', 'node', 'trigger', 'ifElse', 'languageModel', 'memory', 'tool', 'newCredential', 'expr', corpo);
  const w = fn(workflow, nodeComSub, trigger, ifElse, languageModel, memory, tool, newCredential, expr);
  return w._final();
}

// Prompt de agente (systemMessage) entra como texto simples, nunca como
// expressão: um {{ }} dentro do prompt seria avaliado pelo n8n e quebraria.
export function injetar(wf) {
  for (const n of wf.nodes) {
    const o = n.parameters && n.parameters.options;
    if (!o || typeof o.systemMessage !== 'string') continue;
    if (o.systemMessage.startsWith('=')) throw new Error(`${wf.name}: systemMessage não pode ser expressão`);
  }
}

// Importado (pela bateria de ida e volta), so empresta compilar e injetar.
const rodandoDireto = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
let total = 0;
if (rodandoDireto) for (const f of fs.readdirSync(SDK).filter(f => f.endsWith('.js')).sort()) {
  const codigo = fs.readFileSync(path.join(SDK, f), 'utf8');
  const wf = compilar(codigo, f);
  injetar(wf);
  // sanidade: conexões apontam para nós existentes; todo nó sem trigger tem entrada
  const nomes = new Set(wf.nodes.map(n => n.name));
  const comEntrada = new Set();
  for (const [de, tipos] of Object.entries(wf.connections)) {
    if (!nomes.has(de)) throw new Error(`${f}: conexão sai de nó inexistente "${de}"`);
    for (const [tipo, arr] of Object.entries(tipos)) {
      if (tipo !== 'main') comEntrada.add(de);   // subnó de IA: liga-se ao agente pela saída ai_*
      for (const saida of arr) for (const x of saida) {
        if (!nomes.has(x.node)) throw new Error(`${f}: conexão para nó inexistente "${x.node}"`);
        comEntrada.add(x.node);
      }
    }
  }
  const soltos = wf.nodes.filter(n => !comEntrada.has(n.name) && !/Trigger|trigger|webhook/i.test(n.type)).map(n => n.name);
  if (soltos.length) throw new Error(`${f}: nós sem entrada: ${soltos.join(', ')}`);
  const dup = wf.nodes.map(n => n.name).filter((n, i, a) => a.indexOf(n) !== i);
  if (dup.length) throw new Error(`${f}: nomes duplicados: ${dup.join(', ')}`);
  const destino = path.join(OUT, f.replace(/\.js$/, '.json'));
  fs.writeFileSync(destino, JSON.stringify(wf, null, 2));
  const nSub = Object.values(wf.connections).flatMap(t => Object.keys(t)).filter(k => k !== 'main').length;
  console.log(`  ${path.basename(destino).padEnd(38)} ${String(wf.nodes.length).padStart(2)} nós · ${Object.keys(wf.connections).length} origens · ${nSub} ligações ai_*`);
  total++;
}
if (rodandoDireto) console.log(`  ${total} workflows compilados em ${path.relative(process.cwd(), OUT)}`);
