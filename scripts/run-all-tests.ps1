# scripts/run-all-tests.ps1
# Full test suite execution - Security + SEO + Deploy

Write-Host "`n" -BackgroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          RUNNING FULL TEST SUITE (All BLOCO 6)            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$env:NODE_ENV = "test"
$failedTests = @()
$passedTests = @()

# ===== 1. Security Suite =====
Write-Host "1️⃣  Testing Security Suite..." -ForegroundColor Yellow
npm run test -- tests/security/security-suite.test.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Security tests PASSED" -ForegroundColor Green
    $passedTests += "Security"
} else {
    Write-Host "   ❌ Security tests FAILED" -ForegroundColor Red
    $failedTests += "Security"
}

# ===== 2. SEO Suite =====
Write-Host "`n2️⃣  Testing SEO Suite..." -ForegroundColor Yellow
npm run test -- tests/seo/seo-suite.test.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ SEO tests PASSED" -ForegroundColor Green
    $passedTests += "SEO"
} else {
    Write-Host "   ❌ SEO tests FAILED" -ForegroundColor Red
    $failedTests += "SEO"
}

# ===== 3. Deploy Suite =====
Write-Host "`n3️⃣  Testing Deploy Suite..." -ForegroundColor Yellow
npm run test -- tests/deploy/deploy-suite.test.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Deploy tests PASSED" -ForegroundColor Green
    $passedTests += "Deploy"
} else {
    Write-Host "   ❌ Deploy tests FAILED" -ForegroundColor Red
    $failedTests += "Deploy"
}

# ===== Summary =====
Write-Host "`n" -BackgroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    TEST SUITE SUMMARY                      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

if ($passedTests.Count -gt 0) {
    Write-Host "✅ PASSED:" -ForegroundColor Green
    $passedTests | ForEach-Object { Write-Host "   • $_" }
}

if ($failedTests.Count -gt 0) {
    Write-Host "`n❌ FAILED:" -ForegroundColor Red
    $failedTests | ForEach-Object { Write-Host "   • $_" }
    exit 1
} else {
    Write-Host "`n🎉 ALL TESTS PASSED!" -ForegroundColor Green
    exit 0
}
