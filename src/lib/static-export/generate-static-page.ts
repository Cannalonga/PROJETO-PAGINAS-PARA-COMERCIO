// src/lib/static-export/generate-static-page.ts
/**
 * Main static page generation pipeline.
 * Transforms page data into HTML artifacts ready for deployment.
 */

import type {
  StaticPageArtifacts,
  StaticPageContext,
  StaticPageData,
} from "./types";
import { buildCanonicalUrl } from "./collect-page-data";
import { generateDeploymentVersion } from "./versioning";

/**
 * Generate all static artifacts for a page.
 * Produces production HTML, preview HTML, and sitemap entries.
 *
 * @param ctx - Page context for rendering
 * @returns Complete set of artifacts ready for deployment
 */
export async function generateStaticPageArtifacts(
  ctx: StaticPageContext
): Promise<StaticPageArtifacts> {
  // TODO: Uncomment when database is connected
  // const pageData = await collectStaticPageData(ctx);

  // Placeholder data for now
  const pageData = createPlaceholderPageData(ctx);

  const html = renderPageToHtml(pageData);
  const previewHtml = wrapPreviewHtml(html, pageData);
  const sitemapEntry = buildSitemapEntry({
    url: pageData.seo?.canonicalUrl ?? buildCanonicalUrl(ctx),
    lastModified: pageData.updatedAt,
  });

  const version = generateDeploymentVersion(ctx.tenantId, ctx.pageId);

  return {
    html,
    previewHtml,
    sitemapEntry,
    assets: [],
    version,
  };
}

/**
 * Render page data to production HTML.
 * Combines template, blocks, variables, and theme.
 *
 * @param pageData - Complete page data
 * @returns Production-ready HTML string
 */
function renderPageToHtml(pageData: StaticPageData): string {
  // TODO: Call your actual template engine here
  // return renderTemplateToHtml({
  //   template: pageData.template,
  //   blocks: pageData.blocks,
  //   variables: pageData.variables ?? {},
  //   theme: pageData.theme ?? {},
  //   seo: pageData.seo,
  // });

  // Placeholder implementation
  return `<main class="page-content">
  <h1>${escapeHtml(pageData.seo?.title ?? "Página")}</h1>
  ${pageData.seo?.description ? `<p>${escapeHtml(pageData.seo.description)}</p>` : ""}
  <!-- Content blocks will be rendered here -->
</main>`;
}

/**
 * Wrap HTML in preview-specific container.
 * Adds noindex/nofollow meta tags and doctype.
 *
 * @param html - Inner HTML content
 * @param pageData - Page data for metadata
 * @returns Complete preview document HTML
 */
function wrapPreviewHtml(html: string, pageData: StaticPageData): string {
  const title = pageData.seo?.title ?? "Preview da Página";
  const noIndexMeta = `<meta name="robots" content="noindex,nofollow" />`;

  return /* html */ `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview — ${escapeHtml(title)}</title>
    ${noIndexMeta}
    <meta name="description" content="${escapeHtml(pageData.seo?.description ?? "Preview da página")}" />
  </head>
  <body>
    ${html}
  </body>
</html>`;
}

/**
 * Build XML sitemap entry for a page.
 * Includes URL and last modification date.
 *
 * @param input - URL and modification date
 * @returns XML string for sitemap inclusion
 */
function buildSitemapEntry(input: {
  url: string;
  lastModified: Date;
}): string {
  const isoDate = input.lastModified.toISOString().split("T")[0];
  const escapedUrl = escapeHtml(input.url);

  return `<url>
  <loc>${escapedUrl}</loc>
  <lastmod>${isoDate}</lastmod>
</url>`;
}

/**
 * Escape HTML special characters for safe output.
 * Prevents XSS and XML parsing errors.
 *
 * @param value - String to escape
 * @returns Escaped string
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Create placeholder page data for development/testing.
 * Replace with real data from database when ready.
 *
 * @param ctx - Page context
 * @returns Sample StaticPageData
 */
function createPlaceholderPageData(ctx: StaticPageContext): StaticPageData {
  return {
    id: ctx.pageId,
    tenantId: ctx.tenantId,
    slug: ctx.slug,
    blocks: [],
    template: { id: "default-template", name: "Default" },
    variables: {},
    theme: { primary: "#000000" },
    seo: {
      title: `Página: ${ctx.slug}`,
      description: "Descrição da página do comércio local",
      canonicalUrl: buildCanonicalUrl(ctx),
      noIndex: false,
      noFollow: false,
    },
    updatedAt: new Date(),
  };
}
