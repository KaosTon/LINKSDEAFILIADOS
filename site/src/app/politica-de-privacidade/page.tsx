import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import { IconeWhats } from "@/components/Icones";
import { SITE, linkWhats } from "@/data/site";
import { MENSAGENS_ROTA } from "@/data/whatsapp";

// Politica de privacidade (LGPD). Descreve o que o site FAZ: nao ha formulario; a medicao e o
// Web Analytics do Cloudflare, sem cookies, e respeita o aviso; o botao do grupo passa pelo
// encurtador (temdescontos.com.br/grupo), que so conta o clique e a pagina de origem; os links
// de oferta levam as lojas. Se entrar formulario, newsletter ou outra medicao, esta pagina muda.
// PENDENTE (BRIEFING §2): revisao do Wellington e e-mail de contato.

const ATUALIZADA_EM = "16 de outubro de 2026";

export const metadata: Metadata = {
  title: `Política de Privacidade | ${SITE.nome}`,
  description:
    `Como o ${SITE.nome} trata dados pessoais no site e no grupo: sem formulário, medição anônima sem cookies, links de afiliado e seus direitos pela LGPD.`,
  alternates: { canonical: "/politica-de-privacidade" },
};

const SECOES: { titulo: string; itens: string[] }[] = [
  {
    titulo: "1. Quem é o responsável pelos dados",
    itens: [
      `${SITE.nome}, ${SITE.titulo.toLowerCase()}.`,
      SITE.email ? `Contato: ${SITE.email}.` : "Contato: pelo próprio grupo, com os administradores.",
    ],
  },
  {
    titulo: "2. O que este site coleta",
    itens: [
      "O site não tem formulário e não pede nome, telefone, e-mail nem qualquer outro dado seu.",
      "Estatísticas de visita, sem identificar quem visita: página vista, página de origem, país aproximado, tipo de aparelho, navegador e velocidade de carregamento. Detalhes na seção 5.",
      "Quando você toca em \"Entrar no grupo\", contamos o clique e de qual página ele veio (por exemplo, a página inicial ou um guia). Nada que identifique você.",
    ],
  },
  {
    titulo: "3. O grupo no WhatsApp",
    itens: [
      "O botão leva ao convite do grupo. Lá, a conversa acontece no aplicativo, que segue a política de privacidade do próprio WhatsApp.",
      "Num grupo de WhatsApp, os participantes podem ver o número uns dos outros. Nós não copiamos, exportamos nem usamos os números do grupo para outra coisa, e não mandamos mensagem no privado.",
      "Você pode sair do grupo quando quiser, e isso basta para deixar de receber as ofertas.",
    ],
  },
  {
    titulo: "4. Links das ofertas",
    itens: [
      "Os links das ofertas levam para as lojas (Amazon, Mercado Livre, Shopee e Magalu). Alguns passam antes pelo nosso link curto (temdescontos.com.br/...), que conta o clique e manda você para a loja, sem guardar dado seu.",
      "São links de afiliado: a loja usa cookies próprios para saber que a venda veio de nós e nos pagar a comissão. Esses cookies são da loja e seguem a política de privacidade dela.",
      "A compra, o pagamento e a entrega são feitos com a loja. Nós não recebemos nome, endereço nem dados do seu cartão.",
    ],
  },
  {
    titulo: "5. Cookies e medição neste site",
    itens: [
      "O site não grava cookies no seu navegador. A única coisa que ele guarda, no armazenamento do próprio navegador, é a sua escolha no aviso de cookies.",
      "A medição usa o Web Analytics do Cloudflare, que funciona sem cookies e não monta histórico da sua navegação. Se você escolher \"Apenas essenciais\" no aviso, essa medição deixa de ser enviada.",
      "O site não exibe anúncios de terceiros e não carrega ferramentas de publicidade.",
    ],
  },
  {
    titulo: "6. Com quem os dados são compartilhados",
    itens: [
      "Os dados não são vendidos nem cedidos para publicidade.",
      "O site é hospedado no Cloudflare, que processa as estatísticas da seção 5. O link curto roda no Railway.",
      "Autoridades públicas, somente quando a lei exigir.",
    ],
  },
  {
    titulo: "7. Seus direitos (LGPD, art. 18)",
    itens: [
      "Confirmar se há tratamento dos seus dados e acessá-los.",
      "Corrigir dados incompletos, inexatos ou desatualizados.",
      "Pedir anonimização, bloqueio ou eliminação de dados desnecessários.",
      "Revogar o consentimento e pedir informação sobre com quem os dados foram compartilhados.",
    ],
  },
  {
    titulo: "8. Mudanças nesta política",
    itens: [`Esta política pode mudar quando o site ou o grupo mudarem. A data da última atualização fica no topo da página.`],
  },
];

export default function PoliticaPrivacidade() {
  return (
    <>
      <Breadcrumb items={[{ name: "Início", href: "/" }, { name: "Política de Privacidade", href: "/politica-de-privacidade" }]} />
      <section className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <p className="eyebrow mb-5">LGPD</p>
        <h1 className="font-display text-5xl font-extrabold leading-[1.05]">Política de Privacidade</h1>
        <p className="mt-3 text-sm text-tinta-3">Última atualização: {ATUALIZADA_EM}</p>
        <p className="mt-6 text-tinta-2 leading-relaxed">
          Este site respeita a sua privacidade e segue a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).
          Aqui está, em linguagem simples, o que acontece com os seus dados.
        </p>
        <div className="mt-10 space-y-9">
          {SECOES.map((s) => (
            <div key={s.titulo}>
              <h2 className="font-display text-2xl font-extrabold">{s.titulo}</h2>
              <ul className="mt-3 space-y-2 text-tinta-2 leading-relaxed list-disc pl-5 marker:text-marca">
                {s.itens.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl bg-marca-clara/60 border border-marca/25 p-6">
          <p className="text-tinta">
            Para exercer seus direitos ou tirar dúvidas sobre os seus dados, fale com os administradores no grupo
            {SITE.email ? <> ou escreva para {SITE.email}</> : null}.
          </p>
          <a
            href={linkWhats(MENSAGENS_ROTA["/politica-de-privacidade"])}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-tinta hover:bg-black text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <IconeWhats className="w-4 h-4" />
            Abrir o grupo
          </a>
        </div>
      </section>
    </>
  );
}
