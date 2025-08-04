const { app, BrowserWindow, Menu, dialog } = require("electron");
const path = require("path");

let mainWindow: Electron.BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Menu personalizado
  const template = [
    {
      label: "Arquivo",
      submenu: [
        { role: "reload", label: "Recarregar" },
        {
          label: "Sair",
          click: () => {
            if (mainWindow) {
              const escolha = dialog.showMessageBoxSync(mainWindow, {
                type: "question",
                buttons: ["Sim", "Não"],
                defaultId: 1,
                title: "Confirmar saída",
                message: "Deseja sair do MotoPro-AutoDesk?",
              });

              if (escolha === 0) {
                app.quit();
              }
            }
          },
        },
      ],
    },
    {
      label: "Exibir",
      submenu: [
        { role: "togglefullscreen", label: "Tela Cheia" },
        { role: "toggleDevTools", label: "DevTools" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Carregar app
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Confirmação ao fechar pelo botão X
  mainWindow.on("close", (event: Electron.Event) => {
    event.preventDefault();

    const escolha = dialog.showMessageBoxSync(mainWindow!, {
      type: "question",
      buttons: ["Sim", "Não"],
      defaultId: 1,
      title: "Confirmar saída",
      message: "Deseja sair do MotoPro-AutoDesk?",
    });

    if (escolha === 0) {
      // Remove listeners para evitar loop e fecha
      mainWindow!.removeAllListeners("close");
      mainWindow!.close();
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
