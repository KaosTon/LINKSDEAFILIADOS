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

/** Temas do blog (como as categorias da Virtus): agrupam a lista do /blog e dao o rotulo do post.
 *  Pagina propria de categoria so a partir de 3 posts no tema (METODO §2.3). */
export const CATEGORIAS = {
  "ofertas-e-cupons": { nome: "Ofertas e cupons", desc: "Como aproveitar promoção, cupom e data de desconto sem cair em armadilha." },
  "garantias-das-lojas": { nome: "Garantias das lojas", desc: "O que Amazon, Mercado Livre e Shopee fazem quando a compra dá errado." },
  "seus-direitos": { nome: "Seus direitos", desc: "O que a lei garante em compra online: devolução, defeito e prazo." },
  "pagamento-e-impostos": { nome: "Pagamento e impostos", desc: "Pix, cartão e imposto de compra internacional, com a conta feita." },
} as const;

export type Categoria = keyof typeof CATEGORIAS;

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
  /** tema do post (CATEGORIAS) */
  categoria: Categoria;
  /** capa 1200x675 em public/blog/{slug}.webp (imagem propria, casada com o tema; trava check-paginas) */
  imagem: string;
  faq: { q: string; a: string }[];
  fontes: Fonte[];
  conteudo: string;
};

export const POSTS: Post[] = [
{
    slug: "black-friday-2026-quando-e",
    titulo: "Black Friday 2026: quando é e como se preparar",
    metaTitle: "Black Friday 2026: quando é e como se preparar",
    metaDescription: "A Black Friday 2026 cai em 27 de novembro. Veja como montar a lista, conferir histórico de preço, fugir de site falso e o que o CDC garante na compra online.",
    resumo: "A Black Friday 2026 cai na sexta-feira, 27 de novembro. Veja o que fazer antes, durante e depois para comprar com desconto de verdade e sem cair em golpe.",
    resumoRapido: [
      "A Black Friday 2026 é na sexta-feira, 27 de novembro (última sexta do mês).",
      "Monte a lista e anote o preço de cada item desde já: é o histórico que mostra se o desconto é real.",
      "Confira o endereço do site e a lista \"Evite estes sites\" do Procon-SP antes de pagar.",
      "Comprou online e se arrependeu? O CDC (art. 49) dá 7 dias a partir do recebimento para desistir."
    ],
    dataPublicacao: "2026-10-18",
    revisadoEm: "outubro de 2026",
    dataRevisao: "2026-10-19",
    tags: ["black friday 2026", "quando é a black friday", "como se preparar para a black friday", "black friday golpe site falso"],
    servico: "como-saber-se-a-promocao-e-verdadeira",
    categoria: "ofertas-e-cupons",
    imagem: "/blog/black-friday-2026-quando-e.webp",
    faq: [
      { q: "Quando é a Black Friday 2026?", a: "A Black Friday 2026 é na sexta-feira, 27 de novembro de 2026, a última sexta de novembro. Muitas lojas começam ofertas antes e esticam até o fim de semana, mas isso varia de loja para loja." },
      { q: "Como saber se o desconto da Black Friday é real?", a: "Compare o preço do dia com o histórico do mesmo produto nas semanas anteriores. A Senacon orienta pesquisar o histórico porque há lojas que sobem o preço dias antes para o desconto parecer maior." },
      { q: "Posso devolver o que comprei na Black Friday?", a: "Sim, se a compra foi pela internet: o art. 49 do Código de Defesa do Consumidor dá 7 dias, contados do recebimento, para desistir e receber de volta o que pagou, atualizado." },
      { q: "Como saber se um site de Black Friday é falso?", a: "Confira se o endereço é exatamente o da loja oficial e consulte a lista \"Evite estes sites\" do Procon-SP. A Senacon também recomenda verificar CNPJ ativo e canais de atendimento." },
    ],
    fontes: [
      { nome: "Senacon, Ministério da Justiça: Black Friday 2025, orientações para evitar golpes (2025)", url: "https://www.gov.br/mj/pt-br/assuntos/noticias/black-friday-2025-senacon-orienta-consumidores-a-evitar-golpes-e-comprar-com-seguranca" },
      { nome: "Senacon: cartilha Black Friday, boas compras exigem atenção (edição 2025)", url: "https://www.gov.br/mj/pt-br/assuntos/arquivos-imprensa/senacon/cartilha-black-friday-senacon-2025" },
      { nome: "Procon-SP: Black Friday, orientações", url: "https://www.procon.sp.gov.br/black-friday-procon-sp-orienta/" },
      { nome: "Procon-SP: lista Evite estes sites", url: "https://sistemas.procon.sp.gov.br/evitesite/list/evitesites.php" },
      { nome: "Código de Defesa do Consumidor, Lei 8.078/1990, texto compilado (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" },
      { nome: "Decreto 7.962/2013, comércio eletrônico (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm" },
    ],
    conteudo: `<p>Na Black Friday o número de ofertas sobe, e com ele o de ofertas ruins: preço que sobe dias antes para o desconto parecer maior, site copiado de loja famosa, cupom que não funciona na hora de pagar. <strong>Em 2026 a data é sexta-feira, 27 de novembro, e quem compra bem é quem anotou o preço semanas antes.</strong> Este guia mostra o que fazer até lá, como reconhecer o site falso e o que a lei garante se a compra der errado.</p>

<h2>Quando é a Black Friday 2026?</h2>
<p>A Black Friday 2026 é na <strong>sexta-feira, 27 de novembro de 2026</strong>. A data segue a tradição americana: é a sexta depois do Dia de Ação de Graças (quarta quinta-feira de novembro), que em 2026 cai no dia 26. Na prática, também é a última sexta do mês. Conferimos no calendário.</p>
<p>Não existe lei que fixe a data, é uma convenção do comércio. Por isso cada loja decide quando começa e quando termina. Algumas fazem "esquenta" dias antes, outras esticam até o domingo ou a segunda seguinte. Não conte com isso como regra: o que vale é o que a loja anuncia para aquele produto.</p>

<h2>O que fazer agora, antes da Black Friday?</h2>
<p>O trabalho que mais economiza dinheiro acontece antes do dia 27, não no dia. Quem chega na sexta sem saber quanto as coisas custavam não tem como avaliar desconto nenhum.</p>
<h3>1. Faça a lista do que você realmente precisa</h3>
<p>Escreva o produto, o modelo exato e a quantidade. "Fone bluetooth" é vago demais; "modelo X, cor preta, 1 unidade" é comparável. Isso evita a compra por impulso, que é a que mais se arrepende depois, e evita cair em anúncio que troca o modelo ou a quantidade sem você perceber.</p>
<h3>2. Anote o preço de hoje, com data</h3>
<p>Pegue cada item da lista e anote o preço em cada loja onde ele aparece, com a data. Repita uma vez por semana até a Black Friday. Isso é o seu histórico de preço. A Senacon, órgão do Ministério da Justiça, orienta exatamente isso na cartilha de Black Friday de 2025: pesquisar o histórico de preços para confirmar se o desconto é real, porque há lojas que aumentam o preço dias antes para a promoção parecer maior.</p>
<p>Como engenheiro, eu desconfio de número sem conta. Um "50% OFF" só significa alguma coisa quando você sabe de qual preço partiu. O seu caderninho (ou planilha, ou print com data) é essa conta.</p>
<h3>3. Cuidado com o "De" inflado</h3>
<p>O preço riscado nem sempre é o preço que o produto tinha de verdade. Explicamos como checar isso passo a passo no guia <a href="/guias/como-saber-se-a-promocao-e-verdadeira">como saber se a promoção é verdadeira</a>.</p>
<h3>4. Deixe a conta e o pagamento prontos</h3>
<p>Faça login nas lojas onde pretende comprar, confira o endereço de entrega e veja se o cartão está com limite. Na hora da oferta, quanto menos campos você precisar preencher, menor a chance de clicar em algo errado com pressa. Se estiver em dúvida entre pagar no Pix ou no cartão, veja o que muda em <a href="/blog/pix-ou-cartao-compra-online">Pix ou cartão na compra online</a>.</p>
<h3>5. Saiba como funciona cada cupom</h3>
<p>Cupom tem regra: valor mínimo, categoria, limite por conta. Se a sua lista tem item da Amazon, leia antes o guia de <a href="/guias/cupom-da-amazon-como-usar">cupom da Amazon</a>. Para Shopee e Mercado Livre, temos o post <a href="/blog/cupom-shopee-e-mercado-livre-como-usar">cupom da Shopee e do Mercado Livre</a>.</p>

<h2>Como se proteger de site falso na Black Friday?</h2>
<p>Confira o endereço do site antes de pagar e desconfie de preço muito abaixo do que você anotou. Golpista sabe que novembro é o mês em que todo mundo procura promoção.</p>
<ul>
<li><strong>Endereço exato.</strong> O Procon-SP alerta para sites que copiam o nome de lojas conhecidas, mas com o final do endereço diferente. Uma letra trocada já é suficiente para ser outro site.</li>
<li><strong>Lista do Procon-SP.</strong> O Procon-SP mantém a lista "Evite estes sites", com endereços que receberam reclamação e não responderam ou não foram encontrados. Vale consultar antes de comprar em loja que você não conhece.</li>
<li><strong>CNPJ e atendimento.</strong> A Senacon recomenda conferir se o CNPJ está ativo, ler avaliações e checar os canais de atendimento, e desconfiar de loja sem endereço físico.</li>
<li><strong>Forma de pagamento.</strong> A Senacon pede atenção a sites que só aceitam Pix ou boleto, porque esses meios dificultam o reembolso em caso de fraude.</li>
<li><strong>Prints.</strong> Guarde print da oferta, da página do produto e do pagamento. Se der problema, é a sua prova.</li>
</ul>
<p>Golpe também chega por mensagem: link encurtado, "cupom exclusivo" no privado, pedido de código. Resumimos o que é sinal de alerta em grupo de ofertas no guia <a href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro">grupo de ofertas no WhatsApp é seguro?</a></p>

<h2>O que conferimos antes de postar uma oferta?</h2>
<p>Na Black Friday o volume de ofertas sobe, e com ele o de ofertas ruins. No Tem Descontos, conferimos cada uma antes de ir para o grupo. Estas são as regras que seguimos hoje:</p>
<table>
<thead><tr><th>O que conferimos</th><th>O que acontece se falhar</th></tr></thead>
<tbody>
<tr><td>Preço na própria loja (página da Amazon, API oficial de afiliados da Shopee, API do Mercado Livre para produto de catálogo)</td><td>Se o preço anunciado está mais de 3% abaixo do preço da loja e nenhum cupom explica, a oferta é descartada</td></tr>
<tr><td>Se o link leva ao mesmo produto do texto (nome e quantidade, como kit com 3 contra 1 unidade)</td><td>Produto diferente do anunciado: descartada</td></tr>
<tr><td>Preço "De" com mais de 70% de desconto</td><td>Se a loja não confirma, o "De" sai do post</td></tr>
<tr><td>Shopee: nota e vendas do produto</td><td>Só posta com nota 4,5 ou mais e 50 vendas ou mais; acima de R$ 1.000, só de Loja Oficial ou loja indicada</td></tr>
<tr><td>Mercado Livre que não dá para conferir</td><td>Só sai se a oferta tem até 30 minutos</td></tr>
<tr><td>Destino do link</td><td>Sempre a loja oficial, nunca site intermediário</td></tr>
</tbody>
</table>
<p>E uma regra que vale o ano todo: o grupo não pede dado pessoal, Pix ou código no privado. Se alguém fizer isso usando o nosso nome, não é a gente. As ofertas saem das 8h às 22h. Mais sobre quem somos em <a href="/sobre">sobre o Tem Descontos</a>.</p>

<h2>Quais são os seus direitos na compra da Black Friday?</h2>
<p>São os mesmos de qualquer dia do ano: Black Friday não suspende o Código de Defesa do Consumidor (Lei 8.078/1990).</p>
<h3>Arrependimento em 7 dias</h3>
<p>Pelo art. 49 do CDC, quem compra fora do estabelecimento comercial (internet, telefone) pode desistir em até 7 dias, contados da assinatura ou do recebimento do produto, e recebe de volta os valores pagos, atualizados. O Decreto 7.962/2013, que trata do comércio eletrônico, obriga a loja a informar de forma clara como exercer esse direito e permite que você desista pela mesma ferramenta usada na compra. Explicamos prazo, frete e o caminho em cada loja em <a href="/blog/direito-de-arrependimento-compra-online">direito de arrependimento na compra online</a>.</p>
<h3>Produto com defeito</h3>
<p>Para produto durável (eletrônico, eletrodoméstico), o art. 26 do CDC dá 90 dias para reclamar de vício aparente; para não durável, 30 dias. O passo a passo está em <a href="/blog/produto-com-defeito-comprado-online">produto com defeito comprado online</a>.</p>
<h3>Onde reclamar</h3>
<p>Se a loja não resolver, a Senacon indica o consumidor.gov.br ou o Procon do seu estado. Ter os prints da oferta faz diferença nessa hora.</p>

<h2>Checklist para o dia 27 de novembro</h2>
<ol>
<li>Lista pronta, com modelo e quantidade de cada item.</li>
<li>Histórico de preço anotado, com data, de pelo menos algumas semanas.</li>
<li>Login feito, endereço e cartão conferidos.</li>
<li>Regras dos cupons lidas antes, não na hora.</li>
<li>Endereço do site conferido letra por letra antes de pagar.</li>
<li>Print da oferta e do pagamento guardados.</li>
<li>Prazo de 7 dias anotado a partir do dia em que o pacote chegar.</li>
</ol>
<p>Se o preço do dia não for melhor do que o que você anotou, não é promoção para você, mesmo com etiqueta de Black Friday. Esperar também é uma opção.</p>`,
  },
  {
    slug: "direito-de-arrependimento-compra-online",
    titulo: "Direito de arrependimento: como devolver compra online em 7 dias",
    metaTitle: "Direito de arrependimento: devolver compra online em 7 dias",
    metaDescription: "O CDC dá 7 dias, contados do recebimento, para desistir da compra online e receber tudo de volta. Veja quem paga o frete e como pedir em cada grande loja.",
    resumo: "Comprou pela internet e se arrependeu? O art. 49 do CDC dá 7 dias a partir do recebimento para desistir. Veja quem paga o frete e como pedir na Amazon, Mercado Livre, Shopee e Magalu.",
    resumoRapido: [
      "Prazo: 7 dias a partir do recebimento do produto (art. 49 do CDC), sem precisar dar motivo.",
      "Você recebe de volta os valores pagos a qualquer título, atualizados, o que inclui o frete da compra.",
      "O Procon-SP orienta que a loja não pode cobrar frete de devolução no arrependimento.",
      "Peça pelo mesmo canal da compra (Decreto 7.962/2013) e guarde o protocolo."
    ],
    dataPublicacao: "2026-10-18",
    revisadoEm: "outubro de 2026",
    dataRevisao: "2026-10-19",
    tags: ["direito de arrependimento", "devolver compra online", "prazo de 7 dias para devolução", "frete de devolução quem paga", "art. 49 cdc"],
    servico: "grupo-de-ofertas-no-whatsapp-e-seguro",
    categoria: "seus-direitos",
    imagem: "/blog/direito-de-arrependimento-compra-online.webp",
    faq: [
      { q: "O prazo de 7 dias para devolver conta da compra ou da entrega?", a: "Conta do recebimento do produto. O art. 49 do CDC diz \"a contar de sua assinatura ou do ato de recebimento do produto ou serviço\", e o Procon-SP orienta que são dias corridos." },
      { q: "Quem paga o frete da devolução por arrependimento?", a: "A loja. O Procon-SP orienta que o fornecedor não pode cobrar frete de devolução, e o art. 49 manda devolver os valores pagos a qualquer título, o que inclui o frete da compra." },
      { q: "Preciso explicar por que quero devolver?", a: "Não. O art. 49 do CDC não exige motivo: basta a compra ter sido feita fora da loja física, como pela internet, e o pedido ser feito dentro de 7 dias." },
      { q: "Posso devolver se já abri a embalagem?", a: "Pode. O Procon-SP orienta que a loja não pode exigir embalagem não violada para aceitar o arrependimento; as lojas pedem o produto completo, com acessórios e manual." },
      { q: "Em quanto tempo o dinheiro volta?", a: "Varia com a forma de pagamento e a loja. O Decreto 7.962/2013 obriga a loja a avisar a operadora do cartão para não lançar a cobrança ou estornar o valor." },
    ],
    fontes: [
      { nome: "Código de Defesa do Consumidor, Lei 8.078/1990, art. 49, texto compilado (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" },
      { nome: "Decreto 7.962/2013, comércio eletrônico, art. 5º (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm" },
      { nome: "Procon-SP: Guia de Comércio Eletrônico (2024)", url: "https://www.procon.sp.gov.br/wp-content/uploads/2024/08/Guia_de_Comercio_Eletronico.pdf" },
      { nome: "Ministério da Justiça: consumidor tem direito ao arrependimento em compras on-line", url: "https://www.gov.br/mj/pt-br/assuntos/noticias/consumidor-tem-direito-ao-arrependimento-em-compras-on-line" },
      { nome: "Amazon.com.br: política de devolução (ajuda)", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7" },
      { nome: "Amazon.com.br: frete de devolução (ajuda)", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=GFLBEJCLHMVFEPA8" },
      { nome: "Mercado Livre: Compra Garantida", url: "https://www.mercadolivre.com.br/compra-garantida" },
      { nome: "Mercado Livre: como funciona a devolução (ajuda)", url: "https://www.mercadolivre.com.br/ajuda/devolucoes-expressas_3448" },
      { nome: "Shopee: como solicitar devolução/reembolso (central de ajuda)", url: "https://help.shopee.com.br/portal/4/article/133441" },
      { nome: "Shopee: devolução via Correios ou Agência Shopee (central de ajuda)", url: "https://help.shopee.com.br/portal/4/article/156247" },
      { nome: "Magalu: Me arrependi da compra. E agora? (atendimento)", url: "https://atendimento.magazineluiza.com.br/hc/pt-br/articles/360045957712-Me-arrependi-da-compra-E-agora" },
      { nome: "Magalu: prazo para devolver o produto nos Correios (atendimento)", url: "https://atendimento.magazineluiza.com.br/hc/pt-br/articles/34393198524301-Qual-o-prazo-para-devolver-meu-produto-nos-correios" },
    ],
    conteudo: `<p>O pacote chegou, você abriu e não era bem aquilo: a cor é outra, o tamanho não serve ou você simplesmente se arrependeu. <strong>Em compra pela internet, você pode desistir em até 7 dias corridos depois de receber, sem precisar dar motivo, e tem de volta tudo o que pagou, inclusive o frete.</strong> Não é favor da loja, é lei. Este guia mostra de quando contam os 7 dias, quem paga a devolução e o caminho em cada loja, com o artigo da lei ao lado para você conferir.</p>

<h2>O que é o direito de arrependimento?</h2>
<p>É o direito de desistir de uma compra feita fora da loja física, sem dar motivo, em até 7 dias. Ele está no art. 49 do Código de Defesa do Consumidor (Lei 8.078/1990), que continua vigente no texto compilado do Planalto: "O consumidor pode desistir do contrato, no prazo de 7 dias a contar de sua assinatura ou do ato de recebimento do produto ou serviço, sempre que a contratação de fornecimento de produtos e serviços ocorrer fora do estabelecimento comercial, especialmente por telefone ou a domicílio."</p>
<p>A lei é de 1990, quando não existia loja online, mas compra pela internet é justamente o caso típico de compra "fora do estabelecimento". Você não pegou o produto na mão antes de pagar, e a lei dá esse período para ver de perto e decidir.</p>
<p>Repare que o arrependimento não depende de defeito. O produto pode estar perfeito: você só não quer mais. Se o problema é defeito, a regra é outra, com outros prazos, e explicamos em <a href="/blog/produto-com-defeito-comprado-online">produto com defeito comprado online</a>.</p>

<h2>Os 7 dias contam a partir de quando?</h2>
<p>Do dia em que você recebe o produto. O art. 49 fala em "assinatura ou ato de recebimento"; na compra online, o que vale para produto físico é a entrega. O Procon-SP orienta que são <strong>dias corridos</strong>, ou seja, sábado, domingo e feriado contam.</p>
<p>Dica prática: quando o pacote chegar, anote a data (ou tire foto da tela de rastreio com "entregue"). Se a entrega atrasar e o pacote chegar só no dia 10, o seu prazo começa no dia 10, não no dia em que você pagou.</p>

<h2>O que você recebe de volta?</h2>
<p>Tudo o que pagou, atualizado. O parágrafo único do art. 49 diz que os valores "eventualmente pagos, a qualquer título, durante o prazo de reflexão, serão devolvidos, de imediato, monetariamente atualizados". "A qualquer título" quer dizer que não é só o preço do produto: o frete que você pagou na compra também entra.</p>
<p>O Decreto 7.962/2013, que regulamenta o comércio eletrônico, completa a regra no art. 5º:</p>
<ul>
<li>A loja precisa informar, de forma clara e ostensiva, como você exerce o arrependimento.</li>
<li>Você pode desistir <strong>pela mesma ferramenta usada para comprar</strong> (o site ou o app), sem prejuízo de outros meios.</li>
<li>O arrependimento cancela também os contratos acessórios, sem custo para você.</li>
<li>A loja deve avisar imediatamente o banco ou a administradora do cartão para que a cobrança não seja lançada na fatura ou, se já foi, para que o valor seja estornado.</li>
</ul>

<h2>Quem paga o frete de devolução?</h2>
<p>A loja. O Guia de Comércio Eletrônico do Procon-SP (2024) diz que, no arrependimento, o fornecedor não pode cobrar qualquer quantia a título de frete de devolução, nem exigir que a embalagem não tenha sido violada como condição para aceitar o pedido.</p>
<p>Isso não quer dizer que você pode devolver o produto de qualquer jeito. As lojas pedem o item completo, com acessórios e manual, e sem sinal de mau uso. Abrir a caixa para ver o produto é normal; usar até gastar é outra coisa.</p>

<h2>Como pedir a devolução em cada loja?</h2>
<p>Pelo app ou site da loja, na área do pedido. Abaixo, só o que a página oficial de ajuda de cada uma confirma. As regras mudam, então confira na tela do seu pedido antes de enviar o produto.</p>
<table>
<thead><tr><th>Loja</th><th>Prazo informado pela loja</th><th>Frete de devolução</th><th>Onde pedir</th></tr></thead>
<tbody>
<tr><td>Amazon</td><td>A maioria dos produtos físicos em até 30 dias após a entrega; vendedores parceiros devem aceitar devolução pedida em até 7 dias após a entrega (arrependimento)</td><td>Pedido enviado pela Amazon: envio pré-pago pelos Correios. Vendedor parceiro: paga o frete na devolução em até 7 dias após a entrega</td><td>Pela área de pedidos da conta, seguindo a página de política de devolução</td></tr>
<tr><td>Mercado Livre</td><td>Pela Compra Garantida, 30 dias corridos a partir da entrega para arrependimento ou produto diferente, incompleto ou com defeito; 7 dias para usado ou recondicionado</td><td>Gratuita no arrependimento, segundo a ajuda do Mercado Livre</td><td>Minhas compras, escolher a compra e "Devolver produto"</td></tr>
<tr><td>Shopee</td><td>7 dias corridos a partir do recebimento, com base no art. 49 do CDC</td><td>Gratuita na postagem pelos Correios ou em Agência Shopee</td><td>Pelo app da Shopee, no pedido; depois de gerar o código, você tem 7 dias para postar</td></tr>
<tr><td>Magalu</td><td>7 dias corridos após receber o produto, com base no art. 49 do CDC</td><td>A página de ajuda não detalha; pela orientação do Procon-SP, a loja não pode cobrar</td><td>Pedidos, depois "Trocar ou devolver produto"; o código de postagem vale 6 dias corridos</td></tr>
</tbody>
</table>
<p>Dois detalhes que pegam muita gente. Na Shopee, a central de ajuda diz que o pedido precisa ser feito pelo app, mesmo que você já tenha combinado algo com o vendedor no chat; e o produto precisa estar sem uso, na embalagem original e com todas as peças. No Magalu, o código de postagem vale 6 dias corridos e, segundo a ajuda, depois disso não dá para gerar outro: poste logo.</p>
<p>Prazo maior que 7 dias, como os 30 dias da Amazon e do Mercado Livre, é benefício da loja, não da lei. É bom, mas não conte com ele sem conferir: o mínimo garantido em lei para qualquer loja que vende online no Brasil é o de 7 dias. Para entender as proteções próprias de cada plataforma, veja <a href="/blog/compra-garantida-mercado-livre">Compra Garantida do Mercado Livre</a> e <a href="/blog/garantia-de-a-a-z-amazon">Garantia de A a Z da Amazon</a>.</p>

<h2>Passo a passo para devolver sem dor de cabeça</h2>
<ol>
<li><strong>Anote a data de entrega</strong> e conte 7 dias corridos.</li>
<li><strong>Peça pelo mesmo canal da compra</strong> (app ou site), como permite o Decreto 7.962/2013. Escolha o motivo "arrependimento" ou "não quero mais", não "defeito", se o produto está bom.</li>
<li><strong>Guarde o protocolo</strong> ou print da tela de solicitação, com data e hora. Se o prazo for discutido depois, é o que prova que você pediu a tempo.</li>
<li><strong>Embale o produto completo</strong>, com acessórios, manual e nota.</li>
<li><strong>Poste dentro do prazo do código</strong> (Shopee: 7 dias depois de gerar; Magalu: 6 dias corridos) e guarde o comprovante de postagem.</li>
<li><strong>Acompanhe o estorno.</strong> Se a cobrança continuar na fatura, lembre a loja de que ela deve avisar a operadora do cartão (art. 5º do Decreto 7.962/2013).</li>
</ol>

<h2>E se a loja recusar?</h2>
<p>Responda por escrito citando o art. 49 do CDC e o art. 5º do Decreto 7.962/2013, e anexe o print com a data do pedido. Se não resolver, registre reclamação no consumidor.gov.br (se a empresa participa da plataforma) ou no Procon do seu estado.</p>
<p>Um cuidado: o direito de arrependimento só ajuda se você consegue identificar e acionar a loja. Se o "vendedor" pediu pagamento por fora, em Pix para pessoa física ou por link mandado no privado, o problema é maior que devolução. Por isso, no Tem Descontos o link vai sempre para a loja oficial e o grupo nunca pede Pix ou dado no privado; explicamos os sinais de golpe em <a href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro">grupo de ofertas no WhatsApp é seguro?</a></p>
<p>E se você vai comprar muito em novembro, anote este post junto com o guia da <a href="/blog/black-friday-2026-quando-e">Black Friday 2026</a>: os 7 dias valem igualzinho para compra feita em promoção.</p>`,
  },
  {
    slug: "produto-com-defeito-comprado-online",
    titulo: "Produto com defeito comprado online: o que fazer",
    metaTitle: "Produto com defeito comprado online: o que fazer",
    metaDescription: "Pelo CDC, a loja tem 30 dias para consertar produto com defeito, e você tem 30 ou 90 dias para reclamar. Veja o passo a passo e quando pedir troca ou dinheiro.",
    resumo: "Chegou com defeito ou quebrou pouco depois? Veja os prazos do CDC para reclamar, o que a loja é obrigada a fazer e o passo a passo até o consumidor.gov.br.",
    resumoRapido: [
      "Você tem 30 dias (produto não durável) ou 90 dias (durável) para reclamar do defeito (art. 26 do CDC).",
      "A loja e o fabricante respondem juntos e têm até 30 dias para resolver (art. 18).",
      "Se não resolverem, você escolhe: troca, dinheiro de volta atualizado ou abatimento no preço.",
      "Defeito escondido: o prazo começa quando o defeito aparece, não na entrega."
    ],
    dataPublicacao: "2026-10-18",
    revisadoEm: "outubro de 2026",
    dataRevisao: "2026-10-19",
    tags: ["produto com defeito comprado online", "prazo para reclamar de defeito", "garantia legal", "garantia legal e contratual", "troca de produto com defeito"],
    servico: "grupo-de-ofertas-no-whatsapp-e-seguro",
    categoria: "seus-direitos",
    imagem: "/blog/produto-com-defeito-comprado-online.webp",
    faq: [
      { q: "Qual o prazo para reclamar de produto com defeito?", a: "Pelo art. 26 do CDC, 30 dias para produto não durável e 90 dias para produto durável, contados da entrega. Se o defeito é oculto, o prazo começa quando ele aparece." },
      { q: "A loja pode me mandar falar com o fabricante?", a: "Pode sugerir, mas não pode se recusar a atender: o art. 18 do CDC diz que os fornecedores respondem solidariamente pelo vício do produto. Você pode cobrar a loja, o fabricante ou os dois." },
      { q: "Quando posso pedir o dinheiro de volta?", a: "Se o defeito não for resolvido em até 30 dias, o art. 18 permite escolher entre troca, devolução do valor atualizado ou abatimento. Em produto essencial, pode pedir isso de imediato." },
      { q: "A garantia do fabricante substitui a garantia da lei?", a: "Não. O art. 50 do CDC diz que a garantia contratual é complementar à legal. A garantia de 30 ou 90 dias da lei existe mesmo sem termo de garantia." },
    ],
    fontes: [
      { nome: "Código de Defesa do Consumidor, Lei 8.078/1990, arts. 18, 26 e 50, texto compilado (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" },
      { nome: "Consumidor.gov.br: como funciona", url: "https://www.consumidor.gov.br/pages/conteudo/publico/1" },
      { nome: "Ministério da Justiça: como registrar uma reclamação no Consumidor.gov.br", url: "https://www.gov.br/mj/pt-br/assuntos/noticias-1/consumidor-gov-br-saiba-como-registrar-uma-reclamacao-pela-plataforma" },
    ],
    conteudo: `<h2>O que fazer primeiro quando o produto chega com defeito?</h2>
<p>Registre o defeito e avise a loja por escrito, pelo app ou site onde comprou, o quanto antes. Foto, vídeo curto mostrando o problema e print da página do pedido são o seu material de prova. Não jogue fora a caixa nem a nota.</p>
<p>Antes de qualquer coisa, olhe a data de entrega. Se ainda está dentro de 7 dias, você tem um caminho mais rápido: o direito de arrependimento do art. 49 do CDC, que permite devolver sem discutir defeito. Explicamos em <a href="/blog/direito-de-arrependimento-compra-online">direito de arrependimento na compra online</a>. Passou dos 7 dias, ou você quer o produto consertado ou trocado, vale o que está abaixo.</p>

<h2>Qual é o prazo para reclamar de defeito?</h2>
<p>30 dias para produto não durável e 90 dias para produto durável. É o art. 26 do Código de Defesa do Consumidor (Lei 8.078/1990), vigente no texto compilado do Planalto. A lei chama esses prazos de garantia legal: eles existem mesmo que a loja não entregue termo de garantia nenhum.</p>
<table>
<thead><tr><th>Situação</th><th>Prazo para reclamar</th><th>Começa a contar</th><th>Base</th></tr></thead>
<tbody>
<tr><td>Produto não durável (alimento, cosmético, item de consumo rápido) com defeito aparente</td><td>30 dias</td><td>Na entrega efetiva do produto</td><td>CDC, art. 26, I e § 1º</td></tr>
<tr><td>Produto durável (eletrônico, eletrodoméstico, móvel) com defeito aparente</td><td>90 dias</td><td>Na entrega efetiva do produto</td><td>CDC, art. 26, II e § 1º</td></tr>
<tr><td>Defeito oculto (só aparece com o uso)</td><td>30 ou 90 dias, conforme o tipo de produto</td><td>No momento em que o defeito ficar evidenciado</td><td>CDC, art. 26, § 3º</td></tr>
<tr><td>Loja ou fabricante tentando consertar</td><td>Até 30 dias para resolver</td><td>A partir da reclamação ao fornecedor ou da entrega na assistência técnica (guarde a ordem de serviço)</td><td>CDC, art. 18, § 1º</td></tr>
</tbody>
</table>
<p>Um detalhe que protege você: pelo art. 26, § 2º, I, a reclamação feita ao fornecedor, comprovada, impede que o prazo acabe até a resposta negativa dele, que precisa ser clara. Por isso a reclamação por escrito, com protocolo, é tão importante. Se você só ligou e não tem registro, fica mais difícil provar que reclamou a tempo.</p>

<h2>A loja pode dizer que o problema é do fabricante?</h2>
<p>Pode dizer, mas não pode se livrar de você. O art. 18 do CDC diz que os fornecedores de produtos duráveis ou não duráveis "respondem solidariamente pelos vícios de qualidade ou quantidade". Na prática: loja e fabricante respondem juntos, e você escolhe de quem cobrar.</p>
<p>Em marketplace (Amazon, Mercado Livre, Shopee, Magalu) o vendedor muitas vezes é uma loja parceira. Cada plataforma tem um programa próprio de proteção ao comprador, além da lei. Veja como funcionam em <a href="/blog/garantia-de-a-a-z-amazon">Garantia de A a Z da Amazon</a> e <a href="/blog/compra-garantida-mercado-livre">Compra Garantida do Mercado Livre</a>. Na Shopee, ajuda muito comprar de vendedor bem avaliado; explicamos como checar em <a href="/blog/como-saber-se-loja-da-shopee-e-confiavel">como saber se a loja da Shopee é confiável</a>.</p>

<h2>O que a loja é obrigada a fazer?</h2>
<p>Resolver o defeito em até 30 dias. Se não resolver nesse prazo, a escolha passa a ser sua. O art. 18, § 1º, do CDC dá três opções, "alternativamente e à sua escolha":</p>
<ol>
<li><strong>Troca</strong> por outro produto da mesma espécie, em perfeitas condições de uso.</li>
<li><strong>Dinheiro de volta</strong>, de forma imediata, com correção monetária, sem prejuízo de eventuais perdas e danos.</li>
<li><strong>Abatimento proporcional</strong> do preço, se você prefere ficar com o produto.</li>
</ol>
<p>Quem escolhe é você, não a loja. Se a loja oferece só vale-compra e você quer o dinheiro, depois dos 30 dias sem solução você pode exigir o dinheiro.</p>
<h3>Quando não precisa esperar os 30 dias?</h3>
<p>O § 3º do art. 18 permite pedir troca, dinheiro ou abatimento de imediato quando consertar as partes com defeito puder comprometer a qualidade ou as características do produto, diminuir o valor dele, ou quando se tratar de produto essencial.</p>
<h3>A loja pode mudar o prazo de 30 dias?</h3>
<p>Só por acordo e dentro de limites. O § 2º do art. 18 permite que as partes combinem um prazo diferente, mas nunca menor que 7 nem maior que 180 dias. Em contrato de adesão (aquele que você só aceita), essa cláusula tem que ser combinada em separado, com sua manifestação expressa.</p>

<h2>Garantia legal e garantia contratual: qual a diferença?</h2>
<p>A garantia legal é a da lei (30 ou 90 dias, art. 26) e vale sempre. A garantia contratual é a que a loja ou o fabricante oferece por conta própria, como "1 ano de garantia do fabricante". O art. 50 do CDC diz que a garantia contratual é complementar à legal e é dada por escrito. Ou seja, ela não substitui a da lei.</p>
<p>O parágrafo único do art. 50 manda que o termo de garantia explique em que ela consiste, a forma, o prazo e o lugar para usar, e o que fica por conta do consumidor, e que seja entregue preenchido no ato da compra, com manual de instrução. Guarde o termo e a nota juntos. Garantia estendida vendida à parte é outro produto, com regras próprias: leia o contrato antes de pagar.</p>

<h2>Passo a passo: do defeito à solução</h2>
<ol>
<li><strong>Prove o defeito.</strong> Foto, vídeo e descrição curta do que acontece e desde quando.</li>
<li><strong>Confira os prazos.</strong> Até 7 dias da entrega: arrependimento. Até 30 ou 90 dias: garantia legal. Dentro do termo de garantia: garantia contratual.</li>
<li><strong>Reclame por escrito no canal da loja</strong> (app ou site, na área do pedido) e guarde o protocolo. É ele que segura o prazo do art. 26, § 2º, I.</li>
<li><strong>Siga as instruções de envio</strong> da loja ou da assistência técnica e guarde o comprovante de postagem ou entrega.</li>
<li><strong>Conte 30 dias</strong> a partir da reclamação ou da entrega na assistência (guarde a ordem de serviço). Sem solução, escolha troca, dinheiro ou abatimento (art. 18, § 1º) e peça por escrito.</li>
<li><strong>Sem resposta, vá ao consumidor.gov.br</strong> ou ao Procon do seu estado.</li>
</ol>

<h2>Como funciona o consumidor.gov.br?</h2>
<p>É a plataforma pública do governo federal em que você reclama direto com a empresa. Segundo a página oficial, a empresa tem até 10 dias para analisar e responder, contados do registro. Depois da resposta, você tem até 20 dias para comentar, dizer se ficou resolvido ou não e avaliar o atendimento.</p>
<ul>
<li>Precisa de conta gov.br nível prata ou ouro.</li>
<li>Só recebe reclamação de empresa participante: procure o nome da loja antes de começar.</li>
<li>Anexe nota, protocolos, fotos e prints. Quanto mais organizado, mais fácil a análise.</li>
</ul>
<p>Se a empresa não está na plataforma, o caminho é o Procon do seu estado.</p>

<h2>Como diminuir a chance de dor de cabeça?</h2>
<p>Comprar de loja oficial ou vendedor bem avaliado reduz o risco, mas não zera. No Tem Descontos, só postamos produto da Shopee com nota 4,5 ou mais e 50 vendas ou mais, e produto de R$ 1.000 para cima só de Loja Oficial ou loja indicada. Também conferimos se o link leva ao mesmo produto do texto, inclusive a quantidade. Isso ajuda a evitar o "veio diferente do anunciado", mas defeito pode acontecer em qualquer loja, e aí valem os prazos acima. Veja como o grupo funciona em <a href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro">grupo de ofertas no WhatsApp é seguro?</a> e em <a href="/sobre">sobre o Tem Descontos</a>.</p>`,
  },
{
    slug: "taxa-de-importacao-compra-internacional",
    titulo: "Taxa de importação em compra internacional: quanto paga e como evitar surpresa",
    metaTitle: "Taxa de importação 2026: quanto paga na compra internacional",
    metaDescription: "Desde 12/05/2026, compra de até US$ 50 no Remessa Conforme tem imposto federal zero, mas o ICMS de 17% a 20% continua. Veja a conta e como evitar surpresa.",
    resumo: "O que mudou na taxa das compras internacionais em 2026, quanto de imposto federal e de ICMS entra na conta e como conferir o valor antes de pagar.",
    resumoRapido: [
      "Desde 12/05/2026, compra de pessoa física até US$ 50 em site do Remessa Conforme tem imposto de importação zero (Receita Federal).",
      "De US$ 50,01 a US$ 3.000 no Remessa Conforme: 60% de imposto de importação, com desconto de US$ 30 no imposto.",
      "O ICMS continua em qualquer faixa, de 17% a 20% conforme o estado, e é calculado por dentro.",
      "Em site fora do programa, a alíquota é de 60% sem o desconto, mesmo abaixo de US$ 50."
    ],
    dataPublicacao: "2026-10-18",
    revisadoEm: "outubro de 2026",
    dataRevisao: "2026-10-19",
    tags: ["taxa de importação", "taxa das blusinhas", "remessa conforme", "icms compra internacional", "imposto compra internacional"],
    servico: "como-saber-se-a-promocao-e-verdadeira",
    categoria: "pagamento-e-impostos",
    imagem: "/blog/taxa-de-importacao-compra-internacional.webp",
    faq: [
      { q: "Compra internacional de até 50 dólares paga imposto em 2026?", a: "Paga só o ICMS, se o site for do Remessa Conforme. Desde 12/05/2026 o imposto de importação nessa faixa é zero para pessoa física em site certificado, segundo a Receita Federal, mas o ICMS estadual de 17% a 20% continua." },
      { q: "Quanto é a taxa de importação acima de 50 dólares?", a: "No Remessa Conforme, de US$ 50,01 a US$ 3.000, a alíquota é de 60% com desconto de US$ 30 no valor do imposto. Em site fora do programa, são 60% sem esse desconto." },
      { q: "Qual o ICMS da compra internacional no meu estado?", a: "Varia de 17% a 20%, conforme o estado de destino, de acordo com a Receita Federal. A calculadora da Receita usa 17%, então ajuste a conta se o seu estado cobra mais." },
      { q: "Posso ser taxado de novo quando a encomenda chegar?", a: "Em site do Remessa Conforme, o imposto é pago no momento da compra e repassado à Receita, então a cobrança não deveria aparecer de novo na entrega. Fora do programa, o imposto pode ser cobrado depois, na chegada." }
    ],
    fontes: [
      { nome: "Receita Federal, Novas Regras de remessas (2026)", url: "https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/regras-futuras" },
      { nome: "Receita Federal, Tributação de remessas (2026)", url: "https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/topicos/tributacao" },
      { nome: "Receita Federal, Quais são os impostos devidos (2026)", url: "https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/preciso-pagar-impostos-nas-compras-internacionais/quais-sao-os-impostos-devidos" },
      { nome: "Receita Federal, Programa Remessa Conforme: o que é e como funciona", url: "https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/programa-remessa-conforme-o-que-e-como-funciona" },
      { nome: "Medida Provisória nº 1.357, de 12 de maio de 2026 (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/mpv/mpv1357impressao.htm" },
      { nome: "Lei nº 15.502, de 10 de setembro de 2026 (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15502.htm" },
      { nome: "Lei nº 14.902, de 27 de junho de 2024 (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14902.htm" },
      { nome: "Shopee, Central de Ajuda: impostos na compra internacional", url: "https://help.shopee.com.br/portal/4/article/134145" }
    ],
    conteudo: `<h2>Quanto se paga de taxa de importação em 2026?</h2><p>Depende do valor e do site. Desde 12 de maio de 2026, a compra de pessoa física de até US$ 50 feita em site certificado no Programa Remessa Conforme tem imposto de importação <strong>zero</strong>, segundo a <a href="https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/regras-futuras" rel="noopener">página de novas regras da Receita Federal</a>. De US$ 50,01 até US$ 3.000, a alíquota é de 60%, com um desconto de US$ 30 no valor do imposto. E em qualquer faixa entra o ICMS do seu estado, que vai de 17% a 20%.</p><p>Ou seja: a famosa "taxa das blusinhas" de 20% sobre compras pequenas deixou de existir para quem compra em site certificado, mas a compra internacional não ficou livre de imposto. O ICMS continua lá, e é ele que costuma surpreender quem faz a conta de cabeça.</p><h2>O que mudou de 2024 para cá?</h2><p>Mudou duas vezes em pouco tempo, por isso tanta gente se confunde. A <a href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14902.htm" rel="noopener">Lei nº 14.902/2024</a> alterou o Decreto-Lei nº 1.804/1980 e criou a cobrança de 20% para remessas de até US$ 50 e de 60% acima disso, até US$ 3.000. Pela Receita Federal, essa regra valeu de 1º de agosto de 2024 a 11 de maio de 2026, com desconto de US$ 20 na faixa de 60%.</p><p>Em 12 de maio de 2026 foi publicada a <a href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/mpv/mpv1357impressao.htm" rel="noopener">Medida Provisória nº 1.357/2026</a>, que permitiu reduzir a zero o imposto de importação na faixa de até US$ 50. A Receita passou a aplicar a alíquota zero no Remessa Conforme para declarações registradas a partir dessa data, e a dedução na faixa de 60% subiu para US$ 30. A redução não é retroativa: quem pagou os 20% antes de 12/05/2026 não tem direito a restituição por causa da mudança.</p><p>Em 10 de setembro de 2026, a MP foi convertida na <a href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15502.htm" rel="noopener">Lei nº 15.502/2026</a>. A lei também autoriza o Ministério da Fazenda a reduzir para até 30% a alíquota da faixa de até US$ 3.000, mas isso depende de ato da Fazenda. Até outubro de 2026, segue valendo a regra de 60% com desconto de US$ 30.</p><h3>Tabela das regras vigentes (Remessa Conforme, pessoa física)</h3><table><thead><tr><th>Valor da compra</th><th>Imposto de importação</th><th>ICMS</th></tr></thead><tbody><tr><td>Até US$ 50</td><td>0%</td><td>17% a 20%, conforme o estado</td></tr><tr><td>De US$ 50,01 a US$ 3.000</td><td>60%, menos US$ 30 no imposto</td><td>17% a 20%, conforme o estado</td></tr><tr><td>Site fora do programa (qualquer valor até US$ 3.000)</td><td>60%, sem desconto</td><td>17% a 20%, conforme o estado</td></tr></tbody></table><p>Fonte: Receita Federal, páginas de novas regras e de tributação de remessas, 2026.</p><h2>O que é o Remessa Conforme e por que ele importa?</h2><p>É um programa da Receita Federal que certifica sites de compra internacional que seguem regras próprias de importação. Segundo a <a href="https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/programa-remessa-conforme-o-que-e-como-funciona" rel="noopener">Receita</a>, no site certificado você paga o imposto de importação e o ICMS <strong>no momento da compra</strong>, e a plataforma repassa os valores. Em troca, a encomenda tende a passar mais rápido pela alfândega, e o site precisa mostrar o valor total com frete, seguro e impostos.</p><p>Fora do programa, a regra é outra: 60% de imposto de importação sem o desconto de US$ 30, mesmo numa compra de US$ 10. E o imposto pode ser cobrado só quando a encomenda chega, o que é a surpresa clássica de "comprei barato e paguei a taxa na entrega".</p><h2>Como o ICMS entra na conta?</h2><p>O ICMS é estadual e calculado "por dentro", ou seja, ele faz parte da própria base de cálculo. A fórmula publicada pela <a href="https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/topicos/tributacao" rel="noopener">Receita Federal</a> é: (valor dos bens + frete + seguro + imposto de importação) dividido por (1 menos a alíquota do ICMS), e o resultado multiplicado pela alíquota.</p><p>Na prática, um ICMS de 17% "por dentro" pesa cerca de 20,5% sobre o valor antes dele, e um de 20% pesa 25%. A alíquota <strong>varia por estado</strong>: a Receita informa a faixa de 17% a 20% e diz que a calculadora oficial usa 17%. Se o seu estado cobra mais, a conta da calculadora vai sair menor do que o valor real.</p><h2>Exemplo de conta: quanto fica cada compra?</h2><p>Os valores abaixo são <strong>hipotéticos</strong>, só para mostrar a mecânica. Usamos um câmbio de exemplo de R$ 5,00 por dólar e já colocamos o frete dentro do valor da compra. O câmbio real é o da data de registro da declaração, então o seu resultado vai ser diferente.</p><table><thead><tr><th>Situação (exemplo)</th><th>Compra com frete</th><th>Imposto de importação</th><th>ICMS 17%</th><th>Total com ICMS 17%</th><th>Total com ICMS 20%</th></tr></thead><tbody><tr><td>US$ 40 em site do Remessa Conforme</td><td>R$ 200,00</td><td>R$ 0,00</td><td>R$ 40,96</td><td>R$ 240,96</td><td>R$ 250,00</td></tr><tr><td>US$ 100 em site do Remessa Conforme</td><td>R$ 500,00</td><td>R$ 150,00 (60% de R$ 500 menos R$ 150)</td><td>R$ 133,13</td><td>R$ 783,13</td><td>R$ 812,50</td></tr><tr><td>US$ 100 em site fora do programa</td><td>R$ 500,00</td><td>R$ 300,00 (60%, sem desconto)</td><td>R$ 163,86</td><td>R$ 963,86</td><td>não calculado</td></tr></tbody></table><p>Repare em duas coisas. Primeiro, mesmo com imposto federal zero, a compra de US$ 40 sai uns 20% a 25% mais cara que o preço do anúncio por causa do ICMS. Segundo, passar de US$ 50 muda muito a conta: no exemplo, a compra de US$ 100 paga de imposto quase 57% a mais que o valor do produto com frete. Por isso, antes de juntar itens no mesmo carrinho internacional, veja se o total com frete não passou da linha dos US$ 50.</p><h2>Como a Shopee e outros sites mostram o imposto?</h2><p>Nos sites certificados, o imposto aparece antes de você pagar. A <a href="https://help.shopee.com.br/portal/4/article/134145" rel="noopener">Central de Ajuda da Shopee</a> diz que, como participante do Remessa Conforme, a loja calcula automaticamente os impostos no app, e que o imposto de importação é calculado sobre o preço do produto mais o frete. Sobre cupons, as informações da própria Shopee não são consistentes, então confira no checkout se o desconto entrou antes do cálculo do imposto.</p><p>Para outras lojas, não vamos descrever tela por tela, porque o checkout muda com frequência. A regra geral da Receita vale para todas as certificadas: o valor total com impostos tem de estar visível antes do pagamento. Se o site não mostra imposto nenhum numa compra internacional, desconfie: ou ele não é certificado, ou a cobrança vai aparecer depois.</p><h2>Como evitar surpresa na hora de pagar?</h2><ol><li><strong>Confira se o site é do Remessa Conforme.</strong> A Receita mantém no gov.br a lista de empresas certificadas. Fora dela, conte com 60% de imposto em qualquer valor.</li><li><strong>Some o frete antes de ver a faixa.</strong> A Receita calcula o imposto sobre o valor aduaneiro (produto, frete e seguro). Um produto de US$ 45 com US$ 8 de frete já pode cair na faixa de 60%.</li><li><strong>Olhe o total na última tela, não o preço do anúncio.</strong> O preço da vitrine geralmente não inclui o ICMS, e é aí que a "promoção" encolhe. Se o anúncio mostra um "De" muito alto, vale ler nosso guia sobre <a href="/guias/como-saber-se-a-promocao-e-verdadeira">como saber se a promoção é verdadeira</a>.</li><li><strong>Use o ICMS do seu estado.</strong> A calculadora da Receita usa 17%. Se o seu estado cobra 20%, refaça a conta.</li><li><strong>Compare com a versão nacional.</strong> Muitas vezes o mesmo produto vendido por loja brasileira, já com nota e garantia aqui, fica parecido ou mais barato depois do imposto.</li></ol><h2>E se o produto chegar com defeito ou eu desistir?</h2><p>Os direitos de troca e devolução dependem da política da loja e do Código de Defesa do Consumidor, e isso merece um texto à parte: veja <a href="/blog/direito-de-arrependimento-compra-online">direito de arrependimento na compra online</a> e <a href="/blog/produto-com-defeito-comprado-online">produto com defeito comprado online</a>. Antes de comprar de vendedor internacional na Shopee, também ajuda saber <a href="/blog/como-saber-se-loja-da-shopee-e-confiavel">como saber se a loja da Shopee é confiável</a>.</p><h2>Como o Tem Descontos trata oferta internacional?</h2><p>Conferimos o preço na própria loja antes de postar. Na Shopee, consultamos a API oficial de afiliados e só postamos produto com nota 4,5 ou mais e 50 vendas ou mais; acima de R$ 1.000, só de Loja Oficial ou loja indicada. Se o preço que chegou até nós está mais de 3% abaixo do preço da loja e nenhum cupom explica a diferença, a oferta é descartada. O que não fazemos é calcular o seu ICMS, porque ele depende do seu estado. Por isso a regra de ouro continua: olhe o total no checkout antes de pagar.</p>`,
  },
  {
    slug: "pix-ou-cartao-compra-online",
    titulo: "Pix ou cartão na compra online: qual é mais seguro e quando vale o desconto",
    metaTitle: "Pix ou cartão na compra online: qual é mais seguro?",
    metaDescription: "Pix não tem estorno como cartão: o MED do Banco Central só vale para golpe e tem prazo de até 80 dias. Veja quando o desconto no Pix compensa o parcelado.",
    resumo: "A diferença real de proteção entre Pix e cartão de crédito na compra online, como funciona o MED do Banco Central e a conta para saber se o desconto no Pix vale mais que o parcelado sem juros.",
    resumoRapido: [
      "Pix não tem estorno como o cartão: depois de enviado, a volta do dinheiro depende do recebedor ou do MED.",
      "O MED do Banco Central é para fraude e golpe, não para arrependimento ou desacordo comercial; o pedido pode ser feito para Pix de até 80 dias.",
      "No cartão, a compra não reconhecida é contestada com o emissor; prazos variam por banco e bandeira.",
      "Desconto no Pix compensa quando é maior que o rendimento que você teria deixando o dinheiro aplicado durante o parcelamento."
    ],
    dataPublicacao: "2026-10-18",
    revisadoEm: "outubro de 2026",
    dataRevisao: "2026-10-19",
    tags: ["pix ou cartão", "pix é seguro para compra online", "med pix", "desconto no pix vale a pena", "estorno pix"],
    servico: "grupo-de-ofertas-no-whatsapp-e-seguro",
    categoria: "pagamento-e-impostos",
    imagem: "/blog/pix-ou-cartao-compra-online.webp",
    faq: [
      { q: "Pix tem estorno?", a: "Não do jeito que o cartão tem. O Pix enviado só volta se o recebedor devolver ou, em caso de fraude, pelo Mecanismo Especial de Devolução (MED) do Banco Central, que depende de análise e de haver saldo na conta de destino." },
      { q: "Qual o prazo para pedir o MED do Pix?", a: "O pedido pode ser aberto para transações de até 80 dias, segundo o Banco Central. O ideal é pedir no mesmo dia, pelo app do seu banco, porque a devolução depende de ainda haver dinheiro na conta do golpista." },
      { q: "O MED devolve Pix de compra que não chegou?", a: "Depende. Se foi golpe (loja falsa, link falso), é caso de MED. Se foi problema comercial com uma loja real, como atraso ou produto diferente, o MED não se aplica e o caminho é a loja, o Procon ou a Justiça." },
      { q: "É mais seguro pagar com cartão de crédito virtual?", a: "Ele reduz o risco de vazamento do número do cartão físico, porque você pode apagar ou trocar o virtual. A proteção de contestação continua a mesma do cartão de crédito." },
      { q: "Desconto no Pix vale mais que parcelar sem juros?", a: "Vale quando o desconto é maior que o rendimento que o dinheiro teria durante as parcelas. No nosso exemplo hipotético, com rendimento de 1% ao mês, 10x sem juros equivalem a cerca de 5,3% de desconto." }
    ],
    fontes: [
      { nome: "Banco Central, Guia do Mecanismo Especial de Devolução (MED)", url: "https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Guia_MED.pdf" },
      { nome: "Banco Central, FAQ Participantes do Pix", url: "https://www.bcb.gov.br/content/estabilidadefinanceira/pix/FAQ_Participantes.pdf" },
      { nome: "Agência Brasil, Novas regras de segurança do Pix entram em vigor (fev. 2026)", url: "https://agenciabrasil.ebc.com.br/economia/noticia/2026-02/novas-regras-de-seguranca-do-pix-entram-em-vigor-veja-mudancas" },
      { nome: "Agência Brasil, Nova regra do Pix amplia prazo para contestar golpe (set. 2026)", url: "https://agenciabrasil.ebc.com.br/economia/noticia/2026-09/nova-regra-do-pix-amplia-prazo-para-contestar-golpe" },
      { nome: "Lei nº 13.455, de 26 de junho de 2017 (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13455.htm" },
      { nome: "Ministério da Justiça, Fizeram compras indevidas com meu cartão", url: "https://www.gov.br/mj/pt-br/acesso-a-informacao/acoes-e-programas/sofri-um-golpe-e-agora/fizeram-compras-on-line-com-os-dados-do-meu-cartao" },
      { nome: "Gov.br, Reclamar contra instituição supervisionada pelo Banco Central", url: "https://www.gov.br/pt-br/servicos/registrar-reclamacao-contra-instituicao-supervisionada-pelo-banco-central" }
    ],
    conteudo: `<h2>Pix ou cartão: qual é mais seguro na compra online?</h2><p>Para se proteger de problema com a compra, o cartão de crédito é mais seguro; para pagar menos, o Pix costuma ganhar. A diferença está no que acontece depois do pagamento: no cartão, você contesta uma compra não reconhecida com o banco emissor e a cobrança pode ser suspensa enquanto ele analisa. No Pix, o dinheiro sai na hora e não existe estorno nesse formato. Se algo der errado, a volta depende de o recebedor devolver ou, em caso de golpe, do Mecanismo Especial de Devolução (MED) do Banco Central.</p><p>Isso não quer dizer que Pix seja inseguro. Pix numa loja oficial, dentro do site ou do app dela, é tão confiável quanto a loja. O risco aparece quando o Pix vai para uma conta que não é a da loja: link falso, "vendedor" no privado, QR code mandado por mensagem.</p><h2>Pix tem estorno?</h2><p>Não como o cartão. Depois de confirmado, o Pix só volta de três jeitos: o recebedor devolve por vontade própria (a função "devolver" do app, ligada à transação), a loja faz o reembolso pelo canal dela, ou o seu banco aciona o MED por suspeita de fraude. Não há um botão que desfaça a compra por arrependimento.</p><h3>O que é o MED e quando ele vale?</h3><p>O MED é o mecanismo do Banco Central para devolver Pix em caso de fraude ou golpe, inclusive quando você mesmo digitou a senha ou usou a biometria, porque foi enganado. Segundo o <a href="https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Guia_MED.pdf" rel="noopener">guia do MED do Banco Central</a>, ele <strong>não</strong> serve para desacordo comercial: produto que atrasou, não agradou ou não era como o anunciado, comprado de uma loja real, se resolve com a loja, o Procon ou a Justiça. Também não cobre erro seu, como digitar a chave errada.</p><h3>Quais são os prazos do MED?</h3><ul><li><strong>Até 80 dias</strong> da transação para o pedido ser aberto, segundo a <a href="https://www.bcb.gov.br/content/estabilidadefinanceira/pix/FAQ_Participantes.pdf" rel="noopener">FAQ de participantes do Pix do Banco Central</a>.</li><li>Depois de aberto, a instituição do recebedor tem 7 dias corridos para analisar a notificação, de acordo com o mesmo documento.</li><li>A devolução depende de haver saldo na conta de destino e pode ser total ou parcial.</li></ul><p>Na prática, o prazo de 80 dias é o limite, não a meta. Golpista tira o dinheiro rápido, então peça no mesmo dia. Desde outubro de 2025, a contestação pode ser feita pelo próprio app do banco, no autoatendimento do MED.</p><h3>O que mudou com o MED 2.0?</h3><p>O MED 2.0 passou a ser obrigatório para as instituições do Pix em 2 de fevereiro de 2026, conforme o Banco Central e a <a href="https://agenciabrasil.ebc.com.br/economia/noticia/2026-02/novas-regras-de-seguranca-do-pix-entram-em-vigor-veja-mudancas" rel="noopener">Agência Brasil</a>. A novidade é rastrear o dinheiro além da primeira conta: antes, a tentativa de recuperação parava na conta que recebeu o Pix; agora pode seguir as transferências seguintes. Mesmo assim, a devolução não é garantida se o dinheiro já tiver sido sacado. Em setembro de 2026, a <a href="https://agenciabrasil.ebc.com.br/economia/noticia/2026-09/nova-regra-do-pix-amplia-prazo-para-contestar-golpe" rel="noopener">Agência Brasil</a> noticiou que o prazo para contestar uma devolução feita pelo MED passou de 30 para 80 dias, mudança que protege principalmente quem recebeu um Pix legítimo e teve o valor devolvido por engano.</p><h2>Como funciona a contestação no cartão de crédito?</h2><p>No cartão, quem resolve é o banco emissor. Se aparece uma compra que você não fez, a orientação do <a href="https://www.gov.br/mj/pt-br/acesso-a-informacao/acoes-e-programas/sofri-um-golpe-e-agora/fizeram-compras-on-line-com-os-dados-do-meu-cartao" rel="noopener">Ministério da Justiça</a> é bloquear o cartão, contestar com o emissor e registrar boletim de ocorrência com valor, data, estabelecimento e os últimos quatro dígitos do cartão. O processo de contestação entre banco, bandeira e loja é o que o mercado chama de chargeback.</p><p>Não há um prazo único definido pelo Banco Central para isso: cada emissor e cada bandeira têm suas regras, e os prazos mudam conforme o banco. O que vale para todos é agir rápido e guardar provas (prints do anúncio, do pedido, das conversas). Se o banco não resolver, o caminho é a ouvidoria da instituição e, depois, a <a href="https://www.gov.br/pt-br/servicos/registrar-reclamacao-contra-instituicao-supervisionada-pelo-banco-central" rel="noopener">reclamação no Banco Central</a>, lembrando que o BC usa a reclamação para fiscalizar e não decide o caso individual.</p><h3>Cartão virtual ajuda?</h3><p>Ajuda contra vazamento de dados. O cartão virtual é um número gerado no app do banco só para compras online: se ele vazar, você apaga e gera outro, sem trocar o cartão físico. Alguns bancos oferecem virtual temporário, que expira depois de pouco tempo ou de uma compra. A proteção de contestação é a mesma do crédito comum; o que muda é que o estrago de um vazamento fica menor. Para comprar em loja nova ou pouco conhecida, é a opção mais tranquila.</p><h2>Quando o desconto no Pix compensa o parcelado sem juros?</h2><p>Compensa quando o desconto é maior do que o rendimento que você teria deixando o dinheiro aplicado enquanto paga as parcelas. A loja pode cobrar preços diferentes conforme a forma de pagamento: a <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13455.htm" rel="noopener">Lei nº 13.455/2017</a> autoriza essa diferença e obriga o fornecedor a informar o desconto de forma visível.</p><p>Como engenheiro, eu desconfio de número sem conta, então vamos à conta. O exemplo abaixo é <strong>hipotético</strong>: um produto de R$ 1.000, parcelado em 10x de R$ 100 sem juros, e o dinheiro guardado rendendo 1% ao mês (taxa escolhida só para o exemplo; o seu rendimento real pode ser maior ou menor). Trazendo as 10 parcelas para valor de hoje, pagar parcelado equivale a pagar cerca de R$ 947,13 à vista.</p><table><thead><tr><th>Cenário (exemplo)</th><th>Quanto você paga</th><th>Valor de hoje do parcelado (1% a.m.)</th><th>Quem ganha</th></tr></thead><tbody><tr><td>Pix com 3% de desconto</td><td>R$ 970,00</td><td>R$ 947,13</td><td>Parcelado sem juros</td></tr><tr><td>Pix com 5% de desconto</td><td>R$ 950,00</td><td>R$ 947,13</td><td>Praticamente empate</td></tr><tr><td>Pix com 10% de desconto</td><td>R$ 900,00</td><td>R$ 947,13</td><td>Pix</td></tr><tr><td>Pix com 15% de desconto</td><td>R$ 850,00</td><td>R$ 947,13</td><td>Pix</td></tr></tbody></table><p>Resumo da conta: nesse exemplo, 10x sem juros valem cerca de 5,3% de desconto. Desconto no Pix acima disso ganha; abaixo, o parcelado ganha, desde que você de fato deixe o dinheiro rendendo e pague a fatura em dia. Se você não tem o dinheiro guardado e ia gastar de qualquer jeito, qualquer desconto no Pix é economia. E se a fatura for atrasar, nenhum desconto compensa os juros do rotativo.</p><h3>O desconto no Pix é real?</h3><p>Nem sempre. Às vezes o "desconto no Pix" é calculado em cima de um preço cheio inflado. Antes de comemorar, compare o valor final no Pix com o preço de outras lojas; para isso, veja nosso guia sobre <a href="/guias/como-saber-se-a-promocao-e-verdadeira">como saber se a promoção é verdadeira</a>. Nos marketplaces, o pagamento também passa por proteções da própria plataforma, como explicamos em <a href="/blog/compra-garantida-mercado-livre">Compra Garantida do Mercado Livre</a> e <a href="/blog/garantia-de-a-a-z-amazon">Garantia de A a Z da Amazon</a>.</p><h2>Golpe de Pix em link falso: como evitar?</h2><p>O golpe mais comum é a página falsa que copia uma loja grande e só aceita Pix, com preço bom demais. A regra é simples: pague só dentro do site ou app oficial da loja e nunca faça Pix para chave mandada por mensagem. Detalhamos os sinais de golpe em <a href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro">grupo de ofertas no WhatsApp é seguro?</a>.</p><p>No Tem Descontos, o link de toda oferta leva sempre para a loja oficial, nunca para site intermediário, e o grupo não pede dado, Pix ou código no privado. Se alguém usando nosso nome pedir isso, é golpe. Antes de postar, também conferimos o preço na própria loja e descartamos a oferta quando o link leva a um produto diferente do texto. Assim, quando você paga, seja no Pix ou no cartão, está pagando para a loja certa.</p>`,
  },
{
    slug: "como-saber-se-loja-da-shopee-e-confiavel",
    titulo: "Como saber se uma loja da Shopee é confiável",
    metaTitle: "Loja da Shopee é confiável? Como conferir antes de comprar",
    metaDescription: "Nota 4,5+, 50+ vendas e loja oficial acima de R$ 1.000: a regra que usamos na Shopee. Veja selos, Garantia Shopee e sinais de alerta da loja.",
    resumo: "Os sinais que mostram se uma loja da Shopee merece seu dinheiro, com a mesma régua que o Tem Descontos usa antes de postar uma oferta.",
    resumoRapido: [
      "Confira nota (4,5 ou mais) e número de vendas (50 ou mais): é o mínimo que o Tem Descontos exige para postar um produto da Shopee.",
      "Produto caro (R$ 1.000 ou mais) só de Loja Oficial ou de Vendedor Indicado.",
      "Pague sempre dentro do app: a Garantia Shopee segura o pagamento ao vendedor até você confirmar que recebeu.",
      "Leia avaliações com foto e veja se o produto vem do exterior antes de fechar."
    ],
    dataPublicacao: "2026-10-18",
    revisadoEm: "outubro de 2026",
    dataRevisao: "2026-10-19",
    tags: ["loja da shopee é confiável", "garantia shopee", "loja oficial shopee", "vendedor indicado shopee", "como comprar na shopee com segurança"],
    servico: "grupo-de-ofertas-no-whatsapp-e-seguro",
    categoria: "garantias-das-lojas",
    imagem: "/blog/como-saber-se-loja-da-shopee-e-confiavel.webp",
    faq: [
      { q: "Como saber se uma loja da Shopee é confiável?", a: "Olhe nota, número de vendas, avaliações com foto, selo (Oficial ou Indicado) e a taxa de resposta do chat na página da loja. No Tem Descontos, só postamos produto com nota 4,5 ou mais e 50 vendas ou mais." },
      { q: "A Garantia Shopee protege meu dinheiro?", a: "Sim, desde que você pague pelo app: segundo a central de ajuda da Shopee, o pagamento fica retido e só é repassado ao vendedor depois da confirmação do recebimento ou do fim do prazo de autoconfirmação." },
      { q: "O que é loja oficial na Shopee?", a: "É a loja da própria marca, identificada pelo selo vermelho Oficial. A Shopee informa que os produtos dessas lojas são oficiais das marcas." },
      { q: "Posso confirmar o recebimento antes de o produto chegar?", a: "Não faça isso. A própria Shopee orienta a nunca confirmar o recebimento de um produto que não foi entregue, mesmo que o vendedor prometa brinde ou vantagem." },
      { q: "Produto da Shopee que vem do exterior é golpe?", a: "Não necessariamente, mas o prazo é maior e pode haver imposto de importação. A Shopee marca esses produtos com a etiqueta Envio do exterior." }
    ],
    fontes: [
      { nome: "Shopee Brasil, Central de Ajuda: Garantia Shopee, como funciona a garantia de compra segura (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/76327" },
      { nome: "Shopee Brasil, Termos de Serviço (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/77113" },
      { nome: "Shopee Brasil, Blog: Garantia Shopee (consulta em 2026)", url: "https://shopee.com.br/blog/o-que-e-a-garantia-shopee/" },
      { nome: "Shopee Brasil, Central de Ajuda: O que são as Lojas Oficiais (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/78029" },
      { nome: "Shopee Brasil, Central de Ajuda: Quem são os Vendedores Indicados (consulta em 2026)", url: "https://help.shopee.com.br/4/article/76198" },
      { nome: "Shopee Brasil, Central de Ajuda: Como classifico e reviso um produto (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/77967" },
      { nome: "Shopee Brasil, Central de Ajuda: O que é a taxa de resposta do chat (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/129713" },
      { nome: "Shopee Brasil, Central de Ajuda: O que são produtos do exterior (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/78028" }
    ],
    conteudo: `<h2>Como saber se uma loja da Shopee é confiável?</h2>
<p>Olhe cinco coisas antes de pagar: a nota do produto, quantas unidades já foram vendidas, se a loja tem selo (Oficial ou Indicado), o que dizem as avaliações com foto e se o produto vem do Brasil ou do exterior. Nenhum desses sinais sozinho garante nada, mas juntos eles separam bem a loja séria da loja que apareceu ontem com preço bom demais.</p>
<p>No Tem Descontos, essa conferência não fica só no olho. Aplicamos uma régua fixa antes de mandar qualquer oferta da Shopee para o grupo, e é essa régua que vamos abrir aqui, item por item, para você usar nas suas compras também.</p>

<h2>Qual é a régua que o Tem Descontos usa na Shopee?</h2>
<p>A conferência consulta o produto direto na API oficial de afiliados da Shopee e só deixa a oferta passar se ela cumpre três condições:</p>
<table>
<thead><tr><th>Critério</th><th>Nossa regra</th><th>Por que existe</th></tr></thead>
<tbody>
<tr><td>Nota do produto</td><td>4,5 ou mais</td><td>Abaixo disso, a reclamação deixa de ser exceção</td></tr>
<tr><td>Vendas</td><td>50 ou mais</td><td>Nota alta com meia dúzia de vendas não prova nada</td></tr>
<tr><td>Produto de R$ 1.000 ou mais</td><td>Só de Loja Oficial ou Vendedor Indicado</td><td>Quanto maior o valor, maior o prejuízo se der errado</td></tr>
</tbody>
</table>
<p>Além disso, conferimos se o preço anunciado bate com o preço que a própria Shopee mostra e descartamos a oferta quando o link leva a um produto diferente do texto (por exemplo, o post fala em kit com 3 unidades e o link abre 1 unidade). Se você quer entender como pegamos o preço riscado inflado, o passo a passo está no guia <a href="/guias/como-saber-se-a-promocao-e-verdadeira">como saber se a promoção é verdadeira</a>.</p>
<p>Por que nota e vendas juntas? Como engenheiro, eu desconfio de número sem base. Um produto com nota 5,0 e 3 vendas pode ter 3 avaliações da família do vendedor. Um produto com nota 4,7 e 2 mil vendas tem uma média que já resistiu a muita gente diferente. O número de vendas é o tamanho da amostra; a nota só vale quando a amostra é grande.</p>

<h2>O que é Loja Oficial na Shopee?</h2>
<p>Loja Oficial é a loja da própria marca dentro da Shopee, marcada com um selo vermelho escrito Oficial na busca e na página da loja. A central de ajuda da Shopee descreve essas lojas como de grandes marcas, nacionais e internacionais, e a Shopee informa que os produtos vendidos ali são produtos oficiais das marcas.</p>
<p>Na prática, Loja Oficial é o lugar mais seguro para comprar eletrônico, eletrodoméstico e qualquer item em que falsificação é comum. Por isso a nossa regra: produto de R$ 1.000 para cima só sai no grupo se vier de Loja Oficial ou de Vendedor Indicado.</p>

<h2>O que é Vendedor Indicado (loja indicada)?</h2>
<p>Vendedor Indicado é um vendedor que a Shopee selecionou por entregar uma experiência de compra melhor, e ele aparece com um rótulo próprio na página do produto e na busca. Segundo a central de ajuda, para manter o selo a loja precisa sustentar boas avaliações, bom atendimento e envio rápido. A central de ajuda para compradores não informa a meta exata de cada indicador, então trate o selo como um bom sinal, não como garantia.</p>
<p>A diferença para a Loja Oficial: a oficial é a marca vendendo; a indicada é uma loja comum (pode ser revenda) que ganhou o selo pelo desempenho. As duas passam no nosso filtro para produtos caros. Loja sem selo nenhum só passa abaixo de R$ 1.000, e ainda assim com nota e vendas no mínimo exigido.</p>

<h2>Como funciona a Garantia Shopee?</h2>
<p>A Garantia Shopee segura o seu pagamento: o dinheiro não vai direto para o vendedor quando você paga. Pela central de ajuda e pelos Termos de Serviço da Shopee, o pagamento fica retido e só é liberado ao vendedor depois que você confirma o recebimento no app ou quando termina o prazo de autoconfirmação do sistema. Se o produto não chegou, veio errado ou com defeito, é nesse período que você pede devolução ou reembolso pelo app.</p>
<p>Três cuidados para a garantia funcionar a seu favor:</p>
<ul>
<li><strong>Pague sempre dentro do app.</strong> Vendedor que pede Pix por fora, depósito ou pagamento por link de outro site está tirando você da Garantia Shopee.</li>
<li><strong>Não confirme o recebimento antes de abrir a caixa.</strong> A própria Shopee orienta a nunca confirmar o recebimento de um produto que não foi entregue, mesmo que o vendedor prometa brinde ou vantagem em troca.</li>
<li><strong>Abra a disputa dentro do prazo.</strong> O prazo exato aparece no pedido, no app. Depois que o dinheiro foi liberado, a conversa fica mais difícil.</li>
</ul>
<p>Seus direitos de consumidor continuam valendo além da garantia da plataforma. Explicamos o prazo para desistir de uma compra online em <a href="/blog/direito-de-arrependimento-compra-online">direito de arrependimento na compra online</a>.</p>

<h2>Como ler as avaliações sem cair em armadilha?</h2>
<p>Vá direto para as avaliações com foto ou vídeo. Na Shopee, só quem teve o pedido concluído consegue avaliar o produto, e pedidos cancelados, devolvidos ou reembolsados não podem ser avaliados, segundo a central de ajuda. Isso dá peso à avaliação, mas não impede avaliação genérica.</p>
<ul>
<li><strong>Foto do produto real:</strong> compare cor, tamanho e embalagem com as fotos do anúncio. Diferença grande é sinal de alerta.</li>
<li><strong>Avaliações de 1 e 2 estrelas:</strong> leia primeiro as piores. Se todas reclamam da mesma coisa (tamanho menor, peça faltando, não liga), acredite nelas.</li>
<li><strong>Variação certa:</strong> em anúncio com várias opções, veja se a avaliação é da variação que você vai comprar.</li>
<li><strong>Texto repetido:</strong> muitas avaliações curtas e iguais, sem foto, em poucos dias, merecem desconfiança.</li>
</ul>

<h2>O tempo de loja e o atendimento importam?</h2>
<p>Importam, porque histórico é a única coisa que não se compra rápido. Abra a página da loja e veja quantos produtos ela tem, quantas avaliações acumula e se há avaliações antigas além das recentes. A Shopee também mostra na página da loja a taxa de resposta do chat, calculada sobre as conversas que precisavam de resposta. Mande uma pergunta antes de comprar algo caro: loja que não responde antes da venda raramente responde depois.</p>

<h2>Produto internacional ou nacional: qual a diferença?</h2>
<p>Produto do exterior é enviado de outro país depois da compra, e a Shopee marca esses itens com a etiqueta Envio do exterior na página do produto. O prazo de entrega é bem maior que o de um vendedor brasileiro, o pedido passa pela alfândega e pode haver imposto de importação. Antes de comparar preço de produto nacional com importado, some o imposto: explicamos a conta em <a href="/blog/taxa-de-importacao-compra-internacional">taxa de importação na compra internacional</a>.</p>
<p>Importado não é sinônimo de golpe. Mas para presente com data marcada ou produto que você precisa logo, o vendedor nacional costuma ser a escolha mais segura.</p>

<h2>Sinais bons x sinais de alerta</h2>
<table>
<thead><tr><th>Sinal bom</th><th>Sinal de alerta</th></tr></thead>
<tbody>
<tr><td>Nota 4,5 ou mais com dezenas ou centenas de vendas</td><td>Nota 5,0 com poucas vendas</td></tr>
<tr><td>Selo Oficial ou Vendedor Indicado em produto caro</td><td>Produto caro em loja nova, sem selo</td></tr>
<tr><td>Avaliações com foto parecida com o anúncio</td><td>Avaliações sem foto, curtas e repetidas</td></tr>
<tr><td>Pagamento dentro do app</td><td>Pedido de Pix, depósito ou link fora da Shopee</td></tr>
<tr><td>Chat responde a pergunta objetiva</td><td>Loja não responde ou empurra para o WhatsApp</td></tr>
<tr><td>Preço abaixo do normal, mas coerente com a categoria</td><td>Preço de marca famosa muito abaixo de qualquer outra loja</td></tr>
<tr><td>Envio nacional quando você tem pressa</td><td>Envio do exterior sem você ter percebido</td></tr>
</tbody>
</table>

<h2>E se o link da oferta for falso?</h2>
<p>Link falso é outro problema, anterior à loja: antes de olhar nota e selo, confira se o endereço abre o app ou o site oficial da Shopee, e veja como reconhecer golpe de link em <a href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro">grupo de ofertas no WhatsApp é seguro?</a>. No Tem Descontos o link vai sempre para a loja oficial, nunca para site intermediário, e ninguém do grupo pede dado, Pix ou código no privado.</p>

<h2>Checklist rápido antes de pagar</h2>
<ol>
<li>O link abriu a Shopee de verdade?</li>
<li>Nota 4,5 ou mais e pelo menos 50 vendas?</li>
<li>Se custa R$ 1.000 ou mais, a loja é Oficial ou Indicada?</li>
<li>As avaliações com foto mostram o mesmo produto do anúncio?</li>
<li>O produto é nacional ou tem a etiqueta Envio do exterior?</li>
<li>O pagamento vai ser feito dentro do app?</li>
<li>O cupom que você quer usar vale para essa loja? (veja <a href="/blog/cupom-shopee-e-mercado-livre-como-usar">como usar cupom da Shopee e do Mercado Livre</a>)</li>
</ol>
<p>Se a resposta for sim para tudo, a chance de dor de cabeça cai muito. Se algum item falhar, não é proibido comprar, mas é exatamente o tipo de oferta que deixamos de fora.</p>`,
  },
  {
    slug: "cupom-shopee-e-mercado-livre-como-usar",
    titulo: "Cupom da Shopee e do Mercado Livre: como usar e por que às vezes não funciona",
    metaTitle: "Cupom Shopee e Mercado Livre: como usar e por que falha",
    metaDescription: "Valor mínimo, produto fora da regra, cupom esgotado ou de novo usuário: veja por que o cupom da Shopee e do Mercado Livre falha e onde resgatar cada um.",
    resumo: "Tipos de cupom da Shopee e do Mercado Livre, onde resgatar, como aplicar no carrinho e os motivos oficiais para aparecer cupom indisponível.",
    resumoRapido: [
      "Shopee: resgate em Eu > Meus Cupons ou na página da loja; dá para usar 1 cupom de vendedor, 1 de frete grátis e 1 de desconto por compra.",
      "Mercado Livre: os cupons ficam na página de Cupons e em Meus cupons; o desconto entra na finalização da compra.",
      "Cupom falha por valor mínimo, produto ou categoria fora da regra, validade, cota esgotada ou regra de novo usuário.",
      "Cupom pessoal de outro canal não é para você: no Tem Descontos esse tipo de oferta é descartado."
    ],
    dataPublicacao: "2026-10-18",
    revisadoEm: "outubro de 2026",
    dataRevisao: "2026-10-19",
    tags: ["cupom shopee", "cupom mercado livre", "cupom indisponível", "moedas shopee", "cupom primeira compra"],
    servico: "cupom-da-amazon-como-usar",
    categoria: "ofertas-e-cupons",
    imagem: "/blog/cupom-shopee-e-mercado-livre-como-usar.webp",
    faq: [
      { q: "Por que o cupom da Shopee não funciona?", a: "Na maioria das vezes o pedido não cumpre uma condição do cupom: valor mínimo, produto ou categoria, forma de pagamento ou envio, validade ou cota de uso. As condições ficam no regulamento (T&C) de cada cupom, em Eu > Meus Cupons." },
      { q: "Posso usar mais de um cupom na Shopee?", a: "Sim, até um de cada tipo: segundo a central de ajuda, no máximo 1 cupom de vendedor, 1 cupom de frete grátis e 1 cupom de desconto da Shopee por finalização de compra." },
      { q: "Onde ficam os cupons do Mercado Livre?", a: "Na página de Cupons do Mercado Livre (mercadolivre.com.br/cupons) e, depois de ativados, em Meus cupons. Alguns aparecem direto no anúncio do produto." },
      { q: "Quem pode usar cupom de primeira compra na Shopee?", a: "Só quem nunca concluiu uma transação na Shopee, segundo a central de ajuda. Compra de crédito de jogo ou produto digital também conta como transação." },
      { q: "Cupom de influenciador ou de afiliado serve para qualquer pessoa?", a: "Depende do regulamento. Cupom nominal de afiliado na Shopee é de uso do afiliado que o recebeu e dos seguidores dele, conforme os termos do programa, e pode ter cota pequena." }
    ],
    fontes: [
      { nome: "Shopee Brasil, Central de Ajuda: Quais cupons de desconto existem (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/76177" },
      { nome: "Shopee Brasil, Central de Ajuda: Onde posso encontrar os cupons (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/76217" },
      { nome: "Shopee Brasil, Central de Ajuda: Como faço para usar um código de cupom (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/76206" },
      { nome: "Shopee Brasil, Central de Ajuda: Por que meu código promocional não está funcionando (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/76380" },
      { nome: "Shopee Brasil, Central de Ajuda: Por que não consigo usar um cupom de desconto (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/76296" },
      { nome: "Shopee Brasil, Central de Ajuda: Por que as promoções não são aplicáveis a certas categorias (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/88986" },
      { nome: "Shopee Brasil, Central de Ajuda: Cupom de frete grátis abaixo do valor mínimo (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/76298" },
      { nome: "Shopee Brasil, Central de Ajuda: Benefícios para novos usuários (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/76186" },
      { nome: "Shopee Brasil, Central de Ajuda: Onde posso usar minhas Moedas Shopee (consulta em 2026)", url: "https://help.shopee.com.br/portal/4/article/76434" },
      { nome: "Shopee Brasil, Programa de Afiliados: Termos e Condições (consulta em 2026)", url: "https://help.shopee.com.br/portal/10/article/124094" },
      { nome: "Mercado Livre, Blog: como encontrar cupons, descontos e ofertas (consulta em 2026)", url: "https://www.mercadolivre.com.br/blog/mercado-livre-como-encontrar-cupons-descontos-e-ofertas" },
      { nome: "Mercado Livre, página Cupons todos os dias (consulta em 2026)", url: "https://www.mercadolivre.com.br/l/cupons-todos-os-dias" },
      { nome: "Mercado Livre, Blog: milhares de cupons para você economizar (consulta em 2026)", url: "https://www.mercadolivre.com.br/blog/milhares-de-cupons-para-voce-economizar-no-mercado-livre" },
      { nome: "Mercado Livre, página Conheça seus benefícios (consulta em 2026)", url: "https://www.mercadolivre.com.br/l/conheca-seus-beneficios" }
    ],
    conteudo: `<h2>Por que o cupom às vezes não funciona?</h2>
<p>Quase sempre porque o seu carrinho não cumpre alguma condição do cupom: valor mínimo, produto ou categoria participante, forma de pagamento, validade ou quantidade disponível. Cupom não é desconto livre; cada um tem um regulamento próprio, e o sistema da loja só aplica quando tudo bate. A boa notícia é que dá para descobrir qual regra falhou em menos de um minuto, desde que você saiba onde olhar.</p>
<p>Este texto cobre Shopee e Mercado Livre. Cupom da Amazon tem lógica própria (cupom de clicar na página, código promocional e outros), e está explicado no guia <a href="/guias/cupom-da-amazon-como-usar">cupom da Amazon: como usar</a>.</p>

<h2>Quais tipos de cupom existem na Shopee?</h2>
<p>A Shopee separa os cupons em dois grandes grupos: os da plataforma (pagos pela Shopee) e os do vendedor (pagos pela loja). Na prática, você vai encontrar quatro coisas:</p>
<ul>
<li><strong>Cupom de desconto da Shopee:</strong> vale em produtos de várias lojas, pode dar valor fixo, porcentagem ou reembolso em moedas.</li>
<li><strong>Cupom da loja (de vendedor):</strong> criado pelo vendedor e válido só nos produtos dele. Fica na página da loja; o Cupom de Seguidor é uma variação que a loja dá para quem a segue.</li>
<li><strong>Cupom de frete grátis:</strong> abate o frete em pedidos acima de um valor mínimo.</li>
<li><strong>Moedas Shopee:</strong> não são cupom, mas funcionam como desconto. Você ativa a opção de resgatar moedas no carrinho ou na finalização da compra.</li>
</ul>
<p>Segundo a central de ajuda, você pode usar <strong>no máximo 1 cupom de vendedor, 1 cupom de frete grátis e 1 cupom de desconto</strong> em cada finalização de compra. Ou seja, dá para empilhar tipos diferentes, mas não dois do mesmo tipo.</p>

<h2>Onde resgatar cupom na Shopee?</h2>
<p>Os cupons resgatados ficam em <strong>Eu > Meus Cupons</strong>. Para pegar novos, a central de ajuda indica a seção de cupons na página inicial do app (Cupons Diários, botão Eu Quero), a página do produto (quando há indicação de cupom) e a página inicial da loja, onde aparecem o cupom da loja e o Cupom de Seguidor. Na hora de pagar, toque em Cupom de desconto no checkout e escolha os cupons que quer aplicar. O cupom da loja costuma entrar sozinho no carrinho quando as condições são atendidas.</p>
<p>Para ver o regulamento de um cupom, abra Meus Cupons e toque no T&amp;C. É ali que estão o valor mínimo, os produtos participantes e a validade.</p>

<h2>Quais tipos de cupom existem no Mercado Livre?</h2>
<p>No Mercado Livre os cupons aparecem de três formas, segundo as páginas oficiais da loja:</p>
<ul>
<li><strong>Cupom de ativação:</strong> você entra na página de Cupons ou no produto com o selo Cupom, toca em Aplicar e finaliza a compra.</li>
<li><strong>Cupom com código:</strong> você digita o código no campo Inserir código do cupom, na parte de cima da página de Cupons, ou antes de finalizar, nos detalhes do carrinho ou no resumo da compra.</li>
<li><strong>Cupom no anúncio:</strong> alguns aparecem direto no anúncio do produto participante e entram na finalização.</li>
</ul>
<p>A página oficial fica em mercadolivre.com.br/cupons, com os cupons ativos depois que você faz login, e os que você já ativou ficam em Meus cupons. O desconto só aparece na finalização da compra, não no preço do anúncio. Frete grátis da primeira compra é um benefício separado, que vale para quem nunca comprou no Mercado Livre e só em produtos com a etiqueta correspondente.</p>

<h2>Shopee x Mercado Livre: como os cupons se comparam?</h2>
<table>
<thead><tr><th>Ponto</th><th>Shopee</th><th>Mercado Livre</th></tr></thead>
<tbody>
<tr><td>Onde resgatar</td><td>Página inicial (Cupons Diários), página da loja, página do produto</td><td>Página de Cupons e anúncio com selo Cupom</td></tr>
<tr><td>Onde ficam os resgatados</td><td>Eu > Meus Cupons</td><td>Meus cupons</td></tr>
<tr><td>Cupom de quem vende</td><td>Sim, cupom da loja e Cupom de Seguidor</td><td>Varia; quando há, aparece no anúncio ou na página de Cupons</td></tr>
<tr><td>Quantos cupons por compra</td><td>1 de vendedor + 1 de frete grátis + 1 de desconto</td><td>Em campanhas como Cupons todos os dias, 1 cupom por carrinho</td></tr>
<tr><td>Limite por pessoa</td><td>Cada cupom pode ser usado uma vez</td><td>Em campanhas como Cupons todos os dias, 1 uso por CPF</td></tr>
<tr><td>Valor mínimo</td><td>Varia por cupom, está no T&amp;C</td><td>Varia por cupom, está nas condições</td></tr>
<tr><td>Desconto extra além do cupom</td><td>Moedas Shopee no checkout</td><td>Varia por campanha</td></tr>
<tr><td>Primeira compra</td><td>Presente de boas-vindas para quem nunca comprou</td><td>Benefícios para novos compradores, conforme campanha</td></tr>
</tbody>
</table>

<h2>Por que aparece cupom indisponível?</h2>
<p>A resposta está quase sempre no regulamento. Estes são os motivos que as próprias lojas confirmam nas páginas de ajuda:</p>
<h3>O pedido não chegou ao valor mínimo</h3>
<p>Na Shopee, o valor que conta é o final, já com os outros descontos aplicados no checkout. Se o cupom da loja derrubou o total para baixo do mínimo do cupom de frete grátis, o frete grátis cai. No Mercado Livre, a compra também precisa atingir o mínimo exigido no cupom.</p>
<h3>O produto ou a categoria não participa</h3>
<p>Algumas categorias na Shopee ficam fora de promoções por restrição legal. Esses produtos não entram no cálculo do desconto nem do valor mínimo dos cupons (a exceção, segundo a Shopee, é o cupom de frete grátis), e um pedido só com eles não aceita cupom. No Mercado Livre, alguns vendedores e marcas não participam de determinadas campanhas de cupom.</p>
<h3>Forma de pagamento ou envio diferente da regra</h3>
<p>A Shopee lista tipo de produto, opção de pagamento ou envio e gasto mínimo entre os critérios que precisam ser cumpridos. Se o cupom é para um meio de pagamento específico, trocar o meio derruba o cupom.</p>
<h3>Cupom vencido, esgotado ou já usado</h3>
<p>Cupom tem validade e cota. Na Shopee, o código pode ter expirado, ter atingido o limite de usos ou já ter sido usado numa compra concluída. Se o cupom falhou numa tentativa de pagamento, a central de ajuda recomenda tentar de novo depois de 15 minutos.</p>
<h3>Cupom de novo usuário em conta antiga</h3>
<p>Cupom de primeira compra na Shopee é só para quem nunca concluiu uma transação na plataforma, e compra de crédito de jogo ou produto digital também conta. Também só dá para resgatar um benefício de novo usuário.</p>
<h3>Conta sem verificação</h3>
<p>A Shopee informa que o uso de cupom de desconto exige a conta verificada.</p>
<p>Se o código é válido, as regras batem e mesmo assim não entra, o caminho é o atendimento da própria plataforma: na Shopee, o chat do Atendimento ao Cliente no app; no Mercado Livre, a Ajuda do app.</p>

<h2>Cupom exclusivo de afiliado x cupom geral: qual é a diferença?</h2>
<p>Cupom geral é para qualquer cliente que cumpra a regra. Cupom exclusivo (ou nominal) é entregue a um afiliado ou influenciador para os seguidores dele, e costuma ter cota pequena. Nos termos do Programa de Afiliados da Shopee, o cupom nominal é de uso do afiliado que o recebeu, que pode compartilhá-lo com os próprios seguidores.</p>
<p>É por isso que, no Tem Descontos, descartamos oferta que depende de cupom pessoal de outro canal: se o preço só existe com o cupom de outra pessoa, a chance de você chegar e ver cupom indisponível é alta. Também conferimos o preço na própria loja antes de postar; se o preço anunciado está mais de 3% abaixo do preço da loja e não há cupom válido que explique, a oferta não sai.</p>
<p>E se você ficou com dúvida se comprar por link de oferta muda o preço, explicamos em <a href="/blog/link-de-afiliado-o-preco-muda">link de afiliado: o preço muda?</a>.</p>

<h2>Como não perder o cupom na hora de pagar</h2>
<ol>
<li>Resgate antes de ir para o carrinho e confira se ele está em Meus Cupons.</li>
<li>Leia o T&amp;C ou as condições: valor mínimo, produtos, pagamento e validade.</li>
<li>Monte o carrinho pensando no mínimo do cupom que vale mais.</li>
<li>No checkout, confira se o desconto apareceu antes de tocar em pagar.</li>
<li>Desconfie de preço que só existe com cupom que ninguém consegue usar: o preço riscado e o cupom precisam fazer sentido juntos, como mostramos em <a href="/guias/como-saber-se-a-promocao-e-verdadeira">como saber se a promoção é verdadeira</a>.</li>
<li>Cupom de valor alto em loja desconhecida não salva compra ruim. Antes, confira <a href="/blog/como-saber-se-loja-da-shopee-e-confiavel">se a loja da Shopee é confiável</a>.</li>
</ol>`,
  },
{
    slug: "compra-garantida-mercado-livre",
    titulo: "Compra Garantida do Mercado Livre: como funciona e como pedir o dinheiro de volta",
    metaTitle: "Compra Garantida Mercado Livre: prazos e como reclamar",
    metaDescription: "28 dias da compra se não chegar e até 30 do recebimento se vier com problema: veja como funciona a Compra Garantida do Mercado Livre e como pedir o reembolso.",
    resumo: "O que a Compra Garantida do Mercado Livre cobre, quais são os prazos oficiais e o passo a passo para abrir a reclamação e pedir o dinheiro de volta.",
    resumoRapido: [
      "Produto que não chegou: o Mercado Livre informa prazo de 28 dias a partir da data da compra para reclamar.",
      "Arrependimento ou problema no produto: prazo de até 30 dias a partir do recebimento, dependendo do motivo.",
      "A reclamação é aberta dentro da própria compra; se o vendedor não resolver, o Mercado Livre pode intervir.",
      "Compra combinada fora do site (Pix direto ao vendedor no WhatsApp) não tem essa proteção."
    ],
    dataPublicacao: "2026-10-18",
    revisadoEm: "outubro de 2026",
    dataRevisao: "2026-10-19",
    tags: ["compra garantida mercado livre", "como pedir reembolso no mercado livre", "produto não chegou mercado livre", "reclamação mercado livre", "mediação mercado livre"],
    servico: "grupo-de-ofertas-no-whatsapp-e-seguro",
    categoria: "garantias-das-lojas",
    imagem: "/blog/compra-garantida-mercado-livre.webp",
    faq: [
      { q: "Qual o prazo da Compra Garantida do Mercado Livre?", a: "Segundo a página oficial do programa, são 28 dias a partir da data da compra quando o produto não chega, e até 30 dias a partir do recebimento em caso de arrependimento ou problema no produto, dependendo do motivo." },
      { q: "Como pedir o dinheiro de volta no Mercado Livre?", a: "Abra a compra em Minhas compras, escolha a opção de problema com o pedido e descreva o que aconteceu. Se o vendedor não resolver, peça para o Mercado Livre intervir na reclamação." },
      { q: "A Compra Garantida vale se eu paguei o vendedor por Pix no WhatsApp?", a: "Não. O Mercado Livre condiciona a proteção a transações feitas totalmente dentro da plataforma. Pagamento combinado por fora fica sem essa cobertura." },
      { q: "Preciso pagar ou ativar a Compra Garantida?", a: "Não há nada para ativar: a proteção acompanha a compra feita e paga dentro do Mercado Livre, dentro das condições e prazos do programa." }
    ],
    fontes: [
      { nome: "Mercado Livre, página oficial Compra Garantida (consultada em 2026)", url: "https://www.mercadolivre.com.br/compra-garantida" },
      { nome: "Mercado Livre, Compra Garantida, página institucional (consultada em 2026)", url: "https://www.mercadolivre.com.br/institucional/nos-fazemos/compra-garantida" },
      { nome: "Mercado Livre, Central de ajuda: como funciona a devolução (consultada em 2026)", url: "https://www.mercadolivre.com.br/ajuda/devolucoes-expressas_3448" }
    ],
    conteudo: `<h2>O que é a Compra Garantida do Mercado Livre?</h2><p>A Compra Garantida é o programa de proteção do Mercado Livre que devolve o seu dinheiro quando a compra dá errado: o produto não chega, chega com problema ou é diferente do anunciado. Ela vem junto com a compra feita e paga dentro do site ou do app, dentro das condições do programa.</p><p>O ponto que mais confunde quem compra pela primeira vez é este: o Mercado Livre é um marketplace. Boa parte dos produtos é vendida por lojas e pessoas que anunciam lá dentro, e não pelo próprio Mercado Livre. A Compra Garantida existe justamente para que você não dependa só da boa vontade de quem vendeu. Se o vendedor some ou não resolve, a plataforma entra no meio.</p><h2>Quais são os prazos da Compra Garantida?</h2><p>A página oficial do programa informa dois prazos principais, e eles contam a partir de datas diferentes:</p><ul><li><strong>Produto que não chegou:</strong> 28 dias a partir da <strong>data da compra</strong>.</li><li><strong>Arrependimento ou produto com problema:</strong> até 30 dias a partir do <strong>recebimento</strong>, dependendo do motivo.</li></ul><p>O próprio Mercado Livre avisa que as condições de cobertura variam conforme o tipo de produto. Na prática, isso significa que a regra que vale é a que aparece na tela da sua compra. Antes de deixar o prazo correr, abra o pedido e confira o que está escrito ali. Como engenheiro, eu desconfio de número sem conta: marque no calendário o dia da compra e o dia em que o produto chegou, porque é a partir deles que os prazos andam.</p><p>Se a sua dúvida é sobre o direito de desistir da compra pela lei, e não pela regra da loja, nós explicamos à parte no post sobre <a href="/blog/direito-de-arrependimento-compra-online">direito de arrependimento na compra online</a>.</p><h2>O que a Compra Garantida cobre?</h2><p>Pelo que o Mercado Livre descreve no programa, a proteção cobre três tipos de situação:</p><ol><li><strong>Não entrega:</strong> você pagou e o produto não chegou dentro do prazo.</li><li><strong>Problema no produto:</strong> chegou quebrado, com defeito, diferente do anúncio ou incompleto.</li><li><strong>Arrependimento:</strong> você desistiu e quer devolver, dentro das condições do produto.</li></ol><p>Para produto com defeito que aparece depois de um tempo de uso, as regras de garantia do fabricante e da lei também entram na conta. Nós detalhamos esse caminho no post <a href="/blog/produto-com-defeito-comprado-online">produto com defeito comprado online</a>.</p><h2>O que a Compra Garantida não cobre?</h2><p>A regra de ouro: a proteção vale para transações feitas <strong>totalmente dentro da plataforma</strong>. A página institucional do programa fala em proteção desde que a compra seja feita dentro do Mercado Livre, usando Mercado Envios e Mercado Pago.</p><p>Isso deixa de fora um golpe bem comum. O vendedor (ou alguém se passando por ele) chama você no WhatsApp, oferece um "desconto para pagar por fora", manda uma chave Pix e pronto: o dinheiro saiu do sistema que protege você. Se o produto não chegar, não existe compra no Mercado Livre para reclamar. O mesmo vale para links que imitam o site, mas levam para outro endereço. Nós explicamos como reconhecer esse tipo de abordagem no guia <a href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro">grupo de ofertas no WhatsApp é seguro?</a>.</p><h2>Como abrir a reclamação e pedir o dinheiro de volta?</h2><p>A reclamação é aberta dentro da própria compra, pelo app ou pelo site. O caminho costuma ser este:</p><ol><li>Entre em <strong>Minhas compras</strong> e abra o pedido com problema.</li><li>Escolha a opção de ajuda com a compra e selecione o motivo (não chegou, chegou com defeito, é diferente do anúncio, me arrependi).</li><li>Descreva o que aconteceu de forma objetiva e anexe fotos do produto e da embalagem quando o problema for físico.</li><li>Acompanhe a conversa com o vendedor dentro da reclamação. Responda por ali, e não por WhatsApp ou e-mail.</li><li>Se o vendedor não resolver, peça para o Mercado Livre intervir (é a mediação).</li></ol><p>O nome exato dos botões muda de tempos em tempos, mas a lógica é sempre a mesma: tudo fica registrado dentro do pedido. Isso é o que dá força à sua reclamação.</p><h2>Como funciona a mediação do Mercado Livre?</h2><p>A mediação é quando o Mercado Livre entra na reclamação para decidir o caso. Segundo a página institucional do programa, se o vendedor não resolver, a equipe da Compra Garantida intervém para devolver o seu dinheiro. Até lá, vale a conversa direta com o vendedor dentro da reclamação, porque muitas vezes ele mesmo oferece troca, reenvio ou reembolso.</p><p>Três cuidados ajudam muito na mediação:</p><ul><li><strong>Prova:</strong> foto do produto, da etiqueta e da caixa, print do anúncio original.</li><li><strong>Tudo pelo chat do pedido:</strong> acordo feito por fora não aparece para quem vai analisar.</li><li><strong>Não descarte o produto</strong> antes do fim do caso, porque pode ser pedida a devolução.</li></ul><h2>Quanto tempo demora para o dinheiro voltar?</h2><p>Depende do meio de pagamento. O Mercado Livre informa que o reembolso segue o caminho do pagamento: o que foi pago com saldo volta para a conta do Mercado Pago, e o que foi pago no cartão de crédito aparece como estorno na fatura, conforme a data de fechamento. Como o prazo do banco não é igual para todo mundo, a resposta honesta é: varia. Acompanhe pela própria reclamação, que mostra quando o reembolso foi liberado.</p><h2>Situação x o que fazer</h2><table><thead><tr><th>Situação</th><th>O que fazer</th><th>Prazo informado pelo Mercado Livre</th></tr></thead><tbody><tr><td>Paguei e o produto não chegou</td><td>Abrir reclamação em Minhas compras, motivo "não recebi"</td><td>28 dias a partir da data da compra</td></tr><tr><td>Chegou com defeito ou quebrado</td><td>Abrir reclamação com fotos do produto e da embalagem</td><td>Até 30 dias a partir do recebimento, conforme o motivo</td></tr><tr><td>Chegou diferente do anúncio (cor, modelo, quantidade)</td><td>Abrir reclamação com print do anúncio e foto do que chegou</td><td>Até 30 dias a partir do recebimento, conforme o motivo</td></tr><tr><td>Me arrependi da compra</td><td>Pedir devolução pela própria compra</td><td>Até 30 dias a partir do recebimento, conforme o motivo e o produto</td></tr><tr><td>O vendedor não resolve</td><td>Pedir que o Mercado Livre intervenha na reclamação (mediação)</td><td>Dentro da reclamação já aberta</td></tr><tr><td>Paguei o vendedor por Pix ou link fora do site</td><td>Não há Compra Garantida; fale com seu banco na hora e registre boletim de ocorrência</td><td>Não se aplica</td></tr></tbody></table><h2>Como o Tem Descontos ajuda você a comprar com essa proteção?</h2><p>A forma mais simples de garantir a Compra Garantida é fechar a compra dentro do Mercado Livre. Por isso, no Tem Descontos, o link de cada oferta leva sempre para a loja oficial, nunca para site intermediário, e o grupo não pede dado, Pix ou código no privado. Se alguém chamar você em nome do grupo pedindo pagamento por fora, não é o Tem Descontos.</p><p>Também conferimos a oferta antes de postar. Para produto de catálogo do Mercado Livre (aqueles com endereço /p/MLB...), consultamos o preço na API do próprio Mercado Livre. Quando a oferta não pode ser conferida, ela só sai se tiver até 30 minutos. E se o link leva a um produto diferente do texto, por exemplo um kit com 3 unidades anunciado como 1, a oferta é descartada. Para checar um preço por conta própria, veja o guia <a href="/guias/como-saber-se-a-promocao-e-verdadeira">como saber se a promoção é verdadeira</a>. Quer usar cupom junto? O passo a passo está em <a href="/blog/cupom-shopee-e-mercado-livre-como-usar">cupom da Shopee e do Mercado Livre</a>.</p><h2>E na Amazon, funciona igual?</h2><p>Não exatamente. A Amazon tem um programa parecido para produtos de vendedores parceiros, com regras e prazos próprios. Explicamos tudo em <a href="/blog/garantia-de-a-a-z-amazon">Garantia de A a Z da Amazon: quando vale e como acionar</a>.</p>`,
  },
  {
    slug: "garantia-de-a-a-z-amazon",
    titulo: "Garantia de A a Z da Amazon: quando vale e como acionar",
    metaTitle: "Garantia de A a Z Amazon: quando vale e como acionar",
    metaDescription: "Você tem 90 dias após a data máxima de entrega para pedir a Garantia de A a Z da Amazon. Veja quando ela vale, o que cobre e o passo a passo para acionar.",
    resumo: "Quando a Garantia de A a Z da Amazon protege a sua compra de vendedor parceiro, quais são os prazos oficiais e como pedir o reembolso ou recorrer.",
    resumoRapido: [
      "A Garantia de A a Z protege compras de produtos vendidos e enviados por vendedores parceiros da Amazon.",
      "O pedido de reembolso deve ser feito em até 90 dias após a data máxima estimada de entrega.",
      "Em geral, primeiro você fala com o vendedor; sem solução em 48 horas, pode acionar a garantia.",
      "Contestar a cobrança no banco ou no cartão tira a elegibilidade da Garantia de A a Z."
    ],
    dataPublicacao: "2026-10-18",
    revisadoEm: "outubro de 2026",
    dataRevisao: "2026-10-19",
    tags: ["garantia de a a z amazon", "como acionar garantia amazon", "reembolso amazon vendedor parceiro", "produto não chegou amazon", "recorrer garantia de a a z"],
    servico: "grupo-de-ofertas-no-whatsapp-e-seguro",
    categoria: "garantias-das-lojas",
    imagem: "/blog/garantia-de-a-a-z-amazon.webp",
    faq: [
      { q: "Qual o prazo para pedir a Garantia de A a Z da Amazon?", a: "São 90 dias após a data máxima estimada de entrega, segundo a central de ajuda da Amazon Brasil." },
      { q: "A Garantia de A a Z vale para produto vendido pela própria Amazon?", a: "A garantia foi feita para produtos vendidos e enviados por vendedores parceiros. Quando quem vende é a Amazon, o problema é tratado pela política de devolução e pelo atendimento da própria Amazon." },
      { q: "Preciso falar com o vendedor antes de acionar a Garantia de A a Z?", a: "Na maioria dos casos, sim. A Amazon pode pedir que você contate o vendedor e aguarde 48 horas pela resposta antes de considerar o pedido elegível." },
      { q: "Meu pedido de Garantia de A a Z foi negado. Dá para recorrer?", a: "Sim. Se você tiver informações novas, pode recorrer em até 30 dias corridos após a decisão, pela página Seus pedidos." },
      { q: "Se eu contestar no cartão, ainda tenho a Garantia de A a Z?", a: "Não. A Amazon informa que quem contesta a cobrança com o emissor do cartão ou o banco deixa de ser elegível para a Garantia de A a Z." }
    ],
    fontes: [
      { nome: "Amazon.com.br, Central de ajuda: Garantia de A a Z (consultada em 2026)", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=GQ37ZCNECJKTFYQV" },
      { nome: "Amazon.com.br, Central de ajuda: Solicitar um reembolso da Garantia de A a Z (consultada em 2026)", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=GSZAYH7K2C2NVNC9" },
      { nome: "Amazon.com.br, Central de ajuda: Recorrer de um reembolso negado da Garantia de A a Z (consultada em 2026)", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=G9VEMT3X4FQET5DH" },
      { nome: "Amazon.com.br, Central de ajuda: Entrar em contato com um vendedor parceiro (consultada em 2026)", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=GLC8ZMBWMBTR6QZZ" },
      { nome: "Amazon.com.br, Central de ajuda: Política de devolução da Amazon (consultada em 2026)", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7" }
    ],
    conteudo: `<h2>O que é a Garantia de A a Z da Amazon?</h2><p>A Garantia de A a Z é a proteção da Amazon para quem compra de <strong>vendedores parceiros</strong>, as lojas que vendem dentro da Amazon. Segundo a central de ajuda da Amazon Brasil, ela protege a compra de produtos vendidos e enviados por um vendedor parceiro, e cobre tanto a entrega no prazo quanto a condição do produto.</p><p>Na prática, ela resolve o medo mais comum de quem compra de uma loja desconhecida dentro da Amazon: "e se o vendedor sumir?". Se o vendedor não resolve, a Amazon pode analisar o caso e devolver o dinheiro.</p><h2>Vendido pela Amazon ou por vendedor parceiro: qual a diferença?</h2><p>A diferença está em quem aparece como vendedor na página do produto, logo perto do botão de compra. Há dois cenários principais:</p><ul><li><strong>Vendido pela Amazon:</strong> a própria Amazon é a loja. Problema de entrega, defeito ou devolução é tratado direto com o atendimento da Amazon, pela <a href="https://www.amazon.com.br/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7" rel="noopener">política de devolução da Amazon</a>.</li><li><strong>Vendido por vendedor parceiro:</strong> outra empresa é a loja. Primeiro você fala com ela; se não houver solução, entra a Garantia de A a Z.</li></ul><p>Por isso, antes de comprar, vale olhar o nome do vendedor. Não é motivo para desconfiar de todo vendedor parceiro, mas é o que define qual caminho você vai seguir se der problema.</p><h2>Quando a Garantia de A a Z vale?</h2><p>A central de ajuda da Amazon lista os casos em que o pedido pode ser elegível. Os principais são:</p><ol><li><strong>O pacote não chegou:</strong> passaram três dias da última data estimada de entrega, ou o rastreamento mostra entrega (o que ocorrer primeiro), e você falou com o vendedor há mais de 48 horas sem resposta ou sem solução.</li><li><strong>O produto chegou danificado, com defeito ou diferente da descrição.</strong></li><li><strong>Problemas com a devolução:</strong> você pediu a devolução ao vendedor e ele não respondeu em até dois dias úteis.</li></ol><p>E há uma regra que pega muita gente: se você contestar a cobrança com o emissor do cartão ou com o banco, deixa de ser elegível para a Garantia de A a Z. Ou seja, escolha um caminho. Se o pedido está dentro das regras, acionar a garantia pela Amazon costuma ser o caminho mais direto.</p><h2>Qual é o prazo para acionar?</h2><p>O prazo oficial é de <strong>90 dias após a data máxima estimada de entrega</strong>. Não é a data em que você comprou, nem a data em que o produto chegou: é a data mais tardia da estimativa de entrega que aparece no pedido. Anote essa data quando a compra for importante. Como engenheiro, eu desconfio de número sem conta, e prazo contado da data errada é o jeito mais comum de perder um direito.</p><p>Se você quer saber o que a lei garante para desistir de uma compra online, independente da regra da Amazon, explicamos no post sobre <a href="/blog/direito-de-arrependimento-compra-online">direito de arrependimento</a>. E para defeito que aparece depois de um tempo de uso, veja <a href="/blog/produto-com-defeito-comprado-online">produto com defeito comprado online</a>.</p><h2>Como acionar a Garantia de A a Z, passo a passo?</h2><p>O caminho começa pelo vendedor e termina na Amazon, se precisar:</p><ol><li><strong>Fale com o vendedor</strong> pela própria Amazon: em <strong>Seus pedidos</strong>, abra o pedido e use a opção de contato com o vendedor. A Amazon pode pedir que você aguarde 48 horas pela resposta antes de aceitar o pedido de garantia.</li><li><strong>Sem solução, peça o reembolso:</strong> em Seus pedidos, localize o pedido, selecione <strong>Problema com o pedido</strong>, escolha o problema e depois <strong>Solicitação de reembolso</strong>.</li><li><strong>Explique o caso</strong> de forma objetiva e envie.</li><li><strong>Aguarde a análise:</strong> a Amazon informa que pode levar até uma semana para analisar as solicitações.</li></ol><p>Uma dica que vale ouro: mantenha toda a conversa com o vendedor dentro da Amazon. Mensagem trocada por WhatsApp ou e-mail pessoal não aparece para quem vai analisar o seu caso.</p><h2>E se o pedido for negado?</h2><p>Você pode recorrer. A central de ajuda da Amazon informa que, se o reembolso for negado e você tiver mais informações para a análise, é possível recorrer em até <strong>30 dias corridos após a decisão</strong>. O caminho é o mesmo: Seus pedidos, localizar o pedido, Problema com o pedido, <strong>Recorrer da decisão</strong>, escrever seus comentários e enviar. A Amazon diz que leva até uma semana para analisar os recursos, podendo levar mais em alguns casos, e responde pelo e-mail da conta.</p><p>Se você não precisar mais do reembolso (por exemplo, o vendedor resolveu), também dá para cancelar a solicitação antes da decisão.</p><h2>Situação x o que fazer</h2><table><thead><tr><th>Situação</th><th>O que fazer</th><th>Prazo informado pela Amazon</th></tr></thead><tbody><tr><td>Vendedor parceiro: pacote não chegou</td><td>Falar com o vendedor; sem solução, pedir reembolso da Garantia de A a Z</td><td>Três dias após a última data estimada de entrega (ou entrega no rastreio) e 48 horas sem solução do vendedor</td></tr><tr><td>Vendedor parceiro: chegou com defeito ou diferente</td><td>Falar com o vendedor; sem solução, acionar a garantia</td><td>Até 90 dias após a data máxima estimada de entrega</td></tr><tr><td>Vendido pela Amazon: qualquer problema</td><td>Usar a devolução e o atendimento da própria Amazon</td><td>Conforme a política de devolução da Amazon</td></tr><tr><td>Pedido de garantia negado</td><td>Recorrer da decisão com informação nova</td><td>Até 30 dias corridos após a decisão</td></tr><tr><td>Pensando em contestar no cartão</td><td>Saiba que isso tira a elegibilidade da Garantia de A a Z</td><td>Não se aplica</td></tr><tr><td>Pagou por fora (Pix, link fora da Amazon)</td><td>Não há compra na Amazon para proteger; fale com seu banco na hora</td><td>Não se aplica</td></tr></tbody></table><h2>A garantia protege compra fora da Amazon?</h2><p>Não. A Garantia de A a Z vale para pedidos feitos na Amazon. Golpe que começa com "o vendedor me chamou no WhatsApp" ou com um link que imita a loja não tem pedido na Amazon para reclamar. Explicamos como reconhecer esse tipo de golpe no guia <a href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro">grupo de ofertas no WhatsApp é seguro?</a>.</p><h2>Como o Tem Descontos posta as ofertas da Amazon?</h2><p>Antes de qualquer oferta da Amazon sair no grupo, conferimos o preço na própria página do produto na Amazon. Se o preço que veio de outro canal está mais de 3% abaixo do preço da loja e não há cupom que explique, a oferta é descartada. Se o link leva a um produto diferente do texto (outro modelo, ou um kit no lugar de uma unidade), também descarta. E o link sempre leva para a Amazon, nunca para site intermediário.</p><p>Repare que nós não publicamos preço de produto da Amazon neste blog: o preço muda e quem manda é a página da loja. Para conferir se um desconto é real, veja <a href="/guias/como-saber-se-a-promocao-e-verdadeira">como saber se a promoção é verdadeira</a>. Para os tipos de cupom que aparecem na Amazon, veja <a href="/guias/cupom-da-amazon-como-usar">cupom da Amazon: como usar</a>. E se você compra também no Mercado Livre, o programa equivalente de lá está explicado em <a href="/blog/compra-garantida-mercado-livre">Compra Garantida do Mercado Livre</a>.</p>`,
  },
  {
    slug: "link-de-afiliado-o-preco-muda",
    titulo: "Link de afiliado: o preço muda para quem compra?",
    metaTitle: "Link de afiliado: o preço muda para quem compra?",
    metaDescription: "Não: no link de afiliado quem paga a comissão é a loja, e o preço é o dela. Entenda a etiqueta do link, por que grupos de oferta existem e como evitar golpe.",
    resumo: "Como funciona o link de afiliado, por que o preço é o da loja, como reconhecer link oficial e quais regras de transparência valem para quem divulga ofertas.",
    resumoRapido: [
      "Quem paga a comissão do afiliado é a loja, não o comprador.",
      "Pelo acordo da Amazon, quem chega por link de associado é cliente da Amazon e segue os preços e regras dela.",
      "O link de afiliado leva para a loja oficial; o que muda é só uma etiqueta que identifica quem indicou.",
      "O CONAR e a Amazon pedem que a publicidade seja identificada de forma clara."
    ],
    dataPublicacao: "2026-10-18",
    revisadoEm: "outubro de 2026",
    dataRevisao: "2026-10-19",
    tags: ["link de afiliado", "link de afiliado muda o preço", "como funciona link de afiliado", "amazon associados", "por que grupo de ofertas é de graça"],
    servico: "grupo-de-ofertas-no-whatsapp-e-seguro",
    categoria: "ofertas-e-cupons",
    imagem: "/blog/link-de-afiliado-o-preco-muda.webp",
    faq: [
      { q: "Comprar por link de afiliado fica mais caro?", a: "Não. A comissão é paga pela loja ao afiliado. No caso da Amazon, o acordo do Programa de Associados diz que quem chega pelo link é cliente da Amazon e segue os preços e regras da própria Amazon." },
      { q: "O que é a tag no link da Amazon?", a: "É a identificação do associado, colocada como parâmetro no endereço do link. Ela serve para a Amazon saber quem indicou a compra e pagar a comissão." },
      { q: "Como saber se o link de afiliado é seguro?", a: "Confira se o endereço que abre é o domínio oficial da loja e se a compra acontece dentro do site ou app dela. Link que leva para outro site ou pede Pix direto é sinal de golpe." },
      { q: "Grupo de ofertas precisa avisar que ganha comissão?", a: "Sim. O CONAR pede identificação clara da publicidade e a Amazon exige que associados exibam o aviso de que recebem por compras qualificadas." }
    ],
    fontes: [
      { nome: "Amazon Associados, Acordo Operacional do Programa de Associados (consultado em 2026)", url: "https://associados.amazon.com.br/help/operating/agreement" },
      { nome: "Amazon Associados, Ajuda: declaração obrigatória de associado (consultada em 2026)", url: "https://associados.amazon.com.br/help/node/topic/GHQNZAU6669EZS98" },
      { nome: "Amazon.com.br, O que fazer e não fazer no Programa de Associados (consultada em 2026)", url: "https://www.amazon.com.br/b?ie=UTF8&node=104008255011" },
      { nome: "CONAR, Guia de Marketing e Publicidade por Influenciadores Digitais (edição 2026)", url: "https://www.conar.org.br/noticias/guia-de-marketing-e-publicidade-por-influenciadores-digitais" },
      { nome: "CONAR, Nossa História (lançamento do Guia em 2020)", url: "https://www.conar.org.br/nossa-historia" }
    ],
    conteudo: `<h2>O preço muda quando você compra por link de afiliado?</h2><p>Não. No link de afiliado, quem paga a comissão é a loja, e não quem compra. Você clica, cai na página oficial do produto e paga o preço que a loja está cobrando naquele momento, o mesmo que veria se tivesse chegado lá pela busca.</p><p>A Amazon deixa isso claro no Acordo Operacional do Programa de Associados: quem chega por um link de associado é cliente da Amazon, e todos os preços, termos de venda, regras e políticas da Amazon valem para essa pessoa. O afiliado não define preço, não cobra nada de você e não tem acesso ao seu pagamento.</p><h2>Como funciona um link de afiliado, de forma simples?</h2><p>Pense no link de afiliado como uma indicação com etiqueta. O endereço leva para a loja de sempre, mas carrega um pequeno código que diz "quem indicou foi fulano". Na Amazon, esse código se chama <strong>tag</strong>: é a identificação do associado, colocada como parâmetro no final do endereço. Quando alguém compra a partir daquele clique, a Amazon sabe de onde veio a venda e paga uma comissão a quem indicou.</p><p>Três coisas que a etiqueta <strong>não</strong> faz:</p><ul><li>Não muda o preço do produto.</li><li>Não muda o vendedor, o frete ou a garantia.</li><li>Não dá ao afiliado acesso ao seu cartão, ao seu endereço nem aos seus dados pessoais.</li></ul><p>A própria ajuda da Amazon Associados explica que nem é preciso que a identificação apareça no endereço até o fim da compra: a sessão de quem clicou é marcada automaticamente. Ou seja, se você apagar o final do link, nada muda para você. Só a indicação deixa de contar.</p><h2>Se o preço é o mesmo, por que grupos de oferta existem?</h2><p>Porque procurar oferta dá trabalho, e a loja paga por quem traz cliente. A Amazon descreve o seu programa como um programa de <strong>publicidade, e não de descontos</strong>. O grupo de ofertas é isso: um canal que encontra a promoção, confere e avisa você, e a loja remunera essa divulgação quando a compra acontece. Para você, o serviço sai de graça; para a loja, é um anúncio que só custa quando vende.</p><p>O que separa um grupo bom de um grupo ruim é o critério. Comissão existe nos dois. A diferença é se alguém conferiu se o desconto é real antes de postar. Para checar por conta própria, veja o guia <a href="/guias/como-saber-se-a-promocao-e-verdadeira">como saber se a promoção é verdadeira</a>.</p><h2>Como diferenciar link oficial da loja de link de golpe?</h2><p>O link de afiliado sério abre o site ou o app oficial da loja, e a compra acontece lá dentro; link que leva para outro endereço, pede Pix direto ou "confirmação de dados" é golpe, e explicamos os sinais no guia <a href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro">grupo de ofertas no WhatsApp é seguro?</a>.</p><p>Comprar dentro da loja também mantém as proteções dela, como a <a href="/blog/garantia-de-a-a-z-amazon">Garantia de A a Z da Amazon</a> e a <a href="/blog/compra-garantida-mercado-livre">Compra Garantida do Mercado Livre</a>. Pagamento feito por fora não tem nenhuma das duas.</p><h2>Quem divulga oferta precisa avisar que ganha comissão?</h2><p>Sim, e há regra para isso em dois lugares.</p><h3>O que diz o CONAR?</h3><p>O CONAR, órgão de autorregulamentação da publicidade no Brasil, lançou em dezembro de 2020 o Guia de Publicidade por Influenciadores Digitais. Em 2026 ele ganhou uma nova edição, o Guia de Marketing e Publicidade por Influenciadores Digitais, aprovada pelo Conselho do Conteúdo do CONAR. Entre os temas está a transparência e a identificação publicitária: quem recebe para divulgar precisa deixar isso claro para quem vê.</p><h3>O que exige a Amazon?</h3><p>O Programa de Associados da Amazon Brasil exige que o associado exiba de forma clara a frase: <strong>"Como associado da Amazon, eu recebo por compras qualificadas."</strong> A Amazon também proíbe que associados ofereçam incentivos (como cashback ou doações) para alguém comprar pelo link, e pede que preços e promoções eventualmente divulgados estejam corretos e atualizados, com os links removidos quando a promoção acaba.</p><h2>O que o Tem Descontos faz com os links?</h2><table><thead><tr><th>O que nós fazemos</th><th>Por que importa para você</th></tr></thead><tbody><tr><td>Link sempre para a loja oficial, nunca para site intermediário</td><td>A compra acontece na loja, com as proteções dela</td></tr><tr><td>Aviso de afiliado no rodapé do site</td><td>Você sabe que recebemos comissão da loja</td></tr><tr><td>Confere o preço na própria loja antes de postar, sempre que a loja permite</td><td>Oferta com preço mais de 3% abaixo do da loja, sem cupom que explique, é descartada</td></tr><tr><td>Descarta link que leva a produto diferente do texto</td><td>Nada de kit com 3 anunciado como 1 unidade</td></tr><tr><td>Tira do post o preço riscado com mais de 70% de desconto que a loja não confirma</td><td>Menos "De" inflado para enganar</td></tr><tr><td>Não pede dado, Pix ou código no privado</td><td>Se alguém pedir em nosso nome, é golpe</td></tr></tbody></table><p>Na Amazon, conferimos o preço na página do produto. Na Shopee, usamos a API oficial de afiliados. No Mercado Livre, consultamos a API da loja para produtos de catálogo. A comissão não entra nessa conta: oferta que não passa na conferência não sai, mesmo que renda comissão.</p><h2>Por que eu criei o Tem Descontos?</h2><p>Sou o Wellington Santos, engenheiro de produção e no mercado de seguros desde 2015, e criei o Tem Descontos para ter um grupo de ofertas que fizesse o que eu faria por conta própria antes de comprar. Conferimos o preço na loja antes de postar, descartamos o que não bate e mandamos sempre o link direto da loja. O aviso de afiliado fica à vista porque a comissão é o que mantém o grupo de graça para quem participa. Se quiser saber mais sobre quem está por trás do grupo, está tudo em <a href="/sobre">sobre o Tem Descontos</a>.</p><h2>Resumo para não esquecer</h2><ul><li>O link de afiliado leva para a loja oficial com uma etiqueta de indicação.</li><li>Quem paga a comissão é a loja; o preço, o frete e a garantia são os da loja.</li><li>Link que sai da loja ou pede Pix direto não é link de afiliado, é golpe.</li><li>Quem divulga precisa avisar que ganha comissão, pelo CONAR e pelas regras da Amazon.</li></ul>`,
  },
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
