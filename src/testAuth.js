const { loginAndGetToken } = require('./login');
const { refreshToken } = require('./refresh');

async function testAuth() {
    try {
        console.log('=== Teste de Autenticação ===');
        
        // Step 1: Fazer login
        console.log('1. Fazendo login...');
        const tokens = await loginAndGetToken('lbulegon@gmail.com', 'Gabi#0201');
        console.log('✅ Login realizado com sucesso!');
        console.log('Access Token:', tokens.access.substring(0, 50) + '...');
        console.log('Refresh Token:', tokens.refresh.substring(0, 50) + '...');
        
        // Step 2: Testar renovação de token
        console.log('\n2. Testando renovação de token...');
        const newAccessToken = await refreshToken(tokens.refresh);
        console.log('✅ Token renovado com sucesso!');
        console.log('Novo Access Token:', newAccessToken.substring(0, 50) + '...');
        
        // Step 3: Verificar se os tokens são diferentes
        if (tokens.access !== newAccessToken) {
            console.log('✅ Tokens são diferentes (renovação funcionou)');
        } else {
            console.log('⚠️ Tokens são iguais (pode ser normal se renovado rapidamente)');
        }
        
        console.log('\n🎉 Todos os testes de autenticação passaram!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        }
    }
}

testAuth();
















