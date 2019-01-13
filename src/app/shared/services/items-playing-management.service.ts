import { Injectable } from '@angular/core';

import { Observable, ReplaySubject } from 'rxjs';

import { ElectronService } from './electron.service';

export class ItemPlaying {

  constructor(
    public id: string,
    public windowId: string,
    public videoElement?: HTMLMediaElement
  ) {
  }
}

@Injectable()
export class ItemsPlayingManagementService {

  private itemsPlayingSubject = new ReplaySubject<ItemPlaying[]>(1);
  private itemsPlaying$: Observable<ItemPlaying[]> = this.itemsPlayingSubject.asObservable();
  private itemsPlayingArray: ItemPlaying[] = [];

  constructor(
    private electronService: ElectronService
  ) {
    this.electronService.ipcRenderer.on('new-item-playing', (event, itemPlaying: ItemPlaying) => {
      console.log('ADDED ITEM');
      this.addItem(new ItemPlaying(itemPlaying.id, itemPlaying.windowId, itemPlaying.videoElement));
    });

    this.electronService.ipcRenderer.on('removed-item-playing', (event, obj: any) => {
      console.log('REMOVED ITEM');
      this.removeItem(obj.id, obj.windowId);
    });
  }

  public addItem(item: ItemPlaying): void {
    this.itemsPlayingArray.push(item);
    this.itemsPlayingSubject.next(this.itemsPlayingArray);
  }

  public removeItem(id: string, windowId: string): void {
    this.itemsPlayingArray.splice(this.itemsPlayingArray.findIndex((item) => item.id === id && item.windowId === windowId), 1);
    this.itemsPlayingSubject.next(this.itemsPlayingArray);
  }

  public get itemsPlaying(): Observable<ItemPlaying[]> {
    return this.itemsPlaying$;
  }

}
