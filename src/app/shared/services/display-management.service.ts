import { Injectable, NgZone } from '@angular/core';
import Display = Electron.Display;
import { screen } from 'electron';
import { Observable, Observer } from 'rxjs';

export class PlurchDisplay {

    public external: boolean;

    constructor(public electronDisplay: Display) {
        this.external = this.isExternal(electronDisplay);
    }

    private isExternal(electronDisplay: Display): boolean {
        return electronDisplay.bounds.x != 0 || electronDisplay.bounds.y != 0;
    }
}

export default function runInZone(zone: NgZone) {
    return function run<T>(input: Observable<T>) {
        return Observable.create((observer: Observer<T>) => {
            input.subscribe(
                (value) => zone.run(() => observer.next(value)),
                (error) => zone.run(() => observer.error(error)),
                ()      => zone.run(() => observer.complete())
            );
        });
    };
}

@Injectable()
export class DisplayManagementService {

    public display$: Observable<PlurchDisplay[]>;

    constructor(private zone: NgZone) {
        const electronScreen = screen;

        const displayEvents = ['display-added', 'display-removed'];

        this.display$ =
            Observable.merge(
                ...displayEvents.map((event) => Observable.fromEvent(electronScreen, event))
            )
                .startWith(null)
                .map(() => electronScreen.getAllDisplays())
                .map((displays) => displays.map((display) => new PlurchDisplay(display)))
                .let(runInZone(zone));
    }

    // private checkIfPreviewPossible(): boolean {
    //     return this.displays.length > 1;
    // }


}
