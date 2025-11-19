// QUICK REFERENCE — BLOCO 1 STATIC EXPORT CORE

/**
 * IMPORTS RÁPIDOS
 * ═════════════════════════════════════════════════════════════════════════
 */

// Tipos
import type {
  StaticPageContext,
  StaticPageData,
  StaticPageArtifacts,
  StaticPageSeo,
  DeploymentRecord,
  StaticAssetReference,
} from "@/lib/static-export/types";

// Versionamento
import { generateDeploymentVersion, parseDeploymentVersion } from "@/lib/static-export/versioning";

// Coleta de dados
import { collectStaticPageData, buildCanonicalUrl, validatePageData } from "@/lib/static-export/collect-page-data";

// Geração
import { generateStaticPageArtifacts } from "@/lib/static-export/generate-static-page";

// Segurança
import { escapeHtml, escapeJson, sanitizeUrl, validateFilePath } from "@/lib/security";

/**
 * PADRÕES DE USO
 * ═════════════════════════════════════════════════════════════════════════
 */

// 1️⃣ Gerar versão
const version = generateDeploymentVersion("tenant-abc", "page-xyz");
// Output: v-20251119-1320-tenant-abc-page-xyz-a1b2c3d4

// 2️⃣ Parse versão (para rollback)
const parsed = parseDeploymentVersion(version);
// {
//   timestamp: Date,
//   tenantId: "tenant-abc",
//   pageId: "page-xyz",
//   hash: "a1b2c3d4"
// }

// 3️⃣ Buscar dados da página
const pageData = await collectStaticPageData({
  tenantId: "tenant-abc",
  pageId: "page-xyz",
  slug: "sobre-nos",
  locale: "pt-BR",
});

// 4️⃣ Validar dados
if (validatePageData(pageData)) {
  console.log("✅ Dados válidos para geração");
}

// 5️⃣ Gerar HTML + preview + sitemap
const artifacts = await generateStaticPageArtifacts({
  tenantId: "tenant-abc",
  pageId: "page-xyz",
  slug: "sobre-nos",
});

// Retorna:
// {
//   html: "<main>...</main>",
//   previewHtml: "<!DOCTYPE html>...",
//   sitemapEntry: "<url><loc>...</loc></url>",
//   assets: [],
//   version: "v-20251119-1320-...",
//   deployedUrl?: "https://pages.example.com/tenant-abc/sobre-nos",
//   previewUrl?: "https://preview.example.com/v-20251119-1320-..."
// }

