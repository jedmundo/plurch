import { Injectable, NgZone } from '@angular/core';

import { Observable, Observer, merge, fromEvent } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { Display } from 'electron';

import { ElectronService } from './electron.service';

export class PlurchDisplay {

  public external: boolean;

  constructor(public electronDisplay: Display) {
    this.external = this.isExternal(electronDisplay);
  }

  private isExternal(electronDisplay: Display): boolean {
    return electronDisplay.bounds.x !== 0 || electronDisplay.bounds.y !== 0;
  }
}

export default function runInZone(zone: NgZone) {
  return function run<T>(input: Observable<T>) {
    return Observable.create((observer: Observer<T>) => {
      input.subscribe(
        (value) => zone.run(() => observer.next(value)),
        (error) => zone.run(() => observer.error(error)),
        () => zone.run(() => observer.complete())
      );
    });
  };
}

@Injectable()
export class DisplayManagementService {

  public display$: Observable<PlurchDisplay[]>;

  constructor(
    private zone: NgZone,
    private electronService: ElectronService
  ) {
    const electronScreen = this.electronService.screen;

    const displayEvents = ['display-added', 'display-removed'];

    this.display$ =
      merge(
        ...displayEvents.map((event) => fromEvent(electronScreen, event))
      )
        .pipe(
          startWith(null),
          map(() => electronScreen.getAllDisplays()),
          map((displays) => displays.map((display) => new PlurchDisplay(display))),
          runInZone(zone)
        );
  }
}
