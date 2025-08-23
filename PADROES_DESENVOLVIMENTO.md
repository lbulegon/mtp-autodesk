# 📋 Padrões de Desenvolvimento - MTP Autodesk

## 🎯 **Objetivo**
Documentar e padronizar todo o processo de desenvolvimento para garantir consistência, qualidade e eficiência em todas as alterações do software.

---

## 🏗️ **Arquitetura do Sistema**

### **Frontend (Electron)**
- **Tecnologia**: Electron + HTML/CSS/JavaScript
- **Localização**: `electron/`
- **Estrutura**:
  - `index.html` - Interface principal
  - `styles.css` - Estilos globais
  - `main.js` - Lógica principal do Electron

### **Backend (Django)**
- **Tecnologia**: Django + Python
- **Localização**: `src/`
- **Estrutura**:
  - `urls.py` - Roteamento de URLs
  - `views.py` - Lógica de negócio
  - `models.py` - Modelos de dados

---

## 📝 **Convenções de Código**

### **Python (Backend)**
```python
# ✅ CORRETO
class GerarVagasExtrasView(View):
    """Endpoint para gerar vagas extras com quantidade e turno específicos"""
    
    def post(self, request):
        try:
            # Validação de dados
            data = json.loads(request.body)
            
            # Logs informativos
            logger.info(f'Processando requisição para estabelecimento {estabelecimento_id}')
            
            # Tratamento de erros
            if not estabelecimento_id:
                return JsonResponse({'error': 'estabelecimento_id é obrigatório'}, status=400)
                
        except Exception as e:
            logger.error(f'Erro ao processar requisição: {str(e)}')
            return JsonResponse({'error': 'Erro interno'}, status=500)
```

### **JavaScript (Frontend)**
```javascript
// ✅ CORRETO
async function gerarVagasExtras() {
    try {
        // Validação de entrada
        const quantidade = parseInt(document.getElementById('quantidadeVagasExtras').value);
        if (!quantidade || quantidade < 1) {
            alert('Quantidade deve ser maior que 0');
            return;
        }
        
        // Confirmação do usuário
        if (!confirm(`Criar ${quantidade} vagas extras?`)) {
            return;
        }
        
        // Chamada da API
        const response = await window.authManager.authenticatedRequest('/desktop/gerar-vagas-extras/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        // Feedback ao usuário
        if (response.ok) {
            alert('Vagas criadas com sucesso!');
        } else {
            alert('Erro ao criar vagas');
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro interno do sistema');
    }
}
```

### **CSS (Estilos)**
```css
/* ✅ CORRETO */
#btnGerarVagasExtras {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

#btnGerarVagasExtras:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}
```

---

## 🔄 **Fluxo de Desenvolvimento**

### **1. Análise da Solicitação**
- [ ] Entender completamente o que foi solicitado
- [ ] Identificar arquivos que precisam ser modificados
- [ ] Definir a abordagem técnica

### **2. Implementação**
- [ ] Seguir as convenções de código
- [ ] Implementar validações adequadas
- [ ] Adicionar logs informativos
- [ ] Tratar erros apropriadamente

### **3. Testes**
- [ ] Testar funcionalidade no frontend
- [ ] Verificar logs do backend
- [ ] Validar comportamento esperado
- [ ] Testar casos de erro

### **4. Documentação**
- [ ] Atualizar documentação relevante
- [ ] Comentar mudanças importantes
- [ ] Registrar padrões novos

---

## 📊 **Padrões de Logs**

### **Backend (Python)**
```python
# ✅ Logs informativos
logger.info(f'✅ Horário encontrado no contrato: {chave} = {horario}')
logger.info(f'{len(vagas_criadas)} vagas extras criadas com sucesso')

# ⚠️ Logs de aviso
logger.warning(f'⚠️  Item de horário "{chave}" não encontrado no contrato')
logger.warning(f'Usando horários padrão para turno "{turno}"')

# ❌ Logs de erro
logger.error(f'❌ Erro ao processar requisição: {str(e)}')
logger.error(f'❌ Formato inválido para horário: {item.valor}')
```

### **Frontend (JavaScript)**
```javascript
// ✅ Logs informativos
console.log('Iniciando criação de vagas extras...');
console.log('Payload:', payload);

// ❌ Logs de erro
console.error('Erro na requisição:', error);
console.error('Resposta inválida:', response);
```

