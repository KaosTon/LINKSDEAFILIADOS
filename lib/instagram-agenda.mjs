// Posts de conteúdo do Instagram (12/11/2026): dicas e datas que não vendem nada, para o perfil não ser
// só oferta. A agenda (data, imagem, legenda) é gerada por marketing/instagram/gerar.mjs e publicada com o
// site em /instagram/agenda.json; o fluxo 06 lê e posta o item do dia às 18h. Nada é escrito por IA na hora.

const horaSP = (agora) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }).format(agora));
const diaSP = (agora) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);

/** Das 18h às 22h (horário de Brasília): se a Meta falhar às 18h, as rodadas seguintes tentam de novo. */
export const horaDoConteudo = (agora) => horaSP(agora) >= 18 && horaSP(agora) < 22;

/** O item de hoje que ainda não saiu e não estourou as 3 tentativas. Item malformado é ignorado. */
export function postDeHoje(agenda, agora, mem) {
  const dia = diaSP(agora);
  const feitos = new Set(mem.feitos || []);
  const tent = mem.tentativas && mem.tentativas.dia === dia ? mem.tentativas : { dia, n: {} };
  mem.tentativas = tent;
  return (Array.isArray(agenda) ? agenda : []).find(p => p && p.data === dia && /^[a-z0-9-]+$/.test(String(p.id || ''))
    && /^\/instagram\/[a-z0-9-]+\.jpg$/.test(String(p.imagem || '')) && String(p.legenda || '').trim()
    && !feitos.has(p.id) && (tent.n[p.id] || 0) < 3) || null;
}

export function anotarTentativa(mem, id, publicado) {
  if (publicado) mem.feitos = [...(mem.feitos || []).filter(x => x !== id), id].slice(-120);
  else mem.tentativas.n[id] = (mem.tentativas.n[id] || 0) + 1;
}
