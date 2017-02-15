import { Injectable, NgZone } from '@angular/core';
const { shell, ipcRenderer } = electron;

export const LOCAL_STORAGE_FILE_LIST_PREFIX = 'FILES_';

export enum PLAYABLE_FILE_TYPE {
    VIDEO,
    DEFAULT
}

export class PlayableItem {
    constructor(
        public path: string,
        public type: PLAYABLE_FILE_TYPE = PLAYABLE_FILE_TYPE.DEFAULT,
        public thumbnailPath?: string,
        public id?: string,
        public windowIDs: string[] = []
    ) {}

    public getName(): string {
        return this.path.split('/')[this.path.split('/').length-1].split('.')[0]
    }
}

@Injectable()
export class DayFilesManagementService {

    constructor(
        private zone: NgZone
    ) {

    }

    public openFile(path: string) {
        shell.openItem(path);
    }

    public deleteFile(dayName: string, path: string, files: PlayableItem[]) {
        const file = files.find((file) => file.path === path);
        files.splice(files.indexOf(file) , 1);
        localStorage.setItem(LOCAL_STORAGE_FILE_LIST_PREFIX + dayName, JSON.stringify(files));
    }

    public loadItems(name: string, list: PlayableItem[]): void {
        const fileList: PlayableItem[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_FILE_LIST_PREFIX + name));
        if (fileList) {
            fileList.forEach((file: PlayableItem) => {
                list.push(new PlayableItem(file.path, file.type, file.thumbnailPath, file.id));
            });
        }
    }

    public addFile(dayName: string, files: PlayableItem[], path: string, type: PLAYABLE_FILE_TYPE, id?: string): void {
        console.log('ADD PlayableItem:', path);

        if (type === PLAYABLE_FILE_TYPE.VIDEO) {
            this.storeFile(dayName, files, path, type, id);
        } else {
            // ipcRenderer.on('save-preview-reply', (event, thumbnailPath) => {
            //     this.zone.run(() => {
            //         if (thumbnailPath) {
            //             this.storeFile(dayName, files, path, type, thumbnailPath);
            //         } else {
                        this.storeFile(dayName, files, path, type);
                    // }
            //     });
            // });
            // ipcRenderer.send('save-preview', path);

        }
    }

    private storeFile(dayName: string, files: PlayableItem[], path: string, type: PLAYABLE_FILE_TYPE,
                      thumbnailPath?: string, id?: string): void {
        files.push(new PlayableItem(path, type, thumbnailPath, id));
        localStorage.setItem(LOCAL_STORAGE_FILE_LIST_PREFIX + dayName, JSON.stringify(files));
    }

}
