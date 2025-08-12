// electron/main.ts
import { app, BrowserWindow, globalShortcut } from "electron";
import * as path from "path";

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    show: false,               // mostra só quando estiver pronto
    frame: false,              // sem bordas / barra do SO (estilo POS)
    fullscreen: true,          // tenta abrir já em fullscreen
    fullscreenable: true,      // macOS
    // simpleFullScreen: true, // macOS (modo fullscreen sem animação; descomente se preferir)
    backgroundColor: "#000000",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Esconde menu (Windows/Linux)
  win.setMenuBarVisibility(false);
  win.setAutoHideMenuBar(true);

  // Carrega a UI
  win.loadFile(path.join(__dirname, "../electron/index.html"));

  // Garantir fullscreen depois do ready-to-show (ajuda no macOS)
  win.once("ready-to-show", () => {
    if (!win) return;
    // “dupla confirmação” do modo tela cheia
    win.setFullScreen(true);
    // alternativa “impossível de sair” (use só se quiser mesmo kiosk):
    // win.setKiosk(true);

    win.show();
  });

  win.on("closed", () => (win = null));
}

app.whenReady().then(() => {
  createWindow();

  // Atalhos úteis (remova em produção se não quiser):
  // F11 alterna fullscreen
  globalShortcut.register("F11", () => win?.setFullScreen(!win?.isFullScreen()));
  // Esc sai do kiosk/fullscreen (útil quando frame=false)
  globalShortcut.register("Escape", () => {
    if (!win) return;
    if (win.isKiosk()) win.setKiosk(false);
    if (win.isFullScreen()) win.setFullScreen(false);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (win === null) createWindow();
});
