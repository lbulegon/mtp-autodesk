// debug-app.js
// Script para debug da aplicação Electron

console.log('🔍 Iniciando debug da aplicação...');

// Verificar se estamos no ambiente Electron
if (typeof window !== 'undefined') {
    console.log('✅ Ambiente Electron detectado');
    
    // Verificar se o DOM carregou
    if (document.readyState === 'loading') {
        console.log('⏳ DOM ainda carregando...');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('✅ DOM carregado');
            debugApp();
        });
    } else {
        console.log('✅ DOM já carregado');
        debugApp();
    }
} else {
    console.log('❌ Não estamos no ambiente Electron');
}

function debugApp() {
    console.log('🔍 Debug da aplicação iniciado');
    
    // Verificar elementos básicos
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    
    console.log('Elementos encontrados:', {
        sidebar: !!sidebar,
        content: !!content
    });
    
    // Verificar botões do menu
    const btnOrders = document.getElementById('btn-orders');
    const btnAlocacoes = document.getElementById('btn-alocacoes');
    const btnAdminVagas = document.getElementById('btn-admin-vagas');
    
    console.log('Botões do menu:', {
        orders: !!btnOrders,
        alocacoes: !!btnAlocacoes,
        adminVagas: !!btnAdminVagas
    });
    
    // Verificar se o authManager está disponível
    if (window.authManager) {
        console.log('✅ AuthManager encontrado');
        console.log('Status de autenticação:', window.authManager.isAuthenticated);
    } else {
        console.log('❌ AuthManager não encontrado');
    }
    
    // Verificar se as funções de vagas estão disponíveis
    if (window.renderVagasInSidebar) {
        console.log('✅ Função renderVagasInSidebar encontrada');
    } else {
        console.log('❌ Função renderVagasInSidebar não encontrada');
    }
    
    if (window.recarregarVagasComFiltros) {
        console.log('✅ Função recarregarVagasComFiltros encontrada');
    } else {
        console.log('❌ Função recarregarVagasComFiltros não encontrada');
    }
    
    console.log('🔍 Debug concluído');
}

// Expor função globalmente para teste manual
window.debugApp = debugApp;
