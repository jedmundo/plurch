// src/electron.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const filepreview = require('filepreview');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
        title: 'Plurch',
        icon: 'assets/icon.png',
        width: 1280,
        height: 800
    });

    // and load the index.html of the app.
    win.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg);  // prints "ping"
    let win2 = new BrowserWindow({width: 1280, height: 800, show: false});
    // and load the index.html of the app.
    // win2.loadURL(`file://${__dirname}/index.html`);
    // win2.loadURL(`/fs`);
    const indexPath = path.resolve(__dirname, '..', 'dist', 'index.html');
    const indexUrl = url.format({
        protocol: 'file',
        pathname: indexPath,
        slashes: true,
        hash: encodeURIComponent(JSON.stringify('/#/fs'))
    });

    win2.on('closed', () => {
        win2 = null;
    });

    win2.webContents.on('did-finish-load', () => {
        win2.show();
        console.log('window is now visible!')
    });

    console.log('FINAL URL: ', indexUrl);
    console.log(' URL 1: ', `file://${__dirname}/index.html`);
    console.log(' URL 2: ', indexUrl);
    win2.loadURL(indexUrl);

    event.sender.send('asynchronous-reply', 'pong');
});

ipcMain.on('save-preview', (event, path) => {

    const pathList = path.split('/');
    const thumbnailPath = '/Users/jedmundo/Desktop/plurch/thumbnails/preview_'
        + pathList[pathList.length-1].split('.')[0] + '.gif';

    if (!filepreview.generateSync(path, thumbnailPath)) {
        console.log('Oops, something went wrong.');
        event.sender.send('save-preview-reply', null);
    } else {
        event.sender.send('save-preview-reply', thumbnailPath);
    }
});
