const { app, globalShortcut, BrowserWindow, webContents } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: __dirname + '/preload.js'
        }
    });

    const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;

    mainWindow.loadURL(startURL);

    globalShortcut.register('CommandOrControl+G', () => {
        mainWindow.webContents.send('asynchronous-message', { 'SAVED': 'File Saved' });
    })
    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);