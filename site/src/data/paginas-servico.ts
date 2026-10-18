// Conteudo dos guias (/guias/{slug}), o papel das paginas de servico do site-modelo. So ganha
// pagina o guia que tem entrada aqui; a trava de links le os slugs deste arquivo.
//
// Regras (METODO §2 e §3 do fabrica-sites): pergunta no h1, resposta objetiva no primeiro
// paragrafo, tabela com dado real, FAQ de 3 a 5, nenhum fato sem fonte e data.
//
// O dado proprio (first-party) daqui sai do codigo do robo, conferido em 16/10/2026:
//   - conferencias antes de postar: lib/ofertas.mjs (conferirPreco, deCrivel, quantidade,
//     garimpar: produto_diferente_do_post, ml_sem_conferir_antigo) e o limparChamada da legenda;
//   - lojas aceitas pelo encurtador: encurtador/servidor.mjs (LOJAS);
//   - tipos de cupom da Amazon: lerCupomAmazon, testado na pagina real em 16/10/2026.
// Mudou a regra no robo: mudar aqui junto.

export type Fonte = { nome: string; url: string; consultadaEm: string };

export type PaginaServico = {
  slug: string;
  /** ate 60 caracteres, palavra-chave a esquerda */
  title: string;
  /** 140 a 160 caracteres */
  description: string;
  h1: string;
  h1Destaque: string;
  /** resposta direta a pergunta do h1, em 1 a 2 frases */
  resposta: string;
  intro: string;
  /** numeros do card escuro ao lado do h1 (dado real, nunca inventado) */
  numeros: { rotulo: string; valor: string }[];
  tabela: { eyebrow: string; titulo: string; legenda: string; colunas: [string, string, string]; linhas: [string, string, string][] };
  /** passo a passo para quem le repetir sozinho */
  etapas?: { nome: string; desc: string }[];
  etapasTitulo?: string;
  faq: { q: string; a: string }[];
  fontes: Fonte[];
  /** mes/ano da revisao do AUTOR. Sem isso, a tela mostra revisao pendente. */
  revisadoEm?: string;
};

