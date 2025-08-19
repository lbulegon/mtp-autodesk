const { loginAndGetToken } = require('./login');
const { fetchVagas } = require('./api');
const { refreshToken } = require('./refresh');

class ApiService {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.isAuthenticated = false;
    }

    /**
     * Faz login e armazena os tokens
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<Object>} - Objeto com tokens de acesso e refresh
     */
    async login(email, password) {
        try {
            const tokens = await loginAndGetToken(email, password);
            this.accessToken = tokens.access;
            this.refreshToken = tokens.refresh;
            this.isAuthenticated = true;
            
            console.log('Login realizado com sucesso');
            return tokens;
        } catch (error) {
            console.error('Erro no login:', error.message);
            throw error;
        }
    }

    /**
     * Renova o token de acesso usando o refresh token
     * @returns {Promise<string>} - Novo token de acesso
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('Refresh token não disponível');
        }

        try {
            const newAccessToken = await refreshToken(this.refreshToken);
            this.accessToken = newAccessToken;
            console.log('Token renovado com sucesso');
            return newAccessToken;
        } catch (error) {
            console.error('Erro ao renovar token:', error.message);
            this.isAuthenticated = false;
            throw error;
        }
    }

    /**
     * Busca vagas com tratamento automático de renovação de token
     * @returns {Promise<Array>} - Lista de vagas
     */
    async getVagas() {
        if (!this.isAuthenticated) {
            throw new Error('Usuário não autenticado. Faça login primeiro.');
        }

        try {
            const vagas = await fetchVagas(this.accessToken);
            return vagas;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('Token expirado. Renovando...');
                await this.refreshAccessToken();
                
                // Tentar novamente com o novo token
                const vagas = await fetchVagas(this.accessToken);
                return vagas;
            } else {
                throw error;
            }
        }
    }

    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.isAuthenticated && this.accessToken !== null;
    }

    /**
     * Faz logout limpando os tokens
     */
    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        this.isAuthenticated = false;
        console.log('Logout realizado');
    }
}

module.exports = ApiService;

