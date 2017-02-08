import { Injectable } from '@angular/core';
const { ipcRenderer, remote } = electron;
import BrowserWindow = Electron.BrowserWindow;
import Display = Electron.Display;
import { PlayableItem } from '../../manager/day-schedule/day-schedule.component';

export class PlurchWindow {

    constructor(
        public id: string,
        public electronWindow: BrowserWindow,
        public loadUrl: string,
        public title: string,
        public x?: number,
        public y?: number,
        public width?: number,
        public height?: number
    ) {
    }
}

@Injectable()
export class WindowManagementService {

    private availableWindows: PlurchWindow[] = [];
    private indexUrl: string;

    constructor() {
        ipcRenderer.send('get-index-url');

        ipcRenderer.on('get-index-url-reply', (event, arg) => {
            this.indexUrl = arg.indexUrl;
        });
    }

    public getAvailableWindows(): PlurchWindow[] {
        return this.availableWindows;
    }

    public openWindow(id: string,
                      loadUrl: string,
                      externalDisplay: Display,
                      title: string,
                      x?: number,
                      y?: number,
                      width?: number,
                      height?: number): void {

        const externalMonitorXBounds = externalDisplay.bounds.x;
        const externalMonitorYBounds = externalDisplay.bounds.y;
        const rightExternalMonitorXPosition = externalMonitorXBounds < 0 ? externalMonitorXBounds - 10 : externalMonitorXBounds + 10;
        const rightExternalMonitorYPosition = externalMonitorYBounds < 0 ? externalMonitorYBounds - 10 : externalMonitorYBounds + 10;

        let previewWindow = new remote.BrowserWindow({
            title: title,
            icon: 'assets/icon.png',
            width: 800,
            height: 600,
            fullscreen: false,
            x: rightExternalMonitorXPosition,
            y: rightExternalMonitorYPosition
        });

        // and load the index.html of the app.
        const finalLoadUrl = this.indexUrl + loadUrl;
        previewWindow.loadURL(finalLoadUrl);

        // Open the DevTools.
        previewWindow.webContents.openDevTools();

        // Emitted when the window is closed.
        previewWindow.on('closed', () => {
            // Dereference twhe window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.closeWindow(id);
        });

        this.availableWindows.push(new PlurchWindow(id, previewWindow, finalLoadUrl, title));
        console.log(this.availableWindows);

    }

    public closeWindow(id: string): void {
        const pWindow = this.getPlurchWindow(id);
        if (pWindow) {
            pWindow.electronWindow.close();
            this.availableWindows.splice(this.availableWindows.indexOf(pWindow), 1);
        }
    }

    public getPlurchWindow(id: string): PlurchWindow {
        return this.availableWindows.find((pWindow) => pWindow.id === id);
    }

    public addToWindow(id: string, loadUrl: string): void {
        const pWindow = this.availableWindows.find((pWindow) => pWindow.id === id);
        pWindow.electronWindow.loadURL(this.indexUrl + loadUrl);
    }

    public sendMessageToWindow(id: string, messageTitle: string, message: any): void {
        const pWindow = this.availableWindows.find((pWindow) => pWindow.id === id);
        if (pWindow) {
            pWindow.electronWindow.webContents.send(messageTitle, message);
        }
    }

    public sendMessageToWindows(file: PlayableItem, messageTitle: string, message: any): void {
        file.windowIDs.forEach((windowID) => {
            const pWindow = this.availableWindows.find((pWindow) => pWindow.id === windowID);
            if (pWindow) {
                pWindow.electronWindow.webContents.send(messageTitle, message);
            }
        });
    }

}
