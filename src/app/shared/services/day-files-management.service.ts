import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { guid } from '../../util/util-functions';
const { shell, ipcRenderer } = electron;

export const LOCAL_STORAGE_FILE_LIST_PREFIX = 'FILES_';

export enum PLAYABLE_FILE_TYPE {
    VIDEO,
    DEFAULT
}

export class PlayableItem {
    constructor(
        public id: string,
        public path: string,
        public sanitizedPath: SafeUrl,
        public name: string,
        public type: PLAYABLE_FILE_TYPE = PLAYABLE_FILE_TYPE.DEFAULT,
        public thumbnailPath?: string,
        public windowIDs: string[] = []
    ) {}
}

@Injectable()
export class DayFilesManagementService {

    constructor(
        private sanitizer: DomSanitizer
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
            fileList.forEach((file: any) => {
                list.push(new PlayableItem(
                    file.id,
                    file.path,
                    this.sanitizer.bypassSecurityTrustResourceUrl(file.path),
                    this.generateName(file.path),
                    file.type,
                    file.thumbnailPath));
            });
        }
    }

    public addFile(dayName: string, files: PlayableItem[], id: string, path: string, type: PLAYABLE_FILE_TYPE): void {
        console.log('ADD PlayableItem:', path);

        if (type === PLAYABLE_FILE_TYPE.VIDEO) {
            this.storeFile(dayName, files, id, path, type);
        } else {
            // ipcRenderer.on('save-preview-reply', (event, thumbnailPath) => {
            //     this.zone.run(() => {
            //         if (thumbnailPath) {
            //             this.storeFile(dayName, files, path, type, thumbnailPath);
            //         } else {
            this.storeFile(dayName, files, id, path, type);
            // }
            //     });
            // });
            // ipcRenderer.send('save-preview', path);

        }
    }

    private storeFile(dayName: string, files: PlayableItem[], id: string, path: string, type: PLAYABLE_FILE_TYPE,
                      thumbnailPath?: string): void {
        files.push(new PlayableItem(id, path, this.sanitizer.bypassSecurityTrustResourceUrl(path),
            this.generateName(path), type, thumbnailPath));
        localStorage.setItem(LOCAL_STORAGE_FILE_LIST_PREFIX + dayName, JSON.stringify(files));
    }

    private generateName(path: string): string {
        return path.split('/')[path.split('/').length-1].split('.')[0];
    }

}
