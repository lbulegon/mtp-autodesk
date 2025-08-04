import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL('http://localhost:5173');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  Menu.setApplicationMenu(null);

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('window-minimize', () => {
  mainWindow!.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow!.isMaximized()) {
    mainWindow!.unmaximize();
  } else {
    mainWindow!.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow!.close();
});
