import { Injectable, NgZone } from '@angular/core';
import Display = Electron.Display;
import { ReplaySubject, Observable } from 'rxjs';

export class PlurchDisplay {

    public external: boolean;

    constructor(public electronDisplay: Display) {
        this.external = this.isExternal(electronDisplay);
    }

    private isExternal(electronDisplay: Display): boolean {
        return electronDisplay.bounds.x != 0 || electronDisplay.bounds.y != 0;
    }
}

@Injectable()
export class DisplayManagementService {

    private displaySubject = new ReplaySubject<PlurchDisplay[]>(1);
    public display$: Observable<PlurchDisplay[]> = this.displaySubject.asObservable();
    private displayAdded$: Observable<any>;

    constructor(private zone: NgZone) {
        const electronScreen = electron.screen;

        const connectedDisplays: Display[] = electronScreen.getAllDisplays();
        const convertedDisplay: PlurchDisplay[] = connectedDisplays.map((display) => new PlurchDisplay(display));
        this.displaySubject.next(convertedDisplay);

        this.displayAdded$ = Observable.fromEvent(electronScreen, 'on');
        this.displayAdded$.subscribe((value: any) => {
            console.log(value);
            Observable.combineLatest(this.display$, this.displayAdded$)
                .map(([displays, newDisplay]) => displays.concat(newDisplay))
                .subscribe((displays) => this.displaySubject.next(displays));
        });
        // electronScreen.on('display-added', (event: Event, newDisplay: Display) => {
        //     this.zone.run(() => {
        //         console.log('Display Added', newDisplay);
        //         this.displays.push(new PlurchDisplay(newDisplay));
        //         this.displaysChange.emit(this.displays);
        //         this.isPreviewPossibleChange.emit(this.checkIfPreviewPossible());
        //     });
        // });
        //
        // electronScreen.on('display-removed', (event: Event, oldDisplay: Display) => {
        //     this.zone.run(() => {
        //         console.log('Display Removed', oldDisplay);
        //         this.displays.splice(this.displays.findIndex((display) => display.electronDisplay.id === oldDisplay.id), 1);
        //         this.displaysChange.emit(this.displays);
        //     });
        // });
    }


    // private checkIfPreviewPossible(): boolean {
    //     return this.displays.length > 1;
    // }


}
