// apiConfig.js
// Configuração para comunicação com o backend Django

// Configuração da API
const API_CONFIG = {
    // URL base do backend Django
    BASE_URL: 'http://localhost:8000',
    
    // Versão da API
    API_VERSION: 'v1',
    
    // Timeout das requisições (ms)
    TIMEOUT: 10000,
    
    // Headers padrão
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Função para obter URL completa da API
function getApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}/${endpoint}`;
}

// Função para obter headers com autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        ...API_CONFIG.DEFAULT_HEADERS,
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Função para fazer requisições HTTP
async function apiRequest(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    const headers = getAuthHeaders();
    
    const config = {
        method: 'GET',
        headers,
        timeout: API_CONFIG.TIMEOUT,
        ...options
    };
    
    // Se há body, adicionar ao config
    if (options.body) {
        config.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(url, config);
        
        // Verificar se a resposta é ok
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Erro na API ${endpoint}:`, error);
        throw error;
    }
}

// Endpoints específicos
const API_ENDPOINTS = {
    // Sistema de Rotas
    ROTAS: {
        CRIAR: 'desktop/rotas/criar/',
        LISTAR: 'desktop/rotas/listar/',
        DETALHES: (id) => `desktop/rotas/${id}/`,
        INICIAR: (id) => `desktop/rotas/${id}/iniciar/`,
        FINALIZAR: (id) => `desktop/rotas/${id}/finalizar/`,
        CANCELAR: (id) => `desktop/rotas/${id}/cancelar/`
    },
    
    // Pedidos
    PEDIDOS: {
        DISPONIVEIS: 'motoboy-vaga/pedidos-disponiveis-rota/'
    },
    
    // Motoboys
    MOTOBOYS: {
        DISPONIVEIS: 'motoboy-vaga/motoboys-disponiveis/'
    },
    
    // Vagas
    VAGAS: {
        GERAR_FIXAS: 'vagas/gerar-fixas/',
        GERAR_EXTRAS: 'vagas/gerar-extras/',
        FECHAR_CANDIDATAR: (id) => `vagas/${id}/fechar-candidatar/`
    }
};

// Funções específicas para cada endpoint
const API_SERVICE = {
    // Rotas
    async criarRota(data) {
        return apiRequest(API_ENDPOINTS.ROTAS.CRIAR, {
            method: 'POST',
            body: data
        });
    },
    
    async listarRotas() {
        return apiRequest(API_ENDPOINTS.ROTAS.LISTAR);
    },
    
    async detalhesRota(id) {
        return apiRequest(API_ENDPOINTS.ROTAS.DETALHES(id));
    },
    
    async iniciarRota(id) {
        return apiRequest(API_ENDPOINTS.ROTAS.INICIAR(id), {
            method: 'POST'
        });
    },
    
    async finalizarRota(id) {
        return apiRequest(API_ENDPOINTS.ROTAS.FINALIZAR(id), {
            method: 'POST'
        });
    },
    
    async cancelarRota(id) {
        return apiRequest(API_ENDPOINTS.ROTAS.CANCELAR(id), {
            method: 'POST'
        });
    },
    
    // Pedidos
    async pedidosDisponiveis(estabelecimentoId) {
        return apiRequest(`${API_ENDPOINTS.PEDIDOS.DISPONIVEIS}?estabelecimento_id=${estabelecimentoId}`);
    },
    
    // Motoboys
    async motoboysDisponiveis(estabelecimentoId) {
        return apiRequest(`${API_ENDPOINTS.MOTOBOYS.DISPONIVEIS}?estabelecimento_id=${estabelecimentoId}`);
    },
    
    // Vagas
    async gerarVagasFixas(data) {
        return apiRequest(API_ENDPOINTS.VAGAS.GERAR_FIXAS, {
            method: 'POST',
            body: data
        });
    },
    
    async gerarVagasExtras(data) {
        return apiRequest(API_ENDPOINTS.VAGAS.GERAR_EXTRAS, {
            method: 'POST',
            body: data
        });
    },
    
    async fecharCandidatarVaga(id) {
        return apiRequest(API_ENDPOINTS.VAGAS.FECHAR_CANDIDATAR(id), {
            method: 'POST'
        });
    }
};

// Tratamento de erros global
function handleApiError(error) {
    console.error('Erro na API:', error);
    
    if (error.message.includes('401')) {
        // Token expirado ou inválido
        localStorage.removeItem('access_token');
        alert('Sessão expirada. Faça login novamente.');
        // Redirecionar para login se necessário
        return;
    }
    
    if (error.message.includes('500')) {
        alert('Erro interno do servidor. Tente novamente.');
        return;
    }
    
    // Outros erros
    alert(`Erro: ${error.message}`);
}

// Exportar para uso global
window.API_CONFIG = API_CONFIG;
window.API_ENDPOINTS = API_ENDPOINTS;
window.API_SERVICE = API_SERVICE;
window.handleApiError = handleApiError;

// Exemplo de uso:
/*
// Criar uma rota
try {
    const result = await API_SERVICE.criarRota({
        estabelecimento_id: 11,
        max_pedidos_por_rota: 5,
        raio_agrupamento_km: 5.0
    });
    console.log('Rota criada:', result);
} catch (error) {
    handleApiError(error);
}

// Listar rotas
try {
    const rotas = await API_SERVICE.listarRotas();
    console.log('Rotas:', rotas);
} catch (error) {
    handleApiError(error);
}
*/
