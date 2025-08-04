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
        frame: true, // barra padrão
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
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
                        const response = await electron_1.dialog.showMessageBox(mainWindow, {
                            type: 'question',
                            buttons: ['Yes', 'No'],
                            defaultId: 1,
                            title: 'Confirm Exit',
                            message: 'Do you really want to exit the application?',
                        });
                        if (response.response === 0) {
                            electron_1.app.quit();
                        }
                    },
                },
            ],
        },
    ];
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
electron_1.app.whenReady().then(() => {
    createWindow();
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
