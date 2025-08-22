// vagasIntegration-simple.js
// Versão simplificada - apenas retorno da API

// Estado das vagas
let vagasData = [];

// ====== INTEGRAÇÃO SIMPLES COM API ======
async function fetchVagasFromAPI() {
    try {
        console.log('🔄 Buscando vagas da API...');
        
        // Verificar se está autenticado
        if (!window.authManager || !window.authManager.isAuthenticated) {
            throw new Error('Usuário não autenticado');
        }
        
        // Adicionar timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos
        
        try {
            // Chamada simples da API sem filtros
            const response = await window.authManager.authenticatedRequest('/desktop/vagas/', {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Dados da API recebidos:', data);
                return data;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Timeout: API não respondeu em 5 segundos');
            }
            throw error;
        }
    } catch (error) {
        console.error('❌ Erro ao buscar vagas:', error);
        throw error;
    }
}

// ====== RENDERIZAR VAGAS SIMPLES ======
async function renderVagasInSidebar() {
    console.log('🚀 Renderizando vagas...');
    
    const vagasContainer = document.getElementById('list-vagas');
    if (!vagasContainer) {
        console.error('❌ Container de vagas não encontrado');
        return;
    }
    
    try {
        // Buscar dados da API
        const vagas = await fetchVagasFromAPI();
        vagasData = vagas;
        
        // Verificar se os dados são um array
        if (!Array.isArray(vagas)) {
            console.error('❌ Dados recebidos não são um array:', vagas);
            vagasContainer.innerHTML = `
                <div style="color: #ef4444; text-align: center; padding: 20px;">
                    <div>❌</div>
                    <div>Formato de dados inválido</div>
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
        
        // Renderizar lista simples
        vagasContainer.innerHTML = `
            <div style="padding: 20px;">
                <h3>Vagas Encontradas: ${vagas.length}</h3>
                <div style="margin-top: 20px;">
                    ${vagas.map(vaga => `
                        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                            <strong>ID:</strong> ${vaga.id}<br>
                            <strong>Estabelecimento:</strong> ${vaga.estabelecimento_nome}<br>
                            <strong>Data:</strong> ${vaga.data_da_vaga}<br>
                            <strong>Status:</strong> ${vaga.status}<br>
                            <strong>Horário:</strong> ${vaga.hora_inicio_padrao} - ${vaga.hora_fim_padrao}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        console.log('✅ Vagas renderizadas:', vagas.length);
        
    } catch (error) {
        console.error('❌ Erro ao renderizar vagas:', error);
        
        vagasContainer.innerHTML = `
            <div style="color: #ef4444; text-align: center; padding: 20px;">
                <div>❌</div>
                <div>Erro ao carregar vagas</div>
                <div style="font-size: 12px; margin-top: 5px;">${error.message}</div>
            </div>
        `;
    }
}

// ====== FUNÇÕES GLOBAIS ======
window.renderVagasInSidebar = renderVagasInSidebar;

// ====== INICIALIZAÇÃO ======
console.log('✅ Módulo de vagas simplificado carregado');
