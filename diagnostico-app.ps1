# Script de Diagnostico - MTP Autodesk

Write-Host "=== DIAGNOSTICO MTP AUTODESK ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar estrutura de arquivos
Write-Host "1. Verificando estrutura de arquivos..." -ForegroundColor Yellow

if (Test-Path "dist/win-unpacked") {
    Write-Host "   ✅ Pasta win-unpacked encontrada" -ForegroundColor Green
    
    if (Test-Path "dist/win-unpacked/MTP Autodesk.exe") {
        Write-Host "   ✅ Executavel encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Executavel nao encontrado" -ForegroundColor Red
    }
    
    if (Test-Path "dist/win-unpacked/resources") {
        Write-Host "   ✅ Pasta resources encontrada" -ForegroundColor Green
        
        if (Test-Path "dist/win-unpacked/resources/app.asar") {
            Write-Host "   ✅ app.asar encontrado" -ForegroundColor Green
        } else {
            Write-Host "   ❌ app.asar nao encontrado" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ Pasta resources nao encontrada" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Pasta win-unpacked nao encontrada" -ForegroundColor Red
}

Write-Host ""

# 2. Verificar arquivos de desenvolvimento
Write-Host "2. Verificando arquivos de desenvolvimento..." -ForegroundColor Yellow

if (Test-Path "dist-electron/main.js") {
    Write-Host "   ✅ main.js compilado encontrado" -ForegroundColor Green
} else {
    Write-Host "   ❌ main.js nao encontrado" -ForegroundColor Red
}

if (Test-Path "electron/index.html") {
    Write-Host "   ✅ index.html encontrado" -ForegroundColor Green
} else {
    Write-Host "   ❌ index.html nao encontrado" -ForegroundColor Red
}

Write-Host ""

# 3. Testar execucao do executavel
Write-Host "3. Testando execucao do executavel..." -ForegroundColor Yellow

if (Test-Path "dist/win-unpacked/MTP Autodesk.exe") {
    Write-Host "   🚀 Tentando executar o aplicativo..." -ForegroundColor Cyan
    Write-Host "   ⚠️  O aplicativo sera iniciado. Feche-o para continuar o diagnostico." -ForegroundColor Yellow
    
    try {
        Start-Process "dist/win-unpacked/MTP Autodesk.exe" -Wait
        Write-Host "   ✅ Executavel executado com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erro ao executar: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Executavel nao encontrado para teste" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== FIM DO DIAGNOSTICO ===" -ForegroundColor Cyan
Write-Host ""
Read-Host "Pressione Enter para sair"
