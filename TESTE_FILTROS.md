# 🧪 Teste dos Filtros de Vagas

## ✅ Status: Pronto para Teste

A aplicação está rodando com o sistema de filtros implementado. Vamos testar!

## 🚀 Como Testar

### 1. **Abrir a Aplicação**
- A aplicação Electron deve estar rodando
- Abrir no navegador ou na janela do Electron

### 2. **Testar Via Interface**

#### **Passo 1: Acessar Vagas**
1. Clique no botão **🗓️ Admin Vagas** no menu lateral
2. Deve aparecer a interface de vagas com filtros

#### **Passo 2: Testar Filtros**
1. No dropdown "Filtrar por período", selecione:
   - "Últimos 7 dias"
   - "Últimos 15 dias" 
   - "Últimos 30 dias"
   - "Todas as vagas"
2. Clique no botão **🔄** para recarregar
3. Verifique se o número de vagas muda

### 3. **Testar Via Console (F12)**

#### **Teste 1: Filtros Básicos**
```javascript
// Verificar se as funções estão disponíveis
console.log('Funções disponíveis:', {
    recarregarVagasComFiltros: typeof window.recarregarVagasComFiltros,
    exemplosFiltros: typeof window.exemplosFiltros
});

// Testar filtro de 7 dias
window.recarregarVagasComFiltros({ dias_atras: 7 });
```

#### **Teste 2: Filtros por Status**
```javascript
// Apenas vagas abertas
window.recarregarVagasComFiltros({ status: 'aberta' });

// Apenas vagas fixas
window.recarregarVagasComFiltros({ tipo_vaga: 'fixa' });
```

#### **Teste 3: Filtros Combinados**
```javascript
// Vagas abertas dos últimos 7 dias
window.recarregarVagasComFiltros({
    status: 'aberta',
    dias_atras: 7,
    limit: 20
});
```

#### **Teste 4: Exemplos Pré-definidos**
```javascript
// Testar funções de exemplo
window.exemplosFiltros.ultimos7Dias();
window.exemplosFiltros.apenasAbertas();
window.exemplosFiltros.porEstabelecimento(11);
```

### 4. **Verificar Logs**

#### **No Console (F12)**
```javascript
// Verificar logs de debug
console.log('Endpoint chamado:', 'deve mostrar URL com parâmetros');
console.log('Vagas carregadas:', window.vagasData?.length);
```

#### **Logs Esperados**
```
🔍 Endpoint com filtros: /desktop/vagas/?dias_atras=7&limit=50&ordering=-data_da_vaga
✅ Dados da API recebidos: [array de vagas]
✅ Vagas renderizadas com sucesso: X
```

## 🎯 Resultados Esperados

### ✅ **Sucesso**
- [ ] Interface carrega corretamente
- [ ] Filtros funcionam via dropdown
- [ ] Console mostra URLs com parâmetros
- [ ] Número de vagas muda conforme filtro
- [ ] Funções globais estão disponíveis

### ❌ **Problemas Possíveis**
- [ ] Interface não carrega
- [ ] Filtros não funcionam
- [ ] Erro de autenticação
- [ ] Funções não encontradas
- [ ] API retorna erro

## 🔧 Debug

### **Se a Interface Não Carrega:**
```javascript
// Verificar se o módulo carregou
console.log('renderVagasInSidebar:', typeof window.renderVagasInSidebar);
console.log('authManager:', window.authManager?.isAuthenticated);
```

### **Se os Filtros Não Funcionam:**
```javascript
// Verificar se a função está disponível
console.log('recarregarVagasComFiltros:', typeof window.recarregarVagasComFiltros);

// Testar manualmente
window.recarregarVagasComFiltros({ dias_atras: 7 });
```

### **Se a API Retorna Erro:**
```javascript
// Verificar endpoint diretamente
const response = await window.authManager.authenticatedRequest('/desktop/vagas/?limit=5');
console.log('Status:', response.status);
console.log('Dados:', await response.json());
```

## 📊 Métricas de Teste

### **Performance**
- [ ] Carregamento inicial < 3 segundos
- [ ] Filtros aplicam em < 1 segundo
- [ ] Número de vagas reduzido com filtros

### **Funcionalidade**
- [ ] Todos os filtros funcionam
- [ ] Interface responsiva
- [ ] Logs informativos
- [ ] Tratamento de erros

## 🚨 Problemas Conhecidos

### **PowerShell Command**
- O comando `&&` não funciona no PowerShell
- Use `npm start` diretamente

### **Autenticação**
- Verificar se está logado antes de testar
- Tokens podem expirar

## 🔄 Próximos Passos

1. **Executar testes básicos**
2. **Verificar logs no console**
3. **Testar diferentes filtros**
4. **Validar performance**
5. **Reportar resultados**

---

**Status**: ✅ Pronto para teste
**Aplicação**: 🚀 Rodando
**Filtros**: 🔧 Implementados
