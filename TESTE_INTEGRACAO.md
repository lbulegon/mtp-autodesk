# 🧪 Guia de Teste - Integração de Vagas

## ✅ Como Testar a Integração

### 1. **Verificar se a aplicação está rodando**
- A aplicação Electron deve estar aberta
- A janela deve estar maximizada
- Você deve ver a interface do MotoPro AutoDesk

### 2. **Testar o Menu Lateral**
1. Clique no botão **📋 Vagas** no menu lateral (lado esquerdo)
2. Você deve ver:
   - ✅ Cards de vagas carregando
   - ✅ Status visual (Aberta, Em Andamento, Encerrada)
   - ✅ Informações das vagas (estabelecimento, horário, turno)

### 3. **Testar Interações**
1. **Ver Detalhes**: Clique em "Ver Detalhes" em qualquer vaga
   - ✅ Deve aparecer detalhes na coluna direita
   - ✅ Informações completas da vaga

2. **Login Manual** (se necessário):
   - Abra o console do navegador (F12)
   - Digite: `window.showLoginForm()`
   - Digite as credenciais: `lbulegon@gmail.com` / `Gabi#0201`

### 4. **Verificar Console**
Abra o console do navegador (F12) e verifique se aparecem estas mensagens:
```
🚀 Inicializando integração de vagas...
✅ Integração de vagas inicializada
```

### 5. **Testar Estados**
- **Com API**: Se conectado, mostra vagas reais
- **Sem API**: Mostra dados de exemplo
- **Erro**: Mostra mensagem de erro com botão "Tentar Novamente"

## 🔍 Debug

### Se não funcionar, verifique:

1. **Console do Navegador** (F12):
   ```javascript
   // Verificar se o módulo carregou
   console.log('renderVagasInSidebar:', typeof window.renderVagasInSidebar);
   
   // Verificar configurações
   console.log('CONFIG:', window.CONFIG);
   console.log('ConfigUtils:', window.ConfigUtils);
   
   // Verificar tokens
   console.log('Tokens:', window.ConfigUtils?.getTokens());
   ```

2. **Verificar se os scripts carregaram**:
   - `config.js` deve estar carregado
   - `vagasIntegration.js` deve estar carregado

3. **Testar manualmente**:
   ```javascript
   // No console do navegador
   window.renderVagasInSidebar();
   ```

## 🎯 Resultado Esperado

### ✅ Sucesso
- Vagas aparecem no menu lateral
- Interface responsiva e moderna
- Botões funcionando
- Detalhes aparecendo na coluna direita

### ❌ Problemas Comuns
- **Nada aparece**: Verificar console para erros
- **Erro de require**: Já corrigido na versão atual
- **API não conecta**: Usa dados de exemplo automaticamente

## 📱 Interface Esperada

### Menu Lateral (Vagas)
```
📋 Gestão de Vagas

┌─────────────────────────────┐
│ #501 - Mister X CB         │
│ 18:00 - 22:00              │
│ Turno: Noite               │
│ Candidaturas: 3 • Alocados: 2/4 │
│ [Ver Detalhes] [Iniciar]   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ #502 - Mister X Centro     │
│ 12:00 - 16:00              │
│ Turno: Almoço              │
│ Candidaturas: 5 • Alocados: 5/5 │
│ [Ver Detalhes]             │
└─────────────────────────────┘
```

### Coluna Direita (Detalhes)
```
Detalhes da Vaga #501

Estabelecimento: Mister X CB
Horário: 18:00 - 22:00
Turno: Noite
Status: [Aberta]
Candidaturas: 3
Alocados: 2/4
```

## 🚀 Próximos Passos

Se tudo estiver funcionando:
1. ✅ **Teste completo** - Todas as funcionalidades
2. ✅ **Interface responsiva** - Diferentes tamanhos de tela
3. ✅ **Autenticação** - Login automático e manual
4. ✅ **Fallback** - Dados de exemplo quando API não disponível

**Status**: ✅ INTEGRAÇÃO FUNCIONANDO









