// Nenhum telefone de cliente de verdade pode entrar neste repositório.
//
// Esta bateria existe porque a regra falhou uma vez. Ao montar os testes da
// base de clientes, os números vieram da planilha real do dono, que é o jeito
// mais natural de escrever um teste realista e o jeito mais rápido de
// publicar dado pessoal de terceiro num repositório de código.
//
// A convenção: todo telefone inventado aqui é obviamente inventado, e são só
// duas formas aceitas. Ou tem um bloco de dígito repetido (999, 888, 777), ou
// tem uma corrida de quatro dígitos seguidos (98765, 12345). Número de gente
// não tem nem uma coisa nem outra. Qualquer telefone brasileiro que fuja
// disso é reprovado, com arquivo e linha.
//
// A pasta exports/ fica de fora porque é gerada: se o SDK está limpo, ela
// está. Varrê-la só traria os UUID dos nós, que casam com o formato de
// telefone e não são telefone nenhum.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PULAR = new Set(['.git', 'node_modules', '_browser_profile', 'transcricoes', 'exports']);
const EXTENSOES = ['.js', '.mjs', '.md', '.sql', '.json', '.py', '.txt', '.html', '.yaml', '.yml'];

// 10 ou 11 dígitos nacionais, com ou sem o 55 na frente, com ou sem separador.
const TELEFONE = /(?:\+?55[\s.-]?)?\(?([1-9][1-9])\)?[\s.-]?(9?\d{4})[\s.-]?(\d{4})/g;

function pareceInventado(d) {
  if (/(\d)\1{2}/.test(d)) return true;              // 999, 888, 000
  for (let i = 0; i + 3 < d.length; i++) {           // 9876, 1234
    let sobe = true, desce = true;
    for (let k = 0; k < 3; k++) {
      if (+d[i + k + 1] !== +d[i + k] + 1) sobe = false;
      if (+d[i + k + 1] !== +d[i + k] - 1) desce = false;
    }
    if (sobe || desce) return true;
  }
  return false;
}

const arquivos = [];
(function varre(dir){
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (PULAR.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) varre(p);
    else if (EXTENSOES.includes(path.extname(e.name))) arquivos.push(p);
  }
})(raiz);

const suspeitos = [];
for (const arq of arquivos) {
  const linhas = fs.readFileSync(arq, 'utf8').split('\n');
  linhas.forEach((linha, i) => {
    // datas dd/mm/aaaa e horas não são telefone
    if (/^\s*(\/\/|--|#)/.test(linha) && !/\d{4}[\s.-]?\d{4}/.test(linha)) return;
    for (const m of linha.matchAll(TELEFONE)) {
      const so = m[0].replace(/\D/g, '');
      if (so.length < 10) continue;
      if (pareceInventado(so)) continue;
      // Epoch do painel tem 10 dígitos e DDD do interior de SP também começa
      // com 17 e 18, então o número sozinho não decide. O que decide é a
      // vizinhança: telefone de gente não mora ao lado da palavra "epoch".
      // Sem esta exceção o guarda acusava os timestamps do próprio painel, e
      // guarda que grita à toa é guarda que a gente aprende a ignorar.
      // A vizinhança é uma janela, não só a linha: em bloco de comentário a
      // palavra que explica ("timestamps reais do painel") fica no cabeçalho,
      // linhas acima do número.
      const volta = linhas.slice(Math.max(0, i - 3), i + 1).join(' ');
      if (so.length === 10 && /^\(?\d+\)?$/.test(m[0].trim()) &&
          +so >= 1000000000 && +so <= 2500000000 &&
          /epoch|timestamp|_date|_at\b|time_now/i.test(volta)) continue;
      suspeitos.push({ arq: path.relative(raiz, arq), linha: i + 1,
                       achado: m[0].trim(), contexto: linha.trim().slice(0, 78) });
    }
  });
}

if (suspeitos.length) {
  console.log('  FAIL  telefone sem cara de inventado no repositório:');
  for (const s of suspeitos)
    console.log(`        ${s.arq}:${s.linha}  "${s.achado}"\n          ${s.contexto}`);
  console.log(`\n  Se for número de teste, use a convenção da casa: um bloco de`);
  console.log(`  dígito repetido e final 000N, como 47 99777-0001.`);
  console.log(`\n  0/1 PASS`);
  process.exit(1);
}
console.log(`  PASS  ${arquivos.length} arquivos varridos, nenhum telefone com cara de real`);
console.log('\n  1/1 PASS');
