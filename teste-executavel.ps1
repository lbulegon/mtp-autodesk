# Teste Detalhado do Executavel MTP Autodesk

Write-Host "=== TESTE DETALHADO DO EXECUTAVEL ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar estrutura do app.asar
Write-Host "1. Verificando estrutura do app.asar..." -ForegroundColor Yellow

if (Test-Path "dist/win-unpacked/resources/app.asar") {
    Write-Host "   app.asar encontrado" -ForegroundColor Green
    
    # Tentar extrair e verificar conteúdo
    try {
        $asarPath = "dist/win-unpacked/resources/app.asar"
        $tempDir = "temp-asar-extract"
        
        if (Test-Path $tempDir) {
            Remove-Item $tempDir -Recurse -Force
        }
        
        New-Item -ItemType Directory -Path $tempDir | Out-Null
        
        # Usar npx asar para extrair
        npx asar extract $asarPath $tempDir
        
        if (Test-Path "$tempDir/electron/index.html") {
            Write-Host "   index.html encontrado no app.asar" -ForegroundColor Green
        } else {
            Write-Host "   index.html NAO encontrado no app.asar" -ForegroundColor Red
            Write-Host "   Conteudo do app.asar:" -ForegroundColor Yellow
            Get-ChildItem $tempDir -Recurse | ForEach-Object {
                Write-Host "      $($_.FullName.Replace($tempDir, ''))" -ForegroundColor White
            }
        }
        
        # Limpar
        Remove-Item $tempDir -Recurse -Force
        
    } catch {
        Write-Host "   Erro ao extrair app.asar: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   app.asar nao encontrado" -ForegroundColor Red
}

Write-Host ""

# 2. Testar execução com logs
Write-Host "2. Testando execução com logs detalhados..." -ForegroundColor Yellow

if (Test-Path "dist/win-unpacked/MTP Autodesk.exe") {
    Write-Host "   Executando com logs..." -ForegroundColor Cyan
    
    try {
        # Executar com logs detalhados
        $process = Start-Process "dist/win-unpacked/MTP Autodesk.exe" -ArgumentList "--enable-logging", "--v=1", "--log-level=0" -PassThru -WindowStyle Normal
        
        Write-Host "   Aguardando 10 segundos..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        if (!$process.HasExited) {
            Write-Host "   Processo ainda rodando (bom sinal)" -ForegroundColor Green
            $process.Kill()
            Write-Host "   Processo finalizado" -ForegroundColor Yellow
        } else {
            Write-Host "   Processo terminou prematuramente" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "   Erro ao executar: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   Executavel nao encontrado" -ForegroundColor Red
}

Write-Host ""

# 3. Verificar logs do Windows
Write-Host "3. Verificando logs do Windows..." -ForegroundColor Yellow

try {
    $logs = Get-WinEvent -LogName Application -MaxEvents 10 | Where-Object { $_.Message -like "*MTP*" -or $_.Message -like "*Electron*" }
    
    if ($logs) {
        Write-Host "   Logs encontrados:" -ForegroundColor Cyan
        $logs | ForEach-Object {
            Write-Host "   [$($_.TimeCreated)] $($_.Message)" -ForegroundColor White
        }
    } else {
        Write-Host "   Nenhum log relacionado encontrado" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Erro ao verificar logs: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== FIM DO TESTE ===" -ForegroundColor Cyan
Write-Host ""
Read-Host "Pressione Enter para sair"
