const axios = require('axios');
const config = require('./config');

async function loginAndGetToken(email, password) {
    try {
        const response = await axios.post(config.auth.loginUrl, {
            email: email,
            password: password
        }, {
            timeout: config.timeout
        });

        // Verifica se a resposta contém os tokens
        if (!response.data || !response.data.access || !response.data.refresh) {
            throw new Error("Tokens de autenticação não encontrados na resposta.");
        }

        return {
            access: response.data.access,
            refresh: response.data.refresh
        };
    } catch (error) {
        console.error('Erro ao fazer login:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = { loginAndGetToken };