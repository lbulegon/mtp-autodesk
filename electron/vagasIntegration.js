// vagasIntegration.js
// Integração simplificada para garantir funcionamento

// Estado das vagas
let vagasData = [];

// ====== INTEGRAÇÃO COM API REAL ======
async function fetchVagasFromAPI() {
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
        
        // Usar o AuthManager para fazer a requisição autenticada
        const response = await window.authManager.authenticatedRequest('/vagas/', {
            method: 'GET'
        });
        
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
        console.error('❌ Erro ao buscar vagas da API:', error);
        throw error;
    }
}

// Função removida - agora usa AuthManager

// ====== RENDERIZAR VAGAS NO MENU LATERAL ======
async function renderVagasInSidebar() {
    console.log('🚀 Renderizando vagas no sidebar...');
    
    const vagasContainer = document.getElementById('list-vagas');
    if (!vagasContainer) {
        console.error('❌ Container de vagas não encontrado');
        return;
    }
    
    try {
        // Buscar dados da API real
        console.log('🔄 Buscando vagas da API...');
        const vagas = await fetchVagasFromAPI();
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
        
        vagasContainer.innerHTML = vagas.map(vaga => {
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
                <div class="card" data-vaga="${vagaData.id}" style="margin-bottom: 12px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <div>
                            <div style="font-weight: bold; color: #374151;">#${vagaData.id} - ${vagaData.estabelecimento}</div>
                            <div style="font-size: 14px; color: #6b7280;">${vagaData.inicio} - ${vagaData.fim}</div>
                        </div>
                        <div>${getStatusBadge(vagaData.status)}</div>
                    </div>
                    <div style="font-size: 13px; color: #6b7280;">
                        <div>Data: ${formatDate(vagaData.data)}</div>
                        <div>Tipo: ${vagaData.tipo}</div>
                        <div>Local: ${vagaData.local}</div>
                    </div>
                    <div style="margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap;">
                        <button class="btn btn-outline" style="font-size: 12px; padding: 4px 8px;" onclick="viewVagaDetails(${vagaData.id})">Ver Detalhes</button>
                        ${vagaData.status === 'aberta' ? `<button class="btn btn-primary" style="font-size: 12px; padding: 4px 8px;" onclick="startVaga(${vagaData.id})">Iniciar</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
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
