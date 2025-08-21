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
  request: (args: any) => ipcRenderer.invoke("api:request", args),
  getDesalocacaoConfig: () => ipcRenderer.invoke("api:getDesalocacaoConfig"),
  getEstabelecimentoConfig: () => ipcRenderer.invoke("api:getEstabelecimentoConfig")
};

contextBridge.exposeInMainWorld("api", api);
