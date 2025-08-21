# Implementação: Fechar e Candidatar Vagas

## Resumo das Alterações

### 1. Frontend (Electron Desktop)
- ✅ **Removido**: Botão "Candidatar-se" dos cards de vagas (não existia)
- ✅ **Adicionado**: Botão "Fechar e Candidatar" na tela de detalhes da vaga
- ✅ **Implementado**: Função `fecharECandidatar()` que chama o endpoint Django

### 2. Backend (Django)
- ✅ **Criado**: Endpoint `/vagas/{id}/fechar-e-candidatar/` (POST)
- ✅ **Implementado**: Lógica para fechar vaga e gerar candidaturas automaticamente

## Arquivos Modificados

### Frontend
- `electron/vagasIntegration.js` - Adicionado botão e função `fecharECandidatar()`

### Backend
- `src/vagas_endpoint.py` - Novo endpoint Django

## Como Implementar no Django

### 1. Copiar o arquivo `vagas_endpoint.py`
Copie o arquivo `src/vagas_endpoint.py` para o seu projeto Django, por exemplo:
```
seu_projeto_django/
├── motopro/
│   ├── views.py
│   ├── urls.py
│   └── vagas_endpoint.py  # ← Copiar aqui
```

### 2. Adicionar a URL no `urls.py`
```python
# motopro/urls.py
from django.urls import path
from .vagas_endpoint import FecharECandidatarView

urlpatterns = [
    # ... outras URLs existentes ...
    path('vagas/<int:vaga_id>/fechar-e-candidatar/', 
         FecharECandidatarView.as_view(), 
         name='fechar_e_candidatar'),
]
```

### 3. Verificar os modelos necessários
Certifique-se de que os seguintes modelos existem no seu projeto:
- `Vaga` (modelo principal de vagas)
- `Motoboy` (modelo de motoboys)
- `Motoboy_Vaga_Candidatura` (modelo de candidaturas)

### 4. Ajustar imports se necessário
Dependendo da estrutura do seu projeto, pode ser necessário ajustar os imports:
```python
# Se os modelos estiverem em apps diferentes:
from motoboys.models import Motoboy
from vagas.models import Vaga, Motoboy_Vaga_Candidatura
```

## Funcionamento

### Fluxo do Frontend
1. Usuário clica em "Ver Detalhes" de uma vaga
2. Na tela de detalhes, clica em "Fechar e Candidatar"
3. Sistema confirma a ação
4. Chama o endpoint Django via `authManager.authenticatedRequest()`
5. Exibe resultado e recarrega a lista de vagas

### Fluxo do Backend
1. Recebe requisição POST para `/vagas/{id}/fechar-e-candidatar/`
2. Busca a vaga pelo ID
3. Verifica se a vaga está aberta
4. Em uma transação:
   - Fecha a vaga (status = 'encerrada')
   - Busca motoboys ativos da empresa
   - Cria candidaturas para cada motoboy disponível
5. Retorna resultado com número de candidaturas geradas

## Endpoint API

### URL
```
POST /api/v1/vagas/{vaga_id}/fechar-e-candidatar/
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Resposta de Sucesso
```json
{
    "success": true,
    "message": "Vaga fechada e 5 candidaturas geradas",
    "vaga_id": 123,
    "candidaturas_geradas": 5
}
```

### Resposta de Erro
```json
{
    "error": "Vaga não está aberta",
    "status": "encerrada"
}
```

## Testando

### 1. Frontend
```bash
# No diretório do projeto Electron
npm start
```

### 2. Backend
```bash
# No diretório do projeto Django
python manage.py runserver
```

### 3. Teste Manual
1. Abra o aplicativo Electron
2. Faça login
3. Vá para a seção "Vagas"
4. Clique em "Ver Detalhes" de uma vaga aberta
5. Clique em "Fechar e Candidatar"
6. Confirme a ação
7. Verifique se a vaga foi fechada e as candidaturas foram geradas

## Logs e Debug

### Frontend
Os logs aparecem no console do Electron:
```
🔒 Fechando e candidatando vaga: 123
✅ Vaga #123 fechada e candidaturas geradas com sucesso!
```

### Backend
Os logs aparecem no console do Django:
```
INFO: Vaga 123 fechada e 5 candidaturas geradas
```

## Próximos Passos

1. **Implementar no Django**: Copiar o arquivo `vagas_endpoint.py` para seu projeto Django
2. **Configurar URLs**: Adicionar a rota no `urls.py`
3. **Testar**: Verificar se o endpoint funciona corretamente
4. **Ajustar**: Modificar a lógica de candidaturas conforme necessário
5. **Deploy**: Fazer deploy das alterações

## Observações

- O endpoint usa transações para garantir consistência dos dados
- Candidaturas duplicadas são evitadas verificando se já existem
- Apenas motoboys ativos da empresa são considerados
- O status da vaga é alterado para 'encerrada' após o processo

