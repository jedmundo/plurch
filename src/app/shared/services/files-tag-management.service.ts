import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';

export const LOCAL_STORAGE_TAGS = 'file-tags';

export interface FileTag {
    name: string;
    files: string[];
}

@Injectable()
export class FileTagManagementService {

    private fileTagsSubject = new ReplaySubject<FileTag[]>(1);
    private _fileTag$ = this.fileTagsSubject.asObservable();
    private _fileTagList: FileTag[] = [];

    constructor() {
        const tags = localStorage.getItem(LOCAL_STORAGE_TAGS);
        if (tags) {
            this.fileTagList = JSON.parse(tags);
        }
    }

    public createTag(name: string): void {
        this._fileTagList.push({ name: name, files: []});
    }

    public removeTag(): void {
        // TODO
    }

    public get fileTag$(): Observable<FileTag[]> {
        return this._fileTag$;
    }

    private set fileTagList(list: FileTag[]) {
        this._fileTagList = list;
        this.fileTagsSubject.next(this._fileTagList);
    }
}
