const ApiService = require('./apiService');

async function exemploUso() {
    // Criar instância do serviço
    const apiService = new ApiService();

    try {
        // 1. Fazer login
        console.log('=== Fazendo login ===');
        await apiService.login('lbulegon@gmail.com', 'Gabi#0201');
        
        // 2. Verificar se está autenticado
        console.log('Usuário autenticado:', apiService.isLoggedIn());
        
        // 3. Buscar vagas
        console.log('\n=== Buscando vagas ===');
        const vagas = await apiService.getVagas();
        console.log('Vagas encontradas:', vagas);
        
        // 4. Fazer logout
        console.log('\n=== Fazendo logout ===');
        apiService.logout();
        console.log('Usuário autenticado após logout:', apiService.isLoggedIn());
        
    } catch (error) {
        console.error('Erro no exemplo:', error.message);
    }
}

// Executar o exemplo
exemploUso();

