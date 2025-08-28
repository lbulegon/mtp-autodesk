# ⚡ Guia Rápido - Gerar Executável Windows

## 🚀 **Passos Rápidos**

### **1. Preparação (Uma vez apenas)**
```bash
# ✅ Instalar electron-builder
npm install --save-dev electron-builder
```

### **2. Adicionar Ícone (Obrigatório)**
Colocar na pasta `electron/assets/`:
- `icon.ico` (256x256 pixels)
- `icon.png` (512x512 pixels)

### **3. Gerar Executável**
```bash
# ✅ Opção 1: Script PowerShell (Recomendado)
.\build-windows.ps1

# ✅ Opção 2: Script Batch
.\build-windows.bat

# ✅ Opção 3: Comandos manuais
npm run build
npm run dist:win
```

### **4. Resultado**
- **Instalador**: `dist/MTP Autodesk Setup.exe`
- **Portátil**: `dist/win-unpacked/MTP Autodesk.exe`

---

## 🎯 **Comandos Principais**

| Comando | Descrição |
|---------|-----------|
| `npm run build` | Compilar TypeScript |
| `npm run dist:win` | Gerar instalador Windows |
| `npm run dist:win-portable` | Gerar versão portátil |
| `.\build-windows.ps1` | Script PowerShell automático |
| `.\build-windows.bat` | Script Batch automático |

---

## ⚠️ **Problemas Comuns**

### **Erro: "Icon not found"**
```bash
# ✅ Solução: Adicionar ícone
# Colocar icon.ico em electron/assets/
```

### **Erro: "electron-builder not found"**
```bash
# ✅ Solução: Instalar dependência
npm install --save-dev electron-builder
```

### **Erro: "Build failed"**
```bash
# ✅ Solução: Verificar TypeScript
npm run build
```

---

## 📁 **Estrutura Final**
```
mtp-autodesk/
├── dist/                          # ✅ Executáveis gerados
│   ├── MTP Autodesk Setup.exe     # Instalador
│   └── win-unpacked/              # Versão portátil
├── electron/
│   ├── assets/
│   │   ├── icon.ico              # ✅ Obrigatório
│   │   └── icon.png              # ✅ Obrigatório
│   └── ...
└── package.json                   # ✅ Configurado
```

---

**🎯 Dica**: Use `.\build-windows.ps1` para automatizar todo o processo no PowerShell!

---

**📅 Última Atualização**: 23/08/2024  
**👨‍💻 Responsável**: Equipe de Desenvolvimento MTP Autodesk
