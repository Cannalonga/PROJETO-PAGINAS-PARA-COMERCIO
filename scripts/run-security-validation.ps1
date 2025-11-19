# scripts/run-security-validation.ps1
# Security validation suite - CSRF, tenant isolation, audit logging, rate limiting

Write-Host "`n" -BackgroundColor Yellow
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║             RUNNING SECURITY VALIDATION SUITE              ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

$env:NODE_ENV = "test"

Write-Host "🔒 Testing:" -ForegroundColor Yellow
Write-Host "   • CSRF Protection (token validation, regeneration)"
Write-Host "   • Tenant Isolation (query filtering, access control)"
Write-Host "   • Audit Logging (PII masking, compliance)"
Write-Host "   • Rate Limiting (DDoS protection, API throttling)"
Write-Host "   • Content Security Policy (CSP headers)"
Write-Host "   • CORS Protection (origin validation)"
Write-Host "   • SQL Injection Prevention (Prisma escaping)"
Write-Host ""

npm run test -- tests/security/security-suite.test.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n" -BackgroundColor Green
    Write-Host "✅ SECURITY VALIDATION PASSED" -ForegroundColor Green
    Write-Host "   All security gates cleared for production" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "`n" -BackgroundColor Red
    Write-Host "❌ SECURITY VALIDATION FAILED" -ForegroundColor Red
    Write-Host "   Fix security issues before deploying" -ForegroundColor Red
    Write-Host ""
    exit 1
}
