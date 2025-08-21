"use strict";
// electron/main.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// main.ts
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
let API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000/api/v1";
// Configurações de desalocação das variáveis de ambiente
let DESALOCACAO_CONFIG = {
    motivo_padrao: process.env.DESALOCACAO_MOTIVO || "Desalocação solicitada pelo gestor",
    bloqueia_retorno: process.env.DESALOCACAO_BLOQUEIA_RETORNO === "true" || false,
    endpoint: process.env.DESALOCACAO_ENDPOINT || "/motoboy-vaga/cancelar-candidatura/"
};
// Configuração do estabelecimento para gerar vagas
let ESTABELECIMENTO_CONFIG = {
    estabelecimento_id: process.env.ESTABELECIMENTO_ID || "11"
};
let win = null;
function resolveIndexHtml() {
    // Ajuste se seu index.html estiver noutro lugar
    // Aqui assumo que o arquivo está em <raiz do projeto>/electron/index.html
    const p = node_path_1.default.resolve(process.cwd(), "electron", "index.html");
    if (!node_fs_1.default.existsSync(p)) {
        throw new Error(`index.html não encontrado em: ${p}`);
    }
    return p;
}
async function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 1380,
        height: 880,
        show: false, // Não mostrar a janela até estar pronta
        webPreferences: {
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, "preload.js"), // gerado a partir do preload.ts
        },
    });
    await win.loadFile(resolveIndexHtml());
    // Maximizar a janela após carregar o conteúdo
    win.maximize();
    // Mostrar a janela após maximizar
    win.show();
    win.on("closed", () => (win = null));
}
// =============== IPC: Configurações e Proxy de API ===============
electron_1.ipcMain.handle("api:setBaseUrl", (_evt, url) => {
    if (typeof url === "string" && url.trim()) {
        API_BASE_URL = url.trim().replace(/\/+$/, ""); // remove / no final
    }
    return true;
});
// Handler para obter configurações de desalocação
electron_1.ipcMain.handle("api:getDesalocacaoConfig", () => {
    return DESALOCACAO_CONFIG;
});
// Handler para obter configuração do estabelecimento
electron_1.ipcMain.handle("api:getEstabelecimentoConfig", () => {
    return ESTABELECIMENTO_CONFIG;
});
electron_1.ipcMain.handle("api:request", async (_evt, args) => {
    const method = (args.method || "GET").toUpperCase();
    const p = args.path.startsWith("/") ? args.path : `/${args.path}`;
    const url = API_BASE_URL + p;
    const headers = {
        Accept: "application/json",
        ...(args.headers || {}),
    };
    const init = { method, headers };
    if (args.body != null) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
        init.body =
            typeof args.body === "string" ? args.body : JSON.stringify(args.body);
    }
    const res = await fetch(url, init);
    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    }
    catch {
        data = text;
    }
    return { status: res.status, data };
});
// ================================================================
electron_1.app.whenReady().then(async () => {
    await createWindow();
    electron_1.app.on("activate", async () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            await createWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
