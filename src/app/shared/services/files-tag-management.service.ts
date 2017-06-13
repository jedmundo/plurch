import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { YouTubeVideo } from './youtube-management.service';

import { without } from 'lodash';

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
            this.loadItems(JSON.parse(tags));
        }
    }

    public createTag(name: string): void {
        this._fileTagList.push({ name: name, files: []});
        this.storeList();
    }

    public deleteTag(name: string): void {
        this._fileTagList.splice(this._fileTagList.findIndex(item => item.name === name), 1);
        this.storeList();
    }

    public addVideoToTag(name: string, video: YouTubeVideo): void {
        const tag = this._fileTagList.find(tag => tag.name === name);
        tag.files.push(video.id);
        this.storeList();
    }

    public removeVideoFromTag(name: string, video: YouTubeVideo): void {
        const tag = this._fileTagList.find(tag => tag.name === name);
        tag.files.splice(tag.files.findIndex(id => id === video.id), 1);
        this.storeList();
    }

    public get fileTag$(): Observable<FileTag[]> {
        return this._fileTag$;
    }

    private loadItems(list: FileTag[]) {
        this._fileTagList = list;
        this.fileTagsSubject.next(this._fileTagList);
    }

    private storeList(): void {
        this.fileTagsSubject.next(this._fileTagList);
        localStorage.setItem(LOCAL_STORAGE_TAGS, JSON.stringify(this._fileTagList));
    }
}
