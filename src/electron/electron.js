// src/electron.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
// const filepreview = require('filepreview');
const fs = require('fs');

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
    // win.loadURL('http://localhost:9527/index.html');
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
app.on('ready', () => {
    // const express = expressLib();
    // var http = require('http').Server(express);
    // // const server = http.createServer(requestHandler).listen(9527);
    // const port = 9527;
    // http.listen(port, function(){
    //     console.log('App listening on port ' + port);
    // });
    //
    // express.get('*', function (req, res) {
    //     requestHandler(req, res);
    // });
    //
    // function requestHandler(req, res) {
    //     console.log('REQ URL: ', req.url);
    //
    //     var file    = req.url == '/' ? '/index.html' : req.url,
    //         root    = __dirname,
    //         page404 = root + '/404.html';
    //
    //     getFile(root, file, res, page404);
    // };
    //
    // function getFile(root, file, res, page404) {
    //
    //     const localFile = root + file;
    //
    //     fs.exists(localFile, function(exists) {
    //         if(exists) {
    //             fs.readFile(localFile, function(err, contents) {
    //                 if(!err) {
    //                     res.end(contents);
    //                 } else {
    //                     console.dir(err);
    //                 }
    //             });
    //         } else {
    //             // look for files with absolute paths
    //             fs.exists(file, function(exists) {
    //                 if(exists) {
    //                     res.sendFile(file);
    //                 } else {
    //
    //                     fs.readFile(page404, function(err, contents) {
    //                         if(!err) {
    //                             res.writeHead(404, {'Content-Type': 'text/html'});
    //                             res.end(contents);
    //                         } else {
    //                             console.dir(err);
    //                         }
    //                     });
    //                 }
    //             });
    //         }
    //     });
    // };

    createWindow();
});

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
ipcMain.on('get-index-url', (event, arg) => {

    // const electronDisplay = arg.externalDisplay;
    // const externalMonitorXBounds = electronDisplay.bounds.x;
    // const externalMonitorYBounds = electronDisplay.bounds.y;
    // const rightExternalMonitorXPosition = externalMonitorXBounds < 0 ? externalMonitorXBounds - 10 : externalMonitorXBounds + 10;
    // const rightExternalMonitorYPosition = externalMonitorYBounds < 0 ? externalMonitorYBounds - 10 : externalMonitorYBounds + 10;
    //
    // previewWindow = new BrowserWindow({
    //     title: arg.title,
    //     icon: 'assets/icon.png',
    //     width: 800,
    //     height: 600,
    //     fullscreen: false,
    //     x: rightExternalMonitorXPosition,
    //     y: rightExternalMonitorYPosition
    // });
    //
    // // and load the index.html of the app.
    // previewWindow.loadURL(`file://${__dirname}/index.html` + arg.loadUrl);
    //
    // // Open the DevTools.
    // previewWindow.webContents.openDevTools();
    //
    // // Emitted when the window is closed.
    // previewWindow.on('closed', () => {
    //     // Dereference the window object, usually you would store windows
    //     // in an array if your app supports multi windows, this is the time
    //     // when you should delete the corresponding element.
    //     this.previewWindow = null;
    // });

    event.sender.send('get-index-url-reply', { indexUrl: `file://${__dirname}/index.html`});
});

ipcMain.on('get-youtube-videos-folder', (event, arg) => {
    event.sender.send('get-youtube-videos-folder-reply', `${__dirname}/youtube-videos`);
});

ipcMain.on('new-item-playing', (event, arg) => {
    win.webContents.send('new-item-playing', arg);
});

ipcMain.on('removed-item-playing', (event, arg) => {
    win.webContents.send('removed-item-playing', arg);
});

// ipcMain.on('asynchronous-message', (event, arg) => {
//     console.log(arg);  // prints "ping"
//     let win2 = new BrowserWindow({width: 1280, height: 800, title: 'FS'});
//
//     win2.on('closed', () => {
//         win2 = null;
//     });
//
//     // win2.webContents.on('did-finish-load', () => {
//     //     win2.show();
//     //     console.log('window is now visible!')
//     // });
//
//     // console.log('FINAL URL: ', indexUrl);
//     // console.log(' URL 1: ', `file://${__dirname}/index.html`);
//     // console.log(' URL 2: ', indexUrl);
//     win2.loadURL('http://localhost:9527/#/fs');
//
//     event.sender.send('asynchronous-reply', 'pong');
// });

// ipcMain.on('send-video-type', (event, arg) => {
//     console.log(arg);  // prints "ping"
//
//     const myWindows = BrowserWindow.getAllWindows();
//     console.log(myWindows);
//     myWindows[0].webContents.send('send-video-type-win2', arg);
// });

ipcMain.on('save-preview', (event, path) => {

    const pathList = path.split('/');
    const thumbnailPath = '/Users/jedmundo/Desktop/plurch/thumbnails/preview_'
        + pathList[pathList.length-1].split('.')[0] + '.gif';

    // if (!filepreview.generateSync(path, thumbnailPath)) {
    //     console.log('Oops, something went wrong.');
    //     event.sender.send('save-preview-reply', null);
    // } else {
    //     event.sender.send('save-preview-reply', thumbnailPath);
    // }
});
