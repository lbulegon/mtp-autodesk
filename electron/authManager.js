// authManager.js
// Sistema de gerenciamento de autenticação global

class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.company = null;
        this.tokens = {
            access: null,
            refresh: null
        };
        this.apiConfig = {
            baseUrl: 'https://motopro-development.up.railway.app/api/v1',
            endpoints: {
                login: '/token/',
                refresh: '/token/refresh/',
                vagas: '/vagas/',
                entregadores: '/entregadores/',
                pedidos: '/pedidos/'
            }
        };
        
        // Carregar dados salvos ao inicializar
        this.loadFromStorage();
    }
    
    // ====== LOGIN E AUTENTICAÇÃO ======
    async login(email, password) {
        try {
            console.log('🔐 Iniciando login...');
            
            const response = await fetch(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.login}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            console.log('📊 Status do login:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                
                // Salvar tokens
                this.tokens.access = data.access;
                this.tokens.refresh = data.refresh;
                
                // Salvar email do usuário
                localStorage.setItem('userEmail', email);
                
                // Buscar dados do usuário e empresa
                await this.fetchUserData();
                
                // Salvar no localStorage
                this.saveToStorage();
                
                this.isAuthenticated = true;
                console.log('✅ Login realizado com sucesso');
                console.log('🏢 Empresa:', this.company?.nome);
                console.log('👤 Usuário:', this.user?.nome);
                
                return {
                    success: true,
                    user: this.user,
                    company: this.company
                };
            } else {
                const errorText = await response.text();
                console.error('❌ Erro no login:', response.status, errorText);
                throw new Error(`Login falhou: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Erro durante login:', error);
            throw error;
        }
    }
    
    // ====== BUSCAR DADOS DO USUÁRIO E EMPRESA ======
    async fetchUserData() {
        try {
            console.log('👤 Configurando dados do usuário...');
            
            // Para simplificar, vamos usar dados básicos baseados no email
            // Em uma implementação real, você faria uma chamada para /user/profile/
            const email = localStorage.getItem('userEmail') || 'lbulegon@gmail.com';
            
            this.user = {
                id: '1',
                nome: 'Usuário MotoPro',
                email: email,
                cargo: 'Administrador',
                empresa_id: '1' // ID fixo da empresa para teste
            };
            
            // Configurar dados básicos da empresa
            this.company = {
                id: '1',
                nome: 'MotoPro Central',
                cnpj: '12.345.678/0001-90',
                endereco: 'São Paulo, SP',
                telefone: '(11) 99999-9999',
                email: 'contato@motopro.com',
                configuracao: {}
            };
            
            console.log('✅ Dados do usuário e empresa configurados');
            console.log('🏢 Empresa ID:', this.company.id);
            console.log('👤 Usuário:', this.user.nome);
            
        } catch (error) {
            console.error('❌ Erro ao configurar dados:', error);
            // Usar dados básicos em caso de erro
            this.user = {
                id: '1',
                nome: 'Usuário MotoPro',
                email: 'lbulegon@gmail.com',
                cargo: 'Administrador',
                empresa_id: '1'
            };
            
            this.company = {
                id: '1',
                nome: 'MotoPro Central',
                cnpj: '12.345.678/0001-90',
                endereco: 'São Paulo, SP',
                telefone: '(11) 99999-9999',
                email: 'contato@motopro.com',
                configuracao: {}
            };
        }
    }
    

    
    // ====== REFRESH TOKEN ======
    async refreshToken() {
        try {
            console.log('🔄 Renovando token...');
            
            const response = await fetch(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.refresh}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh: this.tokens.refresh
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.tokens.access = data.access;
                this.saveToStorage();
                console.log('✅ Token renovado com sucesso');
                return true;
            } else {
                console.error('❌ Falha ao renovar token');
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao renovar token:', error);
            this.logout();
            return false;
        }
    }
    
    // ====== LOGOUT ======
    logout() {
        console.log('🚪 Fazendo logout...');
        this.isAuthenticated = false;
        this.user = null;
        this.company = null;
        this.tokens.access = null;
        this.tokens.refresh = null;
        
        // Limpar localStorage
        localStorage.removeItem('authManager');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        console.log('✅ Logout realizado');
    }
    
    // ====== REQUISIÇÕES AUTENTICADAS ======
    async authenticatedRequest(endpoint, options = {}) {
        if (!this.isAuthenticated) {
            throw new Error('Usuário não autenticado');
        }
        
        const url = `${this.apiConfig.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.tokens.access}`,
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            if (response.status === 401) {
                // Token expirado, tentar renovar
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // Tentar novamente com o novo token
                    headers.Authorization = `Bearer ${this.tokens.access}`;
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers
                    });
                    return retryResponse;
                } else {
                    throw new Error('Token expirado e não foi possível renovar');
                }
            }
            
            return response;
        } catch (error) {
            console.error('❌ Erro na requisição autenticada:', error);
            throw error;
        }
    }
    
    // ====== PERSISTÊNCIA ======
    saveToStorage() {
        const data = {
            isAuthenticated: this.isAuthenticated,
            user: this.user,
            company: this.company,
            tokens: this.tokens
        };
        
        localStorage.setItem('authManager', JSON.stringify(data));
        
        // Também salvar tokens separadamente para compatibilidade
        if (this.tokens.access) {
            localStorage.setItem('accessToken', this.tokens.access);
        }
        if (this.tokens.refresh) {
            localStorage.setItem('refreshToken', this.tokens.refresh);
        }
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('authManager');
            if (saved) {
                const data = JSON.parse(saved);
                this.isAuthenticated = data.isAuthenticated || false;
                this.user = data.user || null;
                this.company = data.company || null;
                this.tokens = data.tokens || { access: null, refresh: null };
                
                console.log('📦 Dados de autenticação carregados do storage');
                if (this.isAuthenticated) {
                    console.log('🏢 Empresa:', this.company?.nome);
                    console.log('👤 Usuário:', this.user?.nome);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados do storage:', error);
        }
    }
    
    // ====== GETTERS ======
    getAuthStatus() {
        return {
            isAuthenticated: this.isAuthenticated,
            user: this.user,
            company: this.company
        };
    }
    
    getTokens() {
        return this.tokens;
    }
    
    getCompanyId() {
        return this.company?.id;
    }
    
    getCompanyName() {
        return this.company?.nome;
    }
    
    getUserId() {
        return this.user?.id;
    }
    
    getUserName() {
        return this.user?.nome;
    }
    
    getApiConfig() {
        return this.apiConfig;
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Criar instância global
    const authManager = new AuthManager();
    
    // Exportar para uso global
    window.authManager = authManager;
    
    console.log('🔧 AuthManager inicializado');
});

// Também inicializar imediatamente se o DOM já estiver pronto
if (document.readyState === 'loading') {
    // DOM ainda carregando, aguardar o evento acima
} else {
    // DOM já carregado, inicializar imediatamente
    const authManager = new AuthManager();
    window.authManager = authManager;
    console.log('🔧 AuthManager inicializado (DOM já pronto)');
}