export const PAGINAS_SERVICO: PaginaServico[] = [
  {
    slug: "como-saber-se-a-promocao-e-verdadeira",
    title: "Como saber se a promoção é verdadeira | Tem Descontos",
    description:
      "Preço confere na loja? O \"De\" é real? O kit é o mesmo? As 7 conferências que fazemos antes de postar uma oferta, para você repetir antes de comprar.",
    h1: "Como saber se a promoção é verdadeira?",
    h1Destaque: "Confira na loja, não no anúncio",
    resposta:
      "Abra o link e confira na página da loja o preço, o produto e a quantidade. Se o preço riscado (\"De\") parecer alto demais ou a oferta não bater com a loja, desconfie.",
    intro:
      "Promoção falsa quase nunca é preço inventado do nada. O mais comum é o anúncio mostrar um produto e o link abrir outro, um kit virar unidade, um \"De\" inflado para o desconto parecer maior, ou um preço que já acabou continuar circulando. São exatamente essas as coisas que conferimos antes de postar.",
    numeros: [
      { rotulo: "Conferências por oferta", valor: "7" },
      { rotulo: "Lojas", valor: "4" },
    ],
    tabela: {
      eyebrow: "O que conferimos",
      titulo: "As conferências antes de uma oferta sair no grupo",
      legenda: "Regras de conferência do Tem Descontos em 16/10/2026. Oferta que falha em uma delas não é postada, ou sai sem a informação que não deu para confirmar.",
      colunas: ["Conferência", "O problema que ela pega", "O que fazemos"],
      linhas: [
        ["Preço na loja", "O preço do anúncio já mudou ou nunca foi aquele.", "Abre a página da loja e usa o preço de lá. Se não bate, vale o da loja."],
        ["Mesmo produto", "O anúncio fala de um produto e o link abre outro.", "Compara o nome do anúncio com o da loja. Diferente, descarta."],
        ["Mesma quantidade", "\"Kit com 3\" no anúncio e uma unidade no link.", "Lê a quantidade (kit, pack, unidades) dos dois lados. Diferente, descarta."],
        ["Preço riscado (\"De\")", "\"De\" inflado para o desconto parecer maior.", "Só mostra o \"De\" quando o desconto fica em até 70%. Acima disso, o \"De\" sai do post."],
        ["Cupom", "Cupom que só vale para alguns aparece como preço de todos.", "Cupom de primeira compra ou só no app vira aviso, fora do preço."],
        ["Oferta antiga", "Preço relâmpago que já acabou continua circulando.", "Oferta do Mercado Livre que não deu para conferir e tem mais de 30 minutos é descartada."],
        ["Texto do post", "Chamada com \"menor preço do ano\" ou urgência falsa.", "A chamada não pode ter preço, porcentagem, frete ou \"últimas horas\" que não venham da loja."],
      ],
    },
    etapasTitulo: "Faça você mesmo em 4 passos",
    etapas: [
      { nome: "Abra o link e olhe o endereço", desc: "Tem que ser o site da loja (amazon.com.br, mercadolivre.com.br, shopee.com.br, magazineluiza.com.br). Endereço estranho, feche." },
      { nome: "Compare o produto", desc: "Nome, modelo, cor, voltagem e quantidade. Kit de 3 no anúncio tem que ser kit de 3 na loja." },
      { nome: "Confira o preço final", desc: "O que vale é o preço no carrinho, com frete. Cupom que não aparece no carrinho não está valendo." },
      { nome: "Desconfie do riscado", desc: "Desconto muito alto em produto que nunca sai por aquele \"De\" é sinal de preço inflado." },
    ],
    faq: [
      {
        q: "O preço do grupo é garantido?",
        a: "Não: quem define o preço é a loja, e ele pode mudar a qualquer momento. Conferimos antes de postar, mas o que vale é o preço na página da loja na hora da compra.",
      },
      {
        q: "Por que às vezes o post não mostra o preço \"De\"?",
        a: "Porque não deu para confirmar que ele é real. Quando o desconto passa de 70% sobre o preço riscado, tiramos o \"De\" do post para não exagerar a oferta.",
      },
      {
        q: "Anunciar um preço e cobrar outro é permitido?",
        a: "Não. Pelo Código de Defesa do Consumidor, a oferta anunciada obriga quem anuncia, e a publicidade enganosa é proibida. Se a loja mostrou um preço e cobrou outro, guarde o print e fale com a loja.",
      },
      {
        q: "Cupom que não funcionou: a oferta era falsa?",
        a: "Nem sempre. Muitos cupons têm regra (primeira compra, só no app, valor mínimo ou limite de uso) ou acabam. Por isso, cupom com regra vai no post como aviso, não como preço.",
      },
    ],
    fontes: [
      { nome: "Código de Defesa do Consumidor, Lei 8.078/1990, arts. 30 e 37 (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm", consultadaEm: "16/10/2026, sem reabrir na fonte oficial (site fora do ar na consulta)" },
    ],
  },
  {
    slug: "grupo-de-ofertas-no-whatsapp-e-seguro",
    title: "Grupo de ofertas no WhatsApp é seguro? | Tem Descontos",
    description:
      "Grupo de ofertas sério só manda link da loja oficial e nunca pede Pix, dados ou código. Veja os sinais de golpe e como o Tem Descontos protege os links.",
    h1: "Grupo de ofertas no WhatsApp é seguro?",
    h1Destaque: "É, se o link leva para a loja",
    resposta:
      "Um grupo de ofertas sério só manda link que abre a página da loja oficial e nunca pede Pix, dados pessoais ou código do WhatsApp. Qualquer coisa fora disso é sinal de golpe.",
    intro:
      "No grupo, a compra não acontece com a gente: o link abre a loja, e é lá que você paga, recebe e troca. Por isso o risco não está no grupo em si, e sim em link falso, em pedido de pagamento fora da loja e em mensagem no privado em nome do grupo.",
    numeros: [
      { rotulo: "Lojas aceitas no link curto", valor: "4" },
      { rotulo: "Mensagens no privado", valor: "0" },
    ],
    tabela: {
      eyebrow: "Sinais de golpe",
      titulo: "O que é sinal de golpe e como fazemos aqui",
      legenda: "Regras do Tem Descontos em 16/10/2026. O link curto (temdescontos.com.br/...) só redireciona para as lojas da lista, mesmo que alguém tente cadastrar outro endereço.",
      colunas: ["Sinal de golpe", "Por que é golpe", "No Tem Descontos"],
      linhas: [
        ["Link que não abre a loja", "Página copiada para roubar cartão ou senha.", "Todo link termina na Amazon, no Mercado Livre, na Shopee ou na Magalu. Link da Amazon vai direto, sem encurtar."],
        ["Pedido de Pix ou depósito", "Loja de verdade cobra no próprio site.", "Nunca pedimos pagamento. Você paga na loja."],
        ["Pedido de código do WhatsApp", "Com o código, o golpista toma a sua conta.", "Nunca pedimos código, senha ou dado pessoal."],
        ["Mensagem no privado", "Golpista usa nome e foto do grupo para parecer oficial.", "As ofertas saem só no grupo."],
        ["Preço impossível com pressa", "\"Só nos próximos 5 minutos\" é para você não conferir.", "A chamada do post não pode ter urgência que não venha da loja."],
      ],
    },
    etapasTitulo: "Antes de clicar, 3 conferências",
    etapas: [
      { nome: "Veja o endereço que abriu", desc: "Na barra do navegador tem que aparecer o domínio da loja. Se aparecer outro, feche sem digitar nada." },
      { nome: "Pague só no site da loja", desc: "Cartão, Pix e boleto sempre dentro da Amazon, do Mercado Livre, da Shopee ou da Magalu." },
      { nome: "Ignore o privado", desc: "Oferta que chega no privado em nome de grupo, com pedido de dados ou código, é para bloquear e denunciar." },
    ],
    faq: [
      {
        q: "Vocês têm acesso aos meus dados?",
        a: "Não. A compra é feita na loja, com o seu login de lá. Nós não vemos nome, endereço nem cartão de quem compra.",
      },
      {
        q: "Por que o link às vezes é temdescontos.com.br?",
        a: "É o nosso encurtador, que deixa o post mais limpo e conta os cliques. Ele só redireciona para as lojas da lista e não guarda dado de quem clica além da contagem.",
      },
      {
        q: "Os outros membros veem o meu número?",
        a: "Em grupo de WhatsApp, os participantes podem ver o número uns dos outros. Se isso incomoda, ajuste a privacidade do seu WhatsApp ou silencie o grupo; nós não exportamos nem usamos os números do grupo.",
      },
      {
        q: "Recebi oferta no privado em nome de vocês. E agora?",
        a: "Não clique, não pague e não passe código. Bloqueie e denuncie o contato no próprio WhatsApp. Nós não mandamos ofertas no privado.",
      },
    ],
    fontes: [],
  },
  {
    slug: "cupom-da-amazon-como-usar",
    title: "Cupom da Amazon: como usar cada tipo | Tem Descontos",
    description:
      "Cupom de marcar na página, cupom com código na finalização e cupom de primeira compra no app: como cada um aparece na Amazon e como usar sem perder o desconto.",
    h1: "Como usar cupom da Amazon?",
    h1Destaque: "Depende do tipo de cupom",
    resposta:
      "Na Amazon há o cupom de marcar na própria página do produto e o cupom com código, digitado na finalização da compra. Alguns valem só na primeira compra ou só pelo app.",
    intro:
      "O cupom aparece logo abaixo do preço, na página do produto. O texto diz o tipo: \"Aplicar cupom\" (marcar e pronto) ou \"Insira o código\" (digitar no pagamento). O que muda o preço de verdade é o desconto aparecer no resumo do pedido antes de você confirmar.",
    numeros: [
      { rotulo: "Tipos de cupom", valor: "3" },
      { rotulo: "Onde conferir", valor: "Carrinho" },
    ],
    tabela: {
      eyebrow: "Tipos de cupom",
      titulo: "Os cupons que aparecem na página da Amazon",
      legenda: "Tipos conferidos pelo Tem Descontos na página do produto em 16/10/2026. O exemplo de primeira compra é o que estava na página naquele dia; cupom muda e acaba.",
      colunas: ["Tipo", "Como aparece na página", "Como usar"],
      linhas: [
        ["Cupom de marcar", "Uma caixa \"Aplicar cupom\" com o desconto em % ou em reais, abaixo do preço.", "Marque a caixa antes de pôr no carrinho. O desconto aparece no resumo do pedido."],
        ["Cupom com código", "\"Insira o código X na finalização da compra\".", "Digite o código no campo de cupom ou vale-presente, na tela de pagamento."],
        ["Primeira compra ou app", "Ex.: \"R$20 off. Insira o código COMPRANOAPP. Válido na sua primeira compra na Amazon, pelo App\" (16/10/2026).", "Só vale se for a sua primeira compra e pelo aplicativo. Fora disso, o preço é o sem cupom."],
      ],
    },
    etapasTitulo: "Para não perder o cupom",
    etapas: [
      { nome: "Leia a regra do cupom", desc: "Primeira compra, app, valor mínimo e validade ficam no texto do cupom, na página do produto." },
      { nome: "Aplique antes de pagar", desc: "Cupom de marcar: marque antes de ir para o carrinho. Cupom com código: digite na tela de pagamento." },
      { nome: "Confira o resumo do pedido", desc: "O desconto tem que aparecer antes de você confirmar. Se não aparecer, o cupom não está valendo." },
    ],
    faq: [
      {
        q: "O cupom que vem no post do grupo já está no preço?",
        a: "Só quando qualquer pessoa pode usar. Cupom de marcar entra como dica (\"marque o cupom na página\"); cupom de primeira compra ou só no app vai como aviso, e o preço do post é o sem cupom.",
      },
      {
        q: "Posso usar dois cupons no mesmo produto?",
        a: "Depende das regras de cada cupom, que a Amazon define. Na dúvida, aplique os dois e veja no resumo do pedido quais descontos ficaram.",
      },
      {
        q: "O cupom sumiu da página. A oferta acabou?",
        a: "O cupom acabou ou atingiu o limite de usos, mas o produto pode continuar com o preço sem cupom. Confira o preço final antes de comprar.",
      },
    ],
    fontes: [],
  },
];

export function paginaServico(slug: string): PaginaServico | undefined {
  return PAGINAS_SERVICO.find((p) => p.slug === slug);
}
