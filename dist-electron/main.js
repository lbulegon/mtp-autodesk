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
    // Verificar se estamos em desenvolvimento ou produção
    const isDev = process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged;
    console.log(`Modo: ${isDev ? 'Desenvolvimento' : 'Produção'}`);
    console.log(`isPackaged: ${electron_1.app.isPackaged}`);
    console.log(`process.cwd(): ${process.cwd()}`);
    console.log(`__dirname: ${__dirname}`);
    console.log(`process.resourcesPath: ${process.resourcesPath}`);
    let p;
    if (isDev) {
        // Desenvolvimento: procurar em electron/index.html
        p = node_path_1.default.resolve(process.cwd(), "electron", "index.html");
    }
    else {
        // Produção: procurar em resources/app/electron/index.html
        p = node_path_1.default.resolve(process.resourcesPath, "app", "electron", "index.html");
    }
    console.log(`Tentando carregar: ${p}`);
    if (!node_fs_1.default.existsSync(p)) {
        console.error(`index.html não encontrado em: ${p}`);
        // Fallback: tentar outros caminhos
        const fallbackPaths = [
            node_path_1.default.resolve(__dirname, "..", "electron", "index.html"),
            node_path_1.default.resolve(__dirname, "..", "..", "electron", "index.html"),
            node_path_1.default.resolve(process.cwd(), "electron", "index.html"),
            node_path_1.default.resolve(__dirname, "..", "..", "..", "electron", "index.html"),
            node_path_1.default.resolve(__dirname, "..", "..", "..", "..", "electron", "index.html")
        ];
        for (const fallbackPath of fallbackPaths) {
            console.log(`Tentando fallback: ${fallbackPath}`);
            if (node_fs_1.default.existsSync(fallbackPath)) {
                console.log(`Usando fallback: ${fallbackPath}`);
                return fallbackPath;
            }
        }
        throw new Error(`index.html não encontrado. Tentou: ${p}`);
    }
    console.log(`Carregando index.html de: ${p}`);
    return p;
}
async function createWindow() {
    try {
        console.log("Criando janela...");
        win = new electron_1.BrowserWindow({
            width: 1380,
            height: 880,
            show: false, // Não mostrar a janela até estar pronta
            webPreferences: {
                contextIsolation: true,
                preload: node_path_1.default.join(__dirname, "preload.js"), // gerado a partir do preload.ts
                nodeIntegration: false,
            },
        });
        console.log("Janela criada, carregando arquivo...");
        await win.loadFile(resolveIndexHtml());
        console.log("Arquivo carregado, maximizando...");
        // Maximizar a janela após carregar o conteúdo
        win.maximize();
        console.log("Maximizado, mostrando janela...");
        // Mostrar a janela após maximizar
        win.show();
        console.log("Janela mostrada com sucesso!");
        win.on("closed", () => (win = null));
        // Adicionar handler de erro
        win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            console.error(`Falha ao carregar: ${errorCode} - ${errorDescription}`);
        });
    }
    catch (error) {
        console.error("Erro ao criar janela:", error);
        throw error;
    }
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
