import { Component, OnInit, NgZone } from '@angular/core';
import Display = Electron.Display;

@Component({
    selector: 'app-monitor-displays',
    templateUrl: './monitor-displays.component.html',
    styleUrls: ['./monitor-displays.component.scss']
})
export class MonitorDisplaysComponent implements OnInit {

    public displays: PlurchDisplay[] = [];

    constructor(private zone: NgZone) { }

    public ngOnInit() {
        const electronScreen = electron.screen;

        const connectedDisplays = electronScreen.getAllDisplays();
        connectedDisplays.forEach((display) => {
            if (display.bounds.x != 0 || display.bounds.y != 0) {
                this.displays.push(new PlurchDisplay(true, display));
            } else {
                this.displays.push(new PlurchDisplay(false, display));
            }
        });

        electronScreen.on('display-added', (event: Event, newDisplay: Display) => {
            this.zone.run(() => {
                console.log('Display Added', newDisplay);
                // this.displays.push(new PlurchDisplay())
            });
        });

        electronScreen.on('display-removed', (event: Event, oldDisplay: Display) => {
            this.zone.run(() => {
                console.log('Display Removed', oldDisplay);
            });
        });
    }

}

export class PlurchDisplay {

    constructor(public external: boolean, public electronDisplay: Display) {
    }
}
