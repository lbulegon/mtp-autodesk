import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true, // barra padrão
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL('http://localhost:5173');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Menu personalizado com confirmação para sair
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          click: async () => {
            const response = await dialog.showMessageBox(mainWindow!, {
              type: 'question',
              buttons: ['Yes', 'No'],
              defaultId: 1,
              title: 'Confirm Exit',
              message: 'Do you really want to exit the application?',
            });

            if (response.response === 0) {
              app.quit();
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