---

## 🎨 **Padrões de UI/UX**

### **Cores e Gradientes**
```css
/* Botões principais */
.btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
}

/* Botões de ação */
.btn-action {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
}

/* Botões de sucesso */
.btn-success {
    background: linear-gradient(135deg, #56ab2f, #a8e6cf);
}

/* Botões de perigo */
.btn-danger {
    background: linear-gradient(135deg, #ff416c, #ff4b2b);
}
```

### **Animações e Transições**
```css
/* Transições suaves */
.transition-smooth {
    transition: all 0.3s ease;
}

/* Hover effects */
.hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

---

## 🔧 **Padrões de API**

### **Estrutura de Resposta**
```json
{
    "success": true,
    "message": "Operação realizada com sucesso",
    "data": {
        "vagas_criadas": [...],
        "total": 3,
        "estabelecimento_id": 123
    }
}
```

### **Estrutura de Erro**
```json
{
    "success": false,
    "error": "Descrição do erro",
    "details": "Detalhes técnicos (opcional)"
}
```

### **Validações Obrigatórias**
- [ ] Verificar campos obrigatórios
- [ ] Validar tipos de dados
- [ ] Verificar permissões
- [ ] Tratar exceções

---

## 📁 **Estrutura de Arquivos**

### **Novos Endpoints**
```
src/
├── novo_endpoint.py          # Implementação do endpoint
├── urls.py                   # Adicionar rota
└── tests/                    # Testes unitários
    └── test_novo_endpoint.py
```

### **Novas Funcionalidades Frontend**
```
electron/
├── index.html               # Adicionar HTML
├── styles.css               # Adicionar estilos
└── main.js                  # Adicionar JavaScript
```

---

## 🧪 **Padrões de Teste**

### **Teste Manual**
1. **Frontend**: Verificar interface e interações
2. **Backend**: Verificar logs e respostas da API
3. **Integração**: Testar fluxo completo
4. **Erros**: Testar casos de erro

### **Logs de Teste**
```
INFO: Iniciando teste de criação de vagas extras
INFO: Estabelecimento ID: 123
INFO: Quantidade: 3
INFO: Turno: manha
INFO: ✅ 3 vagas extras criadas com sucesso
```

---

## 📚 **Documentação**

### **Para Novas Funcionalidades**
- [ ] Criar arquivo `.md` explicando a implementação
- [ ] Documentar endpoints da API
- [ ] Explicar fluxo de dados
- [ ] Incluir exemplos de uso

### **Estrutura da Documentação**
```markdown
# Nome da Funcionalidade

## 🎯 Objetivo
Descrição clara do que a funcionalidade faz

## 🔧 Implementação
Detalhes técnicos da implementação

## 📊 Testes
Resultados dos testes realizados

## 🚀 Como Usar
Instruções de uso para o usuário final
```

---

## ⚡ **Checklist de Qualidade**

### **Antes de Finalizar**
- [ ] Código segue as convenções
- [ ] Logs informativos implementados
- [ ] Tratamento de erros adequado
- [ ] Validações implementadas
- [ ] Interface responsiva e intuitiva
- [ ] Documentação atualizada
- [ ] Testes realizados
- [ ] Performance adequada

---

## 🎯 **Princípios Gerais**

1. **Simplicidade**: Código limpo e fácil de entender
2. **Consistência**: Seguir padrões estabelecidos
3. **Robustez**: Tratar erros e casos extremos
4. **Usabilidade**: Interface intuitiva e responsiva
5. **Manutenibilidade**: Código bem documentado e estruturado
6. **Performance**: Otimizar para boa performance
7. **Segurança**: Validar entradas e proteger dados

---

## 📞 **Comunicação**

### **Ao Reportar Problemas**
- [ ] Descrever o problema claramente
- [ ] Incluir logs relevantes
- [ ] Especificar passos para reproduzir
- [ ] Indicar comportamento esperado vs atual

### **Ao Solicitar Funcionalidades**
- [ ] Explicar o objetivo da funcionalidade
- [ ] Detalhar requisitos técnicos
- [ ] Fornecer exemplos de uso
- [ ] Indicar prioridade

---

**📅 Última Atualização**: 23/08/2024  
**👨‍💻 Responsável**: Equipe de Desenvolvimento MTP Autodesk
