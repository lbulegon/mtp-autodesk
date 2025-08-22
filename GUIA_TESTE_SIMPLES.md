# 🚀 Guia Simples para Testar

## ✅ **Passo a Passo**

### **1. Abrir a Aplicação**
1. No PowerShell, execute: `npm start`
2. Aguarde a janela do Electron abrir
3. Se não abrir, verifique se há erros no terminal

### **2. Verificar se Carregou**
1. Na janela do Electron, pressione **F12**
2. Vá na aba **Console**
3. Você deve ver logs como:
   ```
   🔍 Debug automático iniciado...
   === DEBUG DA APLICAÇÃO ===
   Elementos encontrados: {sidebar: true, content: true}
   Botões do menu: {orders: true, alocacoes: true, adminVagas: true}
   ```

### **3. Navegar para Vagas**
1. Na aplicação, clique no botão **🗓️** (Admin Vagas)
2. Deve aparecer a interface de vagas

### **4. Testar Filtros**
1. No console (F12), execute:
   ```javascript
   window.recarregarVagasComFiltros({ dias_atras: 7 });
   ```

## 🚨 **Se Não Funcionar**

### **Problema 1: Aplicação não abre**
- Verifique se o terminal mostra erros
- Tente `npm install` antes de `npm start`

### **Problema 2: Console não mostra logs**
- Verifique se pressionou F12 corretamente
- Verifique se está na aba Console

### **Problema 3: Botões não funcionam**
- Verifique se está logado
- Execute no console: `window.authManager?.isAuthenticated`

## 📞 **Me Diga**

1. A janela do Electron abriu?
2. O que aparece no console (F12)?
3. Você consegue ver os botões do menu?
4. O botão Admin Vagas funciona?

**Execute e me diga o resultado!** 🚀
