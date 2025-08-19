const axios = require('axios');
const config = require('./config');

async function fetchVagas(accessToken) {
    try {
        const response = await axios.get(config.api.vagasUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            timeout: config.timeout
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        throw error;
    }
}

module.exports = { fetchVagas };