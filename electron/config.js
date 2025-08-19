// config.js
// Configurações da aplicação

const CONFIG = {
    // URLs da API
    API: {
        baseUrl: localStorage.getItem("API_BASE_URL") || "https://motopro-development.up.railway.app/api/v1",
        authUrl: "https://motopro-development.up.railway.app/api/v1/token/",
        refreshUrl: "https://motopro-development.up.railway.app/api/v1/token/refresh/",
        vagasUrl: "https://motopro-development.up.railway.app/api/v1/vagas/"
    },
    
    // Configurações de autenticação
    AUTH: {
        // Credenciais padrão (pode ser alterado via interface)
        defaultEmail: "lbulegon@gmail.com",
        defaultPassword: "Gabi#0201",
        
        // Configurações de token
        tokenRefreshInterval: 5 * 60 * 1000, // 5 minutos
        autoLogin: true
    },
    
    // Configurações da interface
    UI: {
        refreshInterval: 30000, // 30 segundos
        showNotifications: true,
        theme: "light" // light | dark
    },
    
    // Configurações de desenvolvimento
    DEV: {
        debug: true,
        mockData: false, // usar dados de exemplo quando API não estiver disponível
        logLevel: "info" // debug | info | warn | error
    }
};

// Funções de utilidade
const ConfigUtils = {
    // Salvar configuração
    set: (key, value) => {
        const keys = key.split('.');
        let current = CONFIG;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        
        // Salvar no localStorage se for uma configuração persistente
        if (key.startsWith('API.') || key.startsWith('AUTH.')) {
            localStorage.setItem(`config_${key}`, JSON.stringify(value));
        }
    },
    
    // Obter configuração
    get: (key) => {
        const keys = key.split('.');
        let current = CONFIG;
        
        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return undefined;
            }
        }
        
        return current;
    },
    
    // Carregar configurações salvas
    load: () => {
        // Carregar configurações do localStorage
        const savedConfigs = [
            'API.baseUrl',
            'AUTH.defaultEmail',
            'AUTH.autoLogin',
            'UI.theme'
        ];
        
        savedConfigs.forEach(key => {
            const saved = localStorage.getItem(`config_${key}`);
            if (saved) {
                try {
                    const value = JSON.parse(saved);
                    ConfigUtils.set(key, value);
                } catch (e) {
                    console.warn(`Erro ao carregar configuração ${key}:`, e);
                }
            }
        });
    },
    
    // Salvar tokens de autenticação
    saveTokens: (accessToken, refreshToken) => {
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    },
    
    // Obter tokens salvos
    getTokens: () => ({
        access: localStorage.getItem('accessToken'),
        refresh: localStorage.getItem('refreshToken')
    }),
    
    // Limpar tokens
    clearTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};

// Carregar configurações ao inicializar
ConfigUtils.load();

// Exportar para uso global
window.CONFIG = CONFIG;
window.ConfigUtils = ConfigUtils;

// Log de inicialização
if (CONFIG.DEV.debug) {
    console.log('🔧 Configurações carregadas:', CONFIG);
}

  
