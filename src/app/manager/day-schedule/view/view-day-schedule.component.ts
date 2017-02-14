import { Component, OnInit, NgZone, EventEmitter } from '@angular/core';
import Display = Electron.Display;
import Event = Electron.Event;
import BrowserWindow = Electron.BrowserWindow;
import { WindowManagementService, WINDOW_COMMAND_TYPE } from '../../../shared/services/window-management.service';
import { PlurchDisplay, DisplayManagementService } from '../../../shared/services/display-management.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
const { remote, ipcRenderer, shell } = electron;

export const LOCAL_STORAGE_FILE_LIST_PREFIX = 'FILES_';

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
        public thumbnailPath?: string,
        public windowIDs: string[] = []
    ) {}

    public getName(): string {
        return this.path.split('/')[this.path.split('/').length-1].split('.')[0]
    }
}

@Component({
    selector: 'app-view-day-schedule',
    templateUrl: 'view-day-schedule.component.html',
    styleUrls: ['view-day-schedule.component.scss']
})
export class ViewDayScheduleComponent implements OnInit {

    public files: PlayableItem[] = [];
    public FILE_TYPE = FILE_TYPE;
    public WINDOW_COMMAND_TYPE = WINDOW_COMMAND_TYPE;

    private selectedDayName: string;
    private displays: PlurchDisplay[];
    private pWindowIds: string[] = [];
    private newFileAddedToWindow = new EventEmitter<void>();

    constructor(
        private zone: NgZone,
        private windowManagementService: WindowManagementService,
        private displayManagementService: DisplayManagementService,
        private activatedRoute: ActivatedRoute
    ) { }

    public ngOnInit() {
        this.activatedRoute.parent.params.subscribe((params: Params) => {
            this.selectedDayName = params['dayName'];
            this.loadItems(LOCAL_STORAGE_FILE_LIST_PREFIX + this.selectedDayName, this.files);
        });
        this.displayManagementService.display$.subscribe((displays) => this.displays = displays);
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
        localStorage.setItem(LOCAL_STORAGE_FILE_LIST_PREFIX + this.selectedDayName, JSON.stringify(this.files));
    }

    public openNewScreen(): void {
        let externalDisplay = this.displays.find((display) => display.external);
        if (!externalDisplay) {
            externalDisplay = this.displays[0];
        }

        const windowID = this.guid();
        this.pWindowIds.push(windowID);
        this.windowManagementService.openWindow(windowID, '#/fs/empty-window', externalDisplay.electronDisplay, 'Plurch Video Preview');

        if (!externalDisplay) {
            return;
        }
    }

    public sendCommandToWindow(id: string, command: WINDOW_COMMAND_TYPE) {
        // TODO: Improve this
        if (command === WINDOW_COMMAND_TYPE.CLOSE) {
            this.pWindowIds.splice(this.pWindowIds.indexOf(id), 1);
            for (let j = 0; j < this.files.length; j++) {
                if (this.files[j].windowIDs.indexOf(id) > -1)
                    this.files[j].windowIDs.splice(this.files[j].windowIDs.indexOf(id), 1);
            }
        }
        this.windowManagementService.sendCommandToWindow(id, command);
    }

    public addToWindow(file: PlayableItem, windowId: string): void {
        this.files.forEach((file) => {
            if (file.windowIDs.find((windowIdArg) => windowIdArg === windowId)) {
                file.windowIDs.splice(file.windowIDs.findIndex((windowIdArg) => windowIdArg === windowId), 1)
            }
        });
        file.windowIDs.push(windowId);
        if (file.type === FILE_TYPE.VIDEO) {
            const url = '#/fs/video/' + file.path.replace(/\//g, '___');
            this.windowManagementService.addToWindow(windowId, url);
        }
        this.newFileAddedToWindow.emit();
    }

    public closeAllWindows(): void {
        // TODO: Improve
        for (let i = 0; i < this.pWindowIds.length; i++) {
            this.windowManagementService.closeWindow(this.pWindowIds[i]);
        }
        for (let j = 0; j < this.files.length; j++) {
            this.files[j].windowIDs = [];
        }
        this.pWindowIds = [];
    }

    private guid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
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
        localStorage.setItem(LOCAL_STORAGE_FILE_LIST_PREFIX + this.selectedDayName, JSON.stringify(this.files));
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
