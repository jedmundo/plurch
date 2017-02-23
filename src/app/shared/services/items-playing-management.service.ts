import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

export class ItemPlaying {

    constructor(
        public id: string,
        public videoElement?: HTMLMediaElement
    ) {
    }
}

@Injectable()
export class ItemsPlayingManagementService {

    private itemsPlayingSubject = new ReplaySubject<ItemPlaying[]>(1);
    private itemsPlaying$: Observable<ItemPlaying[]> = this.itemsPlayingSubject.asObservable();
    private itemsPlayingArray: ItemPlaying[] = [];

    constructor() {
    }

    public addItem(item: ItemPlaying): void {
        this.itemsPlayingArray.push(item);
        this.itemsPlayingSubject.next(this.itemsPlayingArray);
    }

    public removeItem(id: string): void {
        this.itemsPlayingArray.splice(this.itemsPlayingArray.findIndex((item) => item.id === id), 1);
        this.itemsPlayingSubject.next(this.itemsPlayingArray);
    }

    public get itemsPlaying(): Observable<ItemPlaying[]> {
        return this.itemsPlaying$;
    }

}
