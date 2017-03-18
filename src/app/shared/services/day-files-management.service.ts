import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ItemPlaying } from './items-playing-management.service';
const { shell } = electron;

export const LOCAL_STORAGE_FILE_LIST_PREFIX = 'FILES_';

export enum PLAYABLE_FILE_TYPE {
    VIDEO,
    DEFAULT
}

export class PlayableItem {

    public isPlaying: boolean = false;
    public isSendingToWindow: boolean = false;
    public isRemovingFromWindow: boolean = false;

    constructor(
        public id: string,
        public path: string,
        public sanitizedPath: SafeUrl,
        public name: string,
        public description?: string,
        public type: PLAYABLE_FILE_TYPE = PLAYABLE_FILE_TYPE.DEFAULT,
        public thumbnailPath?: string,
        public itemsPlaying: ItemPlaying[] = []
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
                    file.name ? file.name : this.generateName(file.path),
                    file.description,
                    file.type,
                    file.thumbnailPath));
            });
        }
    }

    public addFile(
        dayName: string,
        files: PlayableItem[],
        id: string,
        path: string,
        type: PLAYABLE_FILE_TYPE,
        name?: string,
        description?: string,
        thumbnailUrl?: string
    ): void {
        console.log('ADD PlayableItem:', path);

        if (type === PLAYABLE_FILE_TYPE.VIDEO) {
            this.storeFile(dayName, files, id, path, type, name, description, thumbnailUrl);
        } else {
            // ipcRenderer.on('save-preview-reply', (event, thumbnailPath) => {
            //     this.zone.run(() => {
            //         if (thumbnailPath) {
            //             this.storeFile(dayName, files, path, type, thumbnailPath);
            //         } else {
            this.storeFile(dayName, files, id, path, type, name, description, thumbnailUrl);
            // }
            //     });
            // });
            // ipcRenderer.send('save-preview', path);

        }
    }

    public storeReorderedItems(dayName: string, items: PlayableItem[]): void {
        localStorage.setItem(LOCAL_STORAGE_FILE_LIST_PREFIX + dayName, JSON.stringify(items));
    }

    private storeFile(dayName: string,
                      files: PlayableItem[],
                      id: string,
                      path: string,
                      type: PLAYABLE_FILE_TYPE,
                      name?: string,
                      description?: string,
                      thumbnailPath?: string
    ): void {
        files.push(
            new PlayableItem(
                id,
                path,
                this.sanitizer.bypassSecurityTrustResourceUrl(path),
                name ? name : this.generateName(path),
                description,
                type,
                thumbnailPath)
        );
        localStorage.setItem(LOCAL_STORAGE_FILE_LIST_PREFIX + dayName, JSON.stringify(files));
    }

    private generateName(path: string): string {
        return path.split('/')[path.split('/').length-1].split('.')[0];
    }

}
