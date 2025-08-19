const { fetchVagas } = require('./api');

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const vagas = await fetchVagas();
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = `<pre>${JSON.stringify(vagas, null, 2)}</pre>`;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
});