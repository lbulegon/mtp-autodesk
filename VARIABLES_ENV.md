# Variáveis de Ambiente - MotoPro Desktop

## Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# URL base da API
API_BASE_URL=https://motopro-development.up.railway.app/api/v1

# Configurações de desalocação
DESALOCACAO_MOTIVO=Não poderá comparecer
DESALOCACAO_BLOQUEIA_RETORNO=false
DESALOCACAO_ENDPOINT=/motoboy-vaga/cancelar-candidatura/

# Configuração do estabelecimento para gerar vagas
ESTABELECIMENTO_ID=11
```

## Variáveis Disponíveis

### `API_BASE_URL`
- **Descrição**: URL base da API do MotoPro
- **Padrão**: `http://127.0.0.1:8000/api/v1`
- **Exemplo**: `https://motopro-development.up.railway.app/api/v1`

### `DESALOCACAO_MOTIVO`
- **Descrição**: Motivo padrão para desalocação de motoboys
- **Padrão**: `Desalocação solicitada pelo gestor`
- **Exemplo**: `Não poderá comparecer`

### `DESALOCACAO_BLOQUEIA_RETORNO`
- **Descrição**: Se deve bloquear o retorno do motoboy após desalocação
- **Padrão**: `false`
- **Valores**: `true` ou `false`

### `DESALOCACAO_ENDPOINT`
- **Descrição**: Endpoint para cancelar candidatura de motoboy
- **Padrão**: `/motoboy-vaga/cancelar-candidatura/`
- **Exemplo**: `/motoboy-vaga/cancelar-candidatura/`

### `ESTABELECIMENTO_ID`
- **Descrição**: ID do estabelecimento para gerar vagas fixas
- **Padrão**: `11`
- **Exemplo**: `11`

## Payload de Desalocação

O payload enviado para o endpoint de desalocação é:

```json
{
  "motoboy": 18,
  "vaga": 630,
  "motivo": "Não poderá comparecer",
  "bloqueia_retorno": false
}
```

## Payload de Geração de Vagas Fixas

O payload enviado para o endpoint de geração de vagas fixas é:

```json
{
  "estabelecimento_id": 11,
  "data_inicio": "2025-08-22",
  "dias": 1
}
```
