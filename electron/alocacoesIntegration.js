// alocacoesIntegration.js
// Integração com alocações de motoboys

// Estado das alocações
let alocacoesData = [];

// ====== INTEGRAÇÃO COM API REAL ======
async function fetchAlocacoesFromAPI() {
    try {
        console.log('🔄 Buscando alocações ativas...');
        
        // Verificar se está autenticado
        if (!window.authManager || !window.authManager.isAuthenticated) {
            console.error('❌ Usuário não autenticado');
            throw new Error('Usuário não autenticado - faça login primeiro');
        }
        
        console.log('🏢 Buscando alocações ativas agora...');
        
        // Usar o AuthManager para fazer a requisição autenticada
        const response = await window.authManager.authenticatedRequest('/alocacoes/ativas/agora/', {
            method: 'GET'
        });
        
        console.log('📊 Status da resposta:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Dados das alocações recebidos:', data);
            console.log('🔍 Tipo de dados:', typeof data);
            console.log('🔍 É array?', Array.isArray(data));
            console.log('🔍 Estrutura completa:', JSON.stringify(data, null, 2));
            
            // Processar a estrutura real da API
            let alocacoes = [];
            if (data && typeof data === 'object' && data.estabelecimentos) {
                // A API retorna estabelecimentos com alocações aninhadas
                data.estabelecimentos.forEach(estabelecimento => {
                    if (estabelecimento.alocacoes && Array.isArray(estabelecimento.alocacoes)) {
                        alocacoes = alocacoes.concat(estabelecimento.alocacoes);
                    }
                });
            } else if (Array.isArray(data)) {
                // Se for array direto
                alocacoes = data;
            } else if (data && typeof data === 'object') {
                // Verificar outras propriedades possíveis
                if (data.results) {
                    alocacoes = data.results;
                } else if (data.data) {
                    alocacoes = data.data;
                } else if (data.alocacoes) {
                    alocacoes = data.alocacoes;
                } else {
                    alocacoes = [data];
                }
            }
            
            console.log('🔍 Alocações extraídas:', alocacoes.length);
            if (alocacoes.length > 0) {
                console.log('🔍 Estrutura da primeira alocação:', JSON.stringify(alocacoes[0], null, 2));
                console.log('🔍 Campos disponíveis:', Object.keys(alocacoes[0]));
            }
            
            return alocacoes;
        } else {
            console.error('❌ Erro na API:', response.status);
            const errorText = await response.text();
            console.error('❌ Detalhes do erro:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('❌ Erro ao buscar alocações da API:', error);
        
        // Se for erro de rede ou API indisponível, usar dados de exemplo
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('404')) {
            console.log('⚠️ API indisponível, usando dados de exemplo...');
            return [
                {
                    id: 1,
                    motoboy_id: 101,
                    motoboy_nome: "João Silva",
                    vaga_id: 626,
                    estabelecimento_id: 10,
                    estabelecimento_nome: "Pizza Caporale",
                    data_inicio: "2025-08-18T18:00:00",
                    data_fim: "2025-08-18T00:00:00",
                    status: "ativa",
                    tipo: "fixa"
                },
                {
                    id: 2,
                    motoboy_id: 102,
                    motoboy_nome: "Maria Santos",
                    vaga_id: 624,
                    estabelecimento_id: 11,
                    estabelecimento_nome: "Mister X",
                    data_inicio: "2025-08-18T18:00:00",
                    data_fim: "2025-08-18T01:00:00",
                    status: "ativa",
                    tipo: "fixa"
                }
            ];
        }
        
        throw error;
    }
}

