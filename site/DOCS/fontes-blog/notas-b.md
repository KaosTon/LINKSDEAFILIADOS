# Notas do lote B (taxa de importação, Pix ou cartão)

AVISO DE MÉTODO: nesta sessão o WebFetch falhou para todos os domínios (erro "getaddrinfo ENOTFOUND", inclusive www.gov.br, www.bcb.gov.br, www12.senado.leg.br) e o curl foi recusado pelo proxy (403). Não consegui abrir nenhuma página inteira. Tudo abaixo foi conferido por WebSearch restrita aos domínios oficiais (gov.br, bcb.gov.br, planalto.gov.br, help.shopee.com.br), usando o trecho da página oficial devolvido pela busca. Recomendo que alguém abra as URLs marcadas antes de publicar, principalmente as do post 1 (regra mudou em maio de 2026).

---

## Post 1: taxa-de-importacao-compra-internacional

(a) Índice anti-canibalização
4. `taxa-de-importacao-compra-internacional`: dono de "taxa de importação", "taxa das blusinhas 2026", "remessa conforme", "icms compra internacional". Não confundir com /guias/como-saber-se-a-promocao-e-verdadeira (o guia trata de preço falso e "De" inflado; aqui o assunto é imposto no checkout, o guia só é linkado na dica de olhar o total).

(b) Origem WhatsApp: `post:taxa-importacao`

(c) Tags de que é DONO: "taxa de importação", "taxa das blusinhas", "remessa conforme", "icms compra internacional", "imposto compra internacional"

(d) Números e regras, com fonte
- Alíquota 0% até US$ 50, pessoa física, site do Remessa Conforme, declarações registradas desde 12/05/2026. URL: https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/regras-futuras . Trecho da busca: alíquota de 0% "a partir de 12 de maio de 2026" para compras "até US$ 50" no PRC.
- 60% com parcela a deduzir de US$ 30, de US$ 50,01 a US$ 3.000 (PRC). Mesma URL e https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/topicos/tributacao . Trecho: "50,01 · 3.000,00 · 60,0% · US$ 30,00"; exemplo da Receita: R$ 198,00 menos R$ 150,00 (desconto de 30 dólares) = R$ 48,00. Atenção: a exposição de motivos da MP (EXM 1146/2026) mostra US$ 20; usei a tabela da Receita (US$ 30).
- ICMS de 17% a 20% conforme o estado; calculadora da Receita usa 17%. URL: https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/preciso-pagar-impostos-nas-compras-internacionais/quais-sao-os-impostos-devidos . Trecho: "as alíquotas diferenciadas do ICMS (que atualmente variam de 17% a 20%, a depender do estado de destino da encomenda)".
- Fórmula do ICMS por dentro: (bens + frete + seguro + II) / (1 menos alíquota) x alíquota. URL: página de tributação acima.
- Base do II = valor aduaneiro (bens, frete, seguro); câmbio da data de registro da declaração. URL: página de tributação acima.
- Site fora do programa: 60% sem desconto, inclusive abaixo de US$ 50. URL: página "quais são os impostos devidos" e "Novas Regras" (trecho: "não recebem a alíquota zero, mesmo quando custam menos de US$ 50").
- Redução não retroativa (sem restituição). Fonte: trecho da busca atribuído à página Novas Regras / secundárias. CONFIRMAÇÃO PARCIAL.
- Lei 14.902/2024 alterou o DL 1.804/1980: 20% até US$ 50 e 60% acima, até US$ 3.000. URL: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14902.htm . Vigência a partir de 01/08/2024 (MP 1.236/2024) e até 11/05/2026 segundo a Receita.
- MP 1.357, de 12/05/2026, permite reduzir a zero o II até US$ 50. URL: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/mpv/mpv1357impressao.htm (e Casa Civil, gov.br/casacivil, maio 2026).
- Remessa Conforme: imposto pago no momento da compra; site tem de mostrar total com frete, seguro, II e ICMS. URL: https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/programa-remessa-conforme-o-que-e-como-funciona
- Shopee: cálculo automático dos impostos no app; II sobre produto + frete; cupons aplicados antes dos impostos. URL: https://help.shopee.com.br/portal/4/article/134145 (trecho da busca).
- Robô do Tem Descontos: dados first-party da ESPEC (nota 4,5, 50 vendas, R$ 1.000 só Shopee Mall/loja indicada, 3%).
- Tabela de exemplo: valores hipotéticos (câmbio R$ 5,00, compras de R$ 200 e R$ 500 com frete), contas feitas em node com a fórmula da Receita.

NÃO CONFIRMEI (post 1)
- Lei 15.502/2026 (conversão da MP 1.357 em lei, data 10/09/2026): apareceu em trechos de busca do Planalto, mas não abri o texto. Deixei de fora do post; o post cita só a MP.
- Portaria MF 1.342/2026 como ato que zerou a alíquota: só em fontes secundárias. Deixei de fora.
- "Fora do programa o imposto pode ser cobrado na chegada": regra conhecida, mas não vi trecho oficial explícito nesta sessão.
- Se o limite de US$ 50 considera o frete: a Receita diz que a base do imposto inclui frete e seguro; o post orienta "some o frete", sem afirmar a regra da faixa com citação.
- Exemplo da Receita "blusinha de R$ 49, ICMS R$ 18,68": a conta não fecha, não usei.
- Não abri a lista oficial de empresas certificadas (o post não lista empresas).

