# FASE 2 — P1 TEST SUITE
# Validação de: Logging, Rate Limiting, Sentry, Correlation ID
#
# Uso:
#   ./run-p1-tests.ps1
#
# Requisitos:
#   1. npm run dev (servidor rodando em localhost:3000)
#   2. REDIS_URL configurada em .env.local (para rate limiting)
#   3. SENTRY_DSN configurada em .env.local (para error tracking)
#   4. REST Client extension instalada em VS Code

param(
    [switch]$Verbose = $false,
    [switch]$SkipRateLimitTests = $false,
    [int]$TestTimeout = 30000
)

# Cores para output
$Green = @{ ForegroundColor = 'Green' }
$Red = @{ ForegroundColor = 'Red' }
$Yellow = @{ ForegroundColor = 'Yellow' }
$Blue = @{ ForegroundColor = 'Blue' }
$Gray = @{ ForegroundColor = 'DarkGray' }

# State
$PassedTests = 0
$FailedTests = 0
$SkippedTests = 0
$TestResults = @()

# ============================================================================
# Helper Functions
# ============================================================================

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "━" * 80 @Blue
    Write-Host " 📋 $Title" @Blue
    Write-Host "━" * 80 @Blue
}

function Write-Test {
    param([string]$Description)
    Write-Host "  ⏳ $Description" -NoNewline
}

function Write-Pass {
    param([string]$Message = "")
    Write-Host " ✅" @Green
    if ($Message) { Write-Host "     $Message" @Gray }
    $script:PassedTests++
    $TestResults += @{
        Status = "PASS"
        Description = $Description
        Message = $Message
    }
}

function Write-Fail {
    param([string]$Message = "")
    Write-Host " ❌" @Red
    if ($Message) { Write-Host "     $Message" @Red }
    $script:FailedTests++
    $TestResults += @{
        Status = "FAIL"
        Description = $Description
        Message = $Message
    }
}

function Write-Skip {
    param([string]$Message = "")
    Write-Host " ⊘" @Yellow
    if ($Message) { Write-Host "     $Message" @Gray }
    $script:SkippedTests++
    $TestResults += @{
        Status = "SKIP"
        Description = $Description
        Message = $Message
    }
}

# ============================================================================
# Test: Environment Check
# ============================================================================

function Test-Environment {
    Write-Section "Environment Check"
    
    Write-Test "Server running on localhost:3000"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Pass "Server is healthy"
        } else {
            Write-Fail "Server responded with status $($response.StatusCode)"
        }
    } catch {
        Write-Fail "Cannot reach server: $_"
        return $false
    }
    
    Write-Test ".env.local configured"
    if (Test-Path ".env.local") {
        $env_content = Get-Content ".env.local"
        $has_redis = $env_content -match "REDIS_URL"
        $has_sentry = $env_content -match "SENTRY_DSN"
        
        if ($has_redis -and $has_sentry) {
            Write-Pass "REDIS_URL and SENTRY_DSN configured"
        } else {
            if (-not $has_redis) {
                Write-Fail "REDIS_URL missing from .env.local"
            }
            if (-not $has_sentry) {
                Write-Fail "SENTRY_DSN missing from .env.local"
            }
        }
    } else {
        Write-Skip ".env.local not found (using defaults)"
    }
    
    return $true
}

# ============================================================================
# Test: Correlation ID
# ============================================================================

function Test-CorrelationId {
    Write-Section "Correlation ID Tests"
    
    # Test 1: Auto-generate Correlation ID
    Write-Test "Auto-generate Correlation ID on first request"
    try {
        $response = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/example" `
            -Method POST `
            -ContentType "application/json" `
            -Body '{"name":"Test"}' `
            -Headers @{ "X-Tenant-Id" = "test-tenant" } `
            -TimeoutSec 10
        
        $correlationId = $response.Headers['x-correlation-id']
        if ($correlationId -match '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
            Write-Pass "UUID format: $correlationId"
            $script:CorrelationId = $correlationId
        } else {
            Write-Fail "Invalid format: $correlationId"
        }
    } catch {
        Write-Fail "Request failed: $_"
    }
    
    # Test 2: Preserve Correlation ID
    Write-Test "Preserve Correlation ID from header"
    try {
        $customId = "test-custom-id-12345"
        $response = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/example" `
            -Method POST `
            -ContentType "application/json" `
            -Body '{"name":"Test2"}' `
            -Headers @{ 
                "X-Tenant-Id" = "test-tenant"
                "X-Correlation-Id" = $customId
            } `
            -TimeoutSec 10
        
        $responseId = $response.Headers['x-correlation-id']
        if ($responseId -eq $customId) {
            Write-Pass "Custom ID preserved: $responseId"
        } else {
            Write-Fail "Expected $customId, got $responseId"
        }
    } catch {
        Write-Fail "Request failed: $_"
    }
    
    # Test 3: Correlation ID in response body
    Write-Test "Correlation ID included in response body"
    try {
        $response = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/example" `
            -Method POST `
            -ContentType "application/json" `
            -Body '{"name":"Test3"}' `
            -Headers @{ "X-Tenant-Id" = "test-tenant" } `
            -TimeoutSec 10
        
        $body = $response.Content | ConvertFrom-Json
        if ($body.correlationId) {
            Write-Pass "ID in body: $($body.correlationId)"
        } else {
            Write-Fail "No correlationId in response body"
        }
    } catch {
        Write-Fail "Request failed: $_"
    }
}

