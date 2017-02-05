import { Component, OnInit, NgZone } from '@angular/core';
import Display = Electron.Display;
import Event = Electron.Event;
import BrowserWindow = Electron.BrowserWindow;
import { PlurchDisplay } from '../monitor-displays/monitor-displays.component';

const { remote, ipcRenderer, shell } = electron;

const videoAllowedExtensions: string[] = ['mp4', 'm4v', 'mkv'];
const allAllowedExtensions: string[] = videoAllowedExtensions.concat(['.png', 'jpg', 'jpeg','pptx', '']);

export enum FILE_TYPE {
    VIDEO,
    DEFAULT
}

export class PlayableItem {
    constructor(
        public path: string,
        public type: FILE_TYPE = FILE_TYPE.DEFAULT,
        public thumbnailPath?: string
    ) {}

    public getName(): string {
        return this.path.split('/')[this.path.split('/').length-1].split('.')[0]
    }
}

export interface VideoCommand {
    type: VIDEO_COMMAND_TYPE;
    value?: number
}

export enum VIDEO_COMMAND_TYPE {
    PLAY,
    PAUSE,
    RESTART,
    SYNC_TIME,
    CLOSE
}

@Component({
    selector: 'app-day-schedule',
    templateUrl: './day-schedule.component.html',
    styleUrls: ['./day-schedule.component.scss']
})
export class DayScheduleComponent implements OnInit {

    public displays: PlurchDisplay[] = [];
    public isPreviewPossible: boolean = false;

    public title = 'Plurch';
    public files: PlayableItem[] = [];
    public FILE_TYPE = FILE_TYPE;
    public VIDEO_COMMAND_TYPE = VIDEO_COMMAND_TYPE;

    public isVideoPaused: boolean = true;

    private previewWindow: BrowserWindow;

    constructor(private zone: NgZone) { }

    public ngOnInit() {
        this.loadItems('files', this.files);
    }

    public openChooseItemDialog() {
        remote.dialog.showOpenDialog({
            title:"Select files or a folder",
            properties: ["openDirectory","openFile","multiSelections"]
        }, (itemPaths) => {
            this.zone.run(() => {
                this.addVideosFromFolderOrFile(itemPaths);
            });
        });
    }

    public openFile(path: string) {
        shell.openItem(path);
    }

    public deleteFile(path: string) {
        const file = this.files.find((file) => file.path === path);
        this.files.splice(this.files.indexOf(file) , 1);
        localStorage.setItem('files', JSON.stringify(this.files));
    }

    public openNewScreen(file: PlayableItem) {

        const externalDisplay = this.displays.find((display) => display.external);
        const url = 'http://localhost:9527/#/fs/' + file.path.replace(/\//g, '___') + '____' + file.type;

        if (!externalDisplay) {
            return;
        }

        const externalMonitorXBounds = externalDisplay.electronDisplay.bounds.x;
        const externalMonitorYBounds = externalDisplay.electronDisplay.bounds.y;
        const rightExternalMonitorXPosition = externalMonitorXBounds < 0 ? externalMonitorXBounds - 10 : externalMonitorXBounds + 10;
        const rightExternalMonitorYPosition = externalMonitorYBounds < 0 ? externalMonitorYBounds - 10 : externalMonitorYBounds + 10;

        if (this.previewWindow) {
            // and load the index.html of the app.
            this.previewWindow.loadURL(url);
        } else {
            this.previewWindow = new remote.BrowserWindow({
                title: 'Plurch - Full screen mode',
                icon: 'assets/icon.png',
                width: 800,
                height: 600,
                fullscreen: true,
                x: rightExternalMonitorXPosition,
                y: rightExternalMonitorYPosition
            });

            // and load the index.html of the app.
            this.previewWindow.loadURL(url);

            // Open the DevTools.
            this.previewWindow.webContents.openDevTools();

            // Emitted when the window is closed.
            this.previewWindow.on('closed', () => {
                // Dereference twhe window object, usually you would store windows
                // in an array if your app supports multi windows, this is the time
                // when you should delete the corresponding element.
                this.zone.run(() => {
                    this.previewWindow = null;
                });
            });
        }
    }

    public sendVideoControls(command: VIDEO_COMMAND_TYPE): void {
        this.isVideoPaused = !this.isVideoPaused;

        const video: HTMLVideoElement = <HTMLVideoElement> document.getElementById('video_thumbnail');
        switch (command) {
            case VIDEO_COMMAND_TYPE.PLAY:
                video.play();
                break;
            case VIDEO_COMMAND_TYPE.PAUSE:
                video.pause();
                break;
            case VIDEO_COMMAND_TYPE.RESTART:
                this.isVideoPaused = true;
                video.load();
                break;
            case VIDEO_COMMAND_TYPE.CLOSE:
                this.isVideoPaused = true;
                return this.previewWindow.close();
        }

        video.addEventListener("seeking", () => {
            if (this.previewWindow) {
                this.previewWindow.webContents.send('send-video-type', { type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: video.currentTime });
            }
        });

        video.addEventListener("seeked", () => {
            if (this.previewWindow) {
                this.previewWindow.webContents.send('send-video-type', { type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: video.currentTime });
            }
        });

        if (this.previewWindow) {
            this.previewWindow.webContents.send('send-video-type', { type: command });
            // let myWindows = remote.BrowserWindow.getAllWindows();
            // myWindows[0].webContents.send('send-video-type', command);
        }
    }

    public isPreviewWindowOpened(): boolean {
        return !!this.previewWindow;
    }

    private addVideosFromFolderOrFile(itemPaths: string[]): void {
        if (itemPaths) {
            itemPaths.forEach((itemPath) => {
                const isDirectory = fs.lstatSync(itemPath).isDirectory();
                if (isDirectory) {
                    fs.readdir(itemPath, (err, files) => {
                        this.zone.run(() => {
                            files.forEach(file => {
                                if (this.isAllowedVideo(file)) {
                                    this.addFile(itemPath + '/' + file, FILE_TYPE.VIDEO);
                                } else {
                                    this.addFile(itemPath, FILE_TYPE.DEFAULT);
                                }
                            });
                        });
                    })
                } else {
                    if (this.isAllowedVideo(itemPath)) {
                        this.addFile(itemPath, FILE_TYPE.VIDEO);
                    } else {
                        this.addFile(itemPath, FILE_TYPE.DEFAULT);
                    }
                }
            });
        }
    }

    private isAllowedVideo(itemPath: string): boolean {
        if (videoAllowedExtensions.find((extension) => path.extname(itemPath).indexOf('.' + extension) > -1)) {
            return true;
        } else {
            console.log('Item with extension not allowed: ', itemPath);
        }
    }

    private addFile(path: string, type: FILE_TYPE): void {
        console.log('ADD PlayableItem:', path);

        if (type === FILE_TYPE.VIDEO) {
            this.storeFile(path, type);
        } else {
            ipcRenderer.on('save-preview-reply', (event, thumbnailPath) => {
                this.zone.run(() => {
                    if (thumbnailPath) {
                        this.storeFile(path, type, thumbnailPath);
                    } else {
                        this.storeFile(path, type);
                    }
                });
            });
            ipcRenderer.send('save-preview', path);

        }
    }

    private storeFile(path: string, type: FILE_TYPE, thumbnailPath?: string): void {
        this.files.push(new PlayableItem(path, type, thumbnailPath));
        localStorage.setItem('files', JSON.stringify(this.files));
    }

    private loadItems(key: string, list: PlayableItem[]): void {
        const fileList: PlayableItem[] = JSON.parse(localStorage.getItem(key));
        if (fileList) {
            fileList.forEach((file: PlayableItem) => {
                list.push(new PlayableItem(file.path, file.type, file.thumbnailPath));
            });
        }
    }

}
