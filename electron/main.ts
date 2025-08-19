// electron/main.ts

// main.ts
import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";

let API_BASE_URL: string =
  process.env.API_BASE_URL || "http://127.0.0.1:8000/api/v1";

let win: BrowserWindow | null = null;

function resolveIndexHtml() {
  // Ajuste se seu index.html estiver noutro lugar
  // Aqui assumo que o arquivo está em <raiz do projeto>/electron/index.html
  const p = path.resolve(process.cwd(), "electron", "index.html");
  if (!fs.existsSync(p)) {
    throw new Error(`index.html não encontrado em: ${p}`);
  }
  return p;
}

async function createWindow() {
  win = new BrowserWindow({
    width: 1380,
    height: 880,
    show: false, // Não mostrar a janela até estar pronta
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"), // gerado a partir do preload.ts
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
ipcMain.handle("api:setBaseUrl", (_evt, url: string) => {
  if (typeof url === "string" && url.trim()) {
    API_BASE_URL = url.trim().replace(/\/+$/, ""); // remove / no final
  }
  return true;
});

type ApiRequestArgs = {
  method?: string;
  path: string; // ex: "/alocacoes/ativas/agora/?estabelecimento_id=10"
  headers?: Record<string, string>;
  body?: any; // objeto que vira JSON
};

ipcMain.handle("api:request", async (_evt, args: ApiRequestArgs) => {
  const method = (args.method || "GET").toUpperCase();
  const p = args.path.startsWith("/") ? args.path : `/${args.path}`;
  const url = API_BASE_URL + p;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(args.headers || {}),
  };

  const init: RequestInit = { method, headers };
  if (args.body != null) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    init.body =
      typeof args.body === "string" ? args.body : JSON.stringify(args.body);
  }

  const res = await fetch(url, init);
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
});

// ================================================================

app.whenReady().then(async () => {
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
