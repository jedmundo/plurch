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

    constructor(private zone: NgZone) {
        const electronScreen = electron.screen;

        const connectedDisplays: Display[] = electronScreen.getAllDisplays();
        const convertedDisplay: PlurchDisplay[] = connectedDisplays.map((display) => new PlurchDisplay(display));
        this.displaySubject.next(convertedDisplay);

        electronScreen.on('display-added', (event: Event, newDisplay: Display) => {
            this.zone.run(() => {
                console.log('Display Added', newDisplay);
                Observable.combineLatest(this.display$, Observable.of(newDisplay))
                    .do(console.log)
                    .map(([displays, newDisplay]) => displays.concat(new PlurchDisplay(newDisplay)))
                    .subscribe((displays) => this.displaySubject.next(displays));
            });
        });
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
