// preload.ts
import { contextBridge, ipcRenderer } from "electron";

type Tokens = { access: string | null; refresh: string | null };
let tokens: Tokens = { access: null, refresh: null };

async function request(
  method: string,
  path: string,
  body?: any
): Promise<{ status: number; data: any }> {
  const headers: Record<string, string> = {};
  if (tokens.access) headers.Authorization = `Bearer ${tokens.access}`;

  // 1ª tentativa
  let res = await ipcRenderer.invoke("api:request", { method, path, headers, body });

  // Em 401, tenta refresh
  if (res.status === 401 && tokens.refresh) {
    const rf = await ipcRenderer.invoke("api:request", {
      method: "POST",
      path: "/token/refresh/",
      body: { refresh: tokens.refresh },
    });

    if (rf.status === 200 && rf.data?.access) {
      tokens.access = rf.data.access;
      const headers2: Record<string, string> = {
        Authorization: `Bearer ${tokens.access}`,
      };
      res = await ipcRenderer.invoke("api:request", {
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
  setBaseUrl: (url: string) => ipcRenderer.invoke("api:setBaseUrl", url),

  setTokens: (access?: string, refresh?: string) => {
    tokens.access = access ?? null;
    tokens.refresh = refresh ?? null;
  },

  // Obter configurações de desalocação das variáveis de ambiente
  getDesalocacaoConfig: () => ipcRenderer.invoke("api:getDesalocacaoConfig"),

  // Chamadas específicas que você precisa no renderer:
  async getAlocacoesAgora(estabelecimentoId?: number) {
    const qs = estabelecimentoId
      ? `?estabelecimento_id=${encodeURIComponent(estabelecimentoId)}`
      : "";
    const res = await request("GET", `/alocacoes/ativas/agora/${qs}`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return res.data; // {agora, estabelecimentos: [...]}
  },

  // request genérica (se quiser reusar)
  async request(method: string, path: string, body?: any) {
    return request(method, path, body);
  },
};

contextBridge.exposeInMainWorld("api", api);
