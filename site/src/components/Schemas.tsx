import { AUTOR, LOJAS, SITE } from "@/data/site";

// Dados estruturados (JSON-LD). Tudo sai de site.ts. Site de ofertas sem endereco: Organization
// + WebSite (nao LocalBusiness). CONFIRMAR no teste de resultados avancados do Google antes do
// lancamento.

export const ID_ORGANIZACAO = `${SITE.url}/#organizacao`;
export const ID_PESSOA = `${SITE.url}/autor/${AUTOR.slug}#pessoa`;

const json = (dado: unknown) => ({ __html: JSON.stringify(dado) });

const redes = () => [SITE.instagram, ...SITE.redes.map((r) => r.url)].filter(Boolean);

export function organizacaoNode() {
  return {
    "@type": SITE.tipoSchema,
    "@id": ID_ORGANIZACAO,
    name: SITE.nome,
    url: SITE.url,
    logo: `${SITE.url}/icon`,
    description: SITE.descricaoCurta,
    knowsAbout: LOJAS.map((l) => `ofertas ${l}`),
    ...(SITE.email ? { email: SITE.email } : {}),
    ...(redes().length ? { sameAs: redes() } : {}),
  };
}

/** Autor dos guias e posts: Wellington Santos (decidido em 18/10/2026). Mesmos dados do site da Virtus. */
export function pessoaNode() {
  return {
    "@type": "Person",
    "@id": ID_PESSOA,
    name: AUTOR.nome,
    alternateName: AUTOR.nomeLegal,
    jobTitle: AUTOR.cargo,
    url: `${SITE.url}/autor/${AUTOR.slug}`,
    image: `${SITE.url}${AUTOR.foto}`,
    worksFor: { "@id": ID_ORGANIZACAO },
    alumniOf: { "@type": "CollegeOrUniversity", name: "UniABC, Universidade do Grande ABC", alternateName: "Anhanguera" },
    knowsAbout: AUTOR.sabeSobre,
    sameAs: [AUTOR.linkedin, AUTOR.instagram],
  };
}

export function SchemaOrganizacao() {
  const dado = [
    { "@context": "https://schema.org", ...organizacaoNode() },
    { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE.url}/#site`, name: SITE.nome, url: SITE.url, inLanguage: "pt-BR", publisher: { "@id": ID_ORGANIZACAO } },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={json(dado)} />;
}
