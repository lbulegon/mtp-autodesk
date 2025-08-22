# 🔍 Filtros de Vagas - Documentação

## ✅ Problema Resolvido

O endpoint estava retornando **todas as vagas** sem filtros. Agora implementamos um sistema de filtros que permite:

- Filtrar por período (dias atrás/futuro)
- Filtrar por status (aberta, encerrada, etc.)
- Filtrar por tipo de vaga (fixa, temporária, etc.)
- Filtrar por estabelecimento
- Limitar número de resultados
- Ordenar resultados

## 🚀 Como Usar os Filtros

### 1. **Filtros Básicos**

```javascript
// Vagas dos últimos 7 dias
window.exemplosFiltros.ultimos7Dias();

// Vagas dos próximos 30 dias
window.exemplosFiltros.proximos30Dias();

// Apenas vagas abertas
window.exemplosFiltros.apenasAbertas();

// Apenas vagas fixas
window.exemplosFiltros.apenasFixas();
```

### 2. **Filtros Personalizados**

```javascript
// Filtro por período específico
window.recarregarVagasComFiltros({
    dias_atras: 15,        // 15 dias atrás
    dias_futuro: 30        // 30 dias no futuro
});

// Filtro por status
window.recarregarVagasComFiltros({
    status: 'aberta'
});

// Filtro por tipo de vaga
window.recarregarVagasComFiltros({
    tipo_vaga: 'fixa'
});

// Filtro por estabelecimento
window.recarregarVagasComFiltros({
    estabelecimento_id: 11
});

// Filtro por período específico
window.recarregarVagasComFiltros({
    data_inicio: '2025-01-01',
    data_fim: '2025-01-31'
});
```

### 3. **Filtros Combinados**

```javascript
// Vagas abertas dos últimos 7 dias
window.recarregarVagasComFiltros({
    status: 'aberta',
    dias_atras: 7,
    dias_futuro: 0
});

// Vagas fixas dos próximos 30 dias
window.recarregarVagasComFiltros({
    tipo_vaga: 'fixa',
    dias_atras: 0,
    dias_futuro: 30
});
```

## 📋 Parâmetros Disponíveis

### Filtros de Data
- `dias_atras`: Número de dias atrás (ex: 7, 15, 30)
- `dias_futuro`: Número de dias no futuro (ex: 30, 60)
- `data_inicio`: Data de início (formato: YYYY-MM-DD)
- `data_fim`: Data de fim (formato: YYYY-MM-DD)

### Filtros de Status
- `status`: Status da vaga ('aberta', 'encerrada', 'em_andamento')

### Filtros de Tipo
- `tipo_vaga`: Tipo da vaga ('fixa', 'temporária')

### Filtros de Estabelecimento
- `estabelecimento_id`: ID do estabelecimento

### Controle de Resultados
- `limit`: Número máximo de resultados (padrão: 50)
- `ordering`: Ordenação ('-data_da_vaga', 'data_da_vaga', etc.)

## 🔧 Implementação Técnica

### 1. **Função Principal**
```javascript
async function fetchVagasFromAPI(filtros = {}) {
    // Construir parâmetros de query
    const params = new URLSearchParams();
    
    // Adicionar filtros
    if (filtros.status) {
        params.append('status', filtros.status);
    }
    
    // Construir URL
    let endpoint = '/desktop/vagas/';
    if (params.toString()) {
        endpoint += `?${params.toString()}`;
    }
    
    // Fazer requisição
    const response = await window.authManager.authenticatedRequest(endpoint, {
        method: 'GET'
    });
}
```

### 2. **Exemplo de URL Gerada**
```
/desktop/vagas/?status=aberta&dias_atras=7&limit=50&ordering=-data_da_vaga
```

## 🎯 Exemplos Práticos

### Exemplo 1: Vagas Recentes
```javascript
// Buscar vagas dos últimos 7 dias
window.recarregarVagasComFiltros({
    dias_atras: 7,
    dias_futuro: 0,
    limit: 20
});
```

### Exemplo 2: Vagas Futuras
```javascript
// Buscar vagas dos próximos 30 dias
window.recarregarVagasComFiltros({
    dias_atras: 0,
    dias_futuro: 30,
    status: 'aberta'
});
```

### Exemplo 3: Vagas de Estabelecimento Específico
```javascript
// Buscar vagas do estabelecimento ID 11
window.recarregarVagasComFiltros({
    estabelecimento_id: 11,
    status: 'aberta',
    limit: 100
});
```

## 🔍 Debug e Logs

### Verificar Filtros Aplicados
```javascript
// No console do navegador
console.log('Filtros ativos:', window.vagasData);
```

### Testar Endpoint
```javascript
// Testar endpoint diretamente
const response = await window.authManager.authenticatedRequest('/desktop/vagas/?status=aberta&limit=10');
console.log('Resposta:', await response.json());
```

## 📊 Benefícios

1. **Performance**: Menos dados transferidos
2. **Usabilidade**: Resultados mais relevantes
3. **Flexibilidade**: Múltiplos filtros combináveis
4. **Escalabilidade**: Suporte a grandes volumes de dados

## 🚨 Limitações

- Limite máximo de 100 resultados por requisição
- Filtros de data baseados em UTC
- Ordenação apenas por campos disponíveis na API

## 🔄 Atualizações

Para aplicar os filtros em tempo real:

```javascript
// Recarregar com novos filtros
window.recarregarVagasComFiltros({
    dias_atras: 15,
    status: 'aberta'
});
```

---

**Nota**: Os filtros são aplicados no lado do servidor, garantindo melhor performance e menor uso de banda.
