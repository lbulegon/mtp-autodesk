# Script PowerShell para Build do MTP Autodesk Windows

Write-Host "Iniciando build do MTP Autodesk para Windows..." -ForegroundColor Green
Write-Host ""

Write-Host "Instalando dependencias..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao instalar dependencias!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "Compilando TypeScript..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro na compilacao TypeScript!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "Gerando executavel Windows..." -ForegroundColor Yellow
npm run dist:win

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao gerar executavel!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "Build concluido com sucesso!" -ForegroundColor Green
Write-Host "Verifique a pasta 'dist' para o executavel" -ForegroundColor Cyan
Write-Host ""

# Verificar se o executavel foi gerado
if (Test-Path "dist") {
    Write-Host "Arquivos gerados:" -ForegroundColor Cyan
    Get-ChildItem "dist" -Recurse | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor White
    }
} else {
    Write-Host "Pasta 'dist' nao encontrada!" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Pressione Enter para sair"
