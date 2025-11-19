# scripts/run-deploy-check.ps1
# Deploy validation suite - Static export, versioning, deployment orchestration

Write-Host "`n" -BackgroundColor Blue
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║              RUNNING DEPLOY VALIDATION SUITE               ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

$env:NODE_ENV = "test"

Write-Host "🚀 Testing:" -ForegroundColor Blue
Write-Host "   • Page Data Collection (Prisma queries, tenant isolation)"
Write-Host "   • Static HTML Generation (XSS prevention, CSP)"
Write-Host "   • Deployment Orchestration (versioning, rollback)"
Write-Host "   • Version Management (history, cleanup)"
Write-Host "   • Deployment Logging (audit trail, metrics)"
Write-Host "   • Post-Deploy Actions (SEO ping, notifications)"
Write-Host "   • Staging vs Production (environment isolation)"
Write-Host "   • Performance (< 5s deploy, parallel execution)"
Write-Host ""

npm run test -- tests/deploy/deploy-suite.test.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n" -BackgroundColor Green
    Write-Host "✅ DEPLOY VALIDATION PASSED" -ForegroundColor Green
    Write-Host "   Deployment system ready for production" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "`n" -BackgroundColor Red
    Write-Host "❌ DEPLOY VALIDATION FAILED" -ForegroundColor Red
    Write-Host "   Fix deployment issues before going live" -ForegroundColor Red
    Write-Host ""
    exit 1
}
