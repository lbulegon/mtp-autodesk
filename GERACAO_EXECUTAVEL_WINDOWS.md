# 🚀 Geração do Executável para Windows - MTP Autodesk

## 🎯 **Objetivo**
Gerar um executável instalável para Windows da aplicação Electron MTP Autodesk, seguindo os padrões de desenvolvimento estabelecidos.

---

## 🔧 **Implementação**

### **1. Configuração do Package.json**

Primeiro, precisamos adicionar as dependências e scripts necessários:

```json
{
  "name": "mtp-autodesk",
  "version": "1.0.0",
  "main": "dist-electron/main.js",
  "scripts": {
    "build": "tsc -p electron/tsconfig.json",
    "start": "electron dist-electron/main.js",
    "dev": "tsc -p electron/tsconfig.json --watch",
    "dist": "npm run build && electron-builder",
    "dist:win": "npm run build && electron-builder --win",
    "dist:win-portable": "npm run build && electron-builder --win portable"
  },
  "devDependencies": {
    "electron": "^31.0.0",
    "electron-builder": "^24.9.1",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "axios": "^1.11.0"
  },
  "build": {
    "appId": "com.mtp.autodesk",
    "productName": "MTP Autodesk",
    "directories": {
      "output": "dist"
    },
    "files": [
      "dist-electron/**/*",
      "electron/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ],
      "icon": "electron/assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "MTP Autodesk"
    }
  }
}
```

### **2. Instalação das Dependências**

```bash
# ✅ Instalar electron-builder
npm install --save-dev electron-builder

# ✅ Verificar instalação
npm list electron-builder
```

### **3. Configuração do Icone**

Criar pasta `electron/assets/` e adicionar:
- `icon.ico` (256x256 pixels)
- `icon.png` (512x512 pixels)

### **4. Scripts de Build**

#### **Build Completo (Instalador)**
```bash
# ✅ Gerar instalador Windows
npm run dist:win
```

#### **Build Portátil**
```bash
# ✅ Gerar versão portátil
npm run dist:win-portable
```

---

## 📊 **Estrutura de Arquivos**

```
mtp-autodesk/
├── dist/                          # ✅ Saída dos executáveis
│   ├── MTP Autodesk Setup.exe     # Instalador
│   └── win-unpacked/              # Versão portátil
├── electron/
│   ├── assets/
│   │   ├── icon.ico              # Ícone do aplicativo
│   │   └── icon.png              # Ícone PNG
│   ├── index.html
│   ├── styles.css
│   └── main.ts
├── dist-electron/                 # ✅ Código compilado
├── package.json
└── electron-builder.yml          # ✅ Configuração alternativa
```

---

## 🧪 **Testes**

### **Teste Manual**
1. **Build**: Executar `npm run dist:win`
2. **Instalação**: Testar instalador gerado
3. **Execução**: Verificar se aplicativo inicia corretamente
4. **Funcionalidades**: Testar todas as funcionalidades principais

### **Logs de Teste**
```
INFO: Iniciando build do executável Windows
INFO: Compilando TypeScript...
INFO: ✅ Build concluído com sucesso
INFO: Gerando instalador NSIS...
INFO: ✅ Executável gerado: dist/MTP Autodesk Setup.exe
```

---

## 🎨 **Configurações Avançadas**

### **electron-builder.yml (Configuração Separada)**
```yaml
appId: com.mtp.autodesk
productName: MTP Autodesk
directories:
  output: dist
files:
  - dist-electron/**/*
  - electron/**/*
  - node_modules/**/*
win:
  target:
    - target: nsis
      arch:
        - x64
  icon: electron/assets/icon.ico
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: MTP Autodesk
  installerIcon: electron/assets/icon.ico
  uninstallerIcon: electron/assets/icon.ico
  installerHeaderIcon: electron/assets/icon.ico
```

### **Configurações de Assinatura (Opcional)**
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.p12",
      "certificatePassword": "password"
    }
  }
}
```

---

## 🚀 **Como Usar**

### **1. Preparação**
```bash
# ✅ Instalar dependências
npm install

# ✅ Verificar estrutura
ls electron/assets/
```

### **2. Geração do Executável**
```bash
# ✅ Gerar instalador
npm run dist:win

# ✅ Ou versão portátil
npm run dist:win-portable
```

### **3. Distribuição**
- **Instalador**: `dist/MTP Autodesk Setup.exe`
- **Portátil**: `dist/win-unpacked/MTP Autodesk.exe`

---

## ⚡ **Checklist de Qualidade**

### **Antes de Finalizar**
- [ ] ✅ Dependências instaladas corretamente
- [ ] ✅ Ícone configurado (256x256 .ico)
- [ ] ✅ Build compilado sem erros
- [ ] ✅ Instalador gerado com sucesso
- [ ] ✅ Aplicativo inicia corretamente
- [ ] ✅ Todas as funcionalidades testadas
- [ ] ✅ Documentação atualizada
- [ ] ✅ Performance adequada

---

## 🎯 **Princípios Aplicados**

1. **Simplicidade**: Processo de build claro e documentado
2. **Consistência**: Seguindo padrões de desenvolvimento
3. **Robustez**: Configurações de fallback e validações
4. **Usabilidade**: Instalador intuitivo com opções
5. **Manutenibilidade**: Configurações bem estruturadas
6. **Performance**: Build otimizado
7. **Segurança**: Assinatura opcional

---

## 📞 **Solução de Problemas**

### **Erro: "electron-builder not found"**
```bash
# ✅ Solução
npm install --save-dev electron-builder
```

### **Erro: "Icon not found"**
```bash
# ✅ Verificar ícone
ls electron/assets/icon.ico
```

### **Erro: "Build failed"**
```bash
# ✅ Verificar TypeScript
npm run build
```

---

**📅 Última Atualização**: 23/08/2024  
**👨‍💻 Responsável**: Equipe de Desenvolvimento MTP Autodesk
