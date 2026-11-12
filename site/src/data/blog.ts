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
    titulo: "Loja oficial da Shopee é confiável? Como saber se a loja é segura",
    metaTitle: "Loja oficial da Shopee é confiável? Veja como saber",
    metaDescription: "Loja Oficial é da própria marca e é a mais segura da Shopee. Veja como conferir o selo, a nota e as vendas, e o que muda na loja indicada e na loja comum.",
    resumo: "Os sinais que mostram se uma loja da Shopee merece seu dinheiro, com a mesma régua que o Tem Descontos usa antes de postar uma oferta.",
    resumoRapido: [
      "Confira nota (4,5 ou mais) e número de vendas (50 ou mais): é o mínimo que o Tem Descontos exige para postar um produto da Shopee.",
      "Produto caro (R$ 1.000 ou mais) só de Loja Oficial ou de Vendedor Indicado.",
      "Pague sempre dentro do app: a Garantia Shopee segura o pagamento ao vendedor até você confirmar que recebeu.",
      "Leia avaliações com foto e veja se o produto vem do exterior antes de fechar."
    ],
    dataPublicacao: "2026-10-18",
    revisadoEm: "outubro de 2026",
    dataRevisao: "2026-11-12",
    tags: ["loja oficial da shopee é confiável", "loja da shopee é confiável", "loja indicada shopee é confiável", "garantia shopee", "loja oficial shopee", "vendedor indicado shopee", "como comprar na shopee com segurança"],
    servico: "grupo-de-ofertas-no-whatsapp-e-seguro",
    categoria: "garantias-das-lojas",
    imagem: "/blog/como-saber-se-loja-da-shopee-e-confiavel.webp",
    faq: [
      { q: "Como saber se uma loja da Shopee é confiável?", a: "Olhe nota, número de vendas, avaliações com foto, selo (Oficial ou Indicado) e a taxa de resposta do chat na página da loja. No Tem Descontos, só postamos produto com nota 4,5 ou mais e 50 vendas ou mais." },
      { q: "A Garantia Shopee protege meu dinheiro?", a: "Sim, desde que você pague pelo app: segundo a central de ajuda da Shopee, o pagamento fica retido e só é repassado ao vendedor depois da confirmação do recebimento ou do fim do prazo de autoconfirmação." },
      { q: "Loja oficial da Shopee é confiável?", a: "Sim, é a opção mais segura dentro da Shopee: Loja Oficial é a loja da própria marca, identificada pelo selo vermelho Oficial, e a Shopee informa que os produtos vendidos ali são oficiais das marcas. Confira se o selo aparece na página da loja e pague sempre pelo app." },
      { q: "Loja indicada da Shopee é confiável?", a: "É um bom sinal, mas não uma garantia. Vendedor Indicado é uma loja comum que a Shopee selecionou pelo desempenho em avaliações, atendimento e envio. Olhe também a nota e o número de vendas do produto." },
      { q: "Posso confirmar o recebimento antes de o produto chegar?", a: "Não faça isso. A própria Shopee orienta a nunca confirmar o recebimento de um produto que não foi entregue, mesmo que o vendedor prometa brinde ou vantagem." }
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
    conteudo: `<p>A dúvida que mais chega antes de uma compra na Shopee é se dá para confiar na loja, principalmente quando o preço está bom demais. <strong>Loja Oficial da Shopee é confiável: é a loja da própria marca, com selo vermelho, e é a opção mais segura da plataforma. Loja indicada é um bom sinal, e loja comum pede que você confira nota, vendas e avaliações antes de pagar.</strong> Abaixo está como conferir cada uma, com a mesma régua que usamos antes de enviar uma oferta ao grupo.</p>

<h2>Como saber se uma loja da Shopee é confiável?</h2>
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

<h2>Loja Oficial da Shopee é confiável?</h2>
<p>Sim, é a opção mais segura dentro da Shopee. Loja Oficial é a loja da própria marca dentro da Shopee, marcada com um selo vermelho escrito Oficial na busca e na página da loja. A central de ajuda da Shopee descreve essas lojas como de grandes marcas, nacionais e internacionais, e a Shopee informa que os produtos vendidos ali são produtos oficiais das marcas.</p>
<p>Na prática, Loja Oficial é o lugar mais seguro para comprar eletrônico, eletrodoméstico e qualquer item em que falsificação é comum. Por isso a nossa regra: produto de R$ 1.000 para cima só sai no grupo se vier de Loja Oficial ou de Vendedor Indicado.</p>
<p>Dois cuidados que continuam valendo mesmo em Loja Oficial: confira se o selo aparece na página da loja, e não só no nome do anúncio, e chegue até ela pelo app ou pelo site da Shopee. Selo verdadeiro em link falso não protege ninguém.</p>

<h2>Loja indicada da Shopee é confiável?</h2>
<p>É um bom sinal, mas não uma garantia. Vendedor Indicado (a loja indicada) é um vendedor que a Shopee selecionou por entregar uma experiência de compra melhor, e ele aparece com um rótulo próprio na página do produto e na busca. Segundo a central de ajuda, para manter o selo a loja precisa sustentar boas avaliações, bom atendimento e envio rápido. A central de ajuda para compradores não informa a meta exata de cada indicador, então trate o selo como um bom sinal, não como garantia.</p>
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
<p>Link falso é outro problema, anterior à loja: antes de olhar nota e selo, confira se o endereço abre o app ou o site oficial da Shopee, e veja como reconhecer golpe de link em <a href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro">grupo de ofertas no WhatsApp é seguro?</a>. Se a oferta estiver em um site fora da Shopee, as checagens são outras: <a href="/blog/como-saber-se-um-site-e-confiavel">como saber se um site de compras é confiável</a>. No Tem Descontos o link vai sempre para a loja oficial, nunca para site intermediário, e ninguém do grupo pede dado, Pix ou código no privado.</p>

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
    metaTitle: "Garantia de A a Z da Amazon: como acionar e quando vale",
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
  {
    slug: "historico-de-preco-como-consultar",
    titulo: "Histórico de preço: como consultar e ler antes de comprar",
    metaTitle: "Histórico de preço: como consultar e ler antes de comprar",
    metaDescription: "Veja onde consultar o histórico de preço de um produto, como ler o gráfico em 4 passos e o que fazer quando ele não existe, para saber se o desconto é real.",
    resumo: "O histórico de preço mostra quanto o produto custava antes da promoção. Veja onde consultar, como ler o gráfico e o que fazer quando o produto não tem histórico.",
    resumoRapido: [
      "Zoom e Buscapé mostram o gráfico de histórico na página do produto, de graça.",
      "Compare o preço de hoje com o menor preço do período, não com o preço riscado.",
      "Produto sem gráfico: anote o preço com data ou guarde print, como orientam os Procons.",
      "No Brasil não achamos lei que obrigue a loja a mostrar o menor preço dos últimos dias; vale a proibição de publicidade enganosa do CDC."
    ],
    dataPublicacao: "2026-11-10",
    revisadoEm: "novembro de 2026",
    tags: ["histórico de preço", "como ver histórico de preço", "gráfico de preço", "alerta de preço", "menor preço dos últimos 30 dias"],
    servico: "como-saber-se-a-promocao-e-verdadeira",
    categoria: "ofertas-e-cupons",
    imagem: "/blog/historico-de-preco-como-consultar.webp",
    faq: [
      { q: "Onde vejo o histórico de preço de um produto?", a: "Em comparadores como Zoom e Buscapé, que mostram um gráfico na página do produto. O Zoom informa períodos de 40 dias, 3 meses, 6 meses ou 1 ano. Nem todo produto tem histórico." },
      { q: "Como saber se o desconto é real pelo gráfico?", a: "Compare o preço de hoje com o menor preço do período e veja se ele subiu nas semanas antes da promoção. Se o preço \"com desconto\" está igual ou acima do que o produto custava antes, o desconto não existe." },
      { q: "A loja é obrigada a mostrar o menor preço dos últimos 30 dias?", a: "Na União Europeia, sim, quando anuncia redução de preço. No Brasil não encontramos norma federal equivalente. O que vale é o Código de Defesa do Consumidor, que proíbe publicidade enganosa (art. 37)." },
      { q: "O que fazer se o produto não tem histórico de preço?", a: "Anote o preço com a data ou guarde uma captura de tela, e repita por algumas semanas. Os Procons orientam monitorar os preços antes das promoções e guardar os registros." },
      { q: "Alerta de preço funciona?", a: "Funciona para avisar quando o produto chega ao valor que você escolheu. Zoom e Buscapé oferecem alerta por e-mail ou WhatsApp. O alerta não confere se é o mesmo modelo ou o frete: isso continua com você." },
    ],
    fontes: [
      { nome: "Senacon: cartilha Black Friday, boas compras exigem atenção (edição 2025)", url: "https://www.gov.br/mj/pt-br/assuntos/arquivos-imprensa/senacon/cartilha-black-friday-senacon-2025" },
      { nome: "Zoom, central de ajuda: histórico de preços", url: "https://tiresuaduvida.zoom.com.br/hc/pt-br/articles/360018658371" },
      { nome: "Buscapé: histórico de preços", url: "https://www.buscape.com.br/landing-page/historico-de-precos-buscape" },
      { nome: "Procon-SP: de olho na Black Friday, recomendações (2025)", url: "https://www.procon.sp.gov.br/de-olho-na-black-friday-procon-sp-promove-iniciativas-para-auxiliar-o-consumidor-paulista-que-pretende-realizar-compras-neste-periodo/" },
      { nome: "Procon-SP: consulta sobre a Black Friday com 329 consumidores (2025)", url: "https://www.procon.sp.gov.br/consulta-inedita-do-procon-sp-revela-que-consumidores-desconfiam-das-ofertas-mas-reagem-aos-gatilhos-de-marketing-da-black-friday/" },
      { nome: "Procon Vitória: pesquisa de preços antes da Black Friday (2025)", url: "https://www.vitoria.es.gov.br/noticia/black-friday-procon-vitoria-publica-pesquisa-que-aponta-aumento-de-precos-e-alerta-consumidor-55138" },
      { nome: "Procon-ES: orientação para monitorar preços antes da Black Friday (2026)", url: "https://www.es.gov.br/procon-es-orienta-consumidores-a-monitorar-precos-antes-da-black-friday" },
      { nome: "Procon-PR: cuidados essenciais na Black Friday", url: "https://www.parana.pr.gov.br/aen/Noticia/Economia-sem-dor-de-cabeca-Procon-PR-alerta-para-cuidados-essenciais-na-Black-Friday" },
      { nome: "Código de Defesa do Consumidor, Lei 8.078/1990, texto compilado (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" },
      { nome: "Decreto 5.903/2006, oferta e afixação de preços (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/decreto/d5903.htm" },
      { nome: "Diretiva (UE) 2019/2161, indicação de redução de preço (EUR-Lex)", url: "https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32019L2161" },
    ],
    conteudo: `<p>Todo "50% OFF" parte de um preço que você não viu. O histórico de preço mostra quanto o produto custava de verdade nas últimas semanas, e é a conferência que a Senacon recomenda antes de comprar em promoção. <strong>Para consultar, abra a página do produto em um comparador como Zoom ou Buscapé e veja o gráfico; para ler, compare o preço de hoje com o menor preço do período, não com o preço riscado.</strong> Abaixo estão o passo a passo e o que fazer quando o produto não tem gráfico.</p>

<h2>O que é o histórico de preço?</h2>
<p>É o registro de quanto um produto custou ao longo do tempo, normalmente em forma de gráfico: no eixo de baixo ficam as datas, no eixo do lado fica o preço. Com ele você responde a única pergunta que importa em uma promoção: o preço de hoje é baixo perto do que esse produto costuma custar?</p>
<p>A Senacon, órgão do Ministério da Justiça, coloca isso na cartilha de Black Friday (edição 2025): a orientação é pesquisar o histórico de preços para confirmar se o desconto é real.</p>

<h2>Onde consultar o histórico de preço?</h2>
<p>Em comparadores de preço, que guardam o valor do produto em várias lojas. Os dois abaixo mostram o gráfico de graça, na página do produto.</p>
<table>
<thead><tr><th>Onde</th><th>O que mostra</th><th>Período</th><th>Alerta de preço</th></tr></thead>
<tbody>
<tr><td>Zoom</td><td>Gráfico na página do produto, com o menor valor que ele já atingiu</td><td>40 dias, 3 meses, 6 meses ou 1 ano</td><td>WhatsApp e e-mail</td></tr>
<tr><td>Buscapé</td><td>Gráfico na página do produto</td><td>De 40 dias a 1 ano, conforme a página (confira na tela)</td><td>E-mail ou WhatsApp</td></tr>
<tr><td>Seu próprio registro</td><td>O preço que você anotou, com data e loja</td><td>O tempo que você acompanhar</td><td>Não tem</td></tr>
</tbody>
</table>
<p>Um aviso que o próprio Zoom faz: nem todo produto tem histórico. Produto novo, modelo pouco vendido ou vendido só em uma loja costuma ficar sem gráfico. Para esses casos vale o registro próprio, explicado mais abaixo.</p>

<h2>Como ler o gráfico em 4 passos?</h2>
<ol>
<li><strong>Escolha o período mais longo.</strong> Quarenta dias mostram só o mês da promoção. O Procon do Paraná orienta conferir os valores de três meses, seis meses ou um ano atrás.</li>
<li><strong>Ache o menor preço do período.</strong> É com ele que o preço de hoje deve ser comparado. O preço riscado ao lado do desconto é escolhido pela loja; o menor preço do gráfico é fato.</li>
<li><strong>Olhe as semanas antes da promoção.</strong> Se a linha sobe pouco antes de cair, o desconto pode ser só a devolução do aumento.</li>
<li><strong>Confirme que é o mesmo produto.</strong> Modelo, voltagem, cor e quantidade precisam bater. E some o frete: um preço menor com frete alto pode sair mais caro.</li>
</ol>
<p>Um exemplo com a conta feita. Um produto custou R$ 200 durante meses, subiu para R$ 260 e agora aparece "de R$ 260 por R$ 208, 20% OFF". O anúncio não mente na matemática, mas o gráfico mostra que R$ 208 é 4% mais caro do que os R$ 200 de antes. Como engenheiro, eu só acredito no desconto depois dessa conta.</p>
<p>O preço riscado inflado tem um guia só dele: <a href="/guias/como-saber-se-a-promocao-e-verdadeira">como saber se a promoção é verdadeira</a>.</p>

<h2>E quando o produto não tem histórico?</h2>
<p>Você monta o seu. É simples e é o que os Procons orientam: o Procon do Espírito Santo, em outubro de 2026, recomendou monitorar os preços antes da Black Friday e guardar capturas de tela com a data.</p>
<ul>
<li>Anote o produto com modelo exato, a loja, o preço e a data.</li>
<li>Repita uma vez por semana, no mesmo dia.</li>
<li>Guarde print da página com a data visível. Se o preço anunciado não for cumprido, é a sua prova.</li>
<li>Se a loja tiver alerta de preço ou lista de desejos, ative: ajuda a não esquecer.</li>
</ul>
<p>Quatro anotações já mostram se o preço está parado, subindo ou caindo. Quem começa agora chega na <a href="/blog/black-friday-2026-quando-e">Black Friday 2026</a> com um histórico próprio de várias semanas.</p>

<h2>A loja é obrigada a mostrar o menor preço dos últimos dias?</h2>
<p>No Brasil, não encontramos norma federal que obrigue. É diferente da União Europeia, onde a Diretiva 2019/2161 determina que todo anúncio de redução indique o preço anterior, definido como o menor preço praticado pela loja em um período de pelo menos 30 dias antes da redução.</p>
<p>Por aqui o que existe é:</p>
<ul>
<li><strong>Recomendação do Procon-SP</strong> (2025), enviada a empresas com mais reclamações: aplicar o desconto sobre o menor preço praticado nos últimos 60 dias. É uma boa prática sugerida, não uma lei.</li>
<li><strong>Código de Defesa do Consumidor, art. 37:</strong> "É proibida toda publicidade enganosa ou abusiva." Desconto calculado sobre um preço que nunca foi praticado pode ser enquadrado aqui.</li>
<li><strong>Decreto 5.903/2006:</strong> a informação de preço precisa ter "correção", definida como "a informação verdadeira que não seja capaz de induzir o consumidor em erro".</li>
<li><strong>Projeto de lei:</strong> o PL 2849/2015, na Câmara dos Deputados, propõe a exibição do histórico de 30 dias. Não é lei.</li>
</ul>
<p>Encontrou desconto falso? Guarde os prints e registre a reclamação no consumidor.gov.br ou no Procon do seu estado.</p>

<h2>O preço sobe mesmo antes da Black Friday?</h2>
<p>Há levantamentos de Procons que mostram que sim, em parte dos produtos. Dois de 2025:</p>
<ul>
<li>O Procon de Vitória (ES) acompanhou 10 produtos em 5 lojas entre 30 de outubro e 24 de novembro de 2025 e informou que 80% dos produtos monitorados ficaram mais caros às vésperas da Black Friday. A amostra é pequena e local, mas é preço medido.</li>
<li>O Procon-SP ouviu 329 consumidores entre 30 de outubro e 17 de novembro de 2025: 76,47% dos que costumam comprar na Black Friday disseram já ter se sentido enganados ao menos uma vez. É uma enquete de adesão voluntária, não uma pesquisa estatística.</li>
</ul>
<p>Nenhum dos dois prova que toda oferta é falsa. Eles mostram por que vale gastar dois minutos no gráfico antes de pagar. Se a dúvida é comprar agora ou esperar a sexta, veja <a href="/blog/esquenta-black-friday-comprar-antes-ou-esperar">esquenta Black Friday: comprar antes ou esperar</a>.</p>

<h2>O que o Tem Descontos confere no preço?</h2>
<p>Não temos gráfico de histórico no grupo. O que fazemos é conferir o preço na própria loja antes de enviar a oferta, com estas regras:</p>
<table>
<thead><tr><th>O que conferimos</th><th>O que acontece se falhar</th></tr></thead>
<tbody>
<tr><td>Preço anunciado contra o preço na loja (página da Amazon, API oficial de afiliados da Shopee, API do Mercado Livre para produto de catálogo)</td><td>Mais de 3% abaixo do preço da loja sem cupom que explique: oferta descartada</td></tr>
<tr><td>Preço riscado com mais de 70% de desconto</td><td>Se a loja não confirma, o preço riscado sai do post</td></tr>
<tr><td>Produto do link contra o produto do texto (nome e quantidade)</td><td>Produto diferente: oferta descartada</td></tr>
</tbody>
</table>
<p>Essa conferência diz que o preço do post é o preço da loja naquele momento. Ela não diz se aquele é o menor preço do ano: essa parte é o histórico, e continua valendo a pena olhar. Mais sobre o nosso método em <a href="/sobre">sobre o Tem Descontos</a>.</p>

<h2>Resumo para não esquecer</h2>
<ul>
<li>Histórico de preço é o gráfico de quanto o produto custou ao longo do tempo.</li>
<li>Zoom e Buscapé mostram de graça; escolha o período mais longo.</li>
<li>Compare com o menor preço do período e desconfie de alta pouco antes da promoção.</li>
<li>Sem gráfico, anote preço e data toda semana e guarde print.</li>
<li>Desconto sobre preço que nunca existiu é publicidade enganosa (CDC, art. 37).</li>
</ul>`,
  },
  {
    slug: "esquenta-black-friday-comprar-antes-ou-esperar",
    titulo: "Esquenta Black Friday: comprar antes ou esperar o dia?",
    metaTitle: "Esquenta Black Friday: comprar antes ou esperar o dia?",
    metaDescription: "A Black Friday 2026 é em 27 de novembro, mas as ofertas já começaram. Veja quando vale comprar no esquenta, quando esperar e o que fazer se o preço cair.",
    resumo: "As lojas começaram as ofertas semanas antes de 27 de novembro. Veja a regra para decidir entre comprar no esquenta ou esperar, e o que a lei garante se o preço cair depois.",
    resumoRapido: [
      "Esquenta é a antecipação de ofertas antes da Black Friday, que em 2026 cai em 27 de novembro. Não existe regra de data: cada loja decide.",
      "Compre antes se o preço de hoje é o menor do seu histórico e você precisa do produto; se não, espere.",
      "A lei não obriga a loja a devolver a diferença se o preço cair depois.",
      "Em compra online, o art. 49 do CDC dá 7 dias, contados do recebimento, para desistir sem dar motivo."
    ],
    dataPublicacao: "2026-11-10",
    revisadoEm: "novembro de 2026",
    tags: ["esquenta black friday", "esquenta black friday vale a pena", "black november", "comprar antes da black friday", "preço caiu depois da compra"],
    servico: "como-saber-se-a-promocao-e-verdadeira",
    categoria: "ofertas-e-cupons",
    imagem: "/blog/esquenta-black-friday-comprar-antes-ou-esperar.webp",
    faq: [
      { q: "O que é o esquenta Black Friday?", a: "É o período em que as lojas antecipam ofertas nas semanas antes da Black Friday. Em 2026 a data oficial é sexta-feira, 27 de novembro, mas não existe regra que diga quando as promoções começam: cada loja define." },
      { q: "Vale a pena comprar no esquenta?", a: "Vale quando o preço de hoje é o menor do histórico que você acompanhou e você precisa do produto. Se o preço está igual ou acima do que era semanas atrás, é melhor esperar e continuar acompanhando." },
      { q: "Se o preço cair depois que eu comprar, a loja devolve a diferença?", a: "A lei não obriga. A Amazon informa na central de ajuda que não oferece equiparação de preço. Nas outras lojas não encontramos política de devolução de diferença. O que a lei garante é o arrependimento em 7 dias na compra online." },
      { q: "A Black Friday ainda concentra as vendas de novembro?", a: "Cada vez menos. Segundo a Confi Neotrust, só 23,5% do faturamento do e-commerce em novembro de 2025 ficou nos quatro dias da Black Friday. Mesmo assim, a sexta continuou sendo o maior dia de vendas." },
    ],
    fontes: [
      { nome: "Senacon, Ministério da Justiça: Black Friday 2025, orientações (2025)", url: "https://www.gov.br/mj/pt-br/assuntos/noticias/black-friday-2025-senacon-orienta-consumidores-a-evitar-golpes-e-comprar-com-seguranca" },
      { nome: "Procon-SP: Black Friday, orientações", url: "https://www.procon.sp.gov.br/black-friday-procon-sp-orienta/" },
      { nome: "Código de Defesa do Consumidor, Lei 8.078/1990, texto compilado (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" },
      { nome: "Amazon, central de ajuda: equiparação de preço", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=G9EAYKPV5YYDB8P7" },
      { nome: "Amazon, central de ajuda: pré-venda com Preço Mais Baixo Garantido", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=G4BRP7LCB9DSDNCR" },
      { nome: "Magazine Luiza, relações com investidores: comunicado de 25/11/2025", url: "https://ri.magazineluiza.com.br/Download.aspx?Arquivo=0CCMAFtkSMACp8HoEgGP4A%3D%3D" },
      { nome: "CNN Brasil: Black Friday 2026 deve movimentar R$ 13,3 bi, projeção Confi Neotrust (2026)", url: "https://www.cnnbrasil.com.br/economia/money/macroeconomia/black-friday-2026-deve-movimentar-r-133-bi-no-e-commerce-diz-pesquisa/" },
      { nome: "CNN Brasil: faturamento do e-commerce na Black Friday 2025, Confi Neotrust (2025)", url: "https://www.cnnbrasil.com.br/economia/macroeconomia/faturamento-do-e-commerce-atinge-r-476-bi-na-black-friday-diz-pesquisa/" },
      { nome: "E-Commerce Brasil: véspera da Black Friday 2025, Confi Neotrust (2025)", url: "https://www.ecommercebrasil.com.br/noticias/vespera-da-black-friday-registra-aumento-de-34-no-faturamento-do-e-commerce-mostra-confi-neotrust" },
      { nome: "E-Commerce Brasil: Black November 2024, Confi Neotrust (2024)", url: "https://www.ecommercebrasil.com.br/noticias/black-november-faturamento-total-no-mes-foi-de-r-367-bilhoes-mostra-confi-neotrust" },
      { nome: "Magazine Luiza: página da Black Friday 2026", url: "https://www.magazineluiza.com.br/lp/black-friday" },
      { nome: "InvestNews: quando é a Black Friday 2026 e quando começam as ofertas (2026)", url: "https://investnews.com.br/economia/quando-black-friday-2026-ofertas/" },
      { nome: "Exame: Mercado Livre na Black Friday 2026 (2026)", url: "https://exame.com/invest/mercados/mercado-livre-tera-24x-sem-juros-e-mais-de-r-100-mi-em-cupons-na-black-friday-2026/" },
    ],
    conteudo: `<p>Faltam poucos dias para a Black Friday e as lojas já estão em promoção há semanas. A dúvida de quem tem uma compra planejada é sempre a mesma: levo agora ou espero a sexta? <strong>Compre no esquenta se o preço de hoje é o menor do histórico que você acompanhou e você precisa do produto; se o preço está igual ou acima do que era semanas atrás, espere.</strong> E se comprar online e o preço cair depois, a lei não garante a diferença, mas garante 7 dias para desistir.</p>

<h2>O que é o esquenta Black Friday?</h2>
<p>É a antecipação das ofertas nas semanas antes da data oficial, que em 2026 é sexta-feira, 27 de novembro. O mês inteiro de promoção ganhou até apelido no comércio: Black November.</p>
<p>Não existe regra que diga quando a promoção começa ou termina. Cada loja define o próprio calendário, e algumas começaram em outubro. O que cada uma anunciou para 2026:</p>
<table>
<thead><tr><th>Loja</th><th>O que foi anunciado para 2026</th><th>De onde vem a informação</th></tr></thead>
<tbody>
<tr><td>Amazon</td><td>Ofertas antecipadas de 3 a 19 de novembro</td><td>InvestNews</td></tr>
<tr><td>Mercado Livre</td><td>Mais de R$ 100 milhões em cupons e parcelamento em até 24 vezes sem juros no cartão Mercado Pago, em produtos selecionados, a partir de 11 de novembro</td><td>Exame</td></tr>
<tr><td>Shopee</td><td>Campanha do 11.11 de 28 de outubro a 12 de novembro e Black Friday de 13 a 29 de novembro</td><td>InvestNews</td></tr>
<tr><td>Magalu</td><td>Dia principal em 27 de novembro, com ofertas ao longo do mês</td><td>Página da Black Friday do Magalu</td></tr>
</tbody>
</table>
<p>Datas de campanha mudam. Antes de se programar, confira na página da loja. O calendário das outras datas está em <a href="/blog/calendario-de-promocoes-datas-de-desconto">calendário de promoções</a>.</p>

<h2>O esquenta já vende mais que a sexta?</h2>
<p>Somado, sim. A sexta-feira ainda é o maior dia isolado, mas a maior parte das vendas de novembro acontece fora dela. Os números são da Confi Neotrust, que mede o e-commerce brasileiro:</p>
<ul>
<li>Em novembro de 2024, a Black Friday respondeu por 24,6% do faturamento do mês.</li>
<li>Em novembro de 2025, só 23,5% do faturamento ficou nos quatro dias da Black Friday, de quinta a domingo.</li>
<li>Na sexta, 28 de novembro de 2025, o e-commerce faturou R$ 4,76 bilhões, alta de 11,2% sobre 2024. Na véspera, quinta-feira, foram R$ 2,28 bilhões, alta de 34,1%.</li>
<li>Para 2026, a projeção é de R$ 13,3 bilhões entre 26 e 29 de novembro.</li>
</ul>
<p>O que esses números dizem: tem muita gente comprando antes. O que eles não dizem: se o preço de antes é melhor que o do dia. Não encontramos dado confiável que compare o desconto médio do esquenta com o da sexta. Por isso a decisão precisa ser por produto, com o seu histórico.</p>

<h2>Como decidir entre comprar agora ou esperar?</h2>
<p>Com três perguntas, nessa ordem.</p>
<ol>
<li><strong>O preço de hoje é o menor do meu histórico?</strong> Se você anotou o preço nas últimas semanas ou consultou o gráfico em um comparador, a resposta está ali. Explicamos como em <a href="/blog/historico-de-preco-como-consultar">histórico de preço: como consultar e ler</a>.</li>
<li><strong>Eu preciso disso antes do dia 27?</strong> Se precisa, o risco de esperar é ficar sem estoque ou receber depois. Se não precisa, esperar custa pouco.</li>
<li><strong>A loja promete alguma coisa sobre o preço do dia?</strong> Algumas ofertas vêm com promessa de que o preço não vai baixar. Leia a regra antes de contar com ela.</li>
</ol>
<p>A regra prática: preço no menor valor do histórico e produto necessário, compre. Preço no patamar de sempre com uma etiqueta de esquenta, espere e continue anotando. A Senacon alerta que, em alguns casos, os valores são aumentados dias antes da Black Friday para parecerem grandes promoções. O sinal disso é o preço riscado inflado, que mostramos como checar no guia <a href="/guias/como-saber-se-a-promocao-e-verdadeira">como saber se a promoção é verdadeira</a>.</p>

<h2>Se o preço cair depois, a loja devolve a diferença?</h2>
<p>Não existe lei que obrigue. Depende da política de cada loja, e o que encontramos foi isto:</p>
<table>
<thead><tr><th>Loja</th><th>O que encontramos sobre queda de preço depois da compra</th></tr></thead>
<tbody>
<tr><td>Amazon</td><td>A central de ajuda informa que a loja não oferece equiparação de preço. A exceção é a pré-venda com "Preço Mais Baixo Garantido", em que a diferença até a data de lançamento é reembolsada automaticamente. A ajuda também avisa que colocar o item no carrinho não reserva o preço</td></tr>
<tr><td>Mercado Livre</td><td>Não encontramos política de devolução de diferença de preço</td></tr>
<tr><td>Shopee</td><td>Não encontramos política de devolução de diferença de preço</td></tr>
<tr><td>Magalu</td><td>Na campanha de 2025, o comunicado da empresa falava em ofertas "Agora ou Nunca", com "preços que não voltam mais baratos" no dia da Black Friday. Não encontramos o regulamento. Em 2026, confira a regra da oferta na página da loja</td></tr>
</tbody>
</table>
<p>"Não encontramos" quer dizer isso mesmo: procuramos nas páginas oficiais e não achamos. Se a loja tiver uma regra nova, vale o que está escrito na oferta. Promessa de preço anunciada obriga a loja a cumprir (CDC, art. 30), então guarde o print.</p>

<h2>O que a lei garante se eu me arrepender?</h2>
<p>Em compra pela internet, você pode desistir em 7 dias sem explicar o motivo. O art. 49 do Código de Defesa do Consumidor diz: "O consumidor pode desistir do contrato, no prazo de 7 dias a contar de sua assinatura ou do ato de recebimento do produto ou serviço, sempre que a contratação de fornecimento de produtos e serviços ocorrer fora do estabelecimento comercial, especialmente por telefone ou a domicílio."</p>
<p>A Senacon explica que o prazo conta do recebimento, vale independentemente do motivo, e que o reembolso deve ser integral, incluindo o frete. Isso não vale para compra feita dentro da loja física.</p>
<p>Na prática: se você comprou no esquenta, o produto chegou e o preço caiu de forma relevante dentro dos 7 dias, desistir é um direito seu. Pese o trabalho de devolver e o risco de o estoque acabar antes de recomprar. O passo a passo está em <a href="/blog/direito-de-arrependimento-compra-online">direito de arrependimento na compra online</a>.</p>

<h2>O que o Tem Descontos confere nas ofertas de esquenta?</h2>
<p>As mesmas coisas que confere o ano todo. Em novembro o volume de ofertas sobe, a régua não muda:</p>
<table>
<thead><tr><th>O que conferimos</th><th>O que acontece se falhar</th></tr></thead>
<tbody>
<tr><td>Preço anunciado contra o preço na própria loja</td><td>Mais de 3% abaixo do preço da loja sem cupom que explique: oferta descartada</td></tr>
<tr><td>Preço riscado com mais de 70% de desconto</td><td>Se a loja não confirma, o preço riscado sai do post</td></tr>
<tr><td>Produto do link contra o produto do texto</td><td>Nome ou quantidade diferente: oferta descartada</td></tr>
<tr><td>Destino do link</td><td>Sempre a loja oficial, nunca site intermediário</td></tr>
</tbody>
</table>
<p>Nós conferimos se o preço do post é o da loja naquele momento. Se ele é o melhor do mês, quem responde é o seu histórico.</p>

<h2>Resumo para não esquecer</h2>
<ul>
<li>Esquenta é oferta antecipada; cada loja define as datas.</li>
<li>Menor preço do seu histórico e produto necessário: compre. Preço de sempre com etiqueta nova: espere.</li>
<li>A lei não garante a diferença se o preço cair; a Amazon informa que não faz equiparação.</li>
<li>Compra online tem 7 dias para arrependimento, contados do recebimento (CDC, art. 49).</li>
<li>Guarde print de toda promessa de preço.</li>
</ul>`,
  },
  {
    slug: "cyber-monday-2026-quando-e",
    titulo: "Cyber Monday 2026: quando é e o que muda da Black Friday",
    metaTitle: "Cyber Monday 2026: quando é e o que muda da Black Friday",
    metaDescription: "A Cyber Monday 2026 é na segunda-feira, 30 de novembro. Veja de onde vem a data, o tamanho dela no Brasil e se vale esperar por ela depois da Black Friday.",
    resumo: "A Cyber Monday 2026 cai na segunda-feira, 30 de novembro, três dias depois da Black Friday. Veja a diferença entre as duas datas e se vale a pena esperar.",
    resumoRapido: [
      "A Cyber Monday 2026 é na segunda-feira, 30 de novembro, a segunda-feira seguinte à Black Friday (27 de novembro).",
      "O nome foi criado em 2005 nos Estados Unidos pela Shop.org, ligada à federação do varejo americano.",
      "No Brasil ela é bem menor: em 2024 faturou R$ 1,47 bilhão, cerca de um terço da sexta de Black Friday (Confi Neotrust).",
      "Seus direitos são os mesmos de qualquer compra online, incluindo os 7 dias de arrependimento."
    ],
    dataPublicacao: "2026-11-10",
    revisadoEm: "novembro de 2026",
    tags: ["cyber monday 2026", "quando é a cyber monday", "o que é cyber monday", "diferença entre black friday e cyber monday", "cyber monday brasil"],
    servico: "como-saber-se-a-promocao-e-verdadeira",
    categoria: "ofertas-e-cupons",
    imagem: "/blog/cyber-monday-2026-quando-e.webp",
    faq: [
      { q: "Quando é a Cyber Monday 2026?", a: "Na segunda-feira, 30 de novembro de 2026. A Cyber Monday é sempre a segunda-feira seguinte à Black Friday, que em 2026 cai em 27 de novembro." },
      { q: "Qual a diferença entre Black Friday e Cyber Monday?", a: "A Black Friday nasceu no comércio de rua e acontece na sexta depois do Dia de Ação de Graças americano. A Cyber Monday foi criada em 2005 para as lojas online, na segunda seguinte. No Brasil as duas acontecem principalmente na internet e a Cyber Monday é bem menor." },
      { q: "Os descontos da Cyber Monday são melhores?", a: "Não há dado confiável que mostre isso. Depende do produto e da loja. O que funciona é comparar o preço do dia com o histórico que você acompanhou nas semanas anteriores." },
      { q: "Quando é a Cyber Monday 2027?", a: "Em 29 de novembro de 2027, segunda-feira. A Black Friday de 2027 cai em 26 de novembro." },
    ],
    fontes: [
      { nome: "E-Commerce Brasil: Black November e Cyber Monday 2024, dados da Confi Neotrust (2024)", url: "https://www.ecommercebrasil.com.br/noticias/black-november-faturamento-total-no-mes-foi-de-r-367-bilhoes-mostra-confi-neotrust" },
      { nome: "CNN Brasil: vendas online na Black Friday 2024, Confi Neotrust (2024)", url: "https://www.cnnbrasil.com.br/economia/macroeconomia/vendas-online-batem-recorde-de-r-427-bilhoes-na-black-friday-deste-ano/" },
      { nome: "Forbes: Cyber Monday set to dominate holiday sales (2016)", url: "https://www.forbes.com/sites/deborahweinswig/2016/11/17/cyber-monday-set-to-dominate-holiday-sales/" },
      { nome: "CNBC: Is Cyber Monday the last vestige of dotcom hype? (2009)", url: "https://www.cnbc.com/id/34152805" },
      { nome: "IstoÉ Dinheiro: varejo segue com promoções após a Black Friday (2025)", url: "https://istoedinheiro.com.br/varejo-segue-com-promocoes-apos-black-friday" },
      { nome: "Senacon, Ministério da Justiça: Black Friday 2025, orientações (2025)", url: "https://www.gov.br/mj/pt-br/assuntos/noticias/black-friday-2025-senacon-orienta-consumidores-a-evitar-golpes-e-comprar-com-seguranca" },
      { nome: "Código de Defesa do Consumidor, Lei 8.078/1990, texto compilado (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" },
    ],
    conteudo: `<p>Passou a sexta e você não comprou? Ainda tem a segunda. A Cyber Monday é a data que fecha a semana de promoções de novembro, e muita gente só descobre que ela existe quando vê a oferta. <strong>Em 2026 a Cyber Monday é na segunda-feira, 30 de novembro, três dias depois da Black Friday.</strong> No Brasil ela é bem menor que a sexta, e a regra para comprar bem é a mesma: comparar com o preço das semanas anteriores.</p>

<h2>Quando é a Cyber Monday 2026?</h2>
<p>Na <strong>segunda-feira, 30 de novembro de 2026</strong>. A conta é simples: a Black Friday é a sexta depois do Dia de Ação de Graças americano (quarta quinta-feira de novembro, dia 26 em 2026), e a Cyber Monday é a segunda-feira seguinte. Conferimos no calendário.</p>
<table>
<thead><tr><th>Ano</th><th>Black Friday</th><th>Cyber Monday</th></tr></thead>
<tbody>
<tr><td>2026</td><td>Sexta, 27 de novembro</td><td>Segunda, 30 de novembro</td></tr>
<tr><td>2027</td><td>Sexta, 26 de novembro</td><td>Segunda, 29 de novembro</td></tr>
</tbody>
</table>
<p>Como a Black Friday, a Cyber Monday não é fixada por lei. É uma convenção do comércio, e cada loja decide se participa e por quanto tempo. O que fazer até a sexta está em <a href="/blog/black-friday-2026-quando-e">Black Friday 2026: quando é e como se preparar</a>.</p>

<h2>De onde vem a Cyber Monday?</h2>
<p>O nome foi lançado em 2005 nos Estados Unidos pela Shop.org, o braço de comércio eletrônico da National Retail Federation, a federação do varejo americano. A entidade tinha notado que as vendas das lojas online subiam na segunda-feira depois do feriado de Ação de Graças, quando as pessoas voltavam ao trabalho e compravam pela internet. A segunda-feira ganhou um nome e virou data de promoção das lojas virtuais.</p>
<p>A divisão original era esta: Black Friday para a loja de rua, Cyber Monday para a loja online. Hoje as duas acontecem na internet e a diferença ficou mais no calendário do que no tipo de loja.</p>

<h2>Qual a diferença entre Black Friday e Cyber Monday?</h2>
<table>
<thead><tr><th></th><th>Black Friday</th><th>Cyber Monday</th></tr></thead>
<tbody>
<tr><td>Quando</td><td>Sexta depois do Dia de Ação de Graças</td><td>Segunda-feira seguinte</td></tr>
<tr><td>Data em 2026</td><td>27 de novembro</td><td>30 de novembro</td></tr>
<tr><td>Origem</td><td>Comércio de rua dos Estados Unidos</td><td>Lojas online dos Estados Unidos, em 2005</td></tr>
<tr><td>Tamanho no e-commerce brasileiro em 2024</td><td>R$ 4,27 bilhões na sexta</td><td>R$ 1,47 bilhão na segunda</td></tr>
<tr><td>Seus direitos</td><td>Os do Código de Defesa do Consumidor</td><td>Os mesmos</td></tr>
</tbody>
</table>
<p>Os valores são da Confi Neotrust, que mede o e-commerce brasileiro.</p>

<h2>A Cyber Monday é grande no Brasil?</h2>
<p>É bem menor que a Black Friday. Em 2024, segundo a Confi Neotrust, a Cyber Monday (2 de dezembro daquele ano) faturou R$ 1,47 bilhão no e-commerce brasileiro, com 4,65 milhões de pedidos e tíquete médio de R$ 317. Foi 17,1% a mais que em 2023.</p>
<p>Fazendo a conta: R$ 1,47 bilhão é cerca de um terço dos R$ 4,27 bilhões da sexta-feira de Black Friday do mesmo ano. O tíquete médio mais baixo sugere compra de itens mais baratos. Para 2025, não encontramos número com fonte confiável.</p>
<p>Também não encontramos, nas páginas oficiais das grandes lojas, campanha com o nome "Cyber Monday". O que a imprensa registrou em 2025 foi a própria campanha de Black Friday esticada até a segunda-feira, com cupons e ofertas valendo até 1º de dezembro daquele ano. Em 2026, o que vale é o que a loja anunciar para o dia 30.</p>

<h2>Vale a pena esperar a Cyber Monday?</h2>
<p>Só se o seu histórico disser que sim. Não há dado confiável mostrando que o preço da segunda é melhor ou pior que o da sexta. Três situações em que a segunda-feira ajuda:</p>
<ul>
<li><strong>O produto que você queria não baixou na sexta.</strong> Se a campanha da loja vai até segunda, vale olhar de novo antes de desistir.</li>
<li><strong>Você não conseguiu comparar na sexta.</strong> O fim de semana dá tempo de consultar o gráfico em um comparador. Mostramos como em <a href="/blog/historico-de-preco-como-consultar">histórico de preço: como consultar e ler</a>.</li>
<li><strong>Acabou o estoque e voltou.</strong> Acontece, mas não dá para contar com isso.</li>
</ul>
<p>E uma situação em que esperar atrapalha: o produto já está no menor preço que você anotou e você precisa dele. Nesse caso, a segunda só acrescenta o risco de ficar sem. A mesma lógica vale para as ofertas antecipadas, que explicamos em <a href="/blog/esquenta-black-friday-comprar-antes-ou-esperar">esquenta Black Friday: comprar antes ou esperar</a>.</p>
<p>O cuidado com golpe continua. Site copiado de loja famosa e link de "última chance" aparecem até o fim da campanha. Os sinais de alerta estão no guia <a href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro">grupo de ofertas no WhatsApp é seguro?</a></p>

<h2>Quais são os seus direitos na Cyber Monday?</h2>
<p>Os mesmos de qualquer dia. Em compra pela internet, o art. 49 do Código de Defesa do Consumidor dá 7 dias, contados do recebimento do produto, para desistir sem dar motivo. A Senacon reforça que o reembolso deve ser integral, incluindo o frete. Veja o caminho em cada loja em <a href="/blog/direito-de-arrependimento-compra-online">direito de arrependimento na compra online</a>.</p>
<p>Oferta anunciada precisa ser cumprida, e desconto sobre preço que nunca existiu é publicidade enganosa. Guarde print da oferta e do pagamento.</p>

<h2>O que o Tem Descontos faz na Cyber Monday?</h2>
<p>O mesmo de todos os dias: conferimos cada oferta antes de enviar ao grupo, das 8h às 22h.</p>
<table>
<thead><tr><th>O que conferimos</th><th>O que acontece se falhar</th></tr></thead>
<tbody>
<tr><td>Preço anunciado contra o preço na própria loja</td><td>Mais de 3% abaixo do preço da loja sem cupom que explique: oferta descartada</td></tr>
<tr><td>Produto do link contra o produto do texto</td><td>Nome ou quantidade diferente: oferta descartada</td></tr>
<tr><td>Shopee: nota e vendas do produto</td><td>Só sai com nota 4,5 ou mais e 50 vendas ou mais</td></tr>
<tr><td>Destino do link</td><td>Sempre a loja oficial</td></tr>
</tbody>
</table>
<p>Quem somos e como trabalhamos está em <a href="/sobre">sobre o Tem Descontos</a>.</p>

<h2>Resumo para não esquecer</h2>
<ul>
<li>Cyber Monday 2026: segunda-feira, 30 de novembro. Em 2027: 29 de novembro.</li>
<li>Nasceu em 2005 nos Estados Unidos como a data das lojas online.</li>
<li>No Brasil faturou R$ 1,47 bilhão em 2024, cerca de um terço da sexta de Black Friday.</li>
<li>Não há prova de que o preço da segunda seja melhor: compare com o seu histórico.</li>
<li>Os 7 dias de arrependimento valem normalmente.</li>
</ul>`,
  },
  {
    slug: "frete-gratis-amazon-mercado-livre-shopee",
    titulo: "Frete grátis na Amazon, Mercado Livre e Shopee: as regras",
    metaTitle: "Frete grátis na Amazon, Mercado Livre e Shopee: as regras",
    metaDescription: "Veja a partir de quanto o frete é grátis na Amazon, no Mercado Livre, na Shopee e no Magalu, o que muda com assinatura e como conferir o total antes de pagar.",
    resumo: "Cada loja tem um valor mínimo e uma lista de exceções para o frete grátis. Veja as regras da Amazon, do Mercado Livre, da Shopee e do Magalu lado a lado.",
    resumoRapido: [
      "Amazon: frete grátis em pedidos a partir de R$ 19 com produtos elegíveis enviados pela Amazon; com Prime, sem valor mínimo nos elegíveis.",
      "Mercado Livre: disponível em compras a partir de R$ 19, com exceções; procure a legenda verde no anúncio.",
      "Shopee: funciona por cupom de frete grátis, só no aplicativo e acima do valor mínimo escrito no cupom.",
      "Frete grátis não quer dizer menor preço: compare sempre o total, produto mais entrega."
    ],
    dataPublicacao: "2026-11-10",
    revisadoEm: "novembro de 2026",
    tags: ["frete grátis", "frete grátis amazon", "frete grátis mercado livre", "frete grátis shopee", "valor mínimo frete grátis"],
    servico: "cupom-da-amazon-como-usar",
    categoria: "ofertas-e-cupons",
    imagem: "/blog/frete-gratis-amazon-mercado-livre-shopee.webp",
    faq: [
      { q: "A partir de quanto o frete é grátis na Amazon?", a: "Segundo a central de ajuda da Amazon, pedidos a partir de R$ 19 com produtos elegíveis enviados pela Amazon têm frete grátis. Com o Amazon Prime, os produtos elegíveis têm entrega gratuita sem valor mínimo. O valor pode mudar: confira no carrinho." },
      { q: "A partir de quanto o frete é grátis no Mercado Livre?", a: "O Mercado Livre informa que o frete grátis está disponível em compras a partir de R$ 19 e depende de outros fatores. Não vale para Supermercado nem para Compras Internacionais. O anúncio com o benefício mostra uma legenda verde." },
      { q: "Como ter frete grátis na Shopee?", a: "Com cupom de frete grátis. Pela central de ajuda da Shopee, ele vale somente no aplicativo e em pedidos acima do valor mínimo indicado no próprio cupom, calculado por loja." },
      { q: "Frete grátis é sempre mais barato?", a: "Não. O custo da entrega pode estar embutido no preço do produto. Compare o total (produto mais frete) entre as lojas antes de decidir." },
      { q: "A loja pode cobrar frete diferente do anunciado?", a: "Não. Pelo art. 30 do Código de Defesa do Consumidor, a oferta anunciada obriga a loja. O Decreto 7.962/2013 também exige que o site discrimine no preço as despesas de entrega." },
    ],
    fontes: [
      { nome: "Amazon, central de ajuda: pedido com frete grátis da Amazon", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=201910160" },
      { nome: "Amazon Prime: página do programa", url: "https://www.amazon.com.br/prime" },
      { nome: "Mercado Livre: frete grátis", url: "https://www.mercadolivre.com.br/l/fretegratis" },
      { nome: "Mercado Livre: planos do Meli+", url: "https://www.mercadolivre.com.br/assinaturas/melimaisv2/planos" },
      { nome: "Shopee, central de ajuda: cupons de frete grátis", url: "https://help.shopee.com.br/portal/4/article/76220" },
      { nome: "Shopee, central de ajuda: ShopeeVIP", url: "https://help.shopee.com.br/portal/4/article/223874" },
      { nome: "Magazine Luiza: regra do frete grátis no aplicativo", url: "https://especiais.magazineluiza.com.br/app-webviews/regra-frete-gratis/" },
      { nome: "Mercado&Consumo: Mercado Livre zera frete para pedidos a partir de R$ 19 (2025)", url: "https://mercadoeconsumo.com.br/06/06/2025/ecommerce/na-disputa-do-e-commerce-mercado-livre-zera-frete-para-pedidos-a-partir-de-r-19/" },
      { nome: "Código de Defesa do Consumidor, Lei 8.078/1990, texto compilado (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" },
      { nome: "Decreto 7.962/2013, comércio eletrônico (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm" },
    ],
    conteudo: `<p>O frete decide muita compra. Um produto mais barato com entrega cara perde para outro mais caro com entrega grátis, e cada loja tem uma regra diferente para dar o benefício. <strong>Em novembro de 2026, Amazon e Mercado Livre informam frete grátis a partir de R$ 19 em produtos elegíveis, e a Shopee trabalha com cupom de frete grátis no aplicativo.</strong> Em todas existem exceções, e a conta que vale é sempre a do total no carrinho.</p>

<h2>A partir de quanto o frete é grátis em cada loja?</h2>
<p>A tabela resume o que as páginas oficiais informavam em novembro de 2026. Valores e regras mudam: o que vale é o que aparece no seu carrinho.</p>
<table>
<thead><tr><th>Loja</th><th>Regra informada</th><th>Principais exceções</th></tr></thead>
<tbody>
<tr><td>Amazon</td><td>Pedidos a partir de R$ 19 com produtos elegíveis enviados pela Amazon</td><td>Itens enviados por vendedores parceiros não contam para o mínimo</td></tr>
<tr><td>Mercado Livre</td><td>Disponível em compras a partir de R$ 19, considerando "diversos fatores"</td><td>Supermercado e Compras Internacionais</td></tr>
<tr><td>Shopee</td><td>Cupom de frete grátis, só no aplicativo, acima do valor mínimo do cupom</td><td>Mínimo calculado por loja; limite de cupons por semana</td></tr>
<tr><td>Magalu</td><td>No aplicativo, a partir de R$ 99 na maioria das categorias</td><td>Região Norte e produtos de parceiros do marketplace; algumas categorias têm mínimo próprio</td></tr>
</tbody>
</table>

<h2>Como funciona o frete grátis na Amazon?</h2>
<p>Pela central de ajuda, para quem já é cliente, pedidos a partir de R$ 19 com produtos elegíveis enviados pela Amazon se qualificam para o frete grátis. A palavra que importa é "enviados pela Amazon": na página do produto, veja quem envia. Item enviado por vendedor parceiro tem o frete definido por ele e não entra na soma do mínimo.</p>
<p>Com o Amazon Prime, a loja informa entrega gratuita de produtos elegíveis sem valor mínimo de compra. O Prime é uma assinatura paga, com plano mensal ou anual, e o valor está na página do programa. Para saber se compensa, some o frete que você pagou nos últimos meses e compare com o valor da assinatura.</p>
<p>A regra pode mudar, e o que vale é o que aparece no carrinho. Se o seu pedido vai usar cupom, veja como ele entra na conta no guia <a href="/guias/cupom-da-amazon-como-usar">cupom da Amazon: como usar</a>.</p>

<h2>Como funciona o frete grátis no Mercado Livre?</h2>
<p>A página oficial diz que "o benefício do frete grátis está disponível em compras a partir de R$ 19 e leva em consideração diversos fatores". Na prática, não é todo anúncio acima de R$ 19 que tem. Para saber, a orientação do próprio Mercado Livre é procurar a legenda verde no detalhe do anúncio ou verificar no carrinho.</p>
<p>O valor mínimo era de R$ 79 e caiu para R$ 19 em junho de 2025. O benefício não se aplica a produtos da categoria Supermercado nem a Compras Internacionais. Quando o frete grátis não está disponível, o Mercado Livre informa que pode haver um desconto no frete.</p>
<p>A assinatura Meli+ acrescenta frete grátis rápido a partir de R$ 19 em produtos selecionados com a etiqueta Meli+. A página de perguntas do programa lista limites: há um teto para o custo de envio coberto, e em alguns casos o benefício vira um desconto no envio rápido em vez de frete grátis. Os planos e preços estão na página do Meli+. Se a compra der problema na entrega, o caminho está em <a href="/blog/compra-garantida-mercado-livre">Compra Garantida do Mercado Livre</a>.</p>

<h2>Como funciona o frete grátis na Shopee?</h2>
<p>Por cupom. A central de ajuda da Shopee informa que "o uso de cupons de frete grátis é válido somente no aplicativo e em pedidos acima de um valor pré-estabelecido". Três detalhes que confundem:</p>
<ul>
<li><strong>O mínimo é por loja.</strong> Dois produtos de vendedores diferentes no mesmo carrinho não somam para o mesmo cupom.</li>
<li><strong>O cupom tem teto.</strong> Ele cobre o frete até um valor máximo. Se o frete passar disso, você paga a diferença.</li>
<li><strong>Há limite de uso.</strong> A ajuda informa um limite de 10 cupons de frete grátis por semana.</li>
</ul>
<p>Em 2026 a Shopee lançou o ShopeeVIP, assinatura de R$ 9,90 por mês que, segundo a central de ajuda, dá cupons de frete grátis ilimitados para compras acima de R$ 10 com frete de até R$ 20. Confira as condições atuais antes de assinar.</p>
<p>O cupom de frete pode ser combinado com outros cupons no mesmo pedido. Como empilhar está em <a href="/blog/cupom-shopee-e-mercado-livre-como-usar">cupom da Shopee e do Mercado Livre: como usar</a>.</p>

<h2>E no Magalu?</h2>
<p>A regra publicada pelo Magalu vale para compras no aplicativo a partir de R$ 99 na maioria das categorias. Ela não se aplica à região Norte nem a produtos vendidos e entregues por parceiros do marketplace, e algumas categorias, como Mercado e Móveis, têm valor mínimo próprio, informado na página da regra. Na página do produto, veja quem vende e simule o frete com o seu CEP antes de fechar.</p>

<h2>Frete grátis é sempre o melhor negócio?</h2>
<p>Não. Entrega tem custo, e alguém paga: às vezes a loja, às vezes o vendedor, às vezes você, dentro do preço do produto. Por isso a comparação certa é pelo total.</p>
<p>Um exemplo com a conta feita. Loja A: produto por R$ 89,90 com frete grátis, total de R$ 89,90. Loja B: o mesmo produto por R$ 74,90 com frete de R$ 9,90, total de R$ 84,80. A loja com frete pago sai R$ 5,10 mais barata. Como engenheiro, eu comparo o total e o prazo, nunca só a etiqueta.</p>
<p>Três cuidados antes de pagar:</p>
<ol>
<li><strong>Não encha o carrinho só para bater o mínimo.</strong> Gastar R$ 15 a mais para economizar R$ 8 de frete é prejuízo de R$ 7.</li>
<li><strong>Olhe o prazo.</strong> Frete grátis pode vir com entrega mais lenta. Se você precisa do produto até uma data, confira a previsão de entrega.</li>
<li><strong>Confira na última tela.</strong> O frete que vale é o do resumo do pedido, com o seu CEP.</li>
</ol>

<h2>O que a lei diz sobre o frete anunciado?</h2>
<p>Que ele precisa ser cumprido e estar claro antes do pagamento. O art. 30 do Código de Defesa do Consumidor diz que toda informação ou publicidade suficientemente precisa "obriga o fornecedor que a fizer veicular ou dela se utilizar e integra o contrato que vier a ser celebrado". Se o anúncio promete frete grátis e a cobrança aparece no fim, guarde o print e reclame na loja, no consumidor.gov.br ou no Procon.</p>
<p>O Decreto 7.962/2013, que trata do comércio eletrônico, exige no art. 2º, inciso IV, a "discriminação, no preço, de quaisquer despesas adicionais ou acessórias, tais como as de entrega ou seguros".</p>
<p>E se você desistir da compra dentro dos 7 dias do art. 49, a Senacon orienta que o reembolso inclua o frete. Detalhes em <a href="/blog/direito-de-arrependimento-compra-online">direito de arrependimento na compra online</a>.</p>

<h2>O que o Tem Descontos confere sobre frete?</h2>
<p>Sendo direto: o frete depende do seu CEP, e isso nós não temos como conferir por você. O que conferimos é o preço do produto na própria loja e o destino do link.</p>
<table>
<thead><tr><th>O que conferimos</th><th>O que fica com você</th></tr></thead>
<tbody>
<tr><td>Preço anunciado contra o preço na loja; mais de 3% abaixo sem cupom que explique, a oferta é descartada</td><td>Simular o frete com o seu CEP</td></tr>
<tr><td>Produto do link igual ao do texto, em nome e quantidade</td><td>Ver quem vende e quem envia</td></tr>
<tr><td>Link direto para a loja oficial</td><td>Conferir o total na última tela antes de pagar</td></tr>
</tbody>
</table>
<p>Quando o post diz que tem frete grátis, a informação veio da oferta. A confirmação é no seu carrinho.</p>

<h2>Resumo para não esquecer</h2>
<ul>
<li>Amazon: a partir de R$ 19 em produtos elegíveis enviados pela Amazon; Prime tira o mínimo nos elegíveis.</li>
<li>Mercado Livre: a partir de R$ 19, com exceções; procure a legenda verde.</li>
<li>Shopee: cupom de frete grátis no aplicativo, com mínimo por loja e teto.</li>
<li>Magalu: no aplicativo, a partir de R$ 99 na maioria das categorias, com exceções.</li>
<li>Compare o total e confira o frete na última tela.</li>
</ul>`,
  },
  {
    slug: "cashback-como-funciona",
    titulo: "Cashback: como funciona e quando vale a pena usar",
    metaTitle: "Cashback: como funciona e quando vale a pena usar",
    metaDescription: "Cashback devolve parte do valor da compra, mas tem prazo, valor mínimo de resgate e regras que anulam o saldo. Veja como funciona e quando vale a pena usar.",
    resumo: "Cashback é dinheiro de volta pago com parte da comissão da loja. Veja como ativar, quanto demora, o que faz o saldo ser cancelado e quando compensa.",
    resumoRapido: [
      "Cashback é a devolução de parte do valor da compra, paga por um site ou aplicativo parceiro com o dinheiro que a loja paga a ele.",
      "Tem que ativar antes de comprar; o saldo entra como pendente e só vira dinheiro depois que a loja confirma.",
      "Cupom de fora, comparador de preço aberto no meio da compra, troca de pagamento e devolução costumam cancelar o cashback.",
      "Vale a pena quando o total com cashback é menor que o total com o melhor cupom, e só para compra que você já ia fazer."
    ],
    dataPublicacao: "2026-11-10",
    revisadoEm: "novembro de 2026",
    tags: ["cashback", "cashback como funciona", "cashback vale a pena", "cashback não caiu", "cashback ou cupom"],
    servico: "cupom-da-amazon-como-usar",
    categoria: "ofertas-e-cupons",
    imagem: "/blog/cashback-como-funciona.webp",
    faq: [
      { q: "O que é cashback?", a: "É a devolução de uma parte do valor da compra. Em sites e aplicativos de cashback, a loja paga uma comissão ao parceiro que levou o cliente, e o parceiro divide esse valor com quem comprou." },
      { q: "Quanto tempo o cashback demora para cair?", a: "Varia por programa e por loja. No Méliuz, a loja leva alguns dias para avisar da compra e o saldo fica pendente até a confirmação, que em algumas lojas leva até 90 ou 120 dias. O Inter informa que em casos excepcionais o pagamento pode demorar até 120 dias." },
      { q: "Por que meu cashback foi cancelado?", a: "Os motivos mais citados nas regras dos programas são: usar cupom que não é do programa, abrir comparador de preço ou outro link durante a compra, trocar a forma de pagamento, alterar, cancelar ou devolver o pedido." },
      { q: "Dá para usar cupom e cashback juntos?", a: "Só quando o cupom é o que o próprio programa de cashback oferece. Cupom de fora costuma anular o cashback. Por isso vale fazer a conta e escolher o que dá o menor total." },
      { q: "O Tem Descontos dá cashback?", a: "Não. Nós divulgamos ofertas com link de afiliado e conferimos o preço na loja. Se você ativar um cashback antes de comprar, a comissão daquela compra vai para o programa de cashback, e está tudo certo." },
    ],
    fontes: [
      { nome: "Méliuz: como funciona", url: "https://www.meliuz.com.br/como-funciona" },
      { nome: "Méliuz, blog: o que é cashback", url: "https://www.meliuz.com.br/blog/o-que-e-cashback/" },
      { nome: "Inter, central de ajuda: como funciona o cashback no Shopping do Inter", url: "https://ajuda.inter.co/cashback/como-funciona-o-cashback-no-shopping-do-inter" },
      { nome: "Cuponomia: termos de uso", url: "https://www.cuponomia.com.br/termos-uso" },
      { nome: "Cuponomia: perguntas frequentes", url: "https://www.cuponomia.com.br/perguntas-frequentes" },
      { nome: "Magazine Luiza: Dinheiro de Volta", url: "https://especiais.magazineluiza.com.br/dinheirodevolta/" },
      { nome: "PicPay, central de ajuda: cashback nas lojas parceiras", url: "https://meajuda.picpay.com/hc/pt-br/articles/4411050744467" },
      { nome: "Shopee, central de ajuda: Moedas Shopee", url: "https://help.shopee.com.br/portal/4/article/76257" },
      { nome: "Mercado Pago, blog: como receber cashback em Meli Dólar", url: "https://www.mercadopago.com.br/blog/como-receber-cashback-meli-dolar" },
      { nome: "Código de Defesa do Consumidor, Lei 8.078/1990, texto compilado (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" },
    ],
    conteudo: `<p>"Ganhe 10% de volta" parece desconto, mas funciona de outro jeito: você paga o preço cheio hoje e recebe uma parte depois, se cumprir as regras. <strong>Cashback é a devolução de parte do valor da compra, paga por um programa parceiro da loja; vale a pena quando o total com cashback fica menor que o total com o melhor cupom, e só em compra que você já ia fazer.</strong> O que mais dá problema é o saldo que não cai, e quase sempre por um detalhe na hora de comprar.</p>

<h2>O que é cashback e de onde vem o dinheiro?</h2>
<p>Cashback quer dizer "dinheiro de volta". Você compra, e uma parte do valor volta para você depois. O dinheiro não aparece do nada: a loja paga uma comissão a quem levou o cliente até ela, e o programa de cashback divide essa comissão com o cliente.</p>
<p>O Méliuz explica assim: "As lojas parceiras pagam para anunciar no site e no app do Méliuz e nós dividimos esse valor com quem comprou." É o mesmo mecanismo do link de afiliado, com a diferença de que parte da comissão volta para o comprador. Explicamos esse mecanismo em <a href="/blog/link-de-afiliado-o-preco-muda">link de afiliado: o preço muda para quem compra?</a></p>

<h2>Como o cashback funciona, passo a passo?</h2>
<ol>
<li><strong>Você ativa antes de comprar.</strong> Entra no site ou aplicativo do programa, escolhe a loja e clica em ativar. O programa abre a loja em uma janela própria.</li>
<li><strong>Compra nessa mesma janela.</strong> O Méliuz orienta concluir a compra no site da loja que é aberto automaticamente pela ativação. Sair dele no meio do caminho é o erro mais comum.</li>
<li><strong>O saldo aparece como pendente.</strong> A loja leva alguns dias para avisar o programa da compra.</li>
<li><strong>A loja confirma.</strong> Só depois de passar o prazo de troca e devolução a loja libera, e o saldo vira confirmado. Esse prazo varia por loja.</li>
<li><strong>Você resgata.</strong> Com saldo confirmado acima do mínimo, pede a transferência para a sua conta.</li>
</ol>
<p>O cálculo costuma ser sobre o valor dos produtos, sem o frete.</p>

<h2>Quais são os prazos e o mínimo de cada programa?</h2>
<p>Estas são as regras que as páginas oficiais informavam em novembro de 2026. Todas podem mudar.</p>
<table>
<thead><tr><th>Programa</th><th>Quando o saldo aparece</th><th>Resgate</th><th>O que as regras destacam</th></tr></thead>
<tbody>
<tr><td>Méliuz</td><td>Alguns dias para aparecer como pendente; confirmação varia por loja</td><td>Mínimo de R$ 20 em saldo confirmado</td><td>Comprar na janela aberta pela ativação</td></tr>
<tr><td>Cuponomia</td><td>Pendente em até 5 dias</td><td>Mínimo de R$ 20</td><td>Não usar outra plataforma de cupom, cashback ou comparador de preço</td></tr>
<tr><td>Shopping do Inter</td><td>No aplicativo do Inter, até 1 dia útil com cartão Inter, Pix ou débito e 30 dias com outros cartões; no site da loja, até 30 dias; em casos excepcionais, até 120 dias</td><td>Na conta do Inter</td><td>Fazer a compra do início ao fim a partir do Shopping, sem cupons de terceiros</td></tr>
<tr><td>PicPay</td><td>Varia por loja</td><td>Na conta do PicPay</td><td>Usar apenas cupons oferecidos pelo PicPay</td></tr>
</tbody>
</table>

<h2>Por que o cashback não caiu?</h2>
<p>Quase sempre porque a loja não conseguiu ligar a sua compra ao programa, ou porque o pedido mudou depois. As regras dos programas repetem os mesmos motivos:</p>
<ul>
<li><strong>Carrinho montado antes de ativar.</strong> Produto que já estava no carrinho pode não contar. Ative primeiro, monte o carrinho depois.</li>
<li><strong>Outro link no meio da compra.</strong> Abrir comparador de preço, site de cupom ou e-mail da loja depois da ativação troca a origem da visita.</li>
<li><strong>Cupom de fora.</strong> O PicPay pede para usar apenas cupons oferecidos por ele. A Cuponomia pede para não usar nenhuma outra plataforma de cupom ou cashback.</li>
<li><strong>Aplicativo da loja.</strong> Em algumas lojas, a compra pelo aplicativo não vale. A regra está na página da loja dentro do programa.</li>
<li><strong>Pedido alterado.</strong> O PicPay resume: quem altera a forma de pagamento, pede devolução, troca ou cancela a compra tem o cashback anulado.</li>
<li><strong>Bloqueador de anúncios.</strong> A Cuponomia inclui bloqueadores na lista do que não usar.</li>
</ul>
<p>Se você seguiu tudo e o saldo não apareceu no prazo, abra uma reclamação no próprio programa com o número do pedido. E guarde print das condições no dia da compra: pelo art. 30 do Código de Defesa do Consumidor, a oferta anunciada "obriga o fornecedor que a fizer veicular".</p>

<h2>Cashback da própria loja é a mesma coisa?</h2>
<p>Não exatamente. Algumas lojas devolvem em saldo que só pode ser usado nelas mesmas. Funciona mais como desconto na próxima compra do que como dinheiro.</p>
<ul>
<li><strong>Shopee.</strong> As Moedas Shopee valem desconto: cada 100 moedas equivalem a R$ 1, e podem abater até 25% do valor da compra. Não viram dinheiro na conta. Mais em <a href="/blog/cupom-shopee-e-mercado-livre-como-usar">cupom da Shopee e do Mercado Livre</a>.</li>
<li><strong>Mercado Livre e Mercado Pago.</strong> O cashback em Meli Dólar depende da assinatura Meli+ e de pagar com o cartão Mercado Pago no crédito. Percentuais e limites estão na página do programa.</li>
<li><strong>Magalu.</strong> O programa Dinheiro de Volta credita o valor no MagaluPay. Confira o prazo na página da oferta.</li>
</ul>
<p>Antes de contar com esse saldo, veja se ele tem validade e onde pode ser usado.</p>

<h2>Cashback ou cupom: qual escolher?</h2>
<p>O que der o menor total, lembrando que o cupom desconta na hora e o cashback só depois, e com condições. Faça a conta dos dois.</p>
<p>Um exemplo. Compra de R$ 300 em produtos. Opção 1: cupom de R$ 30, você paga R$ 270 hoje. Opção 2: cashback de 5%, você paga R$ 300 hoje e recebe R$ 15 semanas depois, se nada for cancelado. O cupom ganha por R$ 15, e sem espera. Com cashback de 12% (R$ 36), o cashback ganha por R$ 6, desde que você possa esperar e cumpra as regras.</p>
<p>Como engenheiro, eu coloco um desconto na conta do cashback: dinheiro que pode não chegar vale menos que desconto que já saiu do preço. Três perguntas ajudam:</p>
<ol>
<li>Eu já ia comprar esse produto, nessa loja, por esse preço? Cashback não transforma compra desnecessária em economia.</li>
<li>O preço da loja com cashback é o menor? Às vezes outra loja vende mais barato sem devolver nada. Veja <a href="/blog/historico-de-preco-como-consultar">como consultar o histórico de preço</a>.</li>
<li>O saldo vai passar do mínimo de resgate? R$ 6 parados em uma conta que só libera a partir de R$ 20 ainda não são seus.</li>
</ol>
<p>Um aviso sobre o nome: em 2026 a Receita Federal passou a chamar de "cashback" a restituição automática do Imposto de Renda. É outro assunto, sem relação com compra em loja.</p>

<h2>O Tem Descontos dá cashback?</h2>
<p>Não, e é melhor deixar claro. Nós ganhamos comissão das lojas quando alguém compra pelos links do grupo, e essa comissão é o que mantém o grupo de graça. Não devolvemos parte dela, e o Programa de Associados da Amazon proíbe que associados ofereçam esse tipo de incentivo.</p>
<table>
<thead><tr><th>O que nós fazemos</th><th>O que um programa de cashback faz</th></tr></thead>
<tbody>
<tr><td>Conferimos o preço na loja antes de enviar a oferta</td><td>Devolve parte do valor depois da compra confirmada</td></tr>
<tr><td>Descartamos oferta com preço mais de 3% abaixo do da loja sem cupom que explique</td><td>Não confere se o preço é bom</td></tr>
<tr><td>Mandamos o cupom junto quando ele existe</td><td>Costuma aceitar só os próprios cupons</td></tr>
<tr><td>Não pedimos cadastro nem dado pessoal</td><td>Exige conta para receber o saldo</td></tr>
</tbody>
</table>
<p>Se você viu uma oferta no grupo e preferir ativar um cashback antes de comprar, a comissão daquela compra vai para o programa de cashback, não para nós. Sem problema: a conta que importa é a sua. Quem somos está em <a href="/sobre">sobre o Tem Descontos</a>.</p>

<h2>Resumo para não esquecer</h2>
<ul>
<li>Cashback é parte da comissão da loja devolvida para você, depois da compra.</li>
<li>Ative antes, compre na janela aberta e não use cupom de fora.</li>
<li>O saldo fica pendente até a loja confirmar; o prazo varia e pode passar de três meses.</li>
<li>Compare o total: cupom desconta na hora, cashback depende de condições.</li>
<li>Saldo que só vale na própria loja funciona como desconto na próxima compra.</li>
</ul>`,
  },
  {
    slug: "calendario-de-promocoes-datas-de-desconto",
    titulo: "Calendário de promoções: 11.11, 12.12 e datas de 2027",
    metaTitle: "Calendário de promoções: 11.11, 12.12 e datas de 2027",
    metaDescription: "Veja o calendário de promoções do e-commerce: 11.11, Black Friday, Cyber Monday e 12.12 em 2026 e todas as datas de 2027, com o que cada uma costuma trazer.",
    resumo: "As datas de desconto do e-commerce em um lugar só: o que falta em 2026 e o calendário de 2027, das datas duplas à Black Friday, com as campanhas próprias de cada loja.",
    resumoRapido: [
      "Ainda em 2026: 11.11 (quarta, 11 de novembro), Black Friday (sexta, 27 de novembro), Cyber Monday (segunda, 30 de novembro) e 12.12 (sábado, 12 de dezembro).",
      "Datas duplas são as que repetem dia e mês (7.7, 9.9, 10.10, 11.11, 12.12); a mais conhecida, o 11.11, nasceu na China em 2009.",
      "Em 2027 a Black Friday cai em 26 de novembro e o Dia do Consumidor em 15 de março.",
      "Data de promoção não garante desconto: compare com o preço das semanas anteriores."
    ],
    dataPublicacao: "2026-11-10",
    revisadoEm: "novembro de 2026",
    tags: ["calendário de promoções", "datas de promoção 2027", "11.11", "12.12", "datas duplas", "dia do consumidor 2027", "black friday 2027"],
    servico: "como-saber-se-a-promocao-e-verdadeira",
    categoria: "ofertas-e-cupons",
    imagem: "/blog/calendario-de-promocoes-datas-de-desconto.webp",
    faq: [
      { q: "O que é o 11.11?", a: "É a data dupla de 11 de novembro. Nasceu como promoção em 2009, na China, quando o Alibaba fez uma liquidação online de 24 horas no Dia dos Solteiros. No Brasil, Shopee, Mercado Livre, Magalu e AliExpress fazem campanha na data." },
      { q: "O que são datas duplas?", a: "São as datas em que o dia e o mês têm o mesmo número, como 7.7, 9.9, 10.10, 11.11 e 12.12. Viraram dias de campanha no e-commerce, com cupons e frete grátis, principalmente em marketplaces." },
      { q: "Quando é a Black Friday 2027?", a: "Em 26 de novembro de 2027, sexta-feira. A Cyber Monday de 2027 cai em 29 de novembro." },
      { q: "Quando é o Dia do Consumidor 2027?", a: "Em 15 de março de 2027, uma segunda-feira. As lojas costumam fazer a Semana do Consumidor em torno da data." },
      { q: "Qual é a melhor data para comprar?", a: "Não existe uma resposta única. Depende do produto e da loja. A melhor data é aquela em que o preço chega ao menor valor do histórico que você acompanhou." },
    ],
    fontes: [
      { nome: "Alizila (Alibaba): histórico do 11.11", url: "https://www.alizila.com/a-brief-history-of-an-online-phenomenon/" },
      { nome: "Magazine Luiza, Blog da Lu: o que é o 11.11", url: "https://www.magazineluiza.com.br/blog-da-lu/c/dl/dlgc/o-que-e-11-11-entenda-a-data-que-virou-referencia-em-descontos/14440/" },
      { nome: "Shopee, blog: datas duplas", url: "https://shopee.com.br/blog/datas-duplas-shopee/" },
      { nome: "Shopee, blog: sobre nós", url: "https://shopee.com.br/blog/sobre-nos/" },
      { nome: "Mercado Livre: página de promoções", url: "https://www.mercadolivre.com.br/l/promocoes" },
      { nome: "Amazon, central de ajuda: Prime Day 2026", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=GUZZFPRQHPWM6DK5" },
      { nome: "Magazine Luiza: Liquidação Fantástica 2026", url: "https://especiais.magazineluiza.com.br/liquidacao-fantastica/" },
      { nome: "Confi Neotrust: projeção para a Black Friday 2026 (2026)", url: "https://www.confi.com.vc/blog/black-friday-2026-projecao-neotrust" },
      { nome: "Forbes Brasil: datas duplas no e-commerce, dados Confi Neotrust (2026)", url: "https://forbes.com.br/forbes-money/2026/10/datas-duplas-e-commerce-brasil-consumo/" },
      { nome: "Senacon: Black Friday, como identificar descontos enganosos", url: "https://www.gov.br/mj/pt-br/assuntos/noticias/black-friday-saiba-como-identificar-descontos-enganosos" },
    ],
    conteudo: `<p>Promoção boa quase nunca é surpresa: o comércio repete as mesmas datas todo ano, e quem sabe quando elas chegam consegue acompanhar o preço antes. <strong>Ainda em 2026 faltam o 11.11 (11 de novembro), a Black Friday (27 de novembro), a Cyber Monday (30 de novembro) e o 12.12 (12 de dezembro); em 2027, o calendário começa nas liquidações de janeiro e passa pelo Dia do Consumidor em 15 de março.</strong> As tabelas abaixo trazem todas as datas, conferidas no calendário.</p>

<h2>Quais datas de promoção ainda faltam em 2026?</h2>
<table>
<thead><tr><th>Data</th><th>Dia</th><th>O que é</th></tr></thead>
<tbody>
<tr><td>11.11</td><td>Quarta, 11 de novembro</td><td>Data dupla mais conhecida, com campanha em Shopee, Mercado Livre, Magalu e AliExpress</td></tr>
<tr><td>Black Friday</td><td>Sexta, 27 de novembro</td><td>Maior data de vendas do e-commerce no ano</td></tr>
<tr><td>Cyber Monday</td><td>Segunda, 30 de novembro</td><td>Fecha a semana da Black Friday</td></tr>
<tr><td>12.12</td><td>Sábado, 12 de dezembro</td><td>Última data dupla do ano; na Shopee, liquidação de Natal</td></tr>
<tr><td>Natal</td><td>Sexta, 25 de dezembro</td><td>Compras de presente; confira o prazo de entrega</td></tr>
</tbody>
</table>
<p>Para a reta final de novembro temos três posts: <a href="/blog/black-friday-2026-quando-e">Black Friday 2026: quando é e como se preparar</a>, <a href="/blog/esquenta-black-friday-comprar-antes-ou-esperar">esquenta Black Friday: comprar antes ou esperar</a> e <a href="/blog/cyber-monday-2026-quando-e">Cyber Monday 2026</a>.</p>

<h2>O que são as datas duplas e de onde vem o 11.11?</h2>
<p>Datas duplas são aquelas em que o dia e o mês têm o mesmo número: 7.7, 9.9, 10.10, 11.11, 12.12. Viraram dias de campanha no e-commerce, com cupons e frete grátis concentrados em 24 horas.</p>
<p>A origem é o 11.11. Segundo o Alibaba, a primeira edição foi em 2009, na China: uma liquidação online de 24 horas no Dia dos Solteiros, com 27 lojistas participando. A data deu tão certo que o formato foi copiado para os outros meses.</p>
<p>No Brasil, a Shopee é a loja que mais usa o calendário. Ela dá nome a cada data (o 11.11 é "A Maior Liquida do Ano" e o 12.12 é a "Liquidação de Natal") e informa já ter feito mais de 68 campanhas de datas duplas em seis anos no país. O Mercado Livre e o Magalu também fazem campanha no 11.11, e o Magalu trata a data como esquenta da Black Friday.</p>
<p>O tamanho disso, nos dados da Confi Neotrust: as nove datas duplas de janeiro a setembro de 2026 somaram R$ 14,40 bilhões no e-commerce brasileiro. Para 2026, a projeção da mesma consultoria é de R$ 3,17 bilhões no 11.11 e de R$ 13,3 bilhões nos quatro dias da Black Friday.</p>

<h2>Qual é o calendário de promoções de 2027?</h2>
<p>As datas abaixo são fixas ou seguem regra de calendário (segundo domingo de maio, sexta depois do Dia de Ação de Graças americano). Conferimos uma a uma.</p>
<table>
<thead><tr><th>Mês</th><th>Data</th><th>Dia da semana</th><th>O que é</th></tr></thead>
<tbody>
<tr><td>Janeiro</td><td>Liquidações de início de ano</td><td>Cada loja define</td><td>Queima de estoque depois do Natal</td></tr>
<tr><td>Março</td><td>15 de março</td><td>Segunda</td><td>Dia do Consumidor, com a Semana do Consumidor em volta</td></tr>
<tr><td>Maio</td><td>9 de maio</td><td>Domingo</td><td>Dia das Mães</td></tr>
<tr><td>Junho</td><td>12 de junho</td><td>Sábado</td><td>Dia dos Namorados</td></tr>
<tr><td>Julho</td><td>7 de julho (7.7)</td><td>Quarta</td><td>Data dupla; aniversário da Shopee no Brasil</td></tr>
<tr><td>Agosto</td><td>8 de agosto</td><td>Domingo</td><td>Dia dos Pais</td></tr>
<tr><td>Setembro</td><td>9 de setembro (9.9)</td><td>Quinta</td><td>Data dupla</td></tr>
<tr><td>Outubro</td><td>10 de outubro (10.10)</td><td>Domingo</td><td>Data dupla</td></tr>
<tr><td>Outubro</td><td>12 de outubro</td><td>Terça</td><td>Dia das Crianças</td></tr>
<tr><td>Novembro</td><td>11 de novembro (11.11)</td><td>Quinta</td><td>Data dupla</td></tr>
<tr><td>Novembro</td><td>26 de novembro</td><td>Sexta</td><td>Black Friday</td></tr>
<tr><td>Novembro</td><td>29 de novembro</td><td>Segunda</td><td>Cyber Monday</td></tr>
<tr><td>Dezembro</td><td>12 de dezembro (12.12)</td><td>Domingo</td><td>Data dupla</td></tr>
<tr><td>Dezembro</td><td>25 de dezembro</td><td>Sábado</td><td>Natal</td></tr>
</tbody>
</table>
<p>Nenhuma dessas datas obriga a loja a dar desconto. São convenções do comércio, e cada loja decide se participa, quando começa e quando termina.</p>

<h2>Quais são as datas próprias de cada loja?</h2>
<p>Além do calendário comum, cada loja tem campanhas só dela. As de 2027 ainda não foram anunciadas: a tabela mostra quando aconteceram em 2026, para você ter uma ideia da época.</p>
<table>
<thead><tr><th>Loja</th><th>Campanha</th><th>Quando foi em 2026</th></tr></thead>
<tbody>
<tr><td>Amazon</td><td>Prime Day, para assinantes Prime</td><td>De 1º a 7 de julho</td></tr>
<tr><td>Amazon</td><td>Mega Oferta Amazon Prime</td><td>De 5 a 11 de outubro</td></tr>
<tr><td>Shopee</td><td>7.7, aniversário da chegada ao Brasil</td><td>7 de julho</td></tr>
<tr><td>Magalu</td><td>Liquidação Fantástica</td><td>A partir de 9 de janeiro</td></tr>
<tr><td>AliExpress</td><td>Campanha de aniversário</td><td>De 16 a 25 de março</td></tr>
<tr><td>Mercado Livre</td><td>Liquida nas datas duplas (9.9, 10.10)</td><td>Nas semanas das datas duplas</td></tr>
</tbody>
</table>
<p>As lojas costumam confirmar a data poucas semanas antes. Vale conferir na página oficial de cada uma.</p>

<h2>Data de promoção garante desconto de verdade?</h2>
<p>Não. A data garante campanha, não preço baixo. A Senacon recomenda fazer um acompanhamento prévio dos preços dos produtos que você pretende comprar, usando comparadores e sites que mostram o histórico de valor de cada item.</p>
<p>Com o calendário na mão, isso fica fácil de organizar:</p>
<ol>
<li><strong>Escolha a data pelo produto.</strong> Presente de Dia das Mães se pesquisa em abril, não na véspera.</li>
<li><strong>Comece a anotar o preço quatro semanas antes.</strong> Produto, modelo, loja, preço e data. Mostramos como em <a href="/blog/historico-de-preco-como-consultar">histórico de preço: como consultar e ler</a>.</li>
<li><strong>No dia, compare com o menor preço anotado.</strong> Se o preço da campanha não bate o menor que você já viu, a próxima data dupla chega em um mês.</li>
<li><strong>Desconfie do preço riscado.</strong> O guia <a href="/guias/como-saber-se-a-promocao-e-verdadeira">como saber se a promoção é verdadeira</a> mostra como checar.</li>
</ol>
<p>Como engenheiro, eu gosto do calendário por um motivo simples: ele tira a pressa. Quem sabe que tem outra data no mês seguinte não compra por medo de perder.</p>

<h2>O que o Tem Descontos faz nas datas de promoção?</h2>
<p>O mesmo que nos outros dias, com mais volume. As ofertas saem das 8h às 22h, e cada uma passa por esta conferência antes de ir para o grupo:</p>
<table>
<thead><tr><th>O que conferimos</th><th>O que acontece se falhar</th></tr></thead>
<tbody>
<tr><td>Preço anunciado contra o preço na própria loja</td><td>Mais de 3% abaixo do preço da loja sem cupom que explique: oferta descartada</td></tr>
<tr><td>Preço riscado com mais de 70% de desconto</td><td>Se a loja não confirma, o preço riscado sai do post</td></tr>
<tr><td>Shopee: nota e vendas do produto</td><td>Só sai com nota 4,5 ou mais e 50 vendas ou mais</td></tr>
<tr><td>Destino do link</td><td>Sempre a loja oficial, nunca site intermediário</td></tr>
</tbody>
</table>
<p>Nas datas de campanha chegam mais cupons, e eles vão junto com a oferta. Como usar cada um está em <a href="/blog/cupom-shopee-e-mercado-livre-como-usar">cupom da Shopee e do Mercado Livre</a>.</p>

<h2>Resumo para não esquecer</h2>
<ul>
<li>Faltam em 2026: 11.11, Black Friday (27/11), Cyber Monday (30/11) e 12.12.</li>
<li>Datas duplas repetem dia e mês; o 11.11 nasceu na China em 2009.</li>
<li>Em 2027: Dia do Consumidor em 15/03, Black Friday em 26/11, Cyber Monday em 29/11.</li>
<li>Cada loja tem campanhas próprias e confirma a data perto do dia.</li>
<li>Data de promoção não garante desconto: acompanhe o preço quatro semanas antes.</li>
</ul>`,
  },
  {
    slug: "como-saber-se-um-site-e-confiavel",
    titulo: "Como saber se um site de compras é confiável antes de pagar",
    metaTitle: "Como saber se um site de compras é confiável: 5 checagens",
    metaDescription: "Confira o endereço, o CNPJ na Receita, o dono do domínio, a reputação e a lista do Procon-SP antes de pagar. Veja os sinais de site falso e o que fazer.",
    resumo: "Cinco checagens gratuitas, em fontes oficiais, para saber se uma loja online existe de verdade antes de pagar. E o que fazer se o site era falso.",
    resumoRapido: [
      "Confira o endereço letra por letra: site falso costuma copiar o nome da loja com uma letra trocada.",
      "Consulte o CNPJ na Receita Federal (grátis) e o dono do domínio no Registro.br.",
      "Veja a reputação no consumidor.gov.br e a lista \"Evite esses sites\" do Procon-SP.",
      "Cadeado no navegador não prova que a loja é honesta, e site que só aceita Pix ou boleto pede cuidado dobrado."
    ],
    dataPublicacao: "2026-11-11",
    revisadoEm: "novembro de 2026",
    tags: ["site confiável", "como saber se um site é confiável", "site falso", "consultar cnpj de loja", "evite esses sites procon", "loja online é segura"],
    servico: "grupo-de-ofertas-no-whatsapp-e-seguro",
    categoria: "seus-direitos",
    imagem: "/blog/como-saber-se-um-site-e-confiavel.webp",
    faq: [
      { q: "Como saber se um site de compras é confiável?", a: "Confira se o endereço é exatamente o da loja, consulte o CNPJ na Receita Federal, veja quem registrou o domínio no Registro.br, pesquise a reputação no consumidor.gov.br e veja se o site está na lista \"Evite esses sites\" do Procon-SP." },
      { q: "O cadeado no navegador garante que o site é seguro?", a: "Não. O cadeado indica só que a conexão é criptografada. Site falso também pode ter cadeado, então ele não prova que a loja existe nem que vai entregar." },
      { q: "Onde consultar o CNPJ de uma loja online?", a: "No site da Receita Federal, no serviço de Comprovante de Inscrição e de Situação Cadastral. A consulta é gratuita e mostra se o CNPJ está ativo. O nome que aparece deve bater com o da loja." },
      { q: "Paguei por Pix em um site falso. O que fazer?", a: "Avise o seu banco o quanto antes e peça a abertura do Mecanismo Especial de Devolução (MED). Segundo o Banco Central, o pedido vale para transações feitas há no máximo 80 dias, em caso de suspeita de fraude." },
      { q: "Site que não está na lista do Procon é confiável?", a: "Não necessariamente. A lista reúne sites que receberam reclamação, foram notificados e não responderam ou não foram encontrados. Um site novo de golpe pode ainda não ter entrado nela." },
    ],
    fontes: [
      { nome: "Procon-SP: lista Evite esses sites", url: "https://sistemas.procon.sp.gov.br/evitesite/list/evitesites.php" },
      { nome: "Decreto 7.962/2013, comércio eletrônico (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm" },
      { nome: "Receita Federal: comprovante de inscrição e de situação cadastral do CNPJ", url: "https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/" },
      { nome: "Registro.br: consulta Whois", url: "https://registro.br/tecnologia/ferramentas/whois/" },
      { nome: "NIC.br: 8 formas de identificar se um site é seguro ou falso", url: "https://www.nic.br/noticia/na-midia/8-formas-de-identificar-se-um-site-e-seguro-ou-falso/" },
      { nome: "consumidor.gov.br: empresas participantes e indicadores", url: "https://www.consumidor.gov.br/" },
      { nome: "Senacon, Ministério da Justiça: Black Friday 2025, orientações (2025)", url: "https://www.gov.br/mj/pt-br/assuntos/noticias/black-friday-2025-senacon-orienta-consumidores-a-evitar-golpes-e-comprar-com-seguranca" },
      { nome: "Febraban: golpe da falsa venda, 1º semestre de 2025 (2025)", url: "https://portal.febraban.org.br/noticia/4381/pt-br/" },
      { nome: "Banco Central: guia do Mecanismo Especial de Devolução (MED)", url: "https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Guia_MED.pdf" },
      { nome: "Google: status do site no Navegação segura", url: "https://transparencyreport.google.com/safe-browsing/search?hl=pt_BR" },
      { nome: "Serasa Experian: anúncios falsos na semana da Black Friday 2025 (2025)", url: "https://www.serasaexperian.com.br/sala-de-imprensa/prevencao-a-fraude/anuncios-falsos-disparam-147-na-semana-da-black-friday-aponta-serasa-experian/" },
      { nome: "Procon-SP: balanço da Black Friday 2025 (2025)", url: "https://www.procon.sp.gov.br/black-friday-2025-procon-sp-recebe-mais-de-3-mil-interacoes-e-encontra-irregularidades-em-mais-de-340-estabelecimentos-em-todo-o-estado/" },
    ],
    conteudo: `<p>O preço está ótimo, a loja você nunca viu, e o anúncio apareceu no meio do seu feed. Antes de digitar o cartão ou mandar o Pix, dá para descobrir em cinco minutos se aquela loja existe. <strong>Confira cinco coisas, todas de graça: o endereço do site letra por letra, o CNPJ na Receita Federal, o dono do domínio no Registro.br, a reputação no consumidor.gov.br e a lista "Evite esses sites" do Procon-SP.</strong> Se o endereço não bate, o CNPJ não existe ou o site está na lista do Procon, não compre.</p>

<h2>O que a lei obriga um site de compras a mostrar?</h2>
<p>O Decreto 7.962/2013, que regula o comércio eletrônico, determina no art. 2º que o site mostre, em local de destaque e de fácil visualização, o nome empresarial e o número do CNPJ (ou CPF) de quem vende, além do endereço físico e eletrônico e das informações para contato.</p>
<p>Na prática: role até o rodapé. Loja séria mostra razão social, CNPJ e endereço. Se não tem nada disso, ou se só existe um formulário de contato, o site já está descumprindo a regra antes de vender qualquer coisa.</p>

<h2>Como conferir a loja em 5 passos?</h2>
<table>
<thead><tr><th>O que conferir</th><th>Onde</th><th>O que você quer ver</th></tr></thead>
<tbody>
<tr><td>Endereço do site</td><td>Barra do navegador</td><td>Exatamente o endereço da loja, sem letra a mais ou trocada</td></tr>
<tr><td>CNPJ</td><td>Receita Federal, comprovante de situação cadastral</td><td>Situação ativa e nome igual ao da loja</td></tr>
<tr><td>Dono do domínio</td><td>Registro.br, consulta Whois (sites terminados em .br)</td><td>O mesmo CNPJ do rodapé e um domínio que não foi criado na semana passada</td></tr>
<tr><td>Reputação</td><td>consumidor.gov.br e sites de reclamação</td><td>Empresa que responde e resolve</td></tr>
<tr><td>Lista de sites a evitar</td><td>Procon-SP, "Evite esses sites"</td><td>O site fora da lista</td></tr>
</tbody>
</table>
<h3>1. Leia o endereço letra por letra</h3>
<p>A Febraban alerta para sites clonados com uma pequena alteração no endereço: uma letra a mais, um zero no lugar da letra "o". A orientação é digitar o endereço da loja no navegador em vez de clicar em link recebido por mensagem ou anúncio.</p>
<h3>2. Consulte o CNPJ na Receita Federal</h3>
<p>O serviço de Comprovante de Inscrição e de Situação Cadastral é gratuito e não pede login: você digita o CNPJ que está no rodapé do site e vê se ele existe e se está ativo. Compare o nome que aparece com o nome da loja. CNPJ de uma empresa que não tem relação com o que o site vende é sinal de dado copiado.</p>
<h3>3. Veja quem registrou o domínio</h3>
<p>Para sites terminados em .br, a consulta Whois do Registro.br mostra quem é o titular do domínio. Para empresa, aparecem o nome empresarial e o CNPJ. Vale olhar também há quanto tempo o domínio existe: quanto mais recente, maior o risco. Uma "loja tradicional" com domínio de poucos dias não fecha a conta.</p>
<h3>4. Pesquise a reputação</h3>
<p>No consumidor.gov.br, plataforma do governo federal, o perfil de cada empresa mostra o índice de solução das reclamações, a satisfação de quem reclamou e o prazo médio de resposta. A participação das empresas é voluntária, então não achar a loja lá não prova nada contra ela. Complete a pesquisa em sites de reclamação e leia as queixas mais recentes, não só a nota.</p>
<h3>5. Consulte a lista do Procon-SP</h3>
<p>O Procon-SP mantém a lista "Evite esses sites", com endereços que tiveram reclamações de consumidores, foram notificados e não responderam ou não foram encontrados. Vale para o Brasil todo como consulta. Só não leia ao contrário: site fora da lista não está aprovado, ele só não foi denunciado ainda.</p>
<p>Um extra para quem quer ir além: a ferramenta "Navegação segura", do Google, informa se um endereço está marcado como perigoso por vírus ou roubo de dados. Ela não avalia se a loja entrega.</p>

<h2>O cadeado garante que o site é seguro?</h2>
<p>Não. O cadeado ao lado do endereço indica que a conexão entre você e o site é criptografada, e só isso. Em material divulgado pelo NIC.br, o órgão que cuida dos domínios .br, o aviso é que nada impede criminosos de usar o cadeado para o site parecer legítimo.</p>
<p>O cadeado continua sendo necessário: sem ele, não digite dado nenhum. Ele só não é suficiente. Como engenheiro, eu trato o cadeado como o cinto de segurança: obrigatório, mas não me diz quem está dirigindo.</p>

<h2>Quais sinais indicam um site falso?</h2>
<p>Os alertas da Senacon, do Ministério da Justiça, e da Febraban apontam os mesmos sinais:</p>
<ul>
<li><strong>Preço muito abaixo do mercado.</strong> Para a Senacon, oferta extremamente baixa pode indicar fraude ou produto falsificado. Se você acompanha o preço, sabe o que é baixo demais: veja <a href="/blog/historico-de-preco-como-consultar">como consultar o histórico de preço</a>.</li>
<li><strong>Só aceita Pix, boleto ou transferência.</strong> A Senacon explica que golpistas preferem esses meios porque dificultam o reembolso.</li>
<li><strong>Loja recém-criada em rede social.</strong> A Febraban cita perfis novos, com ofertas muito vantajosas e só depoimentos positivos.</li>
<li><strong>Sem CNPJ, sem endereço e sem canal de atendimento.</strong> A Senacon recomenda conferir se o CNPJ está ativo e se há canais de atendimento.</li>
<li><strong>Endereço parecido com o de loja famosa.</strong> É o site clonado do passo 1.</li>
</ul>
<p>Um sinal sozinho pode ser coincidência. Dois ou mais, feche a aba. Golpe também chega por mensagem, e os sinais em grupo de ofertas estão no guia <a href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro">grupo de ofertas no WhatsApp é seguro?</a></p>

<h2>Como pagar com menos risco em loja que você não conhece?</h2>
<p>A Senacon recomenda priorizar o cartão de crédito em loja desconhecida. Se for pagar por Pix, o Banco Central orienta conferir sempre o nome do destinatário antes de confirmar: o aplicativo mostra quem vai receber. Nome de pessoa física ou de empresa diferente da loja é motivo para cancelar.</p>
<p>A comparação completa entre os dois meios está em <a href="/blog/pix-ou-cartao-compra-online">Pix ou cartão na compra online</a>.</p>

<h2>Os golpes aumentam na Black Friday?</h2>
<p>Aumentam, e há números para isso:</p>
<ul>
<li>A Serasa Experian informou que os anúncios falsos subiram 147% na semana da Black Friday de 2025, e que mapeou 103 sites falsos no período.</li>
<li>A Febraban registrou o golpe da falsa venda como o mais relatado por clientes de bancos no 1º semestre de 2025: 174 mil ocorrências, 314% a mais que no mesmo período de 2024.</li>
<li>O Procon-SP recebeu 2.979 reclamações na Black Friday de 2025, contra 2.133 no ano anterior.</li>
</ul>
<p>Em 2026 a data cai em 27 de novembro. O que fazer antes dela está em <a href="/blog/black-friday-2026-quando-e">Black Friday 2026: quando é e como se preparar</a>.</p>

<h2>Paguei e era golpe: o que fazer?</h2>
<ol>
<li><strong>Avise o seu banco na hora.</strong> No Pix, peça a abertura do Mecanismo Especial de Devolução (MED). Segundo o guia do Banco Central, o pedido vale para transações feitas há no máximo 80 dias, e o MED serve para suspeita de fraude. Ele não cobre desacordo com loja verdadeira, como atraso na entrega.</li>
<li><strong>No cartão, conteste a compra</strong> com a operadora e bloqueie o cartão se digitou os dados em site suspeito.</li>
<li><strong>Guarde as provas:</strong> prints do site, do anúncio, da conversa e do comprovante.</li>
<li><strong>Registre boletim de ocorrência</strong> e denuncie o site ao Procon do seu estado.</li>
</ol>
<p>Quanto mais rápido o aviso ao banco, maior a chance de ainda haver dinheiro na conta de destino.</p>

<h2>O que o Tem Descontos faz para você não cair em site falso?</h2>
<table>
<thead><tr><th>O que nós fazemos</th><th>Por que importa</th></tr></thead>
<tbody>
<tr><td>Link sempre para a loja oficial (Amazon, Mercado Livre, Shopee, Magalu), nunca para site intermediário</td><td>A compra acontece na loja, com as proteções dela</td></tr>
<tr><td>Conferimos o preço na própria loja antes de enviar</td><td>Preço mais de 3% abaixo do da loja sem cupom que explique: oferta descartada</td></tr>
<tr><td>Shopee: só produto com nota 4,5 ou mais e 50 vendas ou mais</td><td>Menos risco de vendedor que não entrega</td></tr>
<tr><td>Não pedimos dado pessoal, Pix ou código no privado</td><td>Se alguém pedir em nosso nome, é golpe</td></tr>
</tbody>
</table>
<p>Mesmo assim, confira o endereço antes de pagar: é um hábito de dez segundos. Quem somos está em <a href="/sobre">sobre o Tem Descontos</a>.</p>

<h2>Resumo para não esquecer</h2>
<ul>
<li>Endereço exato, CNPJ ativo, dono do domínio, reputação e lista do Procon-SP: cinco checagens grátis.</li>
<li>A lei obriga o site a mostrar nome empresarial, CNPJ e endereço.</li>
<li>Cadeado é necessário, mas não prova que a loja é honesta.</li>
<li>Preço baixo demais e pagamento só por Pix ou boleto são os sinais mais comuns.</li>
<li>Caiu em golpe no Pix: avise o banco na hora e peça o MED.</li>
</ul>`,
  },
  {
    slug: "compra-online-nao-chegou-o-que-fazer",
    titulo: "Compra online não chegou ou atrasou: o que fazer",
    metaTitle: "Compra online não chegou ou atrasou: o que fazer",
    metaDescription: "O prazo de entrega venceu e a compra não chegou? Veja os 3 direitos do art. 35 do CDC, o caminho em cada loja e como reclamar se a loja não resolver.",
    resumo: "Passou o prazo e o pedido não chegou: você pode exigir a entrega, aceitar outro produto ou cancelar e receber tudo de volta. Veja o caminho em cada loja.",
    resumoRapido: [
      "Atraso na entrega é descumprimento de oferta: pelo art. 35 do CDC você escolhe entre exigir a entrega, aceitar produto equivalente ou cancelar com o dinheiro de volta.",
      "Comece pelo canal da própria loja, por escrito, e guarde protocolo e prints.",
      "Cada loja tem prazo para abrir a reclamação: confira no seu pedido e não deixe passar.",
      "Sem solução: consumidor.gov.br (a empresa tem 10 dias para responder), Procon e Juizado Especial Cível."
    ],
    dataPublicacao: "2026-11-11",
    revisadoEm: "novembro de 2026",
    tags: ["compra não chegou", "pedido atrasado o que fazer", "atraso na entrega", "produto não entregue", "cancelar compra por atraso"],
    servico: "grupo-de-ofertas-no-whatsapp-e-seguro",
    categoria: "seus-direitos",
    imagem: "/blog/compra-online-nao-chegou-o-que-fazer.webp",
    faq: [
      { q: "A compra não chegou no prazo. Posso cancelar?", a: "Sim. Pelo art. 35 do Código de Defesa do Consumidor, se a loja não cumpre a oferta você pode rescindir o contrato e receber de volta o que pagou, com correção. O Procon-SP orienta que esse cancelamento é imediato à solicitação." },
      { q: "A loja pode me obrigar a esperar mais?", a: "Não. A escolha é sua: exigir a entrega, aceitar outro produto equivalente ou cancelar com devolução do valor. A loja pode propor uma nova data, mas você não é obrigado a aceitar." },
      { q: "O pedido aparece como entregue, mas não recebi. E agora?", a: "Avise a loja imediatamente pelo canal oficial e peça o comprovante de entrega. O prazo para contestar costuma ser curto: no Magalu, por exemplo, são 7 dias corridos a partir da data de entrega que consta no pedido." },
      { q: "Tenho direito a indenização por atraso na entrega?", a: "Não automaticamente. O STJ entende que a falha na entrega é, em princípio, descumprimento de contrato, e que o dano moral depende de prova de uma situação excepcional. A devolução do valor pago, com correção, é direito previsto no art. 35." },
      { q: "Posso pedir estorno no cartão se o produto não chegou?", a: "Pode pedir a contestação da compra ao banco emissor, que costuma exigir prova de que você tentou resolver com a loja. Atenção: a Amazon informa que quem contesta a cobrança no cartão perde o direito à Garantia de A a Z." },
    ],
    fontes: [
      { nome: "Código de Defesa do Consumidor, Lei 8.078/1990, texto compilado (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" },
      { nome: "Decreto 7.962/2013, comércio eletrônico (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm" },
      { nome: "Procon-SP: guia de comércio eletrônico", url: "https://www.procon.sp.gov.br/wp-content/uploads/2024/08/Guia_de_Comercio_Eletronico.pdf" },
      { nome: "Senacon, Ministério da Justiça: Black Friday 2025, orientações (2025)", url: "https://www.gov.br/mj/pt-br/assuntos/noticias/black-friday-2025-senacon-orienta-consumidores-a-evitar-golpes-e-comprar-com-seguranca" },
      { nome: "consumidor.gov.br: como funciona", url: "https://www.consumidor.gov.br/pages/principal/como-funciona" },
      { nome: "STJ: falta de estoque não impede consumidor de exigir entrega do produto anunciado (2021)", url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/26042021-Falta-de-estoque-nao-impede-consumidor-de-exigir-entrega-do-produto-anunciado.aspx" },
      { nome: "STJ: dano moral e o esforço para evitar a indústria das indenizações (2015)", url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias-antigas/2015/2015-02-08_08-00_Dano-moral-o-esforco-diario-da-Justica-para-evitar-a-industria-das-indenizacoes.aspx" },
      { nome: "Amazon, central de ajuda: entregas atrasadas", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=GL669SSDXFCJ2ZA6" },
      { nome: "Amazon, central de ajuda: Garantia de A a Z", url: "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=GQ37ZCNECJKTFYQV" },
      { nome: "Mercado Livre: Compra Garantida", url: "https://www.mercadolivre.com.br/compra-garantida" },
      { nome: "Shopee, central de ajuda: Garantia Shopee", url: "https://help.shopee.com.br/portal/4/article/76327" },
      { nome: "Magazine Luiza, atendimento: pedido consta como entregue", url: "https://atendimento.magazineluiza.com.br/hc/pt-br/articles/360045464832" },
      { nome: "Correios: rastreamento de objetos", url: "https://rastreamento.correios.com.br/" },
      { nome: "Procon-SP: balanço da Black Friday 2025 (2025)", url: "https://www.procon.sp.gov.br/black-friday-2025-procon-sp-recebe-mais-de-3-mil-interacoes-e-encontra-irregularidades-em-mais-de-340-estabelecimentos-em-todo-o-estado/" },
    ],
    conteudo: `<p>O prazo passou, o rastreio parou de atualizar e a loja responde com mensagem automática. É o problema mais comum da Black Friday: no balanço do Procon-SP de 2025, a não entrega ou a entrega com atraso respondeu por 31,62% das reclamações. <strong>Se a compra não chegou no prazo, a loja descumpriu a oferta, e o art. 35 do Código de Defesa do Consumidor deixa a escolha com você: exigir a entrega, aceitar um produto equivalente ou cancelar e receber de volta tudo o que pagou.</strong> O caminho começa na própria loja e tem prazo.</p>

<h2>O que a lei garante quando a compra não chega?</h2>
<p>Três saídas, e quem escolhe é você. O art. 35 do Código de Defesa do Consumidor (Lei 8.078/1990) diz que, se o fornecedor recusar cumprimento à oferta, o consumidor pode, "alternativamente e à sua livre escolha":</p>
<ul>
<li>"exigir o cumprimento forçado da obrigação, nos termos da oferta, apresentação ou publicidade";</li>
<li>"aceitar outro produto ou prestação de serviço equivalente";</li>
<li>"rescindir o contrato, com direito à restituição de quantia eventualmente antecipada, monetariamente atualizada, e a perdas e danos".</li>
</ul>
<p>O Procon-SP confirma, no guia de comércio eletrônico, que a não entrega caracteriza descumprimento de oferta, e que o cancelamento por esse motivo é imediato à solicitação: a loja não pode cobrar nada e deve devolver o que já foi pago.</p>
<p>Outros dois pontos da lei ajudam:</p>
<ul>
<li><strong>Prazo é obrigatório.</strong> O art. 39, inciso XII, do CDC considera prática abusiva "deixar de estipular prazo para o cumprimento de sua obrigação". E o Decreto 7.962/2013 exige que o site informe o prazo de entrega antes da compra.</li>
<li><strong>"Acabou o estoque" não encerra a conversa.</strong> O STJ decidiu em 2021 que, se a loja ainda tiver como entregar o produto, mesmo precisando comprá-lo de outra empresa, o consumidor continua podendo exigir a entrega.</li>
</ul>

<h2>O que fazer, passo a passo?</h2>
<ol>
<li><strong>Confira o prazo e o rastreio.</strong> Veja a data prometida no pedido e o último registro do rastreamento. Tire print dos dois.</li>
<li><strong>Reclame pelo canal oficial da loja, por escrito.</strong> Chat, e-mail ou a área do pedido. Diga o que você escolheu: nova data de entrega, produto equivalente ou cancelamento com reembolso. Anote o protocolo.</li>
<li><strong>Use a proteção da plataforma dentro do prazo.</strong> Em marketplace, a reclamação formal dentro do sistema é o que libera o reembolso. A tabela abaixo mostra onde.</li>
<li><strong>Sem resposta, suba a reclamação.</strong> consumidor.gov.br, Procon e, se precisar, Juizado Especial Cível.</li>
</ol>
<p>A Senacon recomenda guardar prints, e-mails e comprovantes da compra: são a prova da oferta e de que você tentou resolver.</p>

<h2>Qual é o caminho em cada loja?</h2>
<p>As regras abaixo vêm das centrais de ajuda das lojas, consultadas em novembro de 2026. Elas mudam, e o prazo que vale é o que aparece no seu pedido.</p>
<table>
<thead><tr><th>Loja</th><th>O que fazer</th><th>Prazo informado</th></tr></thead>
<tbody>
<tr><td>Amazon, pedido enviado pela Amazon</td><td>Esperar um dia útil depois da data estimada e falar com o atendimento</td><td>Até 30 dias depois da data estimada de entrega</td></tr>
<tr><td>Amazon, vendedor parceiro</td><td>Falar com o vendedor; sem solução, pedir a Garantia de A a Z</td><td>Até 90 dias depois da data máxima estimada de entrega</td></tr>
<tr><td>Mercado Livre</td><td>Abrir reclamação pela Compra Garantida</td><td>28 dias a partir da data da compra para produto que não chegou</td></tr>
<tr><td>Shopee</td><td>Pedir reembolso no aplicativo com o motivo de pedido não recebido, sem marcar o pedido como recebido</td><td>Dentro do período da Garantia Shopee, que aparece no pedido</td></tr>
<tr><td>Magalu</td><td>Em "Meus pedidos", abrir o pedido e usar a opção de entrega atrasada</td><td>Se constar como entregue, 7 dias corridos para contestar</td></tr>
</tbody>
</table>
<p>Na Shopee, o detalhe que mais custa dinheiro: o pagamento fica retido até você confirmar o recebimento ou a garantia expirar. Quem toca em "Pedido recebido" sem ter recebido libera o dinheiro para o vendedor.</p>
<p>Cada programa tem um post nosso com o passo a passo: <a href="/blog/compra-garantida-mercado-livre">Compra Garantida do Mercado Livre</a>, <a href="/blog/garantia-de-a-a-z-amazon">Garantia de A a Z da Amazon</a> e <a href="/blog/como-saber-se-loja-da-shopee-e-confiavel">como saber se uma loja da Shopee é confiável</a>.</p>

<h2>O pedido aparece como entregue e eu não recebi. E agora?</h2>
<p>Aja no mesmo dia. Esse é o caso com prazo mais curto.</p>
<ul>
<li>Confira com quem mora com você, com a portaria e com vizinhos.</li>
<li>Peça à loja o comprovante de entrega: quem assinou, onde e quando.</li>
<li>Abra a contestação pelo canal oficial e guarde o protocolo.</li>
</ul>
<p>Se a entrega foi pelos Correios, você pode acompanhar pelo site de rastreamento, com o código do objeto. A reclamação por objeto não entregue cabe a quem enviou, então o seu caminho continua sendo a loja.</p>

<h2>A loja não resolveu. Onde reclamar?</h2>
<table>
<thead><tr><th>Onde</th><th>Como funciona</th></tr></thead>
<tbody>
<tr><td>consumidor.gov.br</td><td>Plataforma do governo federal. A empresa tem até 10 dias para responder e você tem até 20 dias para avaliar se foi resolvido. Só atende empresas cadastradas</td></tr>
<tr><td>Procon do seu estado ou cidade</td><td>Registra a reclamação e notifica a empresa</td></tr>
<tr><td>Juizado Especial Cível</td><td>Para pedir na Justiça a entrega ou a devolução do valor. Em causas de até 20 salários mínimos, não precisa de advogado</td></tr>
</tbody>
</table>
<p>Esses são os três canais que a Senacon indica. Leve os prints, o protocolo da loja e o comprovante de pagamento.</p>

<h2>Posso pedir estorno no cartão?</h2>
<p>Pode pedir a contestação da compra ao banco que emitiu o cartão. Produto não recebido está entre os motivos de contestação aceitos pelas bandeiras, e os bancos costumam pedir prova de que você tentou resolver com a loja antes. O prazo varia por banco e bandeira: pergunte ao seu.</p>
<p>Um cuidado: na Amazon, quem contesta a cobrança no cartão deixa de ser elegível para o reembolso da Garantia de A a Z. Escolha um caminho de cada vez. A diferença de proteção entre os meios de pagamento está em <a href="/blog/pix-ou-cartao-compra-online">Pix ou cartão na compra online</a>.</p>

<h2>Tenho direito a indenização pelo atraso?</h2>
<p>Não automaticamente. O STJ já decidiu, em caso de produto comprado pela internet para o Natal que não chegou a tempo, que a falha na entrega é, em princípio, descumprimento de contrato, e que o dano moral só cabe em situação excepcional, com ofensa que vá além do aborrecimento. O que a lei prevê é a devolução do valor, com correção, e a reparação de prejuízo material que você conseguir comprovar.</p>
<p>Como engenheiro, eu separo o que é certo do que é possível: o reembolso é direito previsto em lei, a indenização depende do caso. Vale conversar com um advogado ou com a Defensoria se o atraso causou prejuízo real.</p>

<h2>E se a loja nem existir?</h2>
<p>Se o site sumiu, não responde e não tem CNPJ, o problema deixa de ser atraso e passa a ser golpe. Avise o banco na hora. O que conferir antes de comprar está em <a href="/blog/como-saber-se-um-site-e-confiavel">como saber se um site de compras é confiável</a>, e os sinais de golpe em grupo estão no guia <a href="/guias/grupo-de-ofertas-no-whatsapp-e-seguro">grupo de ofertas no WhatsApp é seguro?</a></p>

<h2>O que o Tem Descontos faz para reduzir esse risco?</h2>
<p>Nós não entregamos nada: a compra é feita na loja, e a entrega é responsabilidade dela. O que fazemos é escolher para onde o link aponta.</p>
<table>
<thead><tr><th>O que conferimos</th><th>O que isso evita</th></tr></thead>
<tbody>
<tr><td>Link sempre para a loja oficial, nunca para site intermediário</td><td>Compra fora das proteções da plataforma</td></tr>
<tr><td>Shopee: só produto com nota 4,5 ou mais e 50 vendas ou mais; acima de R$ 1.000, só de Loja Oficial ou loja indicada</td><td>Vendedor sem histórico de entrega</td></tr>
<tr><td>Produto do link igual ao do texto, em nome e quantidade</td><td>Receber algo diferente do anunciado</td></tr>
</tbody>
</table>
<p>Se o pedido atrasar, o caminho é o deste post, direto com a loja. Quem somos está em <a href="/sobre">sobre o Tem Descontos</a>.</p>

<h2>Resumo para não esquecer</h2>
<ul>
<li>Atraso é descumprimento de oferta: entrega, produto equivalente ou dinheiro de volta, à sua escolha (CDC, art. 35).</li>
<li>Reclame por escrito no canal da loja e guarde protocolo e prints.</li>
<li>Em marketplace, abra a reclamação dentro do prazo do programa de proteção.</li>
<li>Na Shopee, não marque o pedido como recebido antes de receber.</li>
<li>Sem solução: consumidor.gov.br, Procon e Juizado Especial Cível.</li>
</ul>`,
  },
  {
    slug: "loja-cancelou-compra-preco-errado",
    titulo: "Loja cancelou a compra por preço errado: é obrigada a vender?",
    metaTitle: "Loja cancelou a compra por preço errado: pode fazer isso?",
    metaDescription: "A oferta anunciada obriga a loja, mas erro grosseiro de preço é exceção. Veja quando a loja tem de cumprir, quando pode cancelar e como exigir seu direito.",
    resumo: "Oferta anunciada obriga a loja a cumprir, mas a Justiça abre exceção para erro grosseiro de preço. Veja a diferença e o que fazer se cancelarem o seu pedido.",
    resumoRapido: [
      "Regra: a oferta anunciada obriga a loja (CDC, art. 30), e cancelar indevidamente pedido já pago, alegando erro de sistema ou falta de estoque, é prática abusiva, segundo a Senacon.",
      "Exceção: erro grosseiro de preço, evidente para qualquer pessoa e corrigido rápido, não obriga a loja, segundo o STJ.",
      "Falta de estoque não é desculpa: o STJ decidiu que o consumidor pode exigir a entrega enquanto o produto existir no mercado.",
      "Guarde prints do anúncio e do pedido: sem prova da oferta, não há como exigir."
    ],
    dataPublicacao: "2026-11-11",
    revisadoEm: "novembro de 2026",
    tags: ["loja cancelou minha compra", "preço errado loja é obrigada a vender", "erro de preço", "oferta não cumprida", "pedido cancelado pela loja"],
    servico: "como-saber-se-a-promocao-e-verdadeira",
    categoria: "seus-direitos",
    imagem: "/blog/loja-cancelou-compra-preco-errado.webp",
    faq: [
      { q: "A loja anunciou um preço errado. Ela é obrigada a vender?", a: "Em regra, sim: pelo art. 30 do Código de Defesa do Consumidor, a oferta obriga quem a anunciou. A exceção é o erro grosseiro, quando o preço é tão baixo que qualquer pessoa percebe o engano. Nesse caso, o STJ já decidiu que a loja não é obrigada a cumprir." },
      { q: "A loja pode cancelar um pedido que eu já paguei?", a: "Não por conta própria e sem motivo justo. A Senacon classifica como prática abusiva o cancelamento depois do pagamento com alegação de erro de sistema ou falta de estoque. Você pode exigir a entrega, aceitar produto equivalente ou receber o dinheiro de volta com correção." },
      { q: "O que é erro grosseiro de preço?", a: "É o erro evidente: um preço muito abaixo do valor de mercado, que o consumidor percebe com facilidade. No caso julgado pelo STJ em 2020, pesaram também o cancelamento rápido da reserva e o fato de nada ter sido cobrado no cartão." },
      { q: "O preço no carrinho apareceu maior que o do anúncio. Qual vale?", a: "A Lei 10.962/2004 determina que, havendo divergência de preços para o mesmo produto entre os sistemas de informação do estabelecimento, o consumidor paga o menor. Guarde o print do anúncio com o preço menor." },
      { q: "Onde reclamar se a loja não cumprir a oferta?", a: "Primeiro na própria loja, por escrito. Depois no consumidor.gov.br, no Procon e, se necessário, no Juizado Especial Cível, onde causas de até 20 salários mínimos dispensam advogado." },
    ],
    fontes: [
      { nome: "Código de Defesa do Consumidor, Lei 8.078/1990, texto compilado (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" },
      { nome: "Lei 10.962/2004, oferta e afixação de preços (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10.962.htm" },
      { nome: "Lei 13.543/2017, preço no comércio eletrônico (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13543.htm" },
      { nome: "Lei 9.099/1995, Juizados Especiais (Planalto)", url: "https://www.planalto.gov.br/ccivil_03/leis/l9099.htm" },
      { nome: "STJ, Informativo 671: REsp 1.794.991/SE, erro grosseiro de preço (2020)", url: "https://scon.stj.jus.br/jurisprudencia/externo/informativo/?acao=pesquisarumaedicao&livre=%270671%27.cod." },
      { nome: "STJ: falta de estoque não impede consumidor de exigir entrega do produto anunciado (2021)", url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/26042021-Falta-de-estoque-nao-impede-consumidor-de-exigir-entrega-do-produto-anunciado.aspx" },
      { nome: "Senacon, Ministério da Justiça: Black Friday 2025, orientações (2025)", url: "https://www.gov.br/mj/pt-br/assuntos/noticias/black-friday-2025-senacon-orienta-consumidores-a-evitar-golpes-e-comprar-com-seguranca" },
      { nome: "Procon Goiás: orientação sobre divergência de preços", url: "https://goias.gov.br/procon/procon-goias-orienta-sobre-divergencia-de-precos/" },
      { nome: "consumidor.gov.br: como funciona", url: "https://www.consumidor.gov.br/pages/principal/como-funciona" },
      { nome: "Mercado Livre, central de vendedores: cancelamentos", url: "https://vendedores.mercadolivre.com.br/aprender/nota/cancelamentos-como-evita-los" },
      { nome: "Procon-SP: balanço da Black Friday 2025 (2025)", url: "https://www.procon.sp.gov.br/black-friday-2025-procon-sp-recebe-mais-de-3-mil-interacoes-e-encontra-irregularidades-em-mais-de-340-estabelecimentos-em-todo-o-estado/" },
    ],
    conteudo: `<p>Você achou o preço, pagou, comemorou, e no dia seguinte chegou o e-mail: "seu pedido foi cancelado por um erro no sistema". Na Black Friday de 2025, pedido cancelado pelo fornecedor foi o segundo motivo de reclamação no Procon-SP, com 15,51% das queixas. <strong>A regra é que a oferta anunciada obriga a loja a cumprir, e cancelar indevidamente pedido já pago é prática abusiva; a exceção é o erro grosseiro de preço, evidente para qualquer pessoa, em que a Justiça desobriga a loja.</strong> Saber de que lado o seu caso está muda o que vale a pena exigir.</p>

<h2>O que a lei diz sobre a oferta anunciada?</h2>
<p>Que ela vale como contrato. O art. 30 do Código de Defesa do Consumidor (Lei 8.078/1990) diz:</p>
<p>"Toda informação ou publicidade, suficientemente precisa, veiculada por qualquer forma ou meio de comunicação com relação a produtos e serviços oferecidos ou apresentados, obriga o fornecedor que a fizer veicular ou dela se utilizar e integra o contrato que vier a ser celebrado."</p>
<p>Se a loja se recusa a cumprir, o art. 35 dá três saídas, à escolha do consumidor: exigir o cumprimento forçado da oferta, aceitar outro produto equivalente ou rescindir o contrato, com devolução do valor pago, corrigido, e perdas e danos.</p>
<p>A Senacon, do Ministério da Justiça, aplicou isso à Black Friday na nota de 2025: cancelamento indevido depois do pagamento, com alegação de erro de sistema ou falta de estoque, configura prática abusiva.</p>

<h2>Quando a loja não é obrigada a cumprir?</h2>
<p>Quando o erro de preço é grosseiro. O caso de referência é do STJ (REsp 1.794.991, 3ª Turma, julgado em 2020): um casal reservou passagens internacionais por um preço muito baixo, a reserva foi cancelada dois dias depois e nada chegou a ser cobrado no cartão. O tribunal decidiu que as empresas não precisavam emitir os bilhetes. O entendimento foi que erro grosseiro de preço, com comunicação rápida ao consumidor, pode afastar a obrigação de cumprir a oferta.</p>
<p>Os critérios que aparecem nessa linha de decisões:</p>
<ul>
<li><strong>Preço muito abaixo do mercado</strong>, fora de qualquer promoção plausível.</li>
<li><strong>Erro que o consumidor percebe com facilidade.</strong> A boa-fé vale para os dois lados.</li>
<li><strong>Correção e aviso rápidos</strong> por parte da loja.</li>
<li><strong>Nenhuma cobrança</strong>, ou devolução imediata do que foi pago.</li>
</ul>
<p>Um exemplo com a conta feita. Uma TV que custa R$ 3.000 aparece por R$ 2.400: são 20% de desconto, coisa normal em promoção, e, em regra, a loja tem de cumprir. A mesma TV aparece por R$ 30: é 1% do preço, ninguém acredita que seja de propósito, e a tendência é a Justiça tratar como erro grosseiro. Entre um extremo e outro, a análise é caso a caso.</p>

<h2>Como saber de que lado o meu caso está?</h2>
<table>
<thead><tr><th>Situação</th><th>O que costuma valer</th></tr></thead>
<tbody>
<tr><td>Desconto alto, mas possível em promoção, e a loja cancela dizendo que errou</td><td>Em regra, a oferta obriga: você pode exigir o cumprimento</td></tr>
<tr><td>Pedido pago e cancelado por "falta de estoque"</td><td>Em regra, a oferta obriga: o STJ decidiu que o consumidor pode exigir a entrega enquanto o produto existir no mercado</td></tr>
<tr><td>Preço irrisório, evidentemente errado, cancelado logo e sem cobrança</td><td>Erro grosseiro: a loja não é obrigada a entregar, mas tem de devolver o que foi pago</td></tr>
<tr><td>Preço do carrinho maior que o do anúncio</td><td>A regra é pagar o menor preço (Lei 10.962/2004)</td></tr>
<tr><td>Vendedor de marketplace cancela a venda</td><td>O reembolso é feito pela plataforma; a oferta continua obrigando quem anunciou</td></tr>
</tbody>
</table>
<p>Sobre a falta de estoque, vale o detalhe: no REsp 1.872.048 (3ª Turma, 2021), o STJ entendeu que o cumprimento forçado só fica afastado se o produto não existir mais no mercado. Se existir, a loja pode ter de comprá-lo de outra empresa para entregar.</p>

<h2>E quando o preço muda entre o anúncio e o carrinho?</h2>
<p>A regra é pagar o menor. A Lei 10.962/2004 determina, no art. 5º, que em caso de divergência de preços para o mesmo produto entre os sistemas de informação de preços usados pelo estabelecimento, o consumidor paga o menor dentre eles. Desde 2017, a mesma lei trata do comércio eletrônico e exige que o site mostre o preço à vista de forma ostensiva, junto à imagem do produto.</p>
<p>Dois cuidados antes de reclamar:</p>
<ul>
<li>Confira se é o mesmo produto: cor, tamanho e vendedor diferentes têm preços diferentes.</li>
<li>Veja se a diferença é o frete ou um cupom que não entrou. Explicamos esses casos em <a href="/blog/frete-gratis-amazon-mercado-livre-shopee">frete grátis na Amazon, Mercado Livre e Shopee</a> e em <a href="/blog/cupom-shopee-e-mercado-livre-como-usar">cupom da Shopee e do Mercado Livre</a>.</li>
</ul>

<h2>O que fazer se a loja cancelar o seu pedido?</h2>
<ol>
<li><strong>Junte as provas.</strong> Print do anúncio com preço e data, e-mail de confirmação do pedido, comprovante de pagamento e a mensagem de cancelamento. Sem o print da oferta, fica a sua palavra contra a da loja.</li>
<li><strong>Responda por escrito e diga o que quer.</strong> Cite o art. 35 do CDC e escolha: entrega do produto pelo preço anunciado, produto equivalente ou devolução do valor corrigido.</li>
<li><strong>Dê um prazo e anote o protocolo.</strong></li>
<li><strong>Sem acordo, registre no consumidor.gov.br.</strong> A empresa tem até 10 dias para responder.</li>
<li><strong>Procon e Juizado Especial Cível.</strong> No Juizado, causas de até 20 salários mínimos não exigem advogado (Lei 9.099/1995, art. 9º).</li>
</ol>
<p>Se você só quer o dinheiro de volta, o reembolso é obrigatório em qualquer cenário, inclusive no de erro grosseiro. Se a loja reteve o valor ou demora a devolver, o caminho é parecido com o de <a href="/blog/compra-online-nao-chegou-o-que-fazer">compra online que não chegou</a>.</p>

<h2>E em marketplace, quando quem cancela é o vendedor?</h2>
<p>O dinheiro volta pela própria plataforma. A Shopee informa que processa o reembolso quando o vendedor cancela, pelo mesmo meio de pagamento. O Mercado Livre orienta abrir uma reclamação se o vendedor cancelou a compra, e avisa aos vendedores que cancelar venda por preço desatualizado prejudica a reputação e pode levar à suspensão da conta.</p>
<p>Isso resolve o reembolso. Se você quer o produto pelo preço anunciado, a discussão é com quem anunciou, pelos mesmos passos acima.</p>

<h2>Vale a pena correr atrás de erro de preço?</h2>
<p>Minha opinião, como engenheiro que desconfia de número bom demais: não. Preço irrisório tem três explicações, e só uma é boa para você. Pode ser erro que a loja vai cancelar, pode ser anúncio de vendedor que não vai entregar, ou pode ser site falso. Antes de pagar, confira o preço no <a href="/blog/historico-de-preco-como-consultar">histórico</a> e a loja em <a href="/blog/como-saber-se-um-site-e-confiavel">como saber se um site de compras é confiável</a>.</p>
<p>Promoção de verdade tem desconto que faz sentido. O guia <a href="/guias/como-saber-se-a-promocao-e-verdadeira">como saber se a promoção é verdadeira</a> mostra como separar uma coisa da outra.</p>

<h2>O que o Tem Descontos confere no preço?</h2>
<table>
<thead><tr><th>O que conferimos</th><th>O que acontece se falhar</th></tr></thead>
<tbody>
<tr><td>Preço anunciado contra o preço na própria loja</td><td>Mais de 3% abaixo do preço da loja sem cupom que explique: oferta descartada</td></tr>
<tr><td>Preço riscado com mais de 70% de desconto</td><td>Se a loja não confirma, o preço riscado sai do post</td></tr>
<tr><td>Produto do link contra o produto do texto</td><td>Nome ou quantidade diferente: oferta descartada</td></tr>
</tbody>
</table>
<p>Isso garante que o preço do post era o da loja na hora da conferência. Se a loja cancelar o pedido depois, o direito é seu contra ela, e o print do post ajuda como prova da oferta. Mais em <a href="/sobre">sobre o Tem Descontos</a>.</p>

<h2>Resumo para não esquecer</h2>
<ul>
<li>Oferta anunciada obriga a loja (CDC, art. 30); cancelar indevidamente pedido pago é prática abusiva.</li>
<li>Exceção: erro grosseiro de preço, evidente e corrigido rápido (STJ, 2020).</li>
<li>Falta de estoque não desobriga enquanto o produto existir no mercado (STJ, 2021).</li>
<li>Preço diferente entre anúncio e carrinho: a regra é pagar o menor.</li>
<li>Print do anúncio, pedido por escrito, consumidor.gov.br, Procon e Juizado.</li>
</ul>`,
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
