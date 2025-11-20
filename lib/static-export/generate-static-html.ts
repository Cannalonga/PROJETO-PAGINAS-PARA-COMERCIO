// lib/static-export/generate-static-html.ts
import type { StaticPageContext, StaticPageArtifacts } from "./types";
import { generateVersion } from "./versioning";

/**
 * Gera artefatos estáticos HTML a partir do contexto de página
 * @param ctx - Contexto contendo tenantId, pageId, slug
 * @returns StaticPageArtifacts com HTML, preview, version e assets
 */
export async function generateStaticPageArtifacts(
  ctx: StaticPageContext
): Promise<StaticPageArtifacts> {
  // TODO: Integrar com seu renderizador de templates + blocks
  // Exemplo de integração:
  // const page = await db.page.findUnique({ where: { id: ctx.pageId }, include: { blocks: true } });
  // const html = renderTemplateToHtml(page.template, page.blocks);

  // Placeholder para desenvolvimento
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${ctx.slug}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <h1>Página: ${ctx.slug}</h1>
    <p>Esta é uma página estática gerada automaticamente.</p>
  </body>
</html>`;

  const version = generateVersion();

  return {
    html,
    previewHtml: html,
    sitemapEntry: `<url><loc>https://pages.seudominio.com/${ctx.tenantId}/${ctx.slug}</loc></url>`,
    assets: [],
    version,
  };
}
