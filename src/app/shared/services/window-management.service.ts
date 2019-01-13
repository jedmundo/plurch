import { Injectable } from '@angular/core';

import { Observable, ReplaySubject } from 'rxjs';

import { guid } from '../../util/util-functions';
import { IS_DEBUG } from '../../app.component';
import { ElectronService } from './electron.service';
import { PlayableItem, PLAYABLE_FILE_TYPE } from './day-files-management.service';

export class PlurchWindow {

  public playableItem: PlayableItem;

  constructor(
    public id: string,
    public electronWindow: any,
    public loadUrl: string,
    public title: string,
    public x?: number,
    public y?: number,
    public width?: number,
    public height?: number
  ) {
  }
}

export enum WINDOW_COMMAND_TYPE {
  FULL_SCREEN,
  STOP_FULL_SCREEN,
  CLOSE
}

@Injectable()
export class WindowManagementService {

  private availableWindowsSubject = new ReplaySubject<PlurchWindow[]>(1);
  private _availableWindows$: Observable<PlurchWindow[]> = this.availableWindowsSubject.asObservable();
  private pWindows: PlurchWindow[] = [];
  private indexUrl: string;

  constructor(
    private electronService: ElectronService
  ) {
    this.electronService.ipcRenderer.send('get-index-url');

    this.electronService.ipcRenderer.on('get-index-url-reply', (event, arg) => {
      this.indexUrl = arg.indexUrl;
    });
  }

  public get availableWindows$(): Observable<PlurchWindow[]> {
    return this._availableWindows$;
  }

  public get windowList(): PlurchWindow[] {
    return this.pWindows;
  }

  private addWindow(window: PlurchWindow): void {
    this.pWindows.push(window);
    this.availableWindowsSubject.next(this.pWindows);
  }

  private removeWindow(windowId: string): void {
    this.pWindows.splice(this.pWindows.findIndex((item) => item.id === windowId), 1);
    this.availableWindowsSubject.next(this.pWindows);
  }

  public openWindow(loadUrl: string,
    externalDisplay: any,
    title: string,
    x?: number,
    y?: number,
    width?: number,
    height?: number): void {

    const externalMonitorXBounds = externalDisplay.bounds.x;
    const externalMonitorYBounds = externalDisplay.bounds.y;
    const rightExternalMonitorXPosition = externalMonitorXBounds < 0 ? externalMonitorXBounds - 10 : externalMonitorXBounds + 10;
    const rightExternalMonitorYPosition = externalMonitorYBounds < 0 ? externalMonitorYBounds - 10 : externalMonitorYBounds + 10;

    const previewWindow = new this.electronService.remote.BrowserWindow({
      title: title,
      icon: 'assets/icon.png',
      width: 800,
      height: 600,
      x: rightExternalMonitorXPosition,
      y: rightExternalMonitorYPosition
    });

    const id = guid();

    // and load the index.html of the app.
    const finalLoadUrl = this.indexUrl + loadUrl;
    previewWindow.loadURL(finalLoadUrl);

    // Open the DevTools.
    if (IS_DEBUG) {
      previewWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    previewWindow.on('close', (event: Event) => {
      // TODO: NOT WORKING
      event.preventDefault();
      this.closeWindow(id);
    });

    this.addWindow(new PlurchWindow(id, previewWindow, finalLoadUrl, title));
    console.log('Available Windows', this.pWindows);
  }

  public closeWindow(id: string): void {
    const pWindow = this.getPlurchWindow(id);
    if (pWindow) {
      pWindow.electronWindow.close();
      this.removeWindow(pWindow.id);
    }
  }

  public closeAllWindows(): void {
    this.pWindows.forEach((pWindow: PlurchWindow) => {
      this.closeWindow(pWindow.id);
    });
  }

  public getPlurchWindow(id: string): PlurchWindow {
    return this.pWindows.find((pWindow) => pWindow.id === id);
  }

  public addToWindow(windowId: string, file: PlayableItem): void {
    const pWindow = this.pWindows.find((currPWindow) => currPWindow.id === windowId);
    pWindow.playableItem = file;
    if (file.type === PLAYABLE_FILE_TYPE.VIDEO) {
      const url = `#/fs/video/${file.path.replace(/\//g, '___')}/${file.id}/${pWindow.id}`;
      pWindow.electronWindow.loadURL(this.indexUrl + url);
    } else {
      // TODO: OPEN OTHER FILES ON FULL SCREEN
      pWindow.electronWindow.loadURL(this.indexUrl + file.path);
    }
  }

  public sendMessageToWindow(id: string, messageTitle: string, message: any): void {
    const pWindow = this.pWindows.find((currentPWindow) => currentPWindow.id === id);
    if (pWindow) {
      pWindow.electronWindow.webContents.send(messageTitle, message);
    }
  }

  public sendMessageToWindows(file: PlayableItem, messageTitle: string, message: any): void {
    file.itemsPlaying.map((item) => item.windowId).forEach((windowID) => {
      const pWindow = this.pWindows.find((currentPWindow) => currentPWindow.id === windowID);
      if (pWindow) {
        pWindow.electronWindow.webContents.send(messageTitle, message);
      }
    });
  }

  public sendCommandToWindow(id: string, command: WINDOW_COMMAND_TYPE): void {
    const pWindow = this.pWindows.find((currentPWindow) => currentPWindow.id === id);
    if (pWindow) {
      switch (command) {
        case WINDOW_COMMAND_TYPE.FULL_SCREEN:
          pWindow.electronWindow.setFullScreen(true);
          break;
        case WINDOW_COMMAND_TYPE.STOP_FULL_SCREEN:
          pWindow.electronWindow.setFullScreen(false);
          break;
        case WINDOW_COMMAND_TYPE.CLOSE:
          this.closeWindow(id);
          break;
      }
    }
  }

}
