// Roda as baterias em sequência. Precede qualquer subida de fluxo no n8n.
//
//   node infra/n8n/compilar.mjs && node testes/bateria/todas.mjs
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
let falhou = 0;
for (const f of ['ofertas.mjs', 'entrada.mjs', 'gateway.mjs', 'sem-dado-real.mjs', 'sem-travessao.mjs']) {
  console.log(`\n########## ${f}`);
  try {
    console.log(execFileSync('node', [path.join(aqui, f)], { encoding: 'utf8' }));
  } catch (e) {
    console.log(e.stdout || e.message); falhou++;
  }
}
console.log(falhou ? `\n${falhou} bateria(s) com FALHA` : '\nTodas as baterias passaram.');
process.exit(falhou ? 1 : 0);
