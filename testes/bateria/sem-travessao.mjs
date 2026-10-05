// Regra absoluta do repositório (pedida pelo Wellington): nunca usar
// travessão (os caracteres U+2014 e U+2013) no meio das palavras e das frases. Esta bateria varre
// o que é versionado e falha apontando arquivo e linha.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arquivos = execFileSync('git', ['ls-files'], { cwd: raiz, encoding: 'utf8' })
  .split('\n').filter(f => /\.(md|js|mjs|sql|py|json|txt|html)$/.test(f));
// Montado pelo código do caractere para este arquivo não se acusar.
const TRAVESSAO = new RegExp('[' + String.fromCharCode(0x2014, 0x2013) + ']');
const achados = [];
for (const f of arquivos) {
  const p = path.join(raiz, f);
  if (!fs.existsSync(p)) continue;
  fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
    if (TRAVESSAO.test(l)) achados.push(`${f}:${i + 1}  ${l.trim().slice(0, 90)}`);
  });
}
if (achados.length) {
  console.log(`  FAIL  travessão no repositório (${achados.length}):`);
  for (const a of achados.slice(0, 30)) console.log('        ' + a);
  console.log('\n  0/1 PASS'); process.exitCode = 1;
} else {
  console.log(`  PASS  ${arquivos.length} arquivos varridos, nenhum travessão`);
  console.log('\n  1/1 PASS');
}
