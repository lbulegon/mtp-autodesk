// vagasIntegration-ultra-simple.js
// Versão ultra-simples - apenas dados brutos da API

// ====== FUNÇÃO ULTRA SIMPLES ======
async function renderVagasInSidebar() {
    console.log('🚀 Iniciando carregamento ultra-simples...');
    
    const vagasContainer = document.getElementById('list-vagas');
    if (!vagasContainer) {
        console.error('❌ Container não encontrado');
        return;
    }
    
    // Mostrar carregamento
    vagasContainer.innerHTML = `
        <div style="padding: 20px;">
            <h3>🔄 Carregando dados da API...</h3>
        </div>
    `;
    
    try {
        // Verificar autenticação
        if (!window.authManager || !window.authManager.isAuthenticated) {
            vagasContainer.innerHTML = `
                <div style="padding: 20px; color: #ef4444;">
                    <h3>❌ Não autenticado</h3>
                    <p>Faça login primeiro</p>
                </div>
            `;
            return;
        }
        
        console.log('🔍 Fazendo requisição para API...');
        
        // Requisição direta com timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos
        
        try {
            const response = await window.authManager.authenticatedRequest('/desktop/vagas/', {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log('📡 Resposta recebida:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Dados recebidos:', data);
                
                // Mostrar dados brutos
                vagasContainer.innerHTML = `
                    <div style="padding: 20px;">
                        <h3>✅ Dados da API Recebidos</h3>
                        <p><strong>Status:</strong> ${response.status}</p>
                        <p><strong>Tipo:</strong> ${typeof data}</p>
                        <p><strong>É Array:</strong> ${Array.isArray(data)}</p>
                        <p><strong>Quantidade:</strong> ${Array.isArray(data) ? data.length : 'N/A'}</p>
                        
                        <div style="margin-top: 20px; background: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; max-height: 400px; overflow-y: auto;">
                            <strong>Dados Brutos:</strong><br>
                            <pre>${JSON.stringify(data, null, 2)}</pre>
                        </div>
                    </div>
                `;
                
            } else {
                const errorText = await response.text();
                vagasContainer.innerHTML = `
                    <div style="padding: 20px; color: #ef4444;">
                        <h3>❌ Erro na API</h3>
                        <p><strong>Status:</strong> ${response.status}</p>
                        <p><strong>Erro:</strong> ${errorText}</p>
                    </div>
                `;
            }
            
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('❌ Erro na requisição:', error);
            
            if (error.name === 'AbortError') {
                vagasContainer.innerHTML = `
                    <div style="padding: 20px; color: #f59e0b;">
                        <h3>⏰ Timeout</h3>
                        <p>API não respondeu em 3 segundos</p>
                    </div>
                `;
            } else {
                vagasContainer.innerHTML = `
                    <div style="padding: 20px; color: #ef4444;">
                        <h3>❌ Erro na Requisição</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
        vagasContainer.innerHTML = `
            <div style="padding: 20px; color: #ef4444;">
                <h3>❌ Erro Geral</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// ====== EXPORTAÇÃO ======
window.renderVagasInSidebar = renderVagasInSidebar;

console.log('✅ Módulo ultra-simples carregado');
