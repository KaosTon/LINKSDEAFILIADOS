import Link from "next/link";
import { SITE } from "@/data/site";

type Item = { name: string; href: string };

/** "/servicos/x" -> "https://.../servicos/x". Caso real na Virtus (23/09/2026):
 *  URL relativa no BreadcrumbList gerou aviso "URL do campo id nao e valido" no Search Console. */
export function urlAbsoluta(href: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  return SITE.url + (href.startsWith("/") ? href : `/${href}`);
}

/** Trilha visivel + BreadcrumbList em JSON-LD com os mesmos itens. O ultimo e a pagina atual. */
export default function Breadcrumb({ items }: { items: Item[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: urlAbsoluta(item.href),
    })),
  };

  return (
    <nav aria-label="Trilha de navegação" className="border-b border-linha">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ol className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2 text-sm text-tinta-3">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-2">
            {i > 0 && <span className="text-linha" aria-hidden="true">/</span>}
            {i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-marca-escura transition-colors">
                {item.name}
              </Link>
            ) : (
              <span className="text-tinta" aria-current="page">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
