"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// preload.ts
const electron_1 = require("electron");
let tokens = { access: null, refresh: null };
async function request(method, path, body) {
    const headers = {};
    if (tokens.access)
        headers.Authorization = `Bearer ${tokens.access}`;
    // 1ª tentativa
    let res = await electron_1.ipcRenderer.invoke("api:request", { method, path, headers, body });
    // Em 401, tenta refresh
    if (res.status === 401 && tokens.refresh) {
        const rf = await electron_1.ipcRenderer.invoke("api:request", {
            method: "POST",
            path: "/token/refresh/",
            body: { refresh: tokens.refresh },
        });
        if (rf.status === 200 && rf.data?.access) {
            tokens.access = rf.data.access;
            const headers2 = {
                Authorization: `Bearer ${tokens.access}`,
            };
            res = await electron_1.ipcRenderer.invoke("api:request", {
                method,
                path,
                headers: headers2,
                body,
            });
        }
    }
    return res;
}
const api = {
    setBaseUrl: (url) => electron_1.ipcRenderer.invoke("api:setBaseUrl", url),
    setTokens: (access, refresh) => {
        tokens.access = access ?? null;
        tokens.refresh = refresh ?? null;
    },
    // Obter configurações de desalocação das variáveis de ambiente
    getDesalocacaoConfig: () => electron_1.ipcRenderer.invoke("api:getDesalocacaoConfig"),
    // Chamadas específicas que você precisa no renderer:
    async getAlocacoesAgora(estabelecimentoId) {
        const qs = estabelecimentoId
            ? `?estabelecimento_id=${encodeURIComponent(estabelecimentoId)}`
            : "";
        const res = await request("GET", `/alocacoes/ativas/agora/${qs}`);
        if (res.status !== 200)
            throw new Error(`HTTP ${res.status}`);
        return res.data; // {agora, estabelecimentos: [...]}
    },
    // request genérica (se quiser reusar)
    async request(method, path, body) {
        return request(method, path, body);
    },
};
electron_1.contextBridge.exposeInMainWorld("api", api);
