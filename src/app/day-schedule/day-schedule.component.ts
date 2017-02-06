import { Component, OnInit, NgZone } from '@angular/core';
import Display = Electron.Display;
import Event = Electron.Event;
import BrowserWindow = Electron.BrowserWindow;
import { PlurchDisplay } from '../monitor-displays/monitor-displays.component';
import { WindowManagementService, PlurchWindow } from '../shared/services/window-management.service';

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

    private previewWindowId: number;

    constructor(
        private zone: NgZone, private windowManagementService: WindowManagementService
    ) { }

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

        // const externalDisplay = this.displays.find((display) => display.external);
        const externalDisplay = this.displays[0];
        const url = '#/fs/' + file.path.replace(/\//g, '___') + '____' + file.type;

        if (!externalDisplay) {
            return;
        }

        this.windowManagementService.openWindow(123, url, externalDisplay.electronDisplay, 'Plurch Preview')
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
            return this.windowManagementService.closeWindow(123);
        }

        ipcRenderer.send('send-video-command', { type: command });

        video.addEventListener("seeking", () => {
            if (this.windowManagementService.getPlurchWindow(123)) {
                this.windowManagementService.sendMessageToWindow(123, 'send-video-type', { type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: video.currentTime });
            }
        });

        video.addEventListener("seeked", () => {
            if (this.windowManagementService.getPlurchWindow(123)) {
                this.windowManagementService.sendMessageToWindow(123, 'send-video-type', { type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: video.currentTime });
            }
        });

        this.windowManagementService.sendMessageToWindow(123, 'send-video-type', { type: command });
    }

    public isPreviewWindowOpened(): boolean {
        return !!this.windowManagementService.getPlurchWindow(123);
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