// ====== RENDERIZAR ALOCAÇÕES NO PAINEL ======
async function renderAlocacoes() {
    console.log('🚀 Renderizando alocações...');
    
    const alocacoesContainer = document.getElementById('alocacoes-container');
    if (!alocacoesContainer) {
        console.error('❌ Container de alocações não encontrado');
        return;
    }
    
    try {
        // Buscar dados da API real
        console.log('🔄 Buscando alocações da API...');
        const alocacoes = await fetchAlocacoesFromAPI();
        alocacoesData = alocacoes;
        
        // Verificar se os dados são um array
        if (!Array.isArray(alocacoes)) {
            console.error('❌ Dados recebidos não são um array:', alocacoes);
            alocacoesContainer.innerHTML = `
                <div style="color: #ef4444; text-align: center; padding: 20px;">
                    <div>❌</div>
                    <div>Formato de dados inválido</div>
                    <div style="margin-top: 10px;"><button class="btn btn-outline" onclick="renderAlocacoes()">Tentar Novamente</button></div>
                </div>
            `;
            return;
        }
        
        if (!alocacoes.length) {
            alocacoesContainer.innerHTML = `
                <div style="color: #6b7280; text-align: center; padding: 20px;">
                    <div>🛵</div>
                    <div>Nenhuma alocação ativa encontrada</div>
                </div>
            `;
            return;
        }
        
        alocacoesContainer.innerHTML = alocacoes.map(alocacao => {
            // Mapear campos da API real baseado na estrutura fornecida
            const alocacaoData = {
                id: alocacao.id || 'N/A',
                motoboy_id: alocacao.motoboy?.id || null,
                motoboy_nome: alocacao.motoboy?.nome || 'Nome não informado',
                motoboy_telefone: alocacao.motoboy?.telefone || null,
                motoboy_placa: alocacao.motoboy?.placa_moto || null,
                vaga_id: alocacao.vaga_id || null,
                estabelecimento_id: alocacao.estabelecimento_id || null,
                estabelecimento_nome: alocacao.estabelecimento_nome || 'Estabelecimento não informado',
                data_da_vaga: alocacao.data_da_vaga || null,
                hora_inicio: alocacao.hora_inicio || null,
                hora_fim: alocacao.hora_fim || null,
                data_hora_inicio: alocacao.data_hora_inicio || null,
                status: alocacao.status || 'ativa',
                tipo_vaga: alocacao.tipo_vaga || 'Não informado',
                entregas_realizadas: alocacao.entregas_realizadas || 0
            };
            
            return `
                <div class="card" data-alocacao="${alocacaoData.id}" style="margin-bottom: 12px; padding: 14px; border: 1px solid #e5e7eb; border-radius: 10px; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <!-- Header com nome do motoboy e status -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 28px; height: 28px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px;">
                                    ${alocacaoData.motoboy_nome.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style="font-weight: 600; color: #111827; font-size: 15px;">${alocacaoData.motoboy_nome}</div>
                                    <div style="font-size: 12px; color: #6b7280;">${alocacaoData.estabelecimento_nome}</div>
                                </div>
                            </div>
                        </div>
                        <div style="margin-left: 8px;">${getAlocacaoStatusBadge(alocacaoData.status)}</div>
                    </div>

                    <!-- Informações principais -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                        <div style="background: #f8fafc; padding: 6px 8px; border-radius: 6px;">
                            <div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">VAGA</div>
                            <div style="font-weight: 600; color: #111827; font-size: 13px;">#${alocacaoData.vaga_id || 'N/A'}</div>
                        </div>
                        <div style="background: #f8fafc; padding: 6px 8px; border-radius: 6px;">
                            <div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">TIPO</div>
                            <div style="font-weight: 600; color: #111827; font-size: 13px;">${alocacaoData.tipo_vaga}</div>
                        </div>
                        <div style="background: #f8fafc; padding: 6px 8px; border-radius: 6px;">
                            <div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">DATA</div>
                            <div style="font-weight: 600; color: #111827; font-size: 13px;">${formatDate(alocacaoData.data_da_vaga)}</div>
                        </div>
                        <div style="background: #f8fafc; padding: 6px 8px; border-radius: 6px;">
                            <div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">HORÁRIO</div>
                            <div style="font-weight: 600; color: #111827; font-size: 13px;">${alocacaoData.hora_inicio} - ${alocacaoData.hora_fim}</div>
                        </div>
                    </div>

                    <!-- Informações de contato e estatísticas -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 6px 8px; background: #f9fafb; border-radius: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${alocacaoData.motoboy_telefone ? `
                                <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280;">
                                    <span>📞</span>
                                    <span>${alocacaoData.motoboy_telefone}</span>
                                </div>
                            ` : ''}
                            ${alocacaoData.motoboy_placa ? `
                                <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280;">
                                    <span>🏍️</span>
                                    <span>${alocacaoData.motoboy_placa}</span>
                                </div>
                            ` : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px; background: #dcfce7; padding: 3px 6px; border-radius: 4px;">
                            <span style="font-size: 12px;">📦</span>
                            <span style="font-weight: 600; color: #166534; font-size: 12px;">${alocacaoData.entregas_realizadas}</span>
                        </div>
                    </div>

                    <!-- Botões de ação -->
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-outline" style="flex: 1; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #d1d5db; background: white; color: #374151; transition: all 0.2s ease;" onclick="viewAlocacaoDetails(${alocacaoData.id})">
                            <span style="margin-right: 4px;">👁️</span>
                            Ver Detalhes
                        </button>
                        <button class="btn btn-outline" style="flex: 1; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #f3f4f6; background: #f9fafb; color: #6b7280; transition: all 0.2s ease;" onclick="desalocarMotoboy(${alocacaoData.id})">
                            <span style="margin-right: 4px;">🔄</span>
                            Desalocar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('✅ Alocações renderizadas com sucesso:', alocacoes.length);
        
    } catch (error) {
        console.error('❌ Erro ao renderizar alocações:', error);
        
        // Se não está autenticado, mostrar tela de login
        if (error.message.includes('não autenticado') || error.message.includes('faça login')) {
            console.log('🔐 Usuário não autenticado, mostrando tela de login...');
            alocacoesContainer.innerHTML = `
                <div style="color: #ef4444; text-align: center; padding: 20px;">
                    <div>🔐</div>
                    <div>Faça login para continuar</div>
                    <div style="margin-top: 10px;"><button class="btn btn-outline" onclick="location.reload()">Recarregar</button></div>
                </div>
            `;
            return;
        }
        
        let errorMessage = 'Erro ao carregar alocações';
        if (error.message.includes('Token')) {
            errorMessage = 'Token de acesso inválido - faça login novamente';
        } else if (error.message.includes('401')) {
            errorMessage = 'Token expirado - faça login novamente';
        } else if (error.message.includes('404')) {
            errorMessage = 'API não encontrada';
        } else if (error.message.includes('500')) {
            errorMessage = 'Erro no servidor';
        }
        
        alocacoesContainer.innerHTML = `
            <div style="color: #ef4444; text-align: center; padding: 20px;">
                <div>❌</div>
                <div>${errorMessage}</div>
                <div style="font-size: 12px; margin-top: 5px; color: #6b7280;">${error.message}</div>
                <div style="margin-top: 10px;"><button class="btn btn-outline" onclick="renderAlocacoes()">Tentar Novamente</button></div>
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

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'Data não informada';
    
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateTimeString;
    }
}

function getAlocacaoStatusBadge(status) {
    switch (status) {
        case 'ativa':
            return '<span style="background: #dcfce7; color: #166534; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bbf7d0;">Ativa</span>';
        case 'encerrada':
            return '<span style="background: #fee2e2; color: #dc2626; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; border: 1px solid #fecaca;">Encerrada</span>';
        case 'pendente':
            return '<span style="background: #fef3c7; color: #d97706; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; border: 1px solid #fde68a;">Pendente</span>';
        default:
            return '<span style="background: #f3f4f6; color: #6b7280; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; border: 1px solid #e5e7eb;">' + status + '</span>';
    }
}

// ====== FUNÇÕES GLOBAIS (para chamadas do HTML) ======
window.renderAlocacoes = renderAlocacoes;

window.viewAlocacaoDetails = function(alocacaoId) {
    console.log('🔍 Visualizando detalhes da alocação:', alocacaoId);
    
    const alocacao = alocacoesData.find(a => a.id === alocacaoId);
    if (alocacao) {
        // Mostrar detalhes na coluna direita
        const detailContainer = document.getElementById('detail');
        if (detailContainer) {
            detailContainer.className = 'detail';
            detailContainer.innerHTML = `
                <div class="hdr">
                    <div class="title">📋 Detalhes da Alocação #${alocacao.id}</div>
                </div>
                
                <div style="padding: 20px;">
                    <!-- Seção do Motoboy -->
                    <div style="margin-bottom: 24px;">
                        <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 16px;">🛵</span>
                            Informações do Motoboy
                        </div>
                        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Nome</div>
                                <div style="font-weight: 600; color: #111827;">${alocacao.motoboy?.nome || 'Não informado'}</div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Telefone</div>
                                <div style="color: #111827;">📞 ${alocacao.motoboy?.telefone || 'Não informado'}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Placa da Moto</div>
                                <div style="color: #111827;">🏍️ ${alocacao.motoboy?.placa_moto || 'Não informado'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Seção da Vaga -->
                    <div style="margin-bottom: 24px;">
                        <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 16px;">🏢</span>
                            Informações da Vaga
                        </div>
                        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div>
                                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Estabelecimento</div>
                                    <div style="font-weight: 600; color: #111827;">${alocacao.estabelecimento_nome || 'Não informado'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">ID da Vaga</div>
                                    <div style="font-weight: 600; color: #111827;">#${alocacao.vaga_id || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Tipo de Vaga</div>
                                    <div style="color: #111827;">${alocacao.tipo_vaga || 'Não informado'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Status</div>
                                    <div>${getAlocacaoStatusBadge(alocacao.status)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Seção de Horários -->
                    <div style="margin-bottom: 24px;">
                        <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 16px;">🕐</span>
                            Horários e Datas
                        </div>
                        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div>
                                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Data da Vaga</div>
                                    <div style="font-weight: 600; color: #111827;">${formatDate(alocacao.data_da_vaga)}</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Horário</div>
                                    <div style="color: #111827;">${alocacao.hora_inicio} - ${alocacao.hora_fim}</div>
                                </div>
                                ${alocacao.data_hora_inicio ? `
                                <div style="grid-column: 1 / -1;">
                                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Início da Alocação</div>
                                    <div style="color: #111827;">${formatDateTime(alocacao.data_hora_inicio)}</div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Seção de Estatísticas -->
                    <div style="margin-bottom: 24px;">
                        <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 16px;">📊</span>
                            Estatísticas
                        </div>
                        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="background: #8b5cf6; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                                    ${alocacao.entregas_realizadas || 0}
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Entregas Realizadas</div>
                                    <div style="font-weight: 600; color: #111827;">${alocacao.entregas_realizadas || 0} entregas</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="footer-actions" style="padding: 16px 20px; border-top: 1px solid #e5e7eb; background: #f9fafb;">
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-outline" style="flex: 1; padding: 10px 16px; font-size: 14px;">
                            ✏️ Editar Alocação
                        </button>
                        <button class="btn btn-danger" style="flex: 1; padding: 10px 16px; font-size: 14px;">
                            ❌ Desalocar Motoboy
                        </button>
                    </div>
                </div>
            `;
        }
    }
};

window.desalocarMotoboy = function(alocacaoId) {
    console.log('❌ Desalocando motoboy da alocação:', alocacaoId);
    
    if (confirm(`Deseja desalocar o motoboy da alocação #${alocacaoId}?`)) {
        // Aqui você implementaria a chamada para a API de desalocação
        alert(`Motoboy desalocado da alocação #${alocacaoId} com sucesso!`);
        renderAlocacoes(); // Recarregar a lista
    }
};

// ====== INICIALIZAÇÃO ======
console.log('🚀 Carregando módulo de integração de alocações...');

// Função de inicialização que pode ser chamada externamente
function initializeAlocacoesIntegration() {
    console.log('✅ Inicializando integração de alocações...');
    // A integração será inicializada quando necessário
}

// Expor função de inicialização globalmente
window.alocacoesIntegration = {
    init: initializeAlocacoesIntegration,
    renderAlocacoes: renderAlocacoes,
    viewAlocacaoDetails: window.viewAlocacaoDetails,
    desalocarMotoboy: window.desalocarMotoboy
};

console.log('✅ Módulo de integração de alocações carregado');
