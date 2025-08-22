// vagasIntegration.js
// Integração simplificada para garantir funcionamento

// Estado das vagas
let vagasData = [];

// ====== INTEGRAÇÃO COM API REAL ======
async function fetchVagasFromAPI(filtros = {}) {
    try {
        console.log('🔄 Buscando vagas da empresa...');
        
        // Verificar se está autenticado
        if (!window.authManager || !window.authManager.isAuthenticated) {
            console.error('❌ Usuário não autenticado');
            throw new Error('Usuário não autenticado - faça login primeiro');
        }
        
        // Obter ID da empresa
        const companyId = window.authManager.getCompanyId();
        if (!companyId) {
            console.error('❌ ID da empresa não encontrado');
            throw new Error('ID da empresa não encontrado');
        }
        
        console.log('🏢 Buscando vagas da empresa ID:', companyId);
        
        // Construir parâmetros de query
        const params = new URLSearchParams();
        
        // Adicionar filtros básicos
        if (filtros.status) {
            params.append('status', filtros.status);
        }
        
        if (filtros.tipo_vaga) {
            params.append('tipo_vaga', filtros.tipo_vaga);
        }
        
        if (filtros.estabelecimento_id) {
            params.append('estabelecimento_id', filtros.estabelecimento_id);
        }
        
        // Filtros de data
        if (filtros.data_inicio) {
            params.append('data_inicio', filtros.data_inicio);
        }
        
        if (filtros.data_fim) {
            params.append('data_fim', filtros.data_fim);
        }
        
        // Filtro por período (dias atrás)
        if (filtros.dias_atras) {
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - filtros.dias_atras);
            params.append('data_inicio', dataLimite.toISOString().split('T')[0]);
        }
        
        // Filtro por período futuro (dias à frente)
        if (filtros.dias_futuro) {
            const dataFutura = new Date();
            dataFutura.setDate(dataFutura.getDate() + filtros.dias_futuro);
            params.append('data_fim', dataFutura.toISOString().split('T')[0]);
        }
        
        // Limitar número de resultados
        if (filtros.limit) {
            params.append('limit', filtros.limit);
        } else {
            params.append('limit', '50'); // Limite padrão
        }
        
        // Ordenação
        if (filtros.ordering) {
            params.append('ordering', filtros.ordering);
        } else {
            params.append('ordering', '-data_da_vaga'); // Mais recentes primeiro
        }
        
        // Construir URL com parâmetros
        let endpoint = '/desktop/vagas/';
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        
        console.log('🔍 Endpoint com filtros:', endpoint);
        
        // Usar o AuthManager para fazer a requisição autenticada com timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
        
        try {
            const response = await window.authManager.authenticatedRequest(endpoint, {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            console.log('📊 Status da resposta:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Dados da API recebidos:', data);
                
                // Log detalhado da primeira vaga para debug
                if (Array.isArray(data) && data.length > 0) {
                    console.log('🔍 Estrutura da primeira vaga:', JSON.stringify(data[0], null, 2));
                    console.log('🔍 Campos disponíveis:', Object.keys(data[0]));
                    console.log('🔍 Valores dos campos:', Object.entries(data[0]).map(([key, value]) => `${key}: ${value}`).join(', '));
                }
                
                return data;
            } else {
                console.error('❌ Erro na API:', response.status);
                const errorText = await response.text();
                console.error('❌ Detalhes do erro:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error('⏰ Timeout: API não respondeu em 10 segundos');
                throw new Error('Timeout: API não respondeu em 10 segundos');
            }
            console.error('❌ Erro ao buscar vagas da API:', error);
            throw error;
    }
}

// Função removida - agora usa AuthManager

// ====== RENDERIZAR VAGAS NO MENU LATERAL ======
async function renderVagasInSidebar(filtros = {}) {
    console.log('🚀 Renderizando vagas no sidebar...');
    
    const vagasContainer = document.getElementById('list-vagas');
    if (!vagasContainer) {
        console.error('❌ Container de vagas não encontrado');
        return;
    }
    
    try {
        // Buscar dados da API real com filtros
        console.log('🔄 Buscando vagas da API com filtros:', filtros);
        const vagas = await fetchVagasFromAPI(filtros);
        vagasData = vagas;
        
        // Verificar se os dados são um array
        if (!Array.isArray(vagas)) {
            console.error('❌ Dados recebidos não são um array:', vagas);
            vagasContainer.innerHTML = `
                <div style="color: #ef4444; text-align: center; padding: 20px;">
                    <div>❌</div>
                    <div>Formato de dados inválido</div>
                    <div style="margin-top: 10px;"><button class="btn btn-outline" onclick="renderVagasInSidebar()">Tentar Novamente</button></div>
                </div>
            `;
            return;
        }
        
        if (!vagas.length) {
            vagasContainer.innerHTML = `
                <div style="color: #6b7280; text-align: center; padding: 20px;">
                    <div>📋</div>
                    <div>Nenhuma vaga encontrada</div>
                </div>
            `;
            return;
        }
        
        // Criar container com layout em grade
        vagasContainer.innerHTML = `
            <div class="vagas-grid">
                ${vagas.map(vaga => {
                    // Mapear campos da API real
                    const vagaData = {
                        id: vaga.id || 'N/A',
                        estabelecimento: vaga.estabelecimento_nome || 'Estabelecimento não informado',
                        data: vaga.data_da_vaga || 'Data não informada',
                        inicio: vaga.hora_inicio_padrao ? vaga.hora_inicio_padrao.substring(0, 5) : '00:00',
                        fim: vaga.hora_fim_padrao ? vaga.hora_fim_padrao.substring(0, 5) : '00:00',
                        status: vaga.status || 'aberta',
                        tipo: vaga.tipo_vaga || 'Não informado',
                        local: vaga.local || 'Local não informado',
                        estabelecimento_id: vaga.estabelecimento_id || null
                    };
                    
                    return `
                        <div class="vaga-card" data-vaga="${vagaData.id}" onclick="viewVagaDetails(${vagaData.id})">
                            <div class="vaga-header">
                                <div class="vaga-id">#${vagaData.id}</div>
                                <div class="vaga-status ${vagaData.status}">${vagaData.status}</div>
                            </div>
                            <div class="vaga-info">
                                <div class="vaga-estabelecimento">${vagaData.estabelecimento}</div>
                                <div class="vaga-horario">🕐 ${vagaData.inicio} - ${vagaData.fim}</div>
                                <div class="vaga-data">📅 ${formatDate(vagaData.data)}</div>
                                <div class="vaga-tipo">📋 ${vagaData.tipo}</div>
                                <div class="vaga-local">📍 ${vagaData.local}</div>
                            </div>
                            <div class="vaga-actions">
                                <button class="btn btn-outline" onclick="event.stopPropagation(); viewVagaDetails(${vagaData.id})">Ver Detalhes</button>
                                ${vagaData.status === 'aberta' ? `<button class="btn btn-primary" onclick="event.stopPropagation(); startVaga(${vagaData.id})">Iniciar</button>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        console.log('✅ Vagas renderizadas com sucesso:', vagas.length);
        
    } catch (error) {
        console.error('❌ Erro ao renderizar vagas:', error);
        
        // Se não está autenticado, mostrar tela de login
        if (error.message.includes('não autenticado') || error.message.includes('faça login')) {
            console.log('🔐 Usuário não autenticado, mostrando tela de login...');
            if (window.loginComponent) {
                window.loginComponent.render();
            } else {
                vagasContainer.innerHTML = `
                    <div style="color: #ef4444; text-align: center; padding: 20px;">
                        <div>🔐</div>
                        <div>Faça login para continuar</div>
                        <div style="margin-top: 10px;"><button class="btn btn-outline" onclick="location.reload()">Recarregar</button></div>
                    </div>
                `;
            }
            return;
        }
        
        let errorMessage = 'Erro ao carregar vagas';
        if (error.message.includes('Token')) {
            errorMessage = 'Token de acesso inválido - faça login novamente';
        } else if (error.message.includes('401')) {
            errorMessage = 'Token expirado - faça login novamente';
        } else if (error.message.includes('404')) {
            errorMessage = 'API não encontrada';
        } else if (error.message.includes('500')) {
            errorMessage = 'Erro no servidor';
        }
        
        vagasContainer.innerHTML = `
            <div style="color: #ef4444; text-align: center; padding: 20px;">
                <div>❌</div>
                <div>${errorMessage}</div>
                <div style="font-size: 12px; margin-top: 5px; color: #6b7280;">${error.message}</div>
                <div style="margin-top: 10px;"><button class="btn btn-outline" onclick="renderVagasInSidebar()">Tentar Novamente</button></div>
            </div>
        `;
    }
}

// ====== FUNÇÕES AUXILIARES ======
function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function getStatusBadge(status) {
    switch (status) {
        case 'aberta':
            return '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Aberta</span>';
        case 'encerrada':
            return '<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Encerrada</span>';
        case 'em_andamento':
            return '<span style="background: #f59e0b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Em Andamento</span>';
        default:
            return '<span style="background: #6b7280; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">' + status + '</span>';
    }
}

// ====== FUNÇÕES GLOBAIS (para chamadas do HTML) ======
window.renderVagasInSidebar = renderVagasInSidebar;

// Função global para recarregar vagas com filtros
window.recarregarVagasComFiltros = async function(filtros = {}) {
    console.log('🔄 Recarregando vagas com filtros:', filtros);
    try {
        await renderVagasInSidebar(filtros);
    } catch (error) {
        console.error('❌ Erro ao recarregar vagas:', error);
    }
};

// Exemplos de uso dos filtros
window.exemplosFiltros = {
    // Vagas dos últimos 7 dias
    ultimos7Dias: () => window.recarregarVagasComFiltros({ dias_atras: 7, dias_futuro: 0 }),
    
    // Vagas dos próximos 30 dias
    proximos30Dias: () => window.recarregarVagasComFiltros({ dias_atras: 0, dias_futuro: 30 }),
    
    // Vagas abertas apenas
    apenasAbertas: () => window.recarregarVagasComFiltros({ status: 'aberta' }),
    
    // Vagas fixas apenas
    apenasFixas: () => window.recarregarVagasComFiltros({ tipo_vaga: 'fixa' }),
    
    // Vagas de um estabelecimento específico
    porEstabelecimento: (id) => window.recarregarVagasComFiltros({ estabelecimento_id: id }),
    
    // Vagas de um período específico
    porPeriodo: (dataInicio, dataFim) => window.recarregarVagasComFiltros({ 
        data_inicio: dataInicio, 
        data_fim: dataFim 
    })
};

window.viewVagaDetails = function(vagaId) {
    console.log('🔍 Visualizando detalhes da vaga:', vagaId);
    
    const vaga = vagasData.find(v => v.id === vagaId);
    if (vaga) {
        // Mostrar detalhes na coluna direita
        const detailContainer = document.getElementById('detail');
        if (detailContainer) {
            detailContainer.className = 'detail';
            detailContainer.innerHTML = `
                <div class="hdr">
                    <div class="title">Detalhes da Vaga #${vaga.id}</div>
                </div>
                <div style="padding: 16px;">
                    <div style="margin-bottom: 16px;">
                        <strong>Estabelecimento:</strong> ${vaga.estabelecimento_nome || 'Não informado'}
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong>Data:</strong> ${formatDate(vaga.data_da_vaga)}
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong>Horário:</strong> ${vaga.hora_inicio_padrao ? vaga.hora_inicio_padrao.substring(0, 5) : '00:00'} - ${vaga.hora_fim_padrao ? vaga.hora_fim_padrao.substring(0, 5) : '00:00'}
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong>Tipo:</strong> ${vaga.tipo_vaga || 'Não informado'}
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong>Status:</strong> ${getStatusBadge(vaga.status)}
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong>Local:</strong> ${vaga.local || 'Não informado'}
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong>ID do Estabelecimento:</strong> ${vaga.estabelecimento_id || 'Não informado'}
                    </div>
                </div>
                <div class="footer-actions">
                    <button class="btn-outline">Editar Vaga</button>
                    ${vaga.status === 'aberta' ? `<button class="btn-primary">Iniciar Vaga</button>` : ''}
                    <button class="btn-danger">Encerrar Vaga</button>
                    <button class="btn btn-outline" onclick="fecharECandidatar(${vaga.id})">Fechar e Candidatar</button>
                </div>
            `;
        }
    }
};

window.startVaga = function(vagaId) {
    console.log('▶️ Iniciando vaga:', vagaId);
    
    if (confirm(`Deseja iniciar a vaga #${vagaId}?`)) {
        alert(`Vaga #${vagaId} iniciada com sucesso!`);
        renderVagasInSidebar(); // Recarregar a lista
    }
};

window.fecharECandidatar = async function(vagaId) {
    console.log('🔒 Fechando e candidatando vaga:', vagaId);
    
    try {
        // Verificar se está autenticado
        if (!window.authManager || !window.authManager.isAuthenticated) {
            alert('❌ Usuário não autenticado - faça login primeiro');
            return;
        }
        
        if (confirm(`Deseja fechar a vaga #${vagaId} e gerar candidaturas?`)) {
            // Chamar o endpoint para fechar e candidatar
            const response = await window.authManager.authenticatedRequest(`/vagas/${vagaId}/fechar-e-candidatar/`, {
                method: 'POST'
            });
            
            if (response.ok) {
                const result = await response.json();
                alert(`✅ Vaga #${vagaId} fechada e candidaturas geradas com sucesso!`);
                console.log('✅ Resultado da operação:', result);
                
                // Recarregar a lista de vagas
                await renderVagasInSidebar();
            } else {
                const errorText = await response.text();
                console.error('❌ Erro ao fechar e candidatar vaga:', errorText);
                alert(`❌ Erro ao fechar e candidatar vaga: ${errorText}`);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao fechar e candidatar vaga:', error);
        alert(`❌ Erro: ${error.message}`);
    }
};

// ====== INICIALIZAÇÃO ======
console.log('🚀 Carregando módulo de integração de vagas...');

// Função de inicialização que pode ser chamada externamente
function initializeVagasIntegration() {
    console.log('✅ Inicializando integração de vagas...');
    // A integração será inicializada quando necessário
}

// Expor função de inicialização globalmente
window.vagasIntegration = {
    init: initializeVagasIntegration,
    renderVagasInSidebar: renderVagasInSidebar,
    viewVagaDetails: window.viewVagaDetails,
    startVaga: window.startVaga
};

console.log('✅ Módulo de integração de vagas carregado');
