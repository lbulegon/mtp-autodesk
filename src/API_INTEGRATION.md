# 🔗 Integração Frontend-Backend

## 📋 **Arquitetura Correta**

### **Frontend (MTP-Desktop - Electron)**
- ✅ Interface do usuário (HTML/CSS/JavaScript)
- ✅ Chamadas para APIs do backend
- ✅ Gerenciamento de estado local
- ✅ Renderização de dados

### **Backend (Django)**
- ✅ Endpoints da API
- ✅ Lógica de negócio
- ✅ Modelos do banco de dados
- ✅ Autenticação e autorização

## 🚀 **Endpoints Necessários**

### **1. Sistema de Rotas**
```
POST /api/v1/desktop/rotas/criar/
GET  /api/v1/desktop/rotas/listar/
GET  /api/v1/desktop/rotas/{id}/
POST /api/v1/desktop/rotas/{id}/iniciar/
POST /api/v1/desktop/rotas/{id}/finalizar/
POST /api/v1/desktop/rotas/{id}/cancelar/
```

### **2. Pedidos Disponíveis**
```
GET /api/v1/motoboy-vaga/pedidos-disponiveis-rota/
```

### **3. Sistema de Vagas**
```
POST /api/v1/vagas/gerar-fixas/
POST /api/v1/vagas/gerar-extras/
POST /api/v1/vagas/{id}/fechar-candidatar/
```

### **4. Motoboys**
```
GET /api/v1/motoboy-vaga/motoboys-disponiveis/
```

## 🔧 **Implementação no Backend Django**

### **Estrutura de Pastas Recomendada:**
```
backend/
├── motopro/
│   ├── views/
│   │   ├── rotas.py          # Endpoints de rotas
│   │   ├── vagas.py          # Endpoints de vagas
│   │   ├── motoboys.py       # Endpoints de motoboys
│   │   └── pedidos.py        # Endpoints de pedidos
│   ├── models.py             # Modelos do banco
│   ├── urls.py               # URLs dos endpoints
│   └── serializers.py        # Serializers para JSON
└── manage.py
```

### **Exemplo de View (rotas.py):**
```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views import View

@method_decorator(csrf_exempt, name='dispatch')
class CriarRotasView(View):
    def post(self, request):
        # Lógica para criar rotas
        return JsonResponse({
            'success': True,
            'message': 'Rotas criadas com sucesso'
        })
```

## 🌐 **Configuração do Frontend**

### **URL Base da API:**
```javascript
const API_BASE_URL = 'http://localhost:8000'; // Django development server
```

### **Exemplo de Chamada:**
```javascript
async function criarRota(pedidos) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/desktop/rotas/criar/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
                estabelecimento_id: 11,
                max_pedidos_por_rota: pedidos.length,
                raio_agrupamento_km: 5.0
            })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao criar rota:', error);
        throw error;
    }
}
```

## 🔐 **Autenticação**

### **Token JWT:**
- O frontend armazena o token no `localStorage`
- Todas as requisições incluem o header `Authorization: Bearer <token>`
- O backend valida o token em cada endpoint

### **Exemplo de Middleware:**
```python
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class AuthenticatedView(View):
    def dispatch(self, request, *args, **kwargs):
        # Validar token JWT
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not self.validate_token(token):
            return JsonResponse({'error': 'Token inválido'}, status=401)
        return super().dispatch(request, *args, **kwargs)
```

## 📊 **Tratamento de Erros**

### **Frontend:**
```javascript
async function handleApiCall(apiFunction) {
    try {
        const result = await apiFunction();
        return result;
    } catch (error) {
        if (error.status === 401) {
            // Token expirado - redirecionar para login
            window.location.href = '/login';
        } else if (error.status === 500) {
            // Erro do servidor
            alert('Erro interno do servidor. Tente novamente.');
        } else {
            // Outros erros
            alert(`Erro: ${error.message}`);
        }
    }
}
```

### **Backend:**
```python
try:
    # Lógica da API
    return JsonResponse({'success': True, 'data': result})
except Exception as e:
    logger.error(f'Erro na API: {str(e)}')
    return JsonResponse({
        'success': False,
        'error': 'Erro interno do servidor',
        'details': str(e)
    }, status=500)
```

## 🚀 **Próximos Passos**

1. **Implementar endpoints no backend Django**
2. **Configurar CORS para permitir requisições do frontend**
3. **Testar integração entre frontend e backend**
4. **Implementar autenticação JWT**
5. **Adicionar validação de dados**
6. **Implementar logging e monitoramento**

## 📝 **Notas Importantes**

- ✅ **Separação clara** entre frontend e backend
- ✅ **APIs RESTful** para comunicação
- ✅ **Autenticação segura** com JWT
- ✅ **Tratamento de erros** robusto
- ✅ **Documentação** completa das APIs
- ✅ **Testes** para garantir funcionamento
