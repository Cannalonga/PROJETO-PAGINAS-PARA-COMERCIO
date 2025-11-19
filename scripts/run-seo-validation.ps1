# scripts/run-seo-validation.ps1
# SEO validation suite - Meta tags, sitemap, robots.txt, search engines

Write-Host "`n" -BackgroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║               RUNNING SEO VALIDATION SUITE                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$env:NODE_ENV = "test"

Write-Host "🔍 Testing:" -ForegroundColor Cyan
Write-Host "   • Meta Tags Generation (titles, descriptions, og:tags)"
Write-Host "   • Sitemap Generation (multi-language, hreflang, pagination)"
Write-Host "   • Robots.txt (production vs dev, crawl-delay)"
Write-Host "   • Search Engine Integration (Google, Bing, Yandex ping)"
Write-Host "   • Multi-Tenant SEO (tenant isolation, branding)"
Write-Host "   • Performance (caching, <500ms generation)"
Write-Host "   • Accessibility (canonical URL, sitemap links)"
Write-Host ""

npm run test -- tests/seo/seo-suite.test.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n" -BackgroundColor Green
    Write-Host "✅ SEO VALIDATION PASSED" -ForegroundColor Green
    Write-Host "   SEO system ready for production" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "`n" -BackgroundColor Red
    Write-Host "❌ SEO VALIDATION FAILED" -ForegroundColor Red
    Write-Host "   Fix SEO issues before going live" -ForegroundColor Red
    Write-Host ""
    exit 1
}
