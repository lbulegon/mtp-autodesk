"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
    });
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.Menu.setApplicationMenu(null);
    electron_1.app.on('activate', () => {
        if (mainWindow === null)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.ipcMain.on('window-minimize', () => {
    mainWindow.minimize();
});
electron_1.ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    }
    else {
        mainWindow.maximize();
    }
});
electron_1.ipcMain.on('window-close', () => {
    mainWindow.close();
});
