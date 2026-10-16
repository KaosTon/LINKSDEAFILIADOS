// Posts do blog. Regras em DOCS/BLOG.md (protocolo e indice anti-canibalizacao) e DOCS/METODO.md §3.
//
// - `conteudo` e HTML (vai pra tela com dangerouslySetInnerHTML): comeca em <h2>, nunca <h1>.
//   Markdown aparece cru na tela, e a trava scripts/check-markdown.mjs barra no build.
// - Todo post novo entra no indice do DOCS/BLOG.md (trava scripts/check-indice-blog.mjs).
// - Link interno no corpo e conferido pela trava de links (scripts/check-links-internos.mjs).
// - Nenhum numero sem fonte e ano. Regras do segmento (preco, antes e depois, promessa):
//   BRIEFING.md e metodo/SEGMENTOS.md no fabrica-sites.
// - Preco de produto da Amazon NAO vai em post (a politica do Programa de Associados so aceita
//   preco vindo da Amazon e atualizado); fale de como conferir, nunca "custa R$ X".

export type Fonte = { nome: string; url: string };

export type Post = {
  slug: string;
  titulo: string;
  /** ate 60 caracteres */
  metaTitle: string;
  /** 140 a 160 caracteres */
  metaDescription: string;
  /** 1 a 2 frases pra lista do blog */
  resumo: string;
  /** resposta direta em topicos no topo do post (answer-first, lida por IA) */
  resumoRapido: string[];
  /** ISO AAAA-MM-DD */
  dataPublicacao: string;
  /** mes/ano da revisao tecnica do AUTOR (site.ts). Sem isso, a tela mostra revisao pendente. */
  revisadoEm?: string;
  /** ISO AAAA-MM-DD da ultima revisao do conteudo (vira dateModified). Sem isso, vale a publicacao. */
  dataRevisao?: string;
  /** buscas de que o post trata; tag com dono vira link (src/data/tag-destinos.ts) e keywords */
  tags: string[];
  /** URL do post no blog antigo, pra virar redirect 301 no lancamento */
  urlAntiga?: string;
  /** guia dono do assunto (slug de SERVICOS): link de saida garantido e bloco de CTA */
  servico: string;
  /** capa 1200x675 em public/blog/{slug}.webp (imagem propria, casada com o tema; trava check-paginas) */
  imagem: string;
  faq: { q: string; a: string }[];
  fontes: Fonte[];
  conteudo: string;
};

export const POSTS: Post[] = [
];

export function post(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/** posts mais recentes primeiro */
export const POSTS_ORDENADOS = [...POSTS].sort((a, b) => b.dataPublicacao.localeCompare(a.dataPublicacao));

export function dataPorExtenso(iso: string): string {
  return new Date(`${iso}T12:00:00-03:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

/** tempo de leitura medido no texto, 200 palavras por minuto */
export function tempoLeitura(p: Post): number {
  const palavras = p.conteudo.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 200));
}
