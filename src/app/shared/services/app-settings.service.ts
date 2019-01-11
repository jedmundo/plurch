import { Injectable } from '@angular/core';
import { USE_LOUDNESS } from '../../app.component';
import { ReplaySubject, Observable } from 'rxjs';
import { ElectronService } from './electron.service';

const OVERALL_VOLUME_KEY = 'overall-volume';
const ITEMS_ADDED_TO_MENU = 'items-added-to-menu';

@Injectable()
export class AppSettingsService {

    private mainVolume: number;

    private menuItemsSubject = new ReplaySubject<string[]>(1);
    private _menuItems: string[] = [];
    private _menuItems$: Observable<string[]> = this.menuItemsSubject.asObservable();

    constructor(
        private electronService: ElectronService
    ) {
        const itemsAddedList = localStorage.getItem(ITEMS_ADDED_TO_MENU);
        if (itemsAddedList) {
            const itemsList = JSON.parse(itemsAddedList);
            this._menuItems = (itemsList);
            this.menuItemsSubject.next(itemsList);
        }

        if (!USE_LOUDNESS) {
            return;
        }

        const mainVol = localStorage.getItem(OVERALL_VOLUME_KEY);
        if (!mainVol) {
            this.electronService.loudness.getVolume((err, vol) => this.overallVolume = vol);
        } else {
            this.overallVolume = +mainVol;
        }
    }

    public set overallVolume(volume: number) {
        if (!USE_LOUDNESS) {
            return;
        }

        this.mainVolume = volume;
        this.electronService.loudness.setVolume(volume, (err) => {
            if (err) {
                console.log(err);
            }
        });
        localStorage.setItem(OVERALL_VOLUME_KEY, String(volume));
    }

    public get overallVolume(): number {
        if (!USE_LOUDNESS) {
            return 0;
        }

        return this.mainVolume;
    }

    public get menuItems$(): Observable<string[]> {
        return this._menuItems$;
    }

    public isItemAlreadyAddedToMenu(dayName: string): boolean {
        return !!this._menuItems.find(item => item === dayName);
    }

    public addMenuItem(dayName: string): void {
        this._menuItems.push(dayName);
        this.menuItemsSubject.next(this._menuItems);
        localStorage.setItem(ITEMS_ADDED_TO_MENU, JSON.stringify(this._menuItems));
    }

    public removeMenuItem(dayName: string): void {
        this._menuItems.splice(this._menuItems.findIndex(item => item === dayName), 1);
        this.menuItemsSubject.next(this._menuItems);
        localStorage.setItem(ITEMS_ADDED_TO_MENU, JSON.stringify(this._menuItems));
    }

}
