# 🔧 Solução de Problemas - Instalação MTP Autodesk

## 🚨 **Problema: Aplicativo não inicia após instalação**

### **Diagnóstico Realizado:**
- ✅ Executável gerado corretamente
- ✅ app.asar empacotado adequadamente
- ✅ Estrutura de arquivos válida
- ✅ Aplicativo funciona em modo portátil

---

## 🔍 **Possíveis Causas e Soluções**

### **1. Problema de Permissões**
```bash
# ✅ Solução: Executar como Administrador
# Clique com botão direito no instalador → "Executar como administrador"
```

### **2. Antivírus Bloqueando**
```bash
# ✅ Solução: Adicionar exceção
# 1. Abrir antivírus
# 2. Adicionar pasta de instalação como exceção
# 3. Permitir MTP Autodesk.exe
```

### **3. Instalação Incompleta**
```bash
# ✅ Solução: Reinstalar
# 1. Desinstalar completamente
# 2. Limpar pasta de instalação
# 3. Reinstalar como administrador
```

### **4. DLLs Faltando**
```bash
# ✅ Solução: Instalar Visual C++ Redistributable
# Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
```

---

## 🚀 **Passos para Resolver**

### **Passo 1: Desinstalar Completamente**
1. Painel de Controle → Programas → Desinstalar
2. Remover pasta: `C:\Users\[Usuario]\AppData\Local\Programs\mtp-autodesk`
3. Remover atalhos do Desktop e Menu Iniciar

### **Passo 2: Limpar Sistema**
```bash
# ✅ Limpar cache do Windows
sfc /scannow
```

### **Passo 3: Reinstalar**
1. Executar instalador como Administrador
2. Escolher pasta de instalação padrão
3. Permitir criação de atalhos

### **Passo 4: Verificar**
1. Verificar se atalhos foram criados
2. Tentar executar pelo atalho
3. Verificar logs de erro

---

## 📋 **Logs de Diagnóstico**

### **Verificar Logs do Windows:**
1. Event Viewer → Windows Logs → Application
2. Procurar por erros relacionados ao MTP Autodesk
3. Verificar código de erro

### **Logs do Electron:**
```bash
# ✅ Executar com logs detalhados
# Adicionar ao atalho: --enable-logging --v=1
```

---

## 🎯 **Solução Alternativa: Versão Portátil**

Se o instalador não funcionar, usar versão portátil:

```bash
# ✅ Gerar versão portátil
npm run dist:win-portable

# ✅ Executar diretamente
dist/win-unpacked/MTP Autodesk.exe
```

---

## 📞 **Comunicação de Problemas**

### **Ao Reportar:**
- [ ] Versão do Windows
- [ ] Antivírus instalado
- [ ] Logs de erro
- [ ] Passos para reproduzir
- [ ] Comportamento esperado vs atual

---

**📅 Última Atualização**: 23/08/2024  
**👨‍💻 Responsável**: Equipe de Desenvolvimento MTP Autodesk
