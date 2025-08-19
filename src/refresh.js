const axios = require('axios');
const config = require('./config');

async function refreshToken(refreshToken) {
    try {
        const response = await axios.post(config.auth.refreshUrl, {
            refresh: refreshToken
        }, {
            timeout: config.timeout
        });
        return response.data.access; // Retorna o novo token de acesso
    } catch (error) {
        console.error('Erro ao renovar o token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = { refreshToken };