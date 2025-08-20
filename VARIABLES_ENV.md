# Variáveis de Ambiente - Configuração de Desalocação

## 📋 Configurações Disponíveis

### API Base
```bash
API_BASE_URL=https://motopro-development.up.railway.app/api/v1
```

### Desalocação de Motoboys
```bash
# Motivo padrão para desalocação
DESALOCACAO_MOTIVO=Desalocação solicitada pelo gestor

# Se deve bloquear o retorno do motoboy
DESALOCACAO_BLOQUEIA_RETORNO=false

# Endpoint da API para cancelar candidatura
DESALOCACAO_ENDPOINT=/motoboy-vaga/cancelar-candidatura/
```

## 🚀 Como Configurar

### 1. Criar arquivo `.env` na raiz do projeto:
```bash
# Configurações da API
API_BASE_URL=https://motopro-development.up.railway.app/api/v1

# Configurações de Desalocação
DESALOCACAO_MOTIVO=Desalocação solicitada pelo gestor
DESALOCACAO_BLOQUEIA_RETORNO=false
DESALOCACAO_ENDPOINT=/motoboy-vaga/cancelar-candidatura/
```

### 2. Valores Padrão (se não configurados):
- `DESALOCACAO_MOTIVO`: "Desalocação solicitada pelo gestor"
- `DESALOCACAO_BLOQUEIA_RETORNO`: false
- `DESALOCACAO_ENDPOINT`: "/motoboy-vaga/cancelar-candidatura/"

## 🔧 Implementação

As configurações são carregadas no `main.ts` e expostas via IPC para o renderer process.

### No Main Process (`electron/main.ts`):
```typescript
let DESALOCACAO_CONFIG = {
  motivo_padrao: process.env.DESALOCACAO_MOTIVO || "Desalocação solicitada pelo gestor",
  bloqueia_retorno: process.env.DESALOCACAO_BLOQUEIA_RETORNO === "true" || false,
  endpoint: process.env.DESALOCACAO_ENDPOINT || "/motoboy-vaga/cancelar-candidatura/"
};
```

### No Renderer Process (`alocacoesIntegration.js`):
```javascript
// Obter configurações das variáveis de ambiente
const desalocacaoConfig = await window.api.getDesalocacaoConfig();

const payload = {
  motoboy: alocacao.motoboy?.id,
  vaga: alocacao.vaga_id,
  motivo: desalocacaoConfig.motivo_padrao,
  bloqueia_retorno: desalocacaoConfig.bloqueia_retorno
};
```

## 📝 Exemplo de Uso

Quando um gestor clica em "Desalocar", o sistema:

1. **Carrega** as configurações das variáveis de ambiente
2. **Monta** o payload com os valores configurados
3. **Envia** a requisição para o endpoint configurado
4. **Processa** a resposta da API

## 🔄 Recompilação

Após alterar as variáveis de ambiente, recompile a aplicação:
```bash
npm run build
npm start
```
