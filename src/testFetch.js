const { loginAndGetToken } = require('./login');
const { fetchVagas } = require('./api');
const { refreshToken } = require('./refresh'); // Importa a função de renovação de token

let accessToken = null;
let currentRefreshToken = null; // Renomeia a variável local

async function main() {
    try {
        // Step 1: Fazer login e obter os tokens
        const email = 'lbulegon@gmail.com'; // Substitua pelo seu usuário
        const password = 'Gabi#0201'; // Substitua pela sua senha
        const tokens = await loginAndGetToken(email, password);
        accessToken = tokens.access;
        currentRefreshToken = tokens.refresh;

        console.log('Tokens obtidos com sucesso.');

        // Step 2: Buscar vagas usando o token de acesso
        try {
            const vagas = await fetchVagas(accessToken);
            console.log('Vagas encontradas:', vagas);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('Token expirado. Tentando renovar...');
                
                // Step 3: Renovar o token de acesso
                accessToken = await refreshToken(currentRefreshToken);
                console.log('Novo token de acesso obtido.');

                // Step 4: Tentar buscar vagas novamente com o novo token
                const vagas = await fetchVagas(accessToken);
                console.log('Vagas encontradas após renovação:', vagas);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Erro ao executar o script:', error.message);
    }
}

main();