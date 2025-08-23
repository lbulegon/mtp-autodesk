# Implementação - Gerar Vagas Extras

## 📋 Visão Geral

Este documento explica como implementar a funcionalidade de gerar vagas extras no sistema MotoPro Desktop.

## 🎯 Funcionalidade

A funcionalidade permite criar vagas extras com:
- **Data específica**: Data para a qual as vagas serão criadas
- **Quantidade**: Número de vagas a serem criadas (1-50)
- **Turno**: Manhã (08:00-18:00) ou Noite (18:00-02:00)

## 🔧 Implementação Frontend

### 1. Interface HTML
A interface já foi implementada no arquivo `electron/index.html`:

```html
<!-- Interface Gerar Vagas Extras -->
<div class="search-row" style="margin-bottom: 16px; flex-direction: column; gap: 12px;">
  <div style="display: flex; gap: 8px; align-items: center;">
    <span style="font-weight: 600; color: #333;">➕ Gerar Vagas Extras</span>
  </div>
  
  <div style="display: flex; gap: 8px; align-items: center;">
    <label style="font-size: 12px; color: #666; min-width: 80px;">Data:</label>
    <input type="date" id="dataInicioVagasExtras" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
  </div>
  
  <div style="display: flex; gap: 8px; align-items: center;">
    <label style="font-size: 12px; color: #666; min-width: 80px;">Quantidade:</label>
    <input type="number" id="quantidadeVagasExtras" min="1" max="50" value="1" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
  </div>
  
  <div style="display: flex; gap: 8px; align-items: center;">
    <label style="font-size: 12px; color: #666; min-width: 80px;">Turno:</label>
    <select id="turnoVagasExtras" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
      <option value="manha">Manhã (08:00-18:00)</option>
      <option value="noite">Noite (18:00-02:00)</option>
    </select>
  </div>
  
  <button id="btnGerarVagasExtras" class="btn btn-secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="gerarVagasExtras();">
    <span>➕</span>
    <span>Gerar Vagas Extras</span>
  </button>
</div>
```

### 2. Função JavaScript
A função `gerarVagasExtras()` já foi implementada no arquivo `electron/index.html`:

```javascript
async function gerarVagasExtras() {
  // Validação dos campos
  // Preparação do payload
  // Chamada da API
  // Tratamento da resposta
}
```

### 3. Estilos CSS
Os estilos já foram adicionados no arquivo `electron/styles.css`:

```css
/* Estilos para o botão Gerar Vagas Extras */
#btnGerarVagasExtras {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  /* ... outros estilos ... */
}
```

## 🔧 Implementação Backend

### 1. Arquivo do Endpoint
Copie o arquivo `src/gerar_vagas_extras.py` para seu projeto Django.

### 2. Configuração de URLs
Adicione a seguinte linha no arquivo `urls.py` do seu projeto Django:

```python
from gerar_vagas_extras import GerarVagasExtrasView

# Dentro do urlpatterns
path('motoboy-vaga/gerar-vagas-extras/', GerarVagasExtrasView.as_view(), name='gerar_vagas_extras'),
```

### 3. Estrutura do Endpoint

#### URL
```
POST /api/v1/motoboy-vaga/gerar-vagas-extras/
```

#### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### Payload
```json
{
  "estabelecimento_id": 11,
  "data_inicio": "2025-01-15",
  "quantidade": 5,
  "turno": "manha"
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "5 vagas extras criadas com sucesso",
  "vagas_criadas": [
    {
      "id": 123,
      "status": "aberta",
      "data": "2025-01-15",
      "inicio": "08:00",
      "fim": "18:00",
      "turno": "manha"
    }
  ],
  "vagas_criadas_total": 5,
  "estabelecimento_id": 11,
  "data_inicio": "2025-01-15",
  "turno": "manha"
}
```

#### Resposta de Erro
```json
{
  "error": "estabelecimento_id é obrigatório"
}
```

## 🎨 Design e UX

### Cores e Estilo
- **Botão**: Gradiente laranja (#f39c12 → #e67e22)
- **Campos**: Bordas cinza com hover laranja
- **Ícone**: ➕ (símbolo de adicionar)

### Validações
- **Data**: Obrigatória, formato YYYY-MM-DD
- **Quantidade**: 1-50 vagas
- **Turno**: Manhã ou Noite
- **Estabelecimento**: Deve ter contrato ativo

### Feedback ao Usuário
- **Confirmação**: Dialog de confirmação antes de criar
- **Sucesso**: Mensagem com número de vagas criadas
- **Erro**: Mensagem específica do erro
- **Loading**: Botão desabilitado durante processamento

## 🔍 Testando

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
3. Vá para "Admin Vagas"
4. Preencha os campos:
   - Data: 2025-01-15
   - Quantidade: 3
   - Turno: Manhã
5. Clique em "Gerar Vagas Extras"
6. Confirme a ação
7. Verifique se as vagas foram criadas

## 📊 Logs e Debug

### Frontend
Os logs aparecem no console do Electron:
```
➕ Função gerarVagasExtras chamada!
➕ Enviando payload: {estabelecimento_id: 11, data_inicio: "2025-01-15", quantidade: 3, turno: "manha"}
✅ Resposta da API: {success: true, vagas_criadas: [...]}
```

### Backend
Os logs aparecem no console do Django:
```
INFO: 3 vagas extras criadas para estabelecimento 11 em 2025-01-15
```

## 🚀 Próximos Passos

1. **Implementar no Django**: Copiar o arquivo `gerar_vagas_extras.py`
2. **Configurar URLs**: Adicionar a rota no `urls.py`
3. **Testar**: Verificar se o endpoint funciona corretamente
4. **Monitorar**: Acompanhar logs e performance

## 📝 Notas Técnicas

### Obtenção dos Horários
Os horários de início e fim são obtidos do **contrato do estabelecimento**, buscando os itens:
- **Manhã**: `hora_inicio_manha` e `hora_fim_manha`
- **Noite**: `hora_inicio_noite` e `hora_fim_noite`

Exemplo de itens no contrato:
```
hora_inicio_manha: "08:00"
hora_fim_manha: "18:00"
hora_inicio_noite: "18:00"
hora_fim_noite: "02:00"
```

### Diferenças das Vagas Fixas
- **Tipo**: `tipo_vaga = 'extra'` (vs `'fixa'`)
- **Quantidade**: Definida pelo usuário (vs contrato)
- **Turno**: Selecionável (vs automático)
- **Horários**: Buscados do contrato do estabelecimento (mesmo que vagas fixas)

### Segurança
- Validação de autenticação
- Validação de permissões
- Sanitização de inputs
- Transação atômica

### Performance
- Criação em lote
- Transação única
- Logs otimizados