---

## Post 2: pix-ou-cartao-compra-online

(a) Índice anti-canibalização
5. `pix-ou-cartao-compra-online`: dono de "pix ou cartão", "pix é seguro para compra online", "med pix", "desconto no pix vale a pena", "estorno pix". Não confundir com /guias/grupo-de-ofertas-no-whatsapp-e-seguro (o guia é dono de golpe e link falso; aqui o golpe de Pix em link falso tem 1 parágrafo e linka o guia).

(b) Origem WhatsApp: `post:pix-ou-cartao`

(c) Tags de que é DONO: "pix ou cartão", "pix é seguro para compra online", "med pix", "desconto no pix vale a pena", "estorno pix"

(d) Números e regras, com fonte
- MED vale para fraude/golpe, inclusive com senha/biometria do pagador; não vale para desacordo comercial (atraso, não agradou, diferente do anunciado). URL: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Guia_MED.pdf e FAQ https://www.bcb.gov.br/content/estabilidadefinanceira/pix/FAQ_Participantes.pdf . Trecho: MED "em qualquer caso de fundada suspeita de fraude em que o Pix foi utilizado, incluindo golpes"; desacordos comerciais "devem ser resolvidos no âmbito do Poder Judiciário".
- Não cobre erro de chave do próprio usuário. Fonte: Agência Brasil set/2026 (lista: "arrependimento de uma compra; erro de valor cometido pelo próprio usuário; erro na escolha da chave Pix; simples desacordo comercial sem indício de fraude"). No BCB há material do MED 2.0 indicando que "Pix para Chave Errada" seria um domínio novo, ou seja, fora do MED atual. CONFIRMAÇÃO PARCIAL no bcb.gov.br.
- Pedido para transações de até 80 dias. URL: FAQ Participantes do Pix (bcb.gov.br), trecho da busca: notificação de infração "para transações com até 80 dias".
- 7 dias corridos para o recebedor analisar a notificação. Mesma FAQ.
- Devolução depende de saldo, total ou parcial. FAQ/Guia MED e Agência Brasil.
- Autoatendimento do MED no app desde outubro de 2025. Fonte: trecho de documento bcb.gov.br (Relatório de Gestão do Pix) e Agência Brasil.
- MED 2.0 obrigatório desde 02/02/2026, rastreia além da primeira conta, sem garantia se o dinheiro foi sacado. Fontes: trecho de documento bcb.gov.br e https://agenciabrasil.ebc.com.br/economia/noticia/2026-02/novas-regras-de-seguranca-do-pix-entram-em-vigor-veja-mudancas
- Prazo para contestar devolução feita pelo MED passou de 30 para 80 dias (setembro 2026). Fonte: https://agenciabrasil.ebc.com.br/economia/noticia/2026-09/nova-regra-do-pix-amplia-prazo-para-contestar-golpe (cita IN BCB 766). Agência Brasil não é fonte primária: NÃO CONFIRMEI no bcb.gov.br.
- Cartão: bloquear, contestar com o emissor, BO com valor, data, estabelecimento, últimos 4 dígitos. URL: https://www.gov.br/mj/pt-br/acesso-a-informacao/acoes-e-programas/sofri-um-golpe-e-agora/fizeram-compras-on-line-com-os-dados-do-meu-cartao
- Ouvidoria e reclamação no BC; BC não interfere no caso individual. URL: https://www.gov.br/pt-br/servicos/registrar-reclamacao-contra-instituicao-supervisionada-pelo-banco-central
- Lei 13.455/2017: autoriza diferenciação de preço por prazo ou instrumento de pagamento; fornecedor deve informar o desconto em local visível (art. 5-A da Lei 10.962/2004). URL: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13455.htm . Trecho: "Fica autorizada a diferenciação de preços de bens e serviços oferecidos ao público em função do prazo ou do instrumento de pagamento utilizado."
- Tabela Pix x parcelado: hipotética (R$ 1.000, 10x R$ 100, rendimento de 1% a.m. escolhido para o exemplo, parcelas a partir do mês 1). Valor presente calculado em node: R$ 947,13 (equivale a ~5,3% de desconto).
- Robô do Tem Descontos: first-party da ESPEC (link sempre para loja oficial, não pede dado/Pix/código no privado, descarta produto diferente do texto, confere preço na loja).
- Autor citado uma vez ("Como engenheiro, eu desconfio de número sem conta").

NÃO CONFIRMEI (post 2)
- Nenhuma página do bcb.gov.br foi aberta inteira; os prazos (80 dias, 7 dias) vieram de trechos da FAQ e do Guia do MED via busca. A versão do Guia pode estar desatualizada em relação ao MED 2.0.
- Mudança de 30 para 80 dias no prazo de contestação da devolução (set/2026): só Agência Brasil.
- Prazo total de devolução (fontes divergem: "até 11 dias" x "até 96 horas"): deixei de fora.
- Chargeback: não há regra do Banco Central com prazo; post descreve sem número. Prazos por banco (ex.: Caixa 90/45 dias) deixei de fora.
- Regra do CDC sobre suspensão da cobrança contestada com 10 dias de antecedência: só via nota técnica citada em resumo de busca; deixei de fora (o post diz apenas que a cobrança "pode ser suspensa").
- Cartão virtual: descrito de forma genérica, sem fonte oficial (não é regra regulatória).
