import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { without, remove } from 'lodash';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

export const LOCAL_STORAGE_TAGS = 'file-tags';

export interface FileTag {
    name: string;
    files: string[];
}

export enum ChangeTagAction {
    CREATE,
    DELETE,
    ADD_FILE,
    REMOVE_FILE
}

export interface ChangeTagContainer {
    action: ChangeTagAction;
    payload?: {
        tag: FileTag;
        videoId?: string;
    };
}

@Injectable()
export class FileTagManagementService implements OnDestroy {

    private fileTagChangesSubject = new Subject<ChangeTagContainer>();
    private _fileTags$: Observable<FileTag[]>;

    private storeTagsSubscription: Subscription;

    constructor() {
        let tags = localStorage.getItem(LOCAL_STORAGE_TAGS);
        const parsedTags = JSON.parse(tags) || [];

        this._fileTags$ = this.fileTagChangesSubject
            .scan((acc: ChangeTagContainer[], { action, payload }) => {
                switch (action) {
                    case ChangeTagAction.CREATE:
                        return [...acc, payload];
                    case ChangeTagAction.DELETE:
                        return remove(acc, (container) => container.payload.tag.name === payload.tag.name);
                    case ChangeTagAction.ADD_FILE:
                        payload.tag.files.push(payload.videoId);
                        return [...acc];
                    case ChangeTagAction.REMOVE_FILE:
                        payload.tag.files = without(payload.tag.files, payload.videoId);
                        return [...acc];
                }
            }, [])
            .startWith(parsedTags)
            .publishReplay(1)
            .refCount();

        this.storeTagsSubscription = this._fileTags$
            .subscribe((fileTagList) => {
                localStorage.setItem(LOCAL_STORAGE_TAGS, JSON.stringify(fileTagList));
            });
    }

    public ngOnDestroy(): void {
        this.storeTagsSubscription.unsubscribe();
    }

    public createTag(name: string): void {
        this.fileTagChangesSubject.next({
            action: ChangeTagAction.CREATE,
            payload: { tag: { name: name, files: [] } }
        });
    }

    public deleteTag(tag: FileTag): void {
        this.fileTagChangesSubject.next({
            action: ChangeTagAction.DELETE,
            payload: { tag: tag }
        });
    }

    public addVideoToTag(tag: FileTag, videoId: string): void {
        this.fileTagChangesSubject.next({
            action: ChangeTagAction.ADD_FILE,
            payload: { tag, videoId }
        });
    }

    public removeVideoFromTag(tag: FileTag, videoId: string): void {
        this.fileTagChangesSubject.next({
            action: ChangeTagAction.REMOVE_FILE,
            payload: { tag, videoId }
        });
    }

    public get fileTagChanges$(): Observable<ChangeTagContainer> {
        return this.fileTagChangesSubject;
    }

    public get fileTag$(): Observable<FileTag[]> {
        return this._fileTags$;
    }
}
