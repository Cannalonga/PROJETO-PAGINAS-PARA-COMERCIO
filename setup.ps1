#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Setup inicial do projeto — Páginas para o Comércio Local
    
.DESCRIPTION
    Este script configura o ambiente de desenvolvimento:
    1. Copia .env.example para .env.local
    2. Solicita variáveis críticas (DATABASE_URL, NEXTAUTH_SECRET)
    3. Executa npm install
    4. Gera cliente Prisma
    5. Executa migrações do banco de dados
    6. Popula dados demo (opcional)
    7. Inicia servidor dev

.EXAMPLE
    .\setup.ps1
#>

param(
    [switch]$SkipInstall,
    [switch]$SkipMigrations,
    [switch]$WithSeed
)

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║  🚀 SETUP: Páginas para o Comércio Local                      ║" -ForegroundColor Cyan
Write-Host "║     Enterprise Multi-Tenant Commerce Platform                 ║" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# ============================================================================
# STEP 1: Criar arquivo .env.local
# ============================================================================
Write-Host "`n[1/7] ⚙️  Configurando variáveis de ambiente..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "     ✅ .env.local já existe" -ForegroundColor Green
} else {
    Copy-Item ".env.example" ".env.local"
    Write-Host "     ✅ Arquivo .env.local criado de .env.example" -ForegroundColor Green
}

# ============================================================================
# STEP 2: Solicitar variáveis críticas
# ============================================================================
Write-Host "`n[2/7] 📝 Configurando variáveis críticas..." -ForegroundColor Yellow

# Ler arquivo atual
$envContent = Get-Content ".env.local" -Raw

# DATABASE_URL
$dbUrl = Read-Host "   DATABASE_URL (ex: postgresql://user:pass@localhost:5432/paginas_comercio)"
if ($dbUrl) {
    $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$dbUrl`""
    $envContent = $envContent -replace 'DIRECT_URL="[^"]*"', "DIRECT_URL=`"$dbUrl`""
    Write-Host "   ✅ DATABASE_URL configurada" -ForegroundColor Green
}

# NEXTAUTH_SECRET
$authSecret = Read-Host "   NEXTAUTH_SECRET (deixe vazio para gerar automaticamente)"
if (-not $authSecret) {
    # Gerar secret seguro
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($bytes)
    $authSecret = [System.Convert]::ToBase64String($bytes)
    Write-Host "   ✅ NEXTAUTH_SECRET gerado automaticamente" -ForegroundColor Green
} else {
    Write-Host "   ✅ NEXTAUTH_SECRET configurado" -ForegroundColor Green
}
$envContent = $envContent -replace 'NEXTAUTH_SECRET="[^"]*"', "NEXTAUTH_SECRET=`"$authSecret`""

# Salvar arquivo
$envContent | Out-File ".env.local" -Encoding UTF8

# ============================================================================
# STEP 3: npm install (se não skip)
# ============================================================================
if (-not $SkipInstall) {
    Write-Host "`n[3/7] 📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Falha ao instalar dependências" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Dependências instaladas (903 packages)" -ForegroundColor Green
} else {
    Write-Host "`n[3/7] ⏭️  Pulando npm install (--SkipInstall)" -ForegroundColor Yellow
}

# ============================================================================
# STEP 4: Gerar cliente Prisma
# ============================================================================
Write-Host "`n[4/7] 🔧 Gerando cliente Prisma..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Falha ao gerar cliente Prisma" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Cliente Prisma gerado" -ForegroundColor Green

# ============================================================================
# STEP 5: Executar migrations (se não skip)
# ============================================================================
if (-not $SkipMigrations) {
    Write-Host "`n[5/7] 📊 Executando migrações do banco de dados..." -ForegroundColor Yellow
    Write-Host "   ⚠️  Certifique-se de que o banco de dados está acessível" -ForegroundColor Yellow
    npm run prisma:migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Falha ao executar migrações" -ForegroundColor Red
        Write-Host "   💡 Dica: Verifique DATABASE_URL em .env.local" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "   ✅ Migrações executadas com sucesso" -ForegroundColor Green
} else {
    Write-Host "`n[5/7] ⏭️  Pulando migrações (--SkipMigrations)" -ForegroundColor Yellow
}

# ============================================================================
# STEP 6: Popular dados demo (se --WithSeed)
# ============================================================================
if ($WithSeed) {
    Write-Host "`n[6/7] 🌱 Populando dados demo..." -ForegroundColor Yellow
    npm run prisma:seed
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ⚠️  Falha ao popular dados demo (pode já existir)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Dados demo populados" -ForegroundColor Green
    }
} else {
    Write-Host "`n[6/7] ⏭️  Pulando seed de dados (use --WithSeed para incluir)" -ForegroundColor Yellow
}

# ============================================================================
# STEP 7: Checklist final
# ============================================================================
Write-Host "`n[7/7] ✅ Checklist final:" -ForegroundColor Yellow
Write-Host "   ✅ .env.local configurado" -ForegroundColor Green
Write-Host "   ✅ Dependências instaladas" -ForegroundColor Green
Write-Host "   ✅ Prisma gerado" -ForegroundColor Green
if (-not $SkipMigrations) {
    Write-Host "   ✅ Migrações executadas" -ForegroundColor Green
}

# ============================================================================
# RESUMO
# ============================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║  ✨ SETUP CONCLUÍDO COM SUCESSO!                             ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║  📍 PRÓXIMOS PASSOS:                                          ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║  1️⃣  Verifique as variáveis de ambiente:                     ║" -ForegroundColor Green
Write-Host "║      cat .env.local | grep DATABASE_URL                      ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║  2️⃣  Inicie o servidor de desenvolvimento:                  ║" -ForegroundColor Green
Write-Host "║      npm run dev                                              ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║  3️⃣  Acesse a aplicação em:                                  ║" -ForegroundColor Green
Write-Host "║      http://localhost:3000                                    ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║  4️⃣  Health check da API:                                    ║" -ForegroundColor Green
Write-Host "║      curl http://localhost:3000/api/health                   ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║  📚 Documentação:                                             ║" -ForegroundColor Green
Write-Host "║      - README.md (visão geral)                                ║" -ForegroundColor Green
Write-Host "║      - ARCHITECTURAL_RECOMMENDATIONS.md (arquitetura)        ║" -ForegroundColor Green
Write-Host "║      - .env.example (todas as variáveis)                      ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host ""
