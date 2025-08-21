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
    request: (args) => electron_1.ipcRenderer.invoke("api:request", args),
    getDesalocacaoConfig: () => electron_1.ipcRenderer.invoke("api:getDesalocacaoConfig"),
    getEstabelecimentoConfig: () => electron_1.ipcRenderer.invoke("api:getEstabelecimentoConfig")
};
electron_1.contextBridge.exposeInMainWorld("api", api);
