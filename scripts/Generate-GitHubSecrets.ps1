# ============================================================
# GitHub Secrets Generator - PowerShell Script
# Gera os valores necessários para configurar GitHub Secrets
# ============================================================

Write-Host "🔐 GitHub Secrets Generator" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

# Função para gerar NEXTAUTH_SECRET
function Generate-NextAuthSecret {
    Write-Host "📝 Gerando NEXTAUTH_SECRET..." -ForegroundColor Green
    Write-Host ""
    
    # Usar .NET para gerar bytes aleatórios
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    
    # Converter para base64
    $secret = [Convert]::ToBase64String($bytes)
    
    Write-Host "✅ NEXTAUTH_SECRET gerado:" -ForegroundColor Green
    Write-Host ""
    Write-Host "  $secret" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Copie esse valor para usar no GitHub Secret" -ForegroundColor Cyan
    Write-Host ""
    
    return $secret
}

# Menu principal
Write-Host "Escolha uma opção:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Gerar NEXTAUTH_SECRET"
Write-Host "2. Ver instruções de configuração"
Write-Host "3. Abrir GitHub Secrets page"
Write-Host ""

$choice = Read-Host "Digite sua escolha (1/2/3)"

switch ($choice) {
    "1" {
        $secret = Generate-NextAuthSecret
        
        Write-Host "💡 Dica: Copie este valor para o seu Notepad para usar depois" -ForegroundColor Yellow
        Write-Host ""
        
        # Oferecer para copiar para clipboard
        $copy = Read-Host "Deseja copiar para clipboard? (s/n)"
        if ($copy -eq "s" -or $copy -eq "S") {
            $secret | Set-Clipboard
            Write-Host "✅ Copiado para clipboard!" -ForegroundColor Green
        }
    }
    "2" {
        Write-Host "📋 INSTRUÇÕES DE CONFIGURAÇÃO" -ForegroundColor Cyan
        Write-Host "=============================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Vá para GitHub:"
        Write-Host "   https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/settings/secrets/actions"
        Write-Host ""
        Write-Host "2. Clique em 'New repository secret'"
        Write-Host ""
        Write-Host "3. Configure estes 4 secrets:"
        Write-Host ""
        Write-Host "   SECRET 1: DATABASE_URL"
        Write-Host "   └─ Supabase PostgreSQL connection string"
        Write-Host ""
        Write-Host "   SECRET 2: NEXTAUTH_SECRET"
        Write-Host "   └─ Execute a opção 1 para gerar"
        Write-Host ""
        Write-Host "   SECRET 3: NEXT_PUBLIC_APP_URL"
        Write-Host "   └─ Ex: https://suaapp.com"
        Write-Host ""
        Write-Host "   SECRET 4: NEXTAUTH_URL"
        Write-Host "   └─ Ex: https://suaapp.com"
        Write-Host ""
    }
    "3" {
        Write-Host "🌐 Abrindo GitHub Secrets page..." -ForegroundColor Green
        $url = "https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/settings/secrets/actions"
        
        # Abrir navegador
        if ($PSVersionTable.Platform -eq 'Win32NT' -or -not $PSVersionTable.Platform) {
            Start-Process $url
        } elseif ($PSVersionTable.Platform -eq 'Unix') {
            if ($IsMacOS) {
                open $url
            } else {
                xdg-open $url
            }
        }
        
        Write-Host "✅ Página aberta no navegador!" -ForegroundColor Green
    }
    default {
        Write-Host "❌ Opção inválida" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📚 Documentação:" -ForegroundColor Cyan
Write-Host "   - GITHUB_SECRETS_SETUP.md"
Write-Host "   - PRODUCTION_READY_CHECKLIST.md"
Write-Host "   - FINAL_ACTION_PLAN.md"
