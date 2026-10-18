// FONTE UNICA DE DADOS DO SITE. Nome, grupo, guias e FAQ moram aqui; nenhum componente escreve
// dado solto (METODO §1 do fabrica-sites). Texto das secoes da home: src/data/home.ts.
// Origem dos links do grupo: src/data/whatsapp.ts.
//
// Tem Descontos e o grupo de ofertas do Wellington (robo do repo LINKSDEAFILIADOS). Dados
// conferidos em 16/10/2026: dominio temdescontos.com.br (Registro.br, 16/10), lojas e horario
// do robo (infra/n8n/sdk/03-garimpo.js, valores padrao). O que falta esta no BRIEFING.md §2.

/**
 * true enquanto o site ainda tem dado do modelo. A trava scripts/check-modelo.mjs barra o build
 * com isto ligado. Desligado em 16/10/2026: nada do site-modelo sobrou.
 */
export const MODELO = false;

export const SITE = {
  /** marca como aparece no topo e nos titulos */
  nome: "Tem Descontos",
  /** atividade, curta: vai no topo, no rodape e nos titulos */
  titulo: "Grupo de ofertas no WhatsApp",
  /** sem registro profissional (nao e atividade regulada por conselho) */
  registro: "",
  cidade: "",
  uf: "",
  /** O site nao tem WhatsApp de atendimento: o botao verde leva ao GRUPO (ver `grupo`). O numero
   *  do robo e separado e nao aparece aqui (decisao do Wellington). */
  whatsapp: "",
  whatsappFormatado: "",
  /** e-mail de contato (Cloudflare Email Routing, encaminha para o Gmail do Wellington; 16/10/2026) */
  email: "contato@temdescontos.com.br",
  /** horario padrao do robo (GARIMPO_INICIO e GARIMPO_FIM em 16/10/2026) */
  horario: "Ofertas todos os dias, das 8h às 22h",
  horarioSchema: [] as string[],
  /** perfil do Instagram da marca (criado pelo Wellington em 16/10/2026) */
  instagram: "https://www.instagram.com/temdescontos",
  instagramUsuario: "@temdescontos",
  redes: [] as { nome: string; url: string }[],
  avaliacoesGoogle: "",
  /** endereco do site, sem barra no fim. O dominio sem www e do encurtador (links curtos das
   *  ofertas); o site mora no www. Ver BRIEFING §5. */
  url: "https://www.temdescontos.com.br",
  /** Entrada no grupo: o encurtador redireciona para o convite atual (CONVITE_GRUPO no
   *  Railway). Assim o convite troca sem mexer no site, e o encurtador conta de onde veio. */
  grupo: "https://temdescontos.com.br/grupo",
  /** tipo do schema.org: site de ofertas sem endereco nao e LocalBusiness */
  tipoSchema: "Organization",
  conselho: "",
  /** 2 letras pro icone da aba e da tela inicial */
  monograma: "TD",
  /** logo pra fundo escuro (rodape, /links). Vazio = marca desenhada em components/Marca.tsx. */
  logoClaro: "",
  // ---- textos de SEO e de marca
  /** title da home, ate 60 caracteres */
  tituloSeo: "Tem Descontos | Ofertas conferidas no seu WhatsApp",
  /** description da home, 140 a 160 caracteres, com o dado na frente */
  descricao:
    "Ofertas da Amazon, Mercado Livre, Shopee e Magalu com o preço conferido na loja antes de postar. Grupo de WhatsApp grátis, das 8h às 22h, só com link oficial.",
  /** uma frase pro rodape e pro /links */
  descricaoCurta: "Ofertas das grandes lojas com o preço conferido antes de chegar no seu WhatsApp.",
  /** frase de marca, curta, pro /links e pra imagem de compartilhamento */
  frase: "Oferta boa, conferida antes de chegar em você",
  /** Aviso do rodape. A frase de associado e exigencia do Programa de Associados da Amazon
   *  (Contrato Operacional, secao de identificacao). NAO CONFIRMEI a redacao exata no portal em
   *  16/10/2026 (associados.amazon.com.br fora do alcance daqui): conferir no painel. */
  aviso:
    "Os links das ofertas são links de afiliado: quando você compra por eles, a loja nos paga uma comissão, e o preço para você é o mesmo. Como Associado da Amazon, recebo por compras qualificadas. Preço e estoque são da loja e podem mudar a qualquer momento.",
};

/** Rotulos que mudam por segmento. Aqui as "paginas de servico" sao os guias. */
export const TEXTOS = {
  servicos: "Guias",
  todosServicos: "Todos os guias",
  unidades: "",
  agendar: "Entrar no grupo",
  agendarCurto: "Entrar",
  /** quem fala no site */
  quemAtende: "a equipe do Tem Descontos",
};

/** Menu do topo (e do celular). Toda rota aqui e conferida pela trava de links. */
export const MENU = [
  { label: "Como funciona", href: "/#como-funciona" },
  { label: "Guias", href: "/#guias" },
  { label: "Blog", href: "/blog" },
  { label: "Sobre", href: "/sobre" },
];

/** Lista com check no topo da home: o que o robo faz de verdade (lib/ofertas.mjs, 16/10/2026). */
export const DESTAQUES_TOPO = ["Preço conferido na loja", "Só link oficial da loja", "Grátis, sem cadastro"];

