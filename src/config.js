// Configurações da API
const config = {
    // URLs de autenticação
    auth: {
        loginUrl: 'https://motopro-development.up.railway.app/api/v1/token/',
        refreshUrl: 'https://motopro-development.up.railway.app/api/v1/token/refresh/'
    },
    
    // URLs da API de dados
    api: {
        baseUrl: 'https://motopro-development.up.railway.app/api/v1/',
        vagasUrl: 'https://motopro-development.up.railway.app/api/v1/vagas/'
    },
    
    // Configurações de timeout
    timeout: 10000, // 10 segundos
    
    // Configurações de retry
    retry: {
        maxAttempts: 3,
        delay: 1000 // 1 segundo
    }
};

module.exports = config;