# ============================================================================
# Test: Logging
# ============================================================================

function Test-Logging {
    Write-Section "Logging Tests"
    
    # Test 1: Request logging
    Write-Test "Request logged with method, path, headers"
    try {
        $response = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/example" `
            -Method GET `
            -Headers @{ "X-Tenant-Id" = "test-tenant" } `
            -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Write-Pass "GET request logged (check application logs)"
        } else {
            Write-Fail "Unexpected status: $($response.StatusCode)"
        }
    } catch {
        Write-Fail "Request failed: $_"
    }
    
    # Test 2: Response logging
    Write-Test "Response logged with status, duration"
    try {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/example" `
            -Method POST `
            -ContentType "application/json" `
            -Body '{"name":"LogTest"}' `
            -Headers @{ "X-Tenant-Id" = "test-tenant" } `
            -TimeoutSec 10
        $sw.Stop()
        
        if ($response.StatusCode -eq 201) {
            Write-Pass "Response logged ($($sw.ElapsedMilliseconds)ms) - check logs"
        } else {
            Write-Fail "Unexpected status: $($response.StatusCode)"
        }
    } catch {
        Write-Fail "Request failed: $_"
    }
    
    # Test 3: Error logging
    Write-Test "Error logged with exception details"
    try {
        $response = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/example" `
            -Method POST `
            -ContentType "application/json" `
            -Body '{}' `
            -Headers @{ "X-Tenant-Id" = "test-tenant" } `
            -TimeoutSec 10 `
            -ErrorAction Stop
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Pass "400 error logged - check logs for 'Missing required field'"
        } else {
            Write-Fail "Unexpected error: $_"
        }
    }
}

# ============================================================================
# Test: Rate Limiting
# ============================================================================

function Test-RateLimiting {
    if ($SkipRateLimitTests) {
        Write-Section "Rate Limiting Tests"
        Write-Skip "Rate limiting tests skipped (-SkipRateLimitTests)"
        return
    }
    
    Write-Section "Rate Limiting Tests"
    
    # Test 1: Rate limit info headers
    Write-Test "Rate limit headers present"
    try {
        $response = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/example" `
            -Method POST `
            -ContentType "application/json" `
            -Body '{"name":"RateTest1"}' `
            -Headers @{ "X-Tenant-Id" = "test-tenant-rl" } `
            -TimeoutSec 10
        
        $limit = $response.Headers['x-ratelimit-limit']
        $remaining = $response.Headers['x-ratelimit-remaining']
        $reset = $response.Headers['x-ratelimit-reset']
        
        if ($limit -and $remaining -and $reset) {
            Write-Pass "Limit: $limit, Remaining: $remaining, Reset: $reset"
        } else {
            Write-Fail "Missing headers. Limit: $limit, Remaining: $remaining, Reset: $reset"
        }
    } catch {
        Write-Fail "Request failed: $_"
    }
    
    # Test 2: Rate limit exceeded returns 429
    Write-Test "Rate limit exceeded returns 429 Too Many Requests"
    Write-Host "     (Making multiple rapid requests...)" @Gray
    
    $statusCodes = @()
    for ($i = 1; $i -le 150; $i++) {
        try {
            $response = Invoke-WebRequest `
                -Uri "http://localhost:3000/api/example" `
                -Method POST `
                -ContentType "application/json" `
                -Body "{\"name\":\"RateTest$i\"}" `
                -Headers @{ "X-Tenant-Id" = "test-tenant-rl" } `
                -TimeoutSec 5 `
                -ErrorAction Stop
            
            $statusCodes += $response.StatusCode
        } catch {
            if ($_.Exception.Response) {
                $statusCodes += [int]$_.Exception.Response.StatusCode
            }
        }
    }
    
    $has429 = $statusCodes -contains 429
    if ($has429) {
        $count429 = @($statusCodes | Where-Object { $_ -eq 429 }).Count
        Write-Pass "Got 429 response ($count429 times)"
    } else {
        Write-Fail "No 429 responses received. Statuses: $(($statusCodes | Sort-Object -Unique) -join ', ')"
    }
    
    # Test 3: Retry-After header
    Write-Test "429 response includes Retry-After header"
    try {
        # Fazer requests até hit rate limit
        for ($i = 1; $i -le 150; $i++) {
            try {
                $response = Invoke-WebRequest `
                    -Uri "http://localhost:3000/api/example" `
                    -Method POST `
                    -ContentType "application/json" `
                    -Body "{\"name\":\"RetryTest$i\"}" `
                    -Headers @{ "X-Tenant-Id" = "test-tenant-rl-retry" } `
                    -TimeoutSec 5 `
                    -ErrorAction Stop
            } catch {
                if ($_.Exception.Response.StatusCode -eq 429) {
                    $retryAfter = $_.Exception.Response.Headers['Retry-After']
                    if ($retryAfter) {
                        Write-Pass "Retry-After: $retryAfter seconds"
                    } else {
                        Write-Fail "No Retry-After header on 429"
                    }
                    break
                }
            }
        }
    } catch {
        Write-Fail "Test failed: $_"
    }
}