/** Lojas de onde vem as ofertas (programas de afiliado aprovados em 05/10/2026). */
export const LOJAS = ["Amazon", "Mercado Livre", "Shopee", "Magalu"];

/**
 * Link do botao verde. No site-modelo abre uma conversa com a mensagem da pagina; aqui abre o
 * grupo, e a "mensagem" vira a ORIGEM do clique (?de=), que o encurtador conta. Mesmo principio
 * (METODO §6): saber qual pagina trouxe a pessoa. As origens moram em whatsapp.ts.
 */
export function linkWhats(origem: string): string {
  return `${SITE.grupo}?de=${encodeURIComponent(origem)}`;
}

export type Servico = {
  slug: string;
  nome: string;
  desc: string;
  /** grupo pra organizar a grade da home (um dos GRUPOS_SERVICO) */
  grupo: string;
  /** os principais: entram primeiro e ganham pagina propria */
  principal?: boolean;
  /** foto do card na home (public/guias/{slug}.webp). So com o arquivo no lugar. */
  foto?: string;
};

export const GRUPOS_SERVICO = ["Antes de comprar"];

// Guias: as paginas donas das buscas principais (o papel das paginas de servico no modelo).
// A rota e /guias/{slug} (no modelo, /servicos/{slug}).
export const SERVICOS: Servico[] = [
  { slug: "como-saber-se-a-promocao-e-verdadeira", nome: "Como saber se a promoção é verdadeira", desc: "As conferências que fazemos antes de postar, para você repetir em qualquer oferta.", grupo: "Antes de comprar", principal: true },
  { slug: "grupo-de-ofertas-no-whatsapp-e-seguro", nome: "Grupo de ofertas no WhatsApp é seguro?", desc: "Como reconhecer link de golpe e o que um grupo sério nunca pede.", grupo: "Antes de comprar", principal: true },
  { slug: "cupom-da-amazon-como-usar", nome: "Cupom da Amazon: como usar", desc: "Cupom de marcar na página, cupom com código e cupom de primeira compra no app.", grupo: "Antes de comprar", principal: true },
];

export const PRINCIPAIS = SERVICOS.filter((s) => s.principal);

export type Unidade = {
  slug: string;
  nome: string;
  cidade: string;
  uf: string;
  bairro: string;
  endereco: string;
  cep: string;
  foto?: string;
};

// Sem unidade fisica: o grupo e online.
export const UNIDADES: Unidade[] = [
];

export const ONLINE: { nome: string; desc: string } | null = null;

/**
 * Quem assina o conteudo (E-E-A-T, METODO §2.5). Decidido em 18/10/2026: o Wellington assina com o
 * nome dele ("pode usar meus dados como autoridade"). Dados iguais aos do site da Virtus
 * (projeto-virtus-site, src/data/blog.ts, AUTHOR_WELLINGTON); foto: a mesma, recortada.
 */
export const AUTOR = {
  nome: "Wellington Santos",
  cargo: "Criador do Tem Descontos",
  registro: "",
  foto: "/autor/wellington-santos.webp",
  bio: [
    "Wellington Santos criou o Tem Descontos e escreveu as regras que o robô do grupo segue antes de postar uma oferta: o preço é checado na própria loja, o produto tem que ser o mesmo do anúncio e o link leva direto para a loja oficial. Oferta que não passa nas regras não é postada.",
    "Engenheiro de Produção formado pela UniABC, trabalha no mercado de seguros desde 2015 e fundou a Virtus Corretora de Seguros em 2020. Do seguro veio o hábito de ler a regra antes de prometer e de desconfiar de número sem conta, que é o que o Tem Descontos faz com cada promoção.",
  ],
};

/** Formacao do autor (a mesma do site da Virtus). Sem registro profissional nesta atividade. */
export const CREDENCIAIS = {
  graduacao: { curso: "Engenharia de Produção", instituicao: "UniABC", conclusao: "" } as { curso: string; instituicao: string; conclusao: string } | null,
  cursos: [] as { ano: string; nome: string; com: string; area: string }[],
};

/** FAQ da home: perguntas como as pessoas buscam, resposta objetiva na primeira frase. */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "Precisa pagar para entrar no grupo?",
    a: "Não. O grupo é grátis e não tem cadastro: você entra pelo convite e sai quando quiser. Quem paga a comissão é a loja, quando alguém compra pelo link.",
  },
  {
    q: "O preço é o mesmo da loja?",
    a: "Sim. O link leva para a página da própria loja, e o preço que vale é o que aparece lá na hora da compra. Antes de postar, conferimos o preço na loja; se ele mudar depois, vale o da loja.",
  },
  {
    q: "Vocês vendem os produtos?",
    a: "Não. Nós só mostramos a oferta. A compra, o pagamento, a entrega e a troca são com a loja, do jeito que seriam se você entrasse direto no site dela.",
  },
  {
    q: "Quantas mensagens o grupo manda por dia?",
    a: "As ofertas saem uma por vez, com intervalo entre elas, das 8h às 22h, e à noite o ritmo cai. Se preferir, silencie o grupo e abra quando quiser ver as ofertas.",
  },
  {
    q: "Vocês mandam mensagem no privado?",
    a: "Não. As ofertas saem só no grupo. Se alguém falar em nome do Tem Descontos no seu privado pedindo dados, Pix ou código, é golpe.",
  },
];
