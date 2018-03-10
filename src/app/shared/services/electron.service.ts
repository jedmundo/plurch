import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { IpcRenderer, Remote, Shell, Display, Screen } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as loudness from 'loudness';
import * as ytdl from 'ytdl-core';

@Injectable()
export class ElectronService {

    // Electron specific
    public readonly ipcRenderer: IpcRenderer;
    public readonly remote: Remote;
    public readonly shell: Shell;
    public readonly screen: Screen;
    // TODO: fix this type any
    public ytdl: any;
    public readonly fs: any;
    public readonly path: any;
    public readonly loudness: any;
    public readonly childProcess: childProcess.ChildProcess;

    constructor() {
        // Conditional imports
        if (this.isElectron()) {
            const electron = window.require('electron');
            this.ipcRenderer = electron.ipcRenderer;
            this.remote = electron.remote;
            this.shell = electron.shell;
            this.screen = electron.screen;
            this.fs = window.require('fs');
            this.path = window.require('path');
            this.ytdl = window.require('ytdl-core');
            this.loudness = window.require('loudness');
            this.childProcess = window.require('child_process');
        }
    }

    isElectron = () => {
        return window && window.process && window.process.type;
    }

}