// 6️⃣ Usar em API endpoint
app.post("/api/deploy/generate", async (req, res) => {
  try {
    const { tenantId, pageId, slug } = req.body;

    // Validar entrada
    if (!tenantId || !pageId || !slug) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Gerar artefatos
    const artifacts = await generateStaticPageArtifacts({
      tenantId,
      pageId,
      slug,
    });

    // TODO: Enviar para provider (Vercel, Netlify, etc)
    // const result = await deployProvider.deploy(artifacts);

    return res.json({
      success: true,
      version: artifacts.version,
      previewUrl: artifacts.previewUrl,
      // deployedUrl: result.url
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * TIPOS MAIS USADOS
 * ═════════════════════════════════════════════════════════════════════════
 */

// Context simples para iniciar
const ctx: StaticPageContext = {
  tenantId: "tenant-123",
  pageId: "page-456",
  slug: "minha-pagina",
  locale: "pt-BR", // opcional
};

// Dados prontos para render
const data: StaticPageData = {
  id: "page-456",
  tenantId: "tenant-123",
  slug: "minha-pagina",
  blocks: [], // seus blocos
  template: {}, // seu template
  variables: {}, // dados dinâmicos
  theme: {}, // customizações
  seo: {
    title: "Minha Página",
    description: "Descrição da página",
    canonicalUrl: "https://pages.example.com/tenant-123/minha-pagina",
    ogImageUrl: "https://...",
    noIndex: false,
    noFollow: false,
  },
  updatedAt: new Date(),
};

// Resultado final pronto para deploy
const result: StaticPageArtifacts = {
  html: "<main>...</main>",
  previewHtml: "<!DOCTYPE html>...",
  sitemapEntry: "<url>...</url>",
  assets: [],
  version: "v-20251119-1320-tenant-123-page-456-abc123",
  deployedUrl: "https://pages.example.com/tenant-123/minha-pagina",
  previewUrl: "https://preview.example.com/v-20251119-1320-...",
};

// Record para auditoria/histórico
const deploymentRecord: DeploymentRecord = {
  id: "deploy-789",
  tenantId: "tenant-123",
  pageId: "page-456",
  version: "v-20251119-1320-tenant-123-page-456-abc123",
  status: "SUCCESS",
  provider: "vercel",
  startedAt: new Date(),
  finishedAt: new Date(),
  deployedUrl: "https://pages.example.com/tenant-123/minha-pagina",
  previewUrl: "https://preview.example.com/v-20251119-1320-...",
  metadata: {
    htmlSize: 15234,
    assetCount: 5,
    deploymentTime: 2.5,
  },
};

/**
 * CHECKLIST PRÉ-DEPLOY
 * ═════════════════════════════════════════════════════════════════════════
 */

async function preDeploymentChecklist(ctx: StaticPageContext): Promise<boolean> {
  try {
    // 1. Validar contexto
    if (!ctx.tenantId || !ctx.pageId || !ctx.slug) {
      console.error("❌ Context incompleto");
      return false;
    }

    // 2. Buscar dados
    const pageData = await collectStaticPageData(ctx);
    console.log("✅ Dados carregados");

    // 3. Validar dados
    validatePageData(pageData);
    console.log("✅ Dados validados");

    // 4. Gerar artefatos
    const artifacts = await generateStaticPageArtifacts(ctx);
    console.log("✅ Artefatos gerados");

    // 5. Verificar tamanho
    if (artifacts.html.length > 10 * 1024 * 1024) {
      console.error("❌ HTML muito grande (>10MB)");
      return false;
    }
    console.log("✅ Tamanho OK");

    // 6. Versão válida?
    const parsed = parseDeploymentVersion(artifacts.version);
    if (!parsed) {
      console.error("❌ Versão inválida");
      return false;
    }
    console.log("✅ Versão válida");

    console.log("✅ PRONTO PARA DEPLOY!");
    return true;
  } catch (error) {
    console.error("❌ Erro:", error);
    return false;
  }
}

/**
 * TRATAMENTO DE ERROS
 * ═════════════════════════════════════════════════════════════════════════
 */

// Erros esperados em collectStaticPageData:
// • "Page not found or not accessible" — página não existe ou tenant sem acesso
// • "collectStaticPageData: Please configure..." — Prisma não configurado

// Erros esperados em generateStaticPageArtifacts:
// • Erro de template engine se não está configurado
// • Erro de renderização se template inválido

// Boas práticas:
try {
  const artifacts = await generateStaticPageArtifacts(ctx);
} catch (error) {
  if (error.message.includes("Page not found")) {
    return res.status(404).json({ error: "Página não encontrada" });
  }
  if (error.message.includes("configure Prisma")) {
    console.error("⚠️ TODO: Configurar Prisma no collect-page-data.ts");
    return res.status(500).json({ error: "Sistema não configurado" });
  }
  return res.status(500).json({ error: "Erro ao gerar artefatos" });
}

/**
 * NOTAS IMPORTANTES
 * ═════════════════════════════════════════════════════════════════════════
 *
 * 🔧 TODOs deixados no código:
 * • collect-page-data.ts: Uncomment Prisma queries
 * • generate-static-page.ts: Integrar seu template engine
 * • generate-static-page.ts: Remover placeholder data
 *
 * 🔒 Segurança:
 * • Tenant isolation automática em collectStaticPageData()
 * • HTML escaping em renderPageToHtml()
 * • Noindex/nofollow em wrapPreviewHtml()
 *
 * 📊 Performance:
 * • Version generation é O(1)
 * • Parsing é O(1) com regex
 * • HTML generation depende da engine
 *
 * 🧪 Teste rápido:
 * const version = generateDeploymentVersion("test", "page");
 * console.log(version); // v-20251119-HHMM-test-page-{hash}
 * const parsed = parseDeploymentVersion(version);
 * console.log(parsed.tenantId); // "test"
 */
