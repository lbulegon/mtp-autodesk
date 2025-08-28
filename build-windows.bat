@echo off
echo 🚀 Iniciando build do MTP Autodesk para Windows...
echo.

echo 📦 Instalando dependências...
npm install

echo.
echo 🔨 Compilando TypeScript...
npm run build

echo.
echo 🏗️ Gerando executável Windows...
npm run dist:win

echo.
echo ✅ Build concluído!
echo 📁 Verifique a pasta 'dist' para o executável
echo.
pause
