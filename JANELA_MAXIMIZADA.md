# 🖥️ Configuração de Janela Maximizada

## ✅ Alteração Concluída

A janela do Electron agora inicializa **maximizada** por padrão.

## 📝 Alterações Realizadas

### Arquivo: `electron/main.ts`

**Antes:**
```typescript
async function createWindow() {
  win = new BrowserWindow({
    width: 1380,
    height: 880,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  await win.loadFile(resolveIndexHtml());
  win.on("closed", () => (win = null));
}
```

**Depois:**
```typescript
async function createWindow() {
  win = new BrowserWindow({
    width: 1380,
    height: 880,
    show: false, // Não mostrar a janela até estar pronta
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  await win.loadFile(resolveIndexHtml());
  
  // Maximizar a janela após carregar o conteúdo
  win.maximize();
  
  // Mostrar a janela após maximizar
  win.show();
  
  win.on("closed", () => (win = null));
}
```

## 🔧 Como Funciona

1. **`show: false`** - A janela não é exibida imediatamente
2. **`win.loadFile()`** - Carrega o conteúdo da aplicação
3. **`win.maximize()`** - Maximiza a janela
4. **`win.show()`** - Exibe a janela já maximizada

## 🚀 Benefícios

- ✅ **Experiência do usuário melhorada** - A aplicação abre maximizada
- ✅ **Sem flickering** - A janela não aparece e depois maximiza
- ✅ **Transição suave** - O usuário vê a aplicação já no tamanho correto

## 🧪 Como Testar

```bash
# Compilar o projeto
npm run build

# Executar a aplicação
npm start
```

A janela deve abrir automaticamente maximizada.

## 📋 Comandos Úteis

```bash
# Desenvolvimento com watch (recompila automaticamente)
npm run dev

# Compilar manualmente
npm run build

# Executar aplicação
npm start
```

## 🎯 Resultado

A aplicação Electron agora inicializa com a janela maximizada, proporcionando uma melhor experiência do usuário desde o primeiro uso.



