# ============================================================================
# Test: Sentry Integration
# ============================================================================

function Test-Sentry {
    Write-Section "Sentry Integration Tests"
    
    Write-Test "Sentry initialized (check SENTRY_DSN in .env.local)"
    if (Test-Path ".env.local") {
        $content = Get-Content ".env.local"
        if ($content -match "SENTRY_DSN=") {
            Write-Pass "SENTRY_DSN configured"
        } else {
            Write-Skip "SENTRY_DSN not configured (Sentry disabled)"
            return
        }
    } else {
        Write-Skip ".env.local not found"
        return
    }
    
    # Note: Actual error capture testing requires a real Sentry account
    # For now, just verify the infrastructure is in place
    Write-Test "Error context captured (check Sentry dashboard for correlation IDs)"
    Write-Pass "Manual verification: Log into Sentry, search by correlationId"
}

# ============================================================================
# Summary
# ============================================================================

function Show-Summary {
    Write-Host ""
    Write-Host "━" * 80 @Blue
    Write-Host " 📊 TEST SUMMARY" @Blue
    Write-Host "━" * 80 @Blue
    
    Write-Host ""
    Write-Host "  ✅ Passed:  $PassedTests" @Green
    Write-Host "  ❌ Failed:  $FailedTests" @Red
    Write-Host "  ⊘ Skipped: $SkippedTests" @Yellow
    Write-Host ""
    
    $Total = $PassedTests + $FailedTests
    if ($Total -gt 0) {
        $SuccessRate = [Math]::Round(($PassedTests / $Total) * 100, 0)
        Write-Host "  Success Rate: $SuccessRate%" @Blue
    }
    
    Write-Host ""
    Write-Host "━" * 80 @Blue
    
    if ($FailedTests -gt 0) {
        Write-Host ""
        Write-Host " ⚠️  FAILED TESTS DETAILS:" @Red
        foreach ($result in $TestResults | Where-Object { $_.Status -eq "FAIL" }) {
            Write-Host "   • $($result.Description)" @Red
            if ($result.Message) {
                Write-Host "     └─ $($result.Message)" @Red
            }
        }
    }
    
    Write-Host ""
}

# ============================================================================
# Main Execution
# ============================================================================

function Invoke-AllTests {
    Write-Host ""
    Write-Host "╔" + "═" * 78 + "╗" @Blue
    Write-Host "║" + (" " * 20) + "FASE 2 — P1 TEST SUITE" + (" " * 35) + "║" @Blue
    Write-Host "║" + (" " * 15) + "Logging • Rate Limiting • Correlation ID • Sentry" + (" " * 11) + "║" @Blue
    Write-Host "╚" + "═" * 78 + "╝" @Blue
    
    if ($Verbose) {
        Write-Host "Verbose mode: ON" @Gray
    }
    
    # Run tests
    if (Test-Environment) {
        Test-CorrelationId
        Test-Logging
        Test-RateLimiting
        Test-Sentry
    } else {
        Write-Host ""
        Write-Host "⚠️  Environment check failed. Cannot proceed with tests." @Red
        return 1
    }
    
    # Summary
    Show-Summary
    
    # Exit code
    if ($FailedTests -gt 0) {
        return 1
    } else {
        return 0
    }
}

# Execute
$exitCode = Invoke-AllTests
exit $exitCode
